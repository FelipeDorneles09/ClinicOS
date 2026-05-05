"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, MagnifyingGlass, X, ClipboardText } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { SkeletonTable } from "@/components/Skeletons";
import { formatCPF, formatDate, calcAge } from "@/lib/utils";

interface Paciente {
  id: string; nomeCompleto: string; cpf: string;
  dataNasc: string; telefone: string | null; email: string | null;
  _count?: { consultas: number };
}

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nomeCompleto: "", cpf: "", dataNasc: "", telefone: "", email: "" });

  const load = useCallback(async (q?: string) => {
    setLoading(true);
    const params = q
      ? q.replace(/\D/g, "").length === 11 ? `?cpf=${q.replace(/\D/g, "")}` : `?nome=${q}`
      : "";
    const { data } = await api.get(`/pacientes${params}`);
    setPacientes(data); setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const t = setTimeout(() => load(busca), 350); return () => clearTimeout(t); }, [busca, load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      await api.post("/pacientes", { ...form, cpf: form.cpf.replace(/\D/g, "") });
      toast.success("Paciente cadastrado!");
      setShowModal(false);
      setForm({ nomeCompleto: "", cpf: "", dataNasc: "", telefone: "", email: "" });
      load();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Erro ao cadastrar");
    } finally { setSaving(false); }
  }

  const inputCls = "w-full rounded border border-stroke bg-boxdark-2 px-4 py-2.5 text-sm text-bodydark placeholder-bodydark2 focus:border-primary focus:outline-none transition-colors";

  const fields = [
    { id: "nomeCompleto", label: "Nome completo",      type: "text",  required: true,  placeholder: "" },
    { id: "cpf",          label: "CPF (só números)",   type: "text",  required: true,  placeholder: "00000000000" },
    { id: "dataNasc",     label: "Data de nascimento", type: "date",  required: true,  placeholder: "" },
    { id: "telefone",     label: "Telefone",            type: "text",  required: false, placeholder: "" },
    { id: "email",        label: "E-mail",              type: "email", required: false, placeholder: "" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bodydark">Pacientes</h1>
          <p className="mt-1 text-sm text-bodydark2">{pacientes.length} registro(s) encontrado(s)</p>
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors shadow-md">
          <Plus size={16} weight="bold" /> Novo Paciente
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bodydark2" />
        <input value={busca} onChange={e => setBusca(e.target.value)}
          placeholder="Nome do paciente ou CPF..."
          className={`${inputCls} pl-10`} />
      </div>

      {/* Table */}
      {loading ? <SkeletonTable rows={6} /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="table-header">
              <tr className="border-b border-stroke text-left">
                {["Paciente", "CPF", "Idade", "Telefone", ""].map(h => (
                  <th key={h} className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-bodydark2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke/60">
              {pacientes.length === 0 ? (
                <tr><td colSpan={5} className="py-14 text-center">
                  <Users size={32} className="mx-auto mb-3 text-bodydark2/30" weight="duotone" />
                  <p className="text-sm text-bodydark2">
                    {busca ? "Nenhum paciente encontrado para essa busca" : "Nenhum paciente cadastrado"}
                  </p>
                </td></tr>
              ) : pacientes.map((p, i) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }} className="hover:bg-meta-4/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-success/10 text-xs font-bold text-success">
                        {p.nomeCompleto.split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-bodydark">{p.nomeCompleto}</p>
                        {p.email && <p className="text-xs text-bodydark2">{p.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-bodydark2">{formatCPF(p.cpf)}</td>
                  <td className="px-5 py-4 font-mono text-sm text-bodydark2">{calcAge(p.dataNasc)} anos</td>
                  <td className="px-5 py-4 text-xs text-bodydark2">{p.telefone ?? "—"}</td>
                  <td className="px-5 py-4">
                    <button className="rounded-md p-1.5 text-bodydark2 hover:bg-primary/10 hover:text-primary transition-colors" title="Ver prontuário">
                      <ClipboardText size={15} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="card w-full max-w-md p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-lg">
              <div className="flex items-center justify-between border-b border-stroke pb-4">
                <h2 className="text-base font-bold text-bodydark">Cadastrar Paciente</h2>
                <button onClick={() => setShowModal(false)} className="text-bodydark2 hover:text-danger transition-colors"><X size={18} /></button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                {fields.map(field => (
                  <div key={field.id} className="space-y-1.5">
                    <label className="text-xs font-semibold text-bodydark2 uppercase tracking-wide">{field.label}</label>
                    <input required={field.required} type={field.type} placeholder={field.placeholder}
                      value={form[field.id as keyof typeof form]}
                      onChange={e => setForm(f => ({ ...f, [field.id]: e.target.value }))}
                      className={inputCls} />
                  </div>
                ))}
                <motion.button type="submit" disabled={saving} whileTap={{ scale: 0.98 }}
                  className="w-full rounded bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60 transition-colors">
                  {saving ? "Salvando..." : "Cadastrar Paciente"}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
