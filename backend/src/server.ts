import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import usuariosRoutes from "./routes/usuarios.routes";
import especialidadesRoutes from "./routes/especialidades.routes";
import medicosRoutes from "./routes/medicos.routes";
import pacientesRoutes from "./routes/pacientes.routes";
import consultasRoutes from "./routes/consultas.routes";

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middlewares globais ────────────────────────────────────────────────────
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

// ─── Health check ───────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Rotas ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/especialidades", especialidadesRoutes);
app.use("/api/medicos", medicosRoutes);
app.use("/api/pacientes", pacientesRoutes);
app.use("/api/consultas", consultasRoutes);

// ─── 404 handler ────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

// ─── Global error handler ───────────────────────────────────────────────────
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("[ERROR]", err.stack);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
);

app.listen(PORT, () => {
  console.log(`\n🏥  ClinicOS API rodando em http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health\n`);
});
