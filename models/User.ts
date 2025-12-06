import mongoose, { Schema } from "mongoose";
import { IUser } from "../types/model";

const userSchema = new Schema<IUser>({
  username: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  elo:      { type: Number, default: 0 },
  creditScore: { type: Number, default: 100 },
  profileImage: { type: String, default: "avatar1.png" },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model<IUser>("User", userSchema);