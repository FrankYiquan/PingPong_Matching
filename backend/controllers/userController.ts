import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { Request, Response } from "express";
import { CreateUserBody, LoginUserBody } from "../types/routeTypes";

export const createUser = async (
    req: Request<{}, {}, CreateUserBody>,
    res: Response
) => {
  try {
    const { username, email, password, profileImage } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "username, email, password required" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashed,
      profileImage: profileImage ?? "avatar1.png",
      elo: 1000,
      creditScore: 100,
    });

    return res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      elo: user.elo,
      creditScore: user.creditScore,
      profileImage: user.profileImage,
    });

  } catch (err:  any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


export const loginUser = async (
    req: Request<{}, {}, LoginUserBody>, 
    res: Response
) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.json({ token });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
