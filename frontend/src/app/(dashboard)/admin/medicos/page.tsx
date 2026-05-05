"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Stethoscope, Plus, Trash, MagnifyingGlass, X } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { SkeletonTable } from "@/components/Skeletons";

interface Especialidade { id: string; nome: string; }
interface Medico {
  id: string; crm: string; deletedAt: string | null;
  usuario: { nome: string; email: string; ativo: boolean };
  especialidades: { especialidade: { id: string; nome: string } }[];
  _count: { consultas: number };
}

const ESP_COLORS = [
  "bg-primary/10 text-primary",
  "bg-success/10 text-success",
  "bg-warning/10 text-warning",
  "bg-info/10 text-info",
  "bg-danger/10 text-danger",
];

export default function MedicosPage() {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", senha: "", crm: "", especialidadeIds: [] as string[] });

  const load = useCallback(async () => {
    setLoading(true);
    const [med, esp] = await Promise.all([api.get("/medicos"), api.get("/especialidades")]);
    setMedicos(med.data); setEspecialidades(esp.data); setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = medicos.filter(m =>
    m.usuario.nome.toLowerCase().includes(busca.toLowerCase()) ||
    m.crm.toLowerCase().includes(busca.toLowerCase())
  );

  async function handleDelete(id: string, nome: string) {
    if (!confirm(`Desativar Dr(a). ${nome}? O histórico será preservado.`)) return;
    try { await api.delete(`/medicos/${id}`); toast.success("Médico desativado"); load(); }
    catch { toast.error("Erro ao desativar"); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (form.especialidadeIds.length === 0) { toast.error("Selecione ao menos uma especialidade"); return; }
    setSaving(true);
    try {
      await api.post("/medicos", form);
      toast.success("Médico cadastrado!");
      setShowModal(false);
      setForm({ nome: "", email: "", senha: "", crm: "", especialidadeIds: [] });
      load();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Erro ao cadastrar");
    } finally { setSaving(false); }
  }

  function toggleEsp(id: string) {
    setForm(f => ({
      ...f,
      especialidadeIds: f.especialidadeIds.includes(id)
        ? f.especialidadeIds.filter(e => e !== id)
        : [...f.especialidadeIds, id],
    }));
  }

  const inputCls = "w-full rounded border border-stroke bg-boxdark-2 px-4 py-2.5 text-sm text-bodydark placeholder-bodydark2 focus:border-primary focus:outline-none transition-colors";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bodydark">Corpo Clínico</h1>
          <p className="mt-1 text-sm text-bodydark2">{medicos.length} médico(s) cadastrado(s)</p>
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors shadow-md">
          <Plus size={16} weight="bold" /> Novo Médico
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bodydark2" />
        <input value={busca} onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome ou CRM..."
          className={`${inputCls} pl-10`} />
      </div>

      {/* Table */}
      {loading ? <SkeletonTable rows={5} /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="table-header">
              <tr className="border-b border-stroke text-left">
                {["Médico", "CRM", "Especialidades", "Consultas", ""].map(h => (
                  <th key={h} className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-bodydark2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke/60">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-14 text-center text-sm text-bodydark2">
                  <Stethoscope size={32} className="mx-auto mb-3 text-bodydark2/30" weight="duotone" />
                  Nenhum médico encontrado
                </td></tr>
              ) : filtered.map((m, i) => (
                <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className={`hover:bg-meta-4/40 transition-colors ${m.deletedAt ? "opacity-50" : ""}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {m.usuario.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-bodydark">{m.usuario.nome}</p>
                        <p className="text-xs text-bodydark2">{m.usuario.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-bodydark2">{m.crm}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {m.especialidades.map((e, idx) => (
                        <span key={e.especialidade.id}
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ESP_COLORS[idx % ESP_COLORS.length]}`}>
                          {e.especialidade.nome}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-sm text-bodydark2">{m._count.consultas}</td>
                  <td className="px-5 py-4">
                    {!m.deletedAt && (
                      <button onClick={() => handleDelete(m.id, m.usuario.nome)}
                        className="rounded-md p-1.5 text-bodydark2 hover:bg-danger/10 hover:text-danger transition-colors">
                        <Trash size={15} />
                      </button>
                    )}
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
            <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="card w-full max-w-md p-6 space-y-5 shadow-lg">
              <div className="flex items-center justify-between border-b border-stroke pb-4">
                <h2 className="text-base font-bold text-bodydark">Cadastrar Médico</h2>
                <button onClick={() => setShowModal(false)} className="text-bodydark2 hover:text-danger transition-colors">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                {[
                  { id: "nome",  label: "Nome completo", type: "text",     val: form.nome,  set: (v: string) => setForm(f => ({ ...f, nome: v })) },
                  { id: "email", label: "E-mail",         type: "email",    val: form.email, set: (v: string) => setForm(f => ({ ...f, email: v })) },
                  { id: "senha", label: "Senha",           type: "password", val: form.senha, set: (v: string) => setForm(f => ({ ...f, senha: v })) },
                  { id: "crm",   label: "CRM",             type: "text",     val: form.crm,   set: (v: string) => setForm(f => ({ ...f, crm: v })) },
                ].map(field => (
                  <div key={field.id} className="space-y-1.5">
                    <label className="text-xs font-semibold text-bodydark2 uppercase tracking-wide">{field.label}</label>
                    <input required type={field.type} value={field.val} onChange={e => field.set(e.target.value)} className={inputCls} />
                  </div>
                ))}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-bodydark2 uppercase tracking-wide">Especialidades</label>
                  <div className="flex flex-wrap gap-2">
                    {especialidades.map(e => (
                      <button key={e.id} type="button" onClick={() => toggleEsp(e.id)}
                        className={`rounded-full px-3 py-1 text-xs font-medium border transition-all ${
                          form.especialidadeIds.includes(e.id)
                            ? "bg-primary/15 text-primary border-primary/40"
                            : "bg-meta-4 text-bodydark2 border-stroke hover:border-primary/30"
                        }`}>
                        {e.nome}
                      </button>
                    ))}
                  </div>
                </div>
                <motion.button type="submit" disabled={saving} whileTap={{ scale: 0.98 }}
                  className="w-full rounded bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60 transition-colors">
                  {saving ? "Salvando..." : "Cadastrar Médico"}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
