"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, Clock, Users, ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";
import api from "@/lib/api";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { SkeletonTable, SkeletonStat } from "@/components/Skeletons";
import { formatTime, formatDate, type StatusConsulta } from "@/lib/utils";

interface Consulta {
  id: string; dataHora: string; status: StatusConsulta;
  paciente: { nomeCompleto: string; cpf: string };
  medico: { usuario: { nome: string }; especialidades: { especialidade: { nome: string } }[] };
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } };

export default function RecepcionistaPage() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const hoje = new Date().toISOString().split("T")[0];
    const { data } = await api.get(`/consultas?data=${hoje}`);
    setConsultas(data); setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const agendadas   = consultas.filter(c => c.status === "AGENDADA").length;
  const emAndamento = consultas.filter(c => c.status === "EM_ANDAMENTO").length;
  const concluidas  = consultas.filter(c => c.status === "CONCLUIDA").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bodydark">Central de Atendimento</h1>
          <p className="mt-1 text-sm text-bodydark2">{formatDate(new Date().toISOString())} · Agenda do dia</p>
        </div>
        <div className="flex gap-3">
          <Link href="/recepcionista/agendar">
            <motion.div whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 rounded bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark cursor-pointer transition-colors shadow-md">
              <CalendarCheck size={16} weight="fill" /> Agendar Consulta
            </motion.div>
          </Link>
          <Link href="/recepcionista/pacientes">
            <motion.div whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 rounded border border-stroke px-5 py-2.5 text-sm font-medium text-bodydark hover:border-primary hover:text-primary cursor-pointer transition-colors">
              <Users size={16} /> Pacientes
            </motion.div>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-3 gap-5">
        {loading ? Array.from({ length: 3 }).map((_, i) => <SkeletonStat key={i} />) : [
          { label: "Agendadas",       value: agendadas,   icon: CalendarCheck, iconBg: "bg-info/10",    iconColor: "text-info" },
          { label: "Em atendimento",  value: emAndamento, icon: Clock,         iconBg: "bg-warning/10", iconColor: "text-warning" },
          { label: "Concluídas",      value: concluidas,  icon: Users,         iconBg: "bg-success/10", iconColor: "text-success" },
        ].map(s => (
          <motion.div key={s.label} variants={fadeUp}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </motion.div>

      {/* Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-bodydark">Agenda de hoje</h2>
          <span className="text-xs text-bodydark2 font-mono">{consultas.length} consulta(s)</span>
        </div>

        {loading ? <SkeletonTable rows={5} /> : consultas.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-16 text-center">
            <CalendarCheck size={40} className="text-bodydark2/30 mb-3" weight="duotone" />
            <p className="text-sm font-semibold text-bodydark">Nenhuma consulta hoje</p>
            <p className="mt-1 text-xs text-bodydark2">Clique em "Agendar Consulta" para começar</p>
            <Link href="/recepcionista/agendar"
              className="mt-4 flex items-center gap-1 text-xs text-primary hover:text-primary-dark font-medium">
              Agendar agora <ArrowRight size={12} />
            </Link>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="table-header">
                <tr className="border-b border-stroke text-left">
                  {["Horário", "Paciente", "Médico", "Especialidade", "Status"].map(h => (
                    <th key={h} className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-bodydark2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke/60">
                {consultas.map((c, i) => (
                  <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }} className="hover:bg-meta-4/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 font-mono text-sm font-semibold text-bodydark">
                        <Clock size={13} className="text-bodydark2" />
                        {formatTime(c.dataHora)}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-bodydark">{c.paciente.nomeCompleto}</td>
                    <td className="px-5 py-4 text-bodydark2">{c.medico.usuario.nome}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
                        {c.medico.especialidades[0]?.especialidade.nome ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={c.status} size="sm" /></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
