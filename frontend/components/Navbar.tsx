"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import {
  GraduationCap, Moon, Sun, Search, Menu, X,
  ChevronDown, LogOut, LogIn, Zap
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  {
    name: "Study Hub", href: "/study", color: "text-emerald-400",
    glow: "group-hover:shadow-emerald-500/20",
    items: [
      { name: "Engineering (IOE)", href: "/study/ioe", icon: "⚙️" },
      { name: "Loksewa Prep", href: "/study/loksewa", icon: "📋" },
      { name: "NEB Notes", href: "/study/neb", icon: "📚" },
      { name: "License Exams", href: "/study/license", icon: "🪪" },
    ],
  },
  {
    name: "Tools", href: "/tools", color: "text-violet-400",
    glow: "group-hover:shadow-violet-500/20",
    items: [
      { name: "Voice Typing AI", href: "/tools/voice-to-text", icon: "🎙️" },
      { name: "QR Generator", href: "/tools/qr-generator", icon: "📷" },
      { name: "Merge PDFs", href: "/tools/merge-pdf", icon: "📄" },
      { name: "TU Result Hub", href: "/tools/tu-result", icon: "🎓" },
      { name: "Image Compressor", href: "/tools/compressor", icon: "🗜️" },
      { name: "PDF Converter", href: "/tools/img-to-pdf", icon: "🔄" },
    ],
  },
  {
    name: "Market", href: "/market", color: "text-cyan-400",
    glow: "group-hover:shadow-cyan-500/20",
    items: [
      { name: "NEPSE Live", href: "/market", icon: "📈" },
      { name: "Forex Rates", href: "/market/forex", icon: "💱" },
      { name: "EMI Calculator", href: "/tools/emi-calculator", icon: "🧮" },
    ],
  },
];

