"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  House, Users, Stethoscope, CalendarCheck,
  UserCircle, SignOut, Heartbeat, X,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { logout, type AuthUser, ROLE_LABELS } from "@/lib/auth";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: AuthUser["role"][];
  group: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Painel", icon: House, roles: ["ADMIN"], group: "MENU" },
  { href: "/admin/medicos", label: "Médicos", icon: Stethoscope, roles: ["ADMIN"], group: "MENU" },
  { href: "/admin/usuarios", label: "Usuários", icon: UserCircle, roles: ["ADMIN"], group: "MENU" },
  { href: "/recepcionista", label: "Painel", icon: House, roles: ["RECEPCIONISTA"], group: "MENU" },
  { href: "/recepcionista/pacientes", label: "Pacientes", icon: Users, roles: ["RECEPCIONISTA"], group: "MENU" },
  { href: "/recepcionista/agendar", label: "Agendar", icon: CalendarCheck, roles: ["RECEPCIONISTA"], group: "MENU" },
  { href: "/medico", label: "Minha Agenda", icon: CalendarCheck, roles: ["MEDICO"], group: "MENU" },
];

interface SidebarNavProps {
  user: AuthUser;
  isOpen: boolean;
  onClose: () => void;
}

function SidebarContent({ user, onClose }: { user: AuthUser; onClose: () => void }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter(item => item.roles.includes(user.role));
  const groups = items.reduce<Record<string, NavItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  const initials = user.nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <aside className="flex h-full w-[270px] flex-shrink-0 flex-col bg-boxdark border-r border-stroke">
      {/* Brand */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-stroke">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Heartbeat size={20} weight="fill" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-bodydark">
              Clinic<span className="text-primary">OS</span>
            </span>
            <p className="text-[10px] text-bodydark2 leading-none mt-0.5">Sistema de Gestão</p>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-bodydark2 hover:bg-meta-4 hover:text-bodydark transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
        {Object.entries(groups).map(([group, groupItems]) => (
          <div key={group}>
            <p className="mb-2 mt-4 first:mt-0 px-2 text-[11px] font-semibold uppercase tracking-widest text-bodydark2">
              {group}
            </p>
            <div className="space-y-0.5">
              {groupItems.map(item => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (!["/admin", "/recepcionista", "/medico"].includes(item.href) &&
                    pathname.startsWith(item.href + "/"));

                return (
                  <Link key={item.href} href={item.href} onClick={onClose}>
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "relative flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-bodydark1 hover:bg-meta-4 hover:text-bodydark"
                      )}
                    >
                      {isActive && (
                        <motion.span layoutId="sidebar-active" className="sidebar-active-bar" />
                      )}
                      <Icon size={18} weight={isActive ? "fill" : "regular"} className="flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User info */}
      <div className="border-t border-stroke p-4">
        <div className="flex items-center gap-3 rounded-lg bg-meta-4 p-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-bodydark">{user.nome}</p>
            <p className="text-[11px] text-bodydark2 truncate">{ROLE_LABELS[user.role]}</p>
          </div>
          <button
            onClick={logout}
            title="Sair"
            className="flex-shrink-0 rounded-md p-1.5 text-bodydark2 transition-colors hover:bg-danger/10 hover:text-danger"
          >
            <SignOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export function SidebarNav({ user, isOpen, onClose }: SidebarNavProps) {
  return (
    <>
      {/* ─── Desktop: always visible ──────────────────────────────── */}
      <div className="hidden lg:flex h-screen flex-shrink-0 shadow-sidebar">
        <SidebarContent user={user} onClose={onClose} />
      </div>

      {/* ─── Mobile: slide-in drawer + overlay ────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: -270 }}
              animate={{ x: 0 }}
              exit={{ x: -270 }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 h-full shadow-sidebar"
            >
              <SidebarContent user={user} onClose={onClose} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
