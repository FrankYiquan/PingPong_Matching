import { redis } from "../redis/redisClient";
import {
  activeQueueKey,
  searchingTTLKey,
  lockKey,
  confirmKey,
  matchReqKey,
} from "../redis/key";
import { Location, RedisMatchRequest } from "../types/matchmaking";
import { getRedisMatchRequest } from "./redisHelpers";
import { MatchRequest } from "../models/MatchRequest";
import { Notifier } from "./notifier";

const LOCATIONS: Location[] = ["Gosman", "Shapiro", "IBS"];
const LOCK_TTL_SECONDS = 5;
const CONFIRM_TTL_SECONDS = 15;
const ELO_MAX_DIFF = 300;

// check if two time intervals preferences from users overlap
function timeOverlaps(a: RedisMatchRequest, b: RedisMatchRequest): boolean {
  return a.startTimeMs < b.endTimeMs && a.endTimeMs > b.startTimeMs;
}

// check if two match requests are compatible
// 3 condtions: same playerCount, overlapping time, ELO within limit
function areCompatible(a: RedisMatchRequest, b: RedisMatchRequest): boolean {
  const eloDiff = Math.abs(a.elo - b.elo);
  return (
    a.playerCount === b.playerCount &&
    timeOverlaps(a, b) &&
    eloDiff <= ELO_MAX_DIFF
  );
}

// acuire a lock for a match request if not already locked
async function acquireLock(id: string): Promise<boolean> {
  const key = lockKey(id);
  const result = await redis.call("SET", key, "locked", "NX", "EX", LOCK_TTL_SECONDS.toString());
  return result === "OK";
}

// release the lock for a match request
async function releaseLock(id: string): Promise<void> {
  await redis.del(lockKey(id));
}

// If TTL has expired, clean from queue + Mongo
async function cleanupExpired(id: string, location: Location): Promise<void> {
  const ttlExists = await redis.exists(searchingTTLKey(id));
  if (ttlExists) return;

  // If matchRequest has expired, remove from Redis queue & hash
  await redis.zrem(activeQueueKey(location), id);
  await redis.del(matchReqKey(id));

  // Mark Mongo as expired
  await MatchRequest.findByIdAndUpdate(id, { status: "expired" }).exec();
}

// Move both to pending_confirmation
// Set confirm keys, update Mongo, notify users
async function moveToPendingConfirmation(
  a: RedisMatchRequest,
  b: RedisMatchRequest,
  notifier: Notifier
) {
  const queueKey = activeQueueKey(a.location);

  // Remove from queue
  await redis.zrem(queueKey, a.matchRequestId, b.matchRequestId);

  // Remove TTLs
  await redis.del(searchingTTLKey(a.matchRequestId));
  await redis.del(searchingTTLKey(b.matchRequestId));

  // Set confirm keys
  await redis.set(confirmKey(a.matchRequestId), "waiting", "EX", CONFIRM_TTL_SECONDS);
  await redis.set(confirmKey(b.matchRequestId), "waiting", "EX", CONFIRM_TTL_SECONDS);

  // Update Mongo status & opponentRequestId
  await MatchRequest.findByIdAndUpdate(a.matchRequestId, {
    status: "pending_confirmation",
    opponentRequestId: b.matchRequestId,
  });

  await MatchRequest.findByIdAndUpdate(b.matchRequestId, {
    status: "pending_confirmation",
    opponentRequestId: a.matchRequestId,
  });

  // Notify both users (for UI "Match found" dialog - frontend)
  await notifier.notifyUser(a.userId, "MATCH_FOUND", {
    opponent: {
      username: b.username,
      elo: b.elo,
      creditScore: b.creditScore, 
      profileImage: b.profileImage,
      location: b.location,
      startTimeMs: b.startTimeMs,
      endTimeMs: b.endTimeMs,
      matchRequestId: b.matchRequestId,
    },
  });

  await notifier.notifyUser(b.userId, "MATCH_FOUND", {
    opponent: {
      username: a.username,
      elo: a.elo,
      creditScore: a.creditScore,
      profileImage: a.profileImage,
      location: a.location,
      startTimeMs: a.startTimeMs,
      endTimeMs: a.endTimeMs,
      matchRequestId: a.matchRequestId,
    },
  });
}

// Try match within one location queue
async function tryMatchForLocation(location: Location, notifier: Notifier) {
  const queueKey = activeQueueKey(location);
  const ids = await redis.zrange(queueKey, 0, -1); // all matchRequest in the location queue
  
  // if less than 2, only one or zero requests, cannot match
  if (ids.length < 2) return;

  for (let i = 0; i < ids.length; i++) {
    const idA = ids[i];

    // Skip if expired
    await cleanupExpired(idA, location);
    const ttlA = await redis.exists(searchingTTLKey(idA));
    if (!ttlA) continue;

    // Skip if locked
    const lockA = await acquireLock(idA);
    if (!lockA) continue;

    // Skip if already matched
    const a = await getRedisMatchRequest(idA);
    if (!a) {
      await releaseLock(idA);
      continue;
    }

    let matched = false;

    // Try to find a match for A
    // same process as above
    for (let j = i + 1; j < ids.length; j++) {
      const idB = ids[j];

      await cleanupExpired(idB, location);
      const ttlB = await redis.exists(searchingTTLKey(idB));
      if (!ttlB) continue;

      const lockB = await acquireLock(idB);
      if (!lockB) continue;

      const b = await getRedisMatchRequest(idB);
      if (!b) {
        await releaseLock(idB);
        continue;
      }

      if (areCompatible(a, b)) {
        await moveToPendingConfirmation(a, b, notifier);
        await releaseLock(idA);
        await releaseLock(idB);
        matched = true;
        break;
      } else {
        await releaseLock(idB);
      }
    }

    if (!matched) {
      await releaseLock(idA);
    }
  }
}

export function startMatchEngine(notifier: Notifier, intervalMs = 1000) {
  // simple setInterval loop
  setInterval(async () => {
    for (const location of LOCATIONS) {
      try {
        await tryMatchForLocation(location, notifier);
      } catch (err) {
        console.error("Error in match engine for location", location, err);
      }
    }
  }, intervalMs);
}
