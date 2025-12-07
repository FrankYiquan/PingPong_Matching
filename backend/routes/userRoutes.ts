// routes/userRouter.ts
import { Router } from "express";
import { createUser, loginUser } from "../controllers/userController";

export function createUserRouter() {
  const router = Router();

  router.post("/create", createUser);
  router.post("/login", loginUser);

  return router;
}
