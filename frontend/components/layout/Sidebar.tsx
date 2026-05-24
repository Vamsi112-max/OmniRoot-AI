"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  Activity,
  AlertTriangle,
  Box,
  Gauge,
  Globe,
  Network,
  Radar,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  User,
  PanelLeftClose,
  PanelLeft,
  BookOpen
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProfile } from "@/hooks/useProfile";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <Gauge size={18} /> },
  { href: "/simulation", label: "Simulations", icon: <Activity size={18} /> },
  { href: "/infrastructure", label: "Infrastructure", icon: <Network size={18} /> },
  { href: "/incidents", label: "Incidents", icon: <AlertTriangle size={18} /> },
  { href: "/decoder", label: "AI Decoder", icon: <BookOpen size={18} /> },
  { href: "/copilot", label: "AI Copilot", icon: <Sparkles size={18} /> },
  { href: "/analytics", label: "Analytics", icon: <Radar size={18} /> },
  { href: "/settings", label: "Settings", icon: <Settings size={18} /> },
];

const colorMap: Record<string, string> = {
  cyan: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.2)]",
  rose: "bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.2)]",
  emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]",
  amber: "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]",
  violet: "bg-violet-500/10 border-violet-500/30 text-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.2)]",
};

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const { profile } = useProfile();

  const isExpanded = isHovered || isPinned;

  // Sync active index
  const activeIndex = useMemo(() => {
    const idx = navItems.findIndex((it) => it.href === pathname);
    return idx >= 0 ? idx : 0;
  }, [pathname]);

  // Initials for avatar
  const initials = useMemo(() => {
    if (!profile?.name) return "AM";
    const parts = profile.name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }, [profile?.name]);

  const activeColorClass = colorMap[profile.avatarColor] || colorMap.cyan;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed left-4 top-4 z-[60] rounded-xl bg-white/5 border border-white/10 backdrop-blur px-3 py-2 text-slate-100 hover:bg-white/10 transition"
      >
        <Box size={18} />
      </button>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop collapsible rail */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ width: isExpanded ? 260 : 72 }}
        className={cn(
          "fixed left-0 top-0 z-[58] h-screen",
          "hidden md:flex flex-col",
          "bg-[rgba(5,7,12,0.92)] border-r border-white/10 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,229,255,0.06)]",
          "overflow-hidden transition-all duration-300 ease-in-out px-3 py-5"
        )}
      >
        {/* Header/Logo */}
        <div className="flex items-center gap-3 px-1.5 mb-6 h-12 overflow-hidden shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_18px_rgba(34,211,238,0.35)] shrink-0">
            <Globe size={18} className="text-cyan-300" />
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="leading-tight whitespace-nowrap"
              >
                <div className="text-slate-100 font-semibold tracking-wide">OmniRoot</div>
                <div className="text-[12px] text-slate-300/80">AI Command</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation list */}
        <nav className="relative flex-1 space-y-1">
          {/* Active sliding indicator */}
          <div
            className="absolute left-0 w-1 rounded-full transition-all duration-300 ease-in-out"
            style={{ 
              height: 48, 
              transform: `translateY(${activeIndex * 52}px)`,
              opacity: activeIndex >= 0 ? 1 : 0
            }}
          >
            <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-600 shadow-[0_0_18px_rgba(34,211,238,0.65)]" />
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const active = item.href === pathname;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 transition-all h-[48px]",
                    active
                      ? "bg-white/[0.06] border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                      : "hover:bg-white/[0.04] hover:border-white/5"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className={cn(
                      "text-slate-300/90 shrink-0",
                      active && "text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.45)]"
                    )}
                  >
                    {item.icon}
                  </span>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-sm text-slate-200 font-medium tracking-wide whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Dot indicator when expanded */}
                  {active && isExpanded && (
                    <motion.span
                      layoutId="activeDot"
                      className="ml-auto w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.6)]"
                    />
                  )}

                  {/* Tooltip when collapsed */}
                  {!isExpanded && (
                    <div className="absolute left-[70px] bg-slate-950/95 border border-white/10 text-slate-100 text-xs font-medium px-3 py-2 rounded-xl shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Collapsible toggle / User Profile at bottom */}
        <div className="mt-auto space-y-4 pt-4 border-t border-white/5 shrink-0 overflow-hidden">
          {/* User Profile display */}
          <Link href="/settings" className="flex items-center gap-3 px-1 rounded-xl hover:bg-white/5 p-1 transition overflow-hidden">
            <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm shrink-0", activeColorClass)}>
              {initials}
            </div>
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="leading-tight whitespace-nowrap overflow-hidden flex-1"
                >
                  <div className="text-sm font-semibold text-slate-100">{profile.name}</div>
                  <div className="text-[11px] text-slate-400">{profile.role}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>

          {/* Pin/Collapse trigger button */}
          <button
            onClick={() => setIsPinned(!isPinned)}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] px-3 py-2.5 text-slate-300 hover:text-white transition whitespace-nowrap overflow-hidden h-[42px]"
          >
            {isPinned ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs font-medium"
                >
                  Pin Sidebar
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (always full width menu when open) */}
      {mobileOpen && (
        <aside
          className={cn(
            "fixed z-[59] top-0 left-0 h-screen w-[280px] md:hidden",
            "bg-gradient-to-b from-white/[0.04] to-white/[0.02]",
            "border-r border-white/10 backdrop-blur-xl shadow-[0_0_40px_rgba(0,229,255,0.10)]",
            "overflow-hidden"
          )}
        >
          <div className="h-full flex flex-col px-4 py-5">
            <div className="flex items-center gap-3 px-1 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_18px_rgba(34,211,238,0.35)]">
                <Globe size={18} className="text-cyan-300" />
              </div>
              <div className="leading-tight">
                <div className="text-slate-100 font-semibold tracking-wide">OmniRoot</div>
                <div className="text-[12px] text-slate-300/80">AI Command</div>
              </div>
            </div>

            <nav className="relative flex-1 space-y-1">
              <div
                className="absolute left-0 w-1 rounded-full"
                style={{ height: 48, transform: `translateY(${activeIndex * 52}px)` }}
              >
                <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-600 shadow-[0_0_18px_rgba(34,211,238,0.65)]" />
              </div>

              <div className="space-y-1">
                {navItems.map((item) => {
                  const active = item.href === pathname;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "relative flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 transition-all",
                        active
                          ? "bg-white/[0.06] border-cyan-400/30 shadow-[0_0_22px_rgba(34,211,238,0.22)]"
                          : "hover:bg-white/[0.04] hover:border-white/10"
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      <span
                        className={cn(
                          "text-slate-200/90",
                          active && "text-cyan-200 drop-shadow-[0_0_10px_rgba(34,211,238,0.45)]"
                        )}
                      >
                        {item.icon}
                      </span>
                      <span className="text-sm text-slate-100 font-medium tracking-wide">{item.label}</span>
                      {active && (
                        <span className="ml-auto w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.65)]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Profile on mobile */}
            <div className="mt-auto pt-4 border-t border-white/5 flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm", activeColorClass)}>
                {initials}
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-slate-100">{profile.name}</div>
                <div className="text-[11px] text-slate-400">{profile.role}</div>
              </div>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
