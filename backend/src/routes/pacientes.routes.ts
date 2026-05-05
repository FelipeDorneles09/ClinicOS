import { Router } from "express";
import {
  listarPacientes,
  criarPaciente,
  buscarPaciente,
  editarPaciente,
} from "../controllers/pacientes.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

// GET /api/pacientes?cpf=&nome= — recepcionista e admin
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "RECEPCIONISTA"),
  listarPacientes
);

// POST /api/pacientes
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "RECEPCIONISTA"),
  criarPaciente
);

// GET /api/pacientes/:id — inclui histórico de consultas
router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "RECEPCIONISTA", "MEDICO"),
  buscarPaciente
);

// PUT /api/pacientes/:id
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "RECEPCIONISTA"),
  editarPaciente
);

export default router;
