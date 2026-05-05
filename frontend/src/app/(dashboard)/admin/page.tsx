"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, Stethoscope, CalendarCheck, TrendUp, ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";
import api from "@/lib/api";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { SkeletonStat, SkeletonTable } from "@/components/Skeletons";
import { formatTime, formatDate, type StatusConsulta } from "@/lib/utils";

interface Stats { totalPacientes: number; totalMedicos: number; consultasHoje: number; consultasSemana: number; }
interface Consulta { id: string; dataHora: string; status: StatusConsulta; paciente: { nomeCompleto: string }; medico: { usuario: { nome: string } }; }

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } };

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const hoje = new Date().toISOString().split("T")[0];
      const [pacRes, medRes, conRes] = await Promise.all([
        api.get("/pacientes"),
        api.get("/medicos"),
        api.get(`/consultas?data=${hoje}`),
      ]);
      setStats({
        totalPacientes: pacRes.data.length,
        totalMedicos: medRes.data.length,
        consultasHoje: conRes.data.length,
        consultasSemana: conRes.data.length,
      });
      setConsultas(conRes.data.slice(0, 8));
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-bodydark">Painel Administrativo</h1>
        <p className="mt-1 text-sm text-bodydark2">{formatDate(new Date().toISOString())} · Visão geral do sistema</p>
      </div>

      {/* Stats */}
      <motion.div variants={stagger} initial="hidden" animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {loading ? Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />) : [
          { label: "Pacientes cadastrados", value: stats!.totalPacientes, icon: Users,         iconBg: "bg-info/10",    iconColor: "text-info" },
          { label: "Médicos ativos",         value: stats!.totalMedicos,   icon: Stethoscope,   iconBg: "bg-success/10", iconColor: "text-success" },
          { label: "Consultas hoje",          value: stats!.consultasHoje,  icon: CalendarCheck, iconBg: "bg-warning/10", iconColor: "text-warning" },
          { label: "Média diária",            value: `~${Math.max(1, Math.round(stats!.consultasSemana / 7))}/dia`, icon: TrendUp, iconBg: "bg-primary/10", iconColor: "text-primary" },
        ].map((card) => (
          <motion.div key={card.label} variants={fadeUp}>
            <StatCard {...card} />
          </motion.div>
        ))}
      </motion.div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">
        {/* Consultas do dia */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="card p-6">
          <div className="mb-5 flex items-center justify-between border-b border-stroke pb-4">
            <div>
              <h2 className="text-base font-semibold text-bodydark">Consultas de hoje</h2>
              <p className="text-xs text-bodydark2 mt-0.5">{consultas.length} agendamento(s)</p>
            </div>
            <Link href="/recepcionista"
              className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark transition-colors font-medium">
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? <SkeletonTable rows={5} /> : consultas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <CalendarCheck size={36} className="text-bodydark2/30 mb-3" weight="duotone" />
              <p className="text-sm text-bodydark2">Nenhuma consulta agendada para hoje</p>
            </div>
          ) : (
            <div className="divide-y divide-stroke/60">
              {consultas.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-bodydark truncate">{c.paciente.nomeCompleto}</p>
                    <p className="text-xs text-bodydark2 truncate">{c.medico.usuario.nome}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <span className="font-mono text-xs text-bodydark2">{formatTime(c.dataHora)}</span>
                    <StatusBadge status={c.status} size="sm" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.15 }} className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-bodydark2 px-1">Ações rápidas</p>
          {[
            { href: "/admin/medicos",          label: "Novo médico",     desc: "Cadastrar corpo clínico",    icon: Stethoscope },
            { href: "/admin/usuarios",         label: "Novo usuário",    desc: "Criar acesso ao sistema",    icon: Users },
            { href: "/recepcionista/agendar",  label: "Agendar consulta", desc: "Criar novo agendamento",   icon: CalendarCheck },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}
                  className="card flex items-center gap-4 p-4 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon size={18} weight="fill" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-bodydark">{action.label}</p>
                    <p className="text-xs text-bodydark2">{action.desc}</p>
                  </div>
                  <ArrowRight size={14} className="ml-auto flex-shrink-0 text-bodydark2" />
                </motion.div>
              </Link>
            );
          })}

          {/* Status legend */}
          <div className="card p-4 mt-1">
            <p className="mb-3 text-xs font-semibold text-bodydark2 uppercase tracking-wider">Legenda de status</p>
            <div className="space-y-2">
              {(["AGENDADA", "EM_ANDAMENTO", "CONCLUIDA", "CANCELADA"] as StatusConsulta[]).map((s) => (
                <div key={s}><StatusBadge status={s} size="sm" /></div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
