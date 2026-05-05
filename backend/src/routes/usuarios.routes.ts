import { Router } from "express";
import {
  listarUsuarios,
  criarUsuario,
  toggleAtivo,
} from "../controllers/usuarios.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

// Todas as rotas exigem autenticação + perfil Admin
router.use(authenticate, authorize("ADMIN"));

// GET /api/usuarios
router.get("/", listarUsuarios);

// POST /api/usuarios
router.post("/", criarUsuario);

// PATCH /api/usuarios/:id/toggle-ativo
router.patch("/:id/toggle-ativo", toggleAtivo);

export default router;
