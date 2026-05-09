"use client";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

function ProctorShell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

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
