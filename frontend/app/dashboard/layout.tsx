"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen bg-[#f5fafb]">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}