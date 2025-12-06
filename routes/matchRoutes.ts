import { Router } from "express";
import { MatchRequest } from "../models/MatchRequest";
import { User } from "../models/User";
import { enqueueMatchRequest } from "../matchmaking/enqueue";
import { acceptMatch, declineMatch } from "../matchmaking/acceptDecline";
import { Notifier } from "../matchmaking/notifier";
import { Location } from "../types/matchmaking";
import { requireAuth } from "../middlewares/auth";

export function createMatchRouter(notifier: Notifier) {
  const router = Router();

  router.use(requireAuth); // apply auth middleware to all routes

  // Start matchmaking
  router.post(
    "/start",
    async (req: any, res) => {
      try {
        const userId = req.user.id; // from auth
        
        const { location, startTime, endTime, playerCount } = req.body;

        if (!location || !startTime || !endTime) {
          return res.status(400).json({ error: "Missing fields" });
        }

        const user = await User.findById(userId).exec();
        if (!user) return res.status(404).json({ error: "User not found" });

        const matchReq = await MatchRequest.create({
          userId,
          location: location as Location,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          playerCount: playerCount ?? 2,
          status: "searching",
        });

        await enqueueMatchRequest(matchReq, user);

        return res.json({
          matchRequestId: matchReq._id,
          status: matchReq.status,
          searchExpiresInSeconds: 30,
        });
      } catch (err: any) {
        console.error(err);
        return res.status(500).json({ error: err.message || "Internal error" });
      }
    }
  );

  // Cancel search
  // User click startRequest then decides to cancel before matched
  router.post(
    "/cancel",
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const { matchRequestId } = req.body;

        const reqDoc = await MatchRequest.findById(matchRequestId).exec();
        if (!reqDoc) return res.status(404).json({ error: "MatchRequest not found" });

        if (reqDoc.userId.toString() !== userId) {
          return res.status(403).json({ error: "Not authorized" });
        }

        reqDoc.status = "cancelled";
        await reqDoc.save();

        // best effort cleanup in Redis; not strictly required if TTL will clear
        // you can also remove from queue & hashes here if you want

        return res.json({ ok: true });
      } catch (err: any) {
        console.error(err);
        return res.status(500).json({ error: err.message || "Internal error" });
      }
    }
  );

  // Accept match
  router.post(
    "/accept",
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const { matchRequestId } = req.body;
        await acceptMatch(matchRequestId, userId, notifier);
        return res.json({ ok: true });
      } catch (err: any) {
        console.error(err);
        return res.status(400).json({ error: err.message || "Unable to accept" });
      }
    }
  );

  // Decline match
  router.post(
    "/decline",
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const { matchRequestId } = req.body;
        await declineMatch(matchRequestId, userId, notifier);
        return res.json({ ok: true });
      } catch (err: any) {
        console.error(err);
        return res.status(400).json({ error: err.message || "Unable to decline" });
      }
    }
  );

  // Public waitlist: list waitlisted match requests
  router.get(
    "/waitlist",
    async (_req, res) => {
      try {
        const waitlisted = await MatchRequest.find({ status: "waitlisted" })
          .populate("userId", "username elo creditScore profileImage")
          .sort({ createdAt: -1 })
          .limit(50)
          .exec();

        return res.json(waitlisted);
      } catch (err: any) {
        console.error(err);
        return res.status(500).json({ error: err.message || "Internal error" });
      }
    }
  );

  // Move an expired search to waitlist
  router.post(
    "/waitlist/:id",
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const { id } = req.params;
        const matchReq = await MatchRequest.findById(id).exec();
        if (!matchReq) return res.status(404).json({ error: "MatchRequest not found" });
        if (matchReq.userId.toString() !== userId) {
          return res.status(403).json({ error: "Not authorized" });
        }

        matchReq.status = "waitlisted";
        await matchReq.save();

        return res.json({ ok: true });
      } catch (err: any) {
        console.error(err);
        return res.status(500).json({ error: err.message || "Internal error" });
      }
    }
  );

  return router;
}
