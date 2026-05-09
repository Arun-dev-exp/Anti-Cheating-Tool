"use client";
import { SidebarProvider } from "@/context/SidebarContext";

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
