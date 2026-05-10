"use client";
import { SidebarProvider } from "@/context/SidebarContext";
import { SessionProvider } from "@/context/SessionContext";

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <SidebarProvider>{children}</SidebarProvider>
    </SessionProvider>
  );
}

