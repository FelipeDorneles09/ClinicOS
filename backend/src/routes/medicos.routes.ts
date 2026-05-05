import { Router } from "express";
import {
  listarMedicos,
  criarMedico,
  agendaMedico,
  softDeleteMedico,
} from "../controllers/medicos.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

// GET /api/medicos — todos autenticados
router.get("/", authenticate, listarMedicos);

// POST /api/medicos — apenas Admin
router.post("/", authenticate, authorize("ADMIN"), criarMedico);

// GET /api/medicos/:id/agenda — recepcionista e médico
router.get(
  "/:id/agenda",
  authenticate,
  authorize("ADMIN", "RECEPCIONISTA", "MEDICO"),
  agendaMedico
);

// DELETE /api/medicos/:id — apenas Admin (soft delete)
router.delete("/:id", authenticate, authorize("ADMIN"), softDeleteMedico);

export default router;
