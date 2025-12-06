import { redis } from "../redis/redisClient";
import { activeQueueKey, confirmKey, matchReqKey, searchingTTLKey } from "../redis/key";
import { MatchRequest } from "../models/MatchRequest";
import { Match } from "../models/Match";
import { getRedisMatchRequest } from "./redisHelpers";
import { Notifier } from "./notifier";
import { enqueueMatchRequest } from "./enqueue";
import { User } from "../models/User";

export async function acceptMatch(
  matchRequestId: string,
  userId: string,
  notifier: Notifier
) {
  const req = await MatchRequest.findById(matchRequestId).exec();
  if (!req || req.status !== "pending_confirmation") {
    throw new Error("No pending match to accept");
  }

  // Make sure this request belongs to the user
  if (req.userId.toString() !== userId) {
    throw new Error("Not authorized on this match request");
  }

  const confirmAKey = confirmKey(matchRequestId);
  await redis.set(confirmAKey, "accepted", "EX", 15);

  if (!req.opponentRequestId) return; // weird but ok
  const oppId = req.opponentRequestId.toString(); // from user A matchRequest to get user B matchRequest Id
  const confirmBKey = confirmKey(oppId);

  // Check if opponent has accepted
  // if not, safely return -> wait for opponent to accept (I am the first to accept)
  // if yes, meaning I am the later one to accept, finalize match
  const oppStatus = await redis.get(confirmBKey);
  if (oppStatus === "accepted") {
    // Both accepted → finalize match
    const aRedis = await getRedisMatchRequest(matchRequestId);
    const bRedis = await getRedisMatchRequest(oppId);
    if (!aRedis || !bRedis) return;

    const match = await Match.create({
      player1Id: aRedis.userId,
      player2Id: bRedis.userId,
      location: aRedis.location,
      scheduledStartTime: new Date(aRedis.startTimeMs),
    });

    await MatchRequest.findByIdAndUpdate(matchRequestId, { status: "matched" });
    await MatchRequest.findByIdAndUpdate(oppId, { status: "matched" });

    // Clean Redis
    await redis.del(confirmAKey, confirmBKey, matchReqKey(matchRequestId), matchReqKey(oppId));

    // Notify both users
    await notifier.notifyUser(aRedis.userId, "MATCH_CONFIRMED", { matchId: match._id });
    await notifier.notifyUser(bRedis.userId, "MATCH_CONFIRMED", { matchId: match._id });
  }
}

export async function declineMatch(
  matchRequestId: string,
  userId: string,
  notifier: Notifier
) {
  const req = await MatchRequest.findById(matchRequestId);
  if (!req) throw new Error("MatchRequest not found");

  if (req.userId.toString() !== userId) {
    throw new Error("Not your match request");
  }

  const opponentId = req.opponentRequestId?.toString();

  // Reset status
  req.status = "searching";
  req.opponentRequestId = null;
  await req.save();

  // Clean confirm key
  await redis.del(confirmKey(matchRequestId));

  // Notify opponent if exists
  if (opponentId) {
    await redis.del(confirmKey(opponentId));

    const oppReq = await MatchRequest.findById(opponentId);
    if (oppReq) {
      oppReq.status = "searching";
      oppReq.opponentRequestId = null;
      await oppReq.save();

      notifier.notifyUser(oppReq.userId.toString(), "MATCH_DECLINED", {
        msg: "Opponent declined, searching again.",
      });

      // re-enqueue opponent
      const oppUser = await User.findById(oppReq.userId);
      await enqueueMatchRequest(oppReq, oppUser!);
    }
  }

  // re-enqueue this user
  const user = await User.findById(userId);
  await enqueueMatchRequest(req, user!);

  return { ok: true };
}
