import { Location } from "../types/matchmakingTypes";

export const activeQueueKey = (location: Location) =>
  `active:searching:${location}`;

export const matchReqKey = (matchRequestId: string) =>
  `matchreq:${matchRequestId}`;

export const searchingTTLKey = (matchRequestId: string) =>
  `searching:${matchRequestId}`;

export const lockKey = (matchRequestId: string) =>
  `lock:${matchRequestId}`;

export const confirmKey = (matchRequestId: string) =>
  `confirm:${matchRequestId}`;