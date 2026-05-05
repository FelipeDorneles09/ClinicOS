import { Router } from "express";
import {
  listarConsultas,
  agendaHoje,
  criarConsulta,
  atualizarStatus,
} from "../controllers/consultas.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

// GET /api/consultas?medico_id=&data=&status= — admin e recepcionista
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "RECEPCIONISTA"),
  listarConsultas
);

// GET /api/consultas/agenda-hoje — médico vê apenas as próprias consultas do dia
router.get("/agenda-hoje", authenticate, authorize("MEDICO"), agendaHoje);

// POST /api/consultas — recepcionista agenda
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "RECEPCIONISTA"),
  criarConsulta
);

// PATCH /api/consultas/:id/status — médico atualiza status
router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN", "MEDICO"),
  atualizarStatus
);

export default router;
