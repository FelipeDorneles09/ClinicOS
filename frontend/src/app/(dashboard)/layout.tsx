"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SidebarNav } from "@/components/SidebarNav";
import { Topbar } from "@/components/Topbar";
import { getUser, isTokenValid, type AuthUser } from "@/lib/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  useEffect(() => {
    if (!isTokenValid()) { router.replace("/login"); return; }
    const u = getUser();
    if (!u) { router.replace("/login"); return; }
    setUser(u);
  }, [router]);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-body">
        <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-stroke border-t-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg-body">
      <SidebarNav user={user} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden">
        <Topbar user={user} onMenuClick={() => setSidebarOpen(prev => !prev)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