export default function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeDrop, setActiveDrop] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setActiveDrop(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

const initial = user?.displayName ? String(user.displayName)[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : "U";
  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
      <header
        ref={ref}
        className={`fixed top-3 left-3 right-3 md:top-4 md:left-6 md:right-6 z-[1000] rounded-2xl transition-all duration-500 ${
          scrolled
            ? "glass-nav shadow-2xl shadow-black/40"
            : "bg-transparent border border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-[60px] flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0" onClick={() => setMobileMenu(false)}>
            <div className="relative flex items-center justify-center w-8 h-8 bg-foreground text-background rounded-lg">
              <GraduationCap size={18} className="font-bold" />
            </div>
            <span className="text-xl font-black tracking-tight text-foreground">
              tikajoshi.
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-3">
            <Link href="/" className="px-3 py-1.5 text-[13px] font-bold uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground rounded-lg hover:bg-foreground/5 transition">
              Home
            </Link>
            {navLinks.map((nav) => (
              <div key={nav.name} className="relative group">
                <button
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-bold uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground rounded-lg hover:bg-foreground/5 transition`}
                  onMouseEnter={() => setActiveDrop(nav.name)}
                  onMouseLeave={() => setActiveDrop(null)}
                >
                  {nav.name}
                  <ChevronDown size={14} className={`transition-transform duration-300 ${activeDrop === nav.name ? "rotate-180 text-primary" : ""}`} />
                </button>

                <AnimatePresence>
                  {activeDrop === nav.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-56 glass-card rounded-2xl p-2 shadow-2xl shadow-black/50 z-[9999]"
                      onMouseEnter={() => setActiveDrop(nav.name)}
                      onMouseLeave={() => setActiveDrop(null)}
                    >
                      {nav.items.map((item, i) => (
                        <Link
                          key={i}
                          href={item.href}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-white/8 hover:text-white transition group/item"
                        >
                          <span className="text-base">{item.icon}</span>
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            <Link href="/news" className="px-3 py-1.5 text-[13px] font-bold uppercase tracking-[0.1em] text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 rounded-lg hover:bg-cyan-500/10 transition">
              News
            </Link>
            <Link href="/chill-zone" className="px-3 py-1.5 text-[13px] font-bold uppercase tracking-[0.1em] text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 rounded-lg hover:bg-red-500/10 transition">
              Live Sports
            </Link>
            <Link href="/vehicles" className="px-3 py-1.5 text-[13px] font-bold uppercase tracking-[0.1em] text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 rounded-lg hover:bg-amber-500/10 transition">
              Vehicles
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search */}
            <div className={`flex items-center rounded-full transition-all duration-300 overflow-hidden ${
              searchOpen
                ? "w-40 md:w-56 bg-white/8 border border-indigo-500/40 px-3"
                : "w-9 h-9 bg-white/5 hover:bg-white/10 justify-center"
            }`}>
              <button onClick={() => setSearchOpen(!searchOpen)} className="text-slate-400 hover:text-white transition shrink-0">
                {searchOpen ? <X size={15} /> : <Search size={16} />}
              </button>
              {searchOpen && (
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent outline-none text-white text-sm ml-2 w-full placeholder:text-slate-600 h-9"
                  autoFocus
                />
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => mounted && setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 dark:bg-white/5 dark:hover:bg-white/10 transition relative overflow-hidden"
              aria-label="Toggle theme"
            >
              {mounted && resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              )}
            </button>

            {/* Mobile menu btn */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center text-white bg-white/5 rounded-full hover:bg-white/10 transition"
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              {mobileMenu ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* User / Login */}
            <div className="hidden md:block">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-full glass border border-white/8 hover:border-indigo-500/40 transition"
                  >
                    <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {initial}
                    </div>
                    <span className="text-xs text-slate-300 font-medium hidden lg:block max-w-[80px] truncate">
                      {displayName}
                    </span>
                    <ChevronDown size={12} className={`text-slate-500 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 glass-card rounded-2xl p-2 shadow-2xl shadow-black/50 z-[9999] border border-white/10"
                      >
                        {/* Profile Header */}
                        <div className="px-3 py-3 border-b border-white/8 mb-1">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {initial}
                            </div>
                            <div className="min-w-0">
                              <p className="text-white text-sm font-bold truncate">{displayName}</p>
                              <p className="text-slate-500 text-[10px] truncate">{user.email}</p>
                            </div>
                          </div>
                          {user.emailVerified === false && (
                            <div className="mt-2 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg">
                              ⚠️ Email not verified
                            </div>
                          )}
                        </div>

                        {/* Menu Items */}
                        <Link href="/chill-zone/create" onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-white/8 hover:text-white transition">
                          <span>📝</span> Create Post
                        </Link>
                        <Link href="/chill-zone" onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-white/8 hover:text-white transition">
                          <span>🍿</span> Chill Zone
                        </Link>

                        <div className="border-t border-white/8 mt-1 pt-1">
                          <button
                            onClick={() => { logout(); setProfileOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition"
                          >
                            <LogOut size={14} /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href="/login" className="relative px-4 py-2 rounded-full text-xs font-bold text-white overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-cyan-600 transition group-hover:opacity-80" />
                  <span className="relative">Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-3 top-[76px] z-[999] md:hidden"
          >
            <div className="glass-card rounded-3xl p-5 shadow-2xl shadow-black/60 max-h-[82vh] overflow-y-auto">
              {/* User section */}
              <div className="mb-4 p-3 rounded-2xl bg-white/4 border border-white/6">
                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                      {initial}
                    </div>
                    <div className="flex-1">
                     <p className="font-semibold text-white text-sm">{user.displayName || user.email}</p>
                      <button
                        onClick={() => { logout(); setMobileMenu(false); }}
                        className="text-xs text-red-400 flex items-center gap-1 mt-0.5"
                      >
                        <LogOut size={11} /> Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenu(false)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white py-2.5 rounded-xl font-bold text-sm"
                  >
                    <LogIn size={16} /> Login / Sign Up
                  </Link>
                )}
              </div>

              {/* Links */}
              <div className="space-y-1">
                {[
                  { href: "/", label: "Home", icon: "🏠" },
                  { href: "/news", label: "News", icon: "📰" },
                  { href: "/chill-zone", label: "Live Sports", icon: "📺" },
                  { href: "/vehicles", label: "Vehicles", icon: "🏍️" },
                  { href: "/quiz", label: "Quiz", icon: "🧠" },
                  { href: "/contact", label: "Contact", icon: "💬" },
                ].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileMenu(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/6 text-slate-300 text-sm font-medium transition"
                  >
                    <span>{l.icon}</span> {l.label}
                  </Link>
                ))}

                {navLinks.map((nav, i) => (
                  <div key={i} className="rounded-xl overflow-hidden">
                    <button
                      onClick={() => setActiveDrop(activeDrop === nav.name ? null : nav.name)}
                      className="flex justify-between items-center w-full p-3 text-slate-200 text-sm font-semibold hover:bg-white/6 rounded-xl transition"
                    >
                      {nav.name}
                      <ChevronDown size={16} className={`transition-transform ${activeDrop === nav.name ? "rotate-180 text-indigo-400" : "text-slate-600"}`} />
                    </button>
                    <AnimatePresence>
                      {activeDrop === nav.name && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-4 pb-2 space-y-0.5">
                            {nav.items.map((item, j) => (
                              <Link
                                key={j}
                                href={item.href}
                                onClick={() => setMobileMenu(false)}
                                className="flex items-center gap-2 p-2.5 rounded-lg text-slate-400 text-sm hover:text-white hover:bg-white/6 transition"
                              >
                                <span>{item.icon}</span> {item.name}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}