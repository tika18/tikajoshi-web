// frontend/app/admin/layout.tsx
"use client";

import React, { useState, useEffect, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { logoutAdmin } from "@/actions/adminAuth";
import { ToastProvider, useToast } from "@/components/Toast";
import {
  LayoutDashboard,
  BookOpen,
  Image as ImageIcon,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  Power,
  Menu,
  X,
  Database,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Blog Posts", href: "/admin/blogs", icon: BookOpen },
    { name: "Media Library", href: "/admin/media", icon: ImageIcon },
    { name: "System Settings", href: "/admin/settings", icon: Settings },
  ];

  // Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    const toastId = toast("Logging out...", "loading");
    await logoutAdmin();
    toast("Logged out successfully!", "success");
    router.push("/admin/login");
    router.refresh();
  };

  const executeShortcut = (href: string) => {
    setCommandPaletteOpen(false);
    router.push(href);
  };

  const filteredShortcuts = [
    { name: "Go to Dashboard", keys: ["g", "d"], href: "/admin" },
    { name: "Manage Blog Posts", keys: ["g", "b"], href: "/admin/blogs" },
    { name: "Open Media Library", keys: ["g", "m"], href: "/admin/media" },
    { name: "System Settings", keys: ["g", "s"], href: "/admin/settings" },
    { name: "Write New Post", keys: ["n", "p"], href: "/admin/blogs/new" },
  ].filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Don't show layout on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#020408] text-white flex">
      {/* Background aurora */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* --- DESKTOP SIDEBAR --- */}
      <aside
        className={`hidden md:flex flex-col bg-[#05090f]/90 border-r border-white/5 transition-all duration-300 relative ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute right-[-12px] top-8 bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/20 text-white rounded-full p-1 shadow-md hover:scale-105 active:scale-95 transition z-10"
        >
          {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
        </button>

        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-4 border-b border-white/5 overflow-hidden">
          <Link href="/admin" className="flex items-center gap-2.5 hover:opacity-90 transition">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center font-black text-sm shrink-0 glow-indigo">
              T
            </div>
            {sidebarOpen && (
              <span className="font-black text-sm tracking-tight grad-indigo-cyan bg-clip-text">
                tikajoshi <span className="text-[10px] text-indigo-400 font-medium">ADMIN</span>
              </span>
            )}
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all group ${
                  isActive
                    ? "bg-indigo-600/15 border border-indigo-500/20 text-indigo-300 shadow-inner"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                }`}
              >
                <Icon size={16} className={`${isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Database Status indicator */}
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {sidebarOpen && (
              <span className="text-[10px] font-bold text-emerald-400 tracking-wider flex items-center gap-1.5">
                <Database size={10} /> SANITY CONNECTED
              </span>
            )}
          </div>
        </div>

        {/* Sidebar Footer / User Profile & Logout */}
        <div className="p-3 border-t border-white/5">
          {sidebarOpen ? (
            <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] p-3 rounded-2xl">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xs font-black">
                  A
                </div>
                <div className="overflow-hidden">
                  <p className="text-[11px] font-bold text-white truncate">Administrator</p>
                  <p className="text-[9px] text-slate-500 truncate">admin@tikajoshi</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-slate-500 hover:text-red-400 rounded-lg transition"
                title="Logout"
              >
                <Power size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-xl transition"
              title="Logout"
            >
              <Power size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* --- MOBILE DRAWERS --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-[#05090f] border-r border-white/10 z-50 p-4 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between pb-6 border-b border-white/5">
                <span className="font-black text-sm grad-indigo-cyan bg-clip-text">tikajoshi admin</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition"
                >
                  <X size={18} />
                </button>
              </div>
              <nav className="flex-1 py-6 space-y-1.5">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        isActive
                          ? "bg-indigo-600/15 border border-indigo-500/20 text-indigo-300"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Icon size={16} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/15 flex items-center justify-center text-xs font-bold">A</div>
                  <span className="text-xs font-bold">Admin</span>
                </div>
                <button onClick={handleLogout} className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition">
                  <Power size={14} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- MAIN PAGE WRAPPER --- */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* --- HEADER --- */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-white/5 bg-[#020408]/65 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 md:hidden text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition"
            >
              <Menu size={18} />
            </button>

            {/* Search Bar / CMD+K palette trigger */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-slate-400 text-xs transition duration-200"
            >
              <Search size={14} className="text-slate-500" />
              <span>Search dashboard or run action...</span>
              <kbd className="bg-white/10 px-1.5 py-0.5 rounded border border-white/10 text-[9px] font-mono tracking-widest text-slate-500 uppercase">
                ⌘K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick action write post */}
            <Link
              href="/admin/blogs/new"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/20 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/10 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Write Post</span>
            </Link>
          </div>
        </header>

        {/* --- MAIN PAGE CONTENT --- */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto relative z-10">
          {children}
        </main>
      </div>

      {/* --- COMMAND PALETTE MODAL --- */}
      <AnimatePresence>
        {commandPaletteOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setCommandPaletteOpen(false)}
              className="fixed inset-0 bg-black"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              transition={{ duration: 0.15 }}
              className="bg-[#080d14] border border-white/[0.08] w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[350px] flex flex-col"
            >
              {/* Search input inside palette */}
              <div className="flex items-center px-4 border-b border-white/5 gap-3 h-14 shrink-0">
                <Search size={16} className="text-slate-500" />
                <input
                  type="text"
                  placeholder="Type a command or page name..."
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-600 outline-none"
                />
                <button
                  onClick={() => setCommandPaletteOpen(false)}
                  className="bg-white/5 text-slate-500 hover:text-white px-2 py-1 rounded text-[10px] font-bold"
                >
                  ESC
                </button>
              </div>

              {/* Suggestions */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 custom-scrollbar">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 px-3 py-1">
                  Actions & Navigation
                </p>
                {filteredShortcuts.length > 0 ? (
                  filteredShortcuts.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => executeShortcut(item.href)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-indigo-600/10 hover:text-indigo-300 border border-transparent hover:border-indigo-500/15 text-left text-xs font-semibold text-slate-300 transition duration-150"
                    >
                      <span>{item.name}</span>
                      <div className="flex gap-1">
                        {item.keys.map((k) => (
                          <kbd
                            key={k}
                            className="bg-white/10 px-1.5 py-0.5 rounded border border-white/10 text-[9px] font-mono text-slate-400 uppercase"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-600">No shortcuts found.</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </ToastProvider>
  );
}
