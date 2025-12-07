import { Types } from "mongoose";
import { MatchRequestStatus, Location } from "./matchmakingTypes";

export interface IMatchRequest {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  location: Location;
  startTime: Date;
  endTime: Date;
  playerCount: 2 | 4;
  status: MatchRequestStatus;
  opponentRequestId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  elo: number;
  creditScore: number;
  profileImage: string;
  createdAt: Date;
}

export interface IMatch {
  player1Id: Types.ObjectId;
  player2Id: Types.ObjectId;
  location: Location;
  scheduledStartTime: Date;
  createdAt: Date;
}
