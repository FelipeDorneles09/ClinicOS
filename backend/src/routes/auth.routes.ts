import { Router } from "express";
import { login, me } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// POST /api/auth/login
router.post("/login", login);

// GET /api/auth/me
router.get("/me", authenticate, me);

export default router;
