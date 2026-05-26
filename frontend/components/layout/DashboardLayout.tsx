"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { ProfileProvider } from "@/hooks/useProfile";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { useEffect, useState } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";
  const isIntroPage = pathname === "/intro";
  const [checkingAuth, setCheckingAuth] = useState(true);


  useEffect(() => {
    const isLoggedIn = localStorage.getItem("omni_logged_in") === "true";
    // Always allow public auth pages to render.
    if (!isLoggedIn && !isLoginPage && !isIntroPage) {
      router.push("/login");

    } else {
      setCheckingAuth(false);
    }
  }, [pathname, isLoginPage, router]);

  // Prevent flash of content during redirect checks
  if (checkingAuth && !isLoginPage) {
    return (
      <div className="h-screen w-screen bg-[#05070c] flex items-center justify-center font-mono text-cyan-400 text-xs gap-2">
        <span className="w-4 h-4 rounded-full border border-cyan-400/40 border-t-cyan-400 animate-spin" />
        Decoupling Handshake Credentials...
      </div>
    );
  }

  return (
    <ProfileProvider>
      <div className="h-screen bg-[#05070c] text-slate-100 flex overflow-hidden relative">
        {/* Global HUD Ambient Effects */}
        <div className="omni-bg" />
        <div className="omni-glow" />
        <div className="omni-scanlines" />

        {!isLoginPage && <Sidebar />}
        <div className={cn(
          "flex-1 flex flex-col h-screen transition-all duration-300 ease-in-out overflow-hidden relative z-10",
          !isLoginPage ? "md:pl-[72px]" : "md:pl-0"
        )}>
          {!isLoginPage && <Navbar />}
          <main className="flex-1 overflow-y-auto w-full relative">{children}</main>
        </div>
      </div>
    </ProfileProvider>
  );
}


