import { Router } from "express";
import {
  listarEspecialidades,
  criarEspecialidade,
} from "../controllers/especialidades.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

// GET /api/especialidades — autenticado (todos os perfis)
router.get("/", authenticate, listarEspecialidades);

// POST /api/especialidades — apenas Admin
router.post("/", authenticate, authorize("ADMIN"), criarEspecialidade);

export default router;
