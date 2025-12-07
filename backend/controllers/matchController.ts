import { MatchRequest } from "../models/MatchRequest";
import { User } from "../models/User";
import { enqueueMatchRequest } from "../matchmaking/enqueue";
import { acceptMatch, declineMatch } from "../matchmaking/acceptDecline";
import { Request, RequestHandler, Response } from "express";
import { startMatchBody, matchRequestBody, matchRequestParams } from "../types/routeTypes";
import { Notifier } from "../matchmaking/notifier";


export const startMatchmaking: RequestHandler<{}, any, startMatchBody> = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;
    const { location, startTime, endTime, playerCount } = req.body;

    if (!location || !startTime || !endTime) {
      res.status(400).json({ error: "Missing fields" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const matchReq = await MatchRequest.create({
      userId,
      location,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      playerCount: playerCount ?? 2,
      status: "searching",
    });

    await enqueueMatchRequest(matchReq, user);

    res.json({
      matchRequestId: matchReq._id,
      status: matchReq.status,
      searchExpiresInSeconds: 30,
    });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


export const cancelMatchmaking: RequestHandler<{}, any, matchRequestBody> = async (
    req, 
    res) => {
  try {
    const userId = req.user.id;
    const { matchRequestId } = req.body;

    const reqDoc = await MatchRequest.findById(matchRequestId);
    if (!reqDoc) {
      res.status(404).json({ error: "MatchRequest not found" });
      return;
    }

    if (reqDoc.userId.toString() !== userId) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }

    reqDoc.status = "cancelled";
    await reqDoc.save();

    res.json({ ok: true });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


export const acceptMatchRequest = async (
    req: Request<{}, any, matchRequestBody>, 
    res: Response, 
    notifier: Notifier) => {
  try {
    const userId = req.user.id;
    const { matchRequestId } = req.body;

    await acceptMatch(matchRequestId, userId, notifier);
    res.json({ ok: true });

  } catch (err: any) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};


export const declineMatchRequest = async (
    req: Request<{}, any, matchRequestBody>, 
    res: Response, 
    notifier: Notifier) => {
  try {
    const userId = req.user.id;
    const { matchRequestId } = req.body;

    await declineMatch(matchRequestId, userId, notifier);
    res.json({ ok: true });

  } catch (err: any) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};


export const getWaitlist: RequestHandler = async (_req, res) => {
  try {
    const waitlisted = await MatchRequest.find({ status: "waitlisted" })
      .populate("userId", "username elo creditScore profileImage")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(waitlisted);

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


export const markWaitlisted: RequestHandler<matchRequestParams> = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const matchReq = await MatchRequest.findById(id);
    if (!matchReq) {
      res.status(404).json({ error: "MatchRequest not found" });
      return;
    }

    if (matchReq.userId.toString() !== userId) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }

    matchReq.status = "waitlisted";
    await matchReq.save();

    res.json({ ok: true });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
