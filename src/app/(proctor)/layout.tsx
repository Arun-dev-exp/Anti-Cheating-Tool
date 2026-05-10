"use client";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function ProctorShell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <span className="material-symbols-outlined text-accent-blue text-4xl animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <Sidebar variant="proctor" />
      <div
        style={{
          marginLeft: collapsed ? 68 : 240,
          transition: "margin-left 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <Topbar variant="proctor" />
        {children}
      </div>
    </div>
  );
}

export default function ProctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ProctorShell>{children}</ProctorShell>
    </SidebarProvider>
  );
}
