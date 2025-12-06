import mongoose, { Schema } from "mongoose";
import {IMatch } from "../types/model";


const matchSchema = new Schema<IMatch>(
  {
    player1Id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    player2Id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    location: { type: String, enum: ["Gosman", "Shapiro", "IBS"], required: true },
    scheduledStartTime: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Match = mongoose.model<IMatch>("Match", matchSchema);