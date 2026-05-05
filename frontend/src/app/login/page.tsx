"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Envelope, LockKey, Heartbeat, ArrowRight, Warning } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { saveAuth, getDashboardPath, type AuthUser } from "@/lib/auth";

function EcgAnimation() {
  return (
    <svg viewBox="0 0 400 120" className="w-full max-w-sm opacity-30" fill="none" stroke="currentColor">
      <motion.polyline
        points="0,60 40,60 55,60 65,20 75,95 85,30 95,60 120,60 140,60 155,60 165,15 175,100 185,25 195,60 220,60 260,60 275,60 285,20 295,95 305,30 315,60 340,60 400,60"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2.5, ease: "easeInOut", delay: 0.3 }}
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post<{ token: string; usuario: AuthUser }>("/auth/login", { email, senha });
      saveAuth(data.token, data.usuario);
      toast.success(`Bem-vindo, ${data.usuario.nome.split(" ")[0]}!`);
      router.push(getDashboardPath(data.usuario.role));
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        "Erro ao conectar com o servidor"
      );
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full rounded border border-stroke bg-boxdark-2 py-3 pl-10 pr-4 text-sm text-bodydark placeholder-bodydark2 focus:border-primary focus:outline-none transition-colors";

  return (
    <div className="flex min-h-[100dvh] bg-bg-body">
      {/* ─── Left panel: Brand ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex lg:w-[55%] flex-col justify-between bg-boxdark border-r border-stroke px-16 py-14"
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Heartbeat size={22} weight="fill" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-bodydark">
              Clinic<span className="text-primary">OS</span>
            </span>
            <p className="text-[10px] text-bodydark2 leading-none">Sistema de Gestão Clínica</p>
          </div>
        </div>

        {/* Center content */}
        <div className="space-y-8">
          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl font-bold tracking-tight text-bodydark leading-tight"
            >
              Gestão clínica<br />
              <span className="text-primary">sem complicação.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="text-bodydark2 text-base leading-relaxed max-w-sm"
            >
              Agendamentos inteligentes, prontuário digital e controle de
              acesso por perfil — tudo em um único lugar.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-primary"
          >
            <EcgAnimation />
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-3 gap-6 border-t border-stroke pt-8"
          >
            {[
              { value: "3", label: "Perfis de acesso" },
              { value: "100%", label: "Containerizado" },
              { value: "0", label: "Conflitos de agenda" },
            ].map(stat => (
              <div key={stat.label}>
                <p className="font-mono text-2xl font-bold text-bodydark">{stat.value}</p>
                <p className="mt-0.5 text-xs text-bodydark2">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <p className="text-xs text-bodydark2 font-mono">ClinicOS v1.0.0 · Docker + PostgreSQL + Node.js + Next.js</p>
      </motion.div>

      {/* ─── Right panel: Form ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-1 items-center justify-center px-6 py-12"
      >
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <Heartbeat size={20} weight="fill" className="text-primary" />
            <span className="font-bold text-sm text-bodydark">
              Clinic<span className="text-primary">OS</span>
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-bodydark">Acesso ao sistema</h2>
            <p className="mt-1 text-sm text-bodydark2">Use suas credenciais institucionais</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-bodydark">E-mail</label>
              <div className="relative">
                <Envelope size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bodydark2" />
                <input id="email" type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nome@clinicos.com" required className={inputCls} />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <label htmlFor="senha" className="block text-sm font-semibold text-bodydark">Senha</label>
              <div className="relative">
                <LockKey size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bodydark2" />
                <input id="senha" type="password" value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••" required className={inputCls} />
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded border border-danger/20 bg-danger/10 px-3 py-2.5 text-sm text-danger">
                <Warning size={16} weight="fill" />
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
              className="flex w-full items-center justify-center gap-2 rounded bg-primary px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed shadow-md">
              {loading ? (
                <span className="font-mono text-xs tracking-widest">Verificando...</span>
              ) : (
                <> Entrar <ArrowRight size={16} weight="bold" /> </>
              )}
            </motion.button>
          </form>

          {/* Demo credentials */}
          <div className="rounded border border-stroke bg-boxdark p-4">
            <p className="mb-3 text-xs font-semibold text-bodydark2 uppercase tracking-wider">Credenciais de demo</p>
            <div className="space-y-1.5 font-mono text-xs">
              {[
                { role: "Admin", email: "admin@clinicos.com", senha: "admin123" },
                { role: "Recepcionista", email: "marina.recep@clinicos.com", senha: "recep123" },
                { role: "Médico", email: "augusto.ferreira@clinicos.com", senha: "medico123" },
              ].map(cred => (
                <button key={cred.role} type="button"
                  onClick={() => { setEmail(cred.email); setSenha(cred.senha); }}
                  className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-bodydark2 transition-colors hover:bg-meta-4 hover:text-bodydark">
                  <span className="font-semibold text-bodydark">{cred.role}</span>
                  <span>{cred.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
