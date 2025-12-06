// src/routes/userRoutes.ts
import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";

export const userRouter = Router();

// POST /user/create
userRouter.post("/create", async (req, res) => {
  try {
    const { username, email, password, profileImage } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "username, email, password required" });
    }

    // check duplicate email
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already registered" });

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashed,
      profileImage: profileImage ?? "avatar1.png",
      elo: 1000,          // default elo
      creditScore: 100,   // default score
    });

    // return safe user info
    return res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      elo: user.elo,
      creditScore: user.creditScore,
      profileImage: user.profileImage,
    });

  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});
