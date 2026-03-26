"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import {
  GraduationCap, Moon, Sun, Search, Menu, X,
  ChevronDown, LogOut, LogIn, Home, Zap,
  BookOpen, BarChart2, Newspaper, Popcorn
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
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeDrop, setActiveDrop] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  const initial = user?.name ? String(user.name)[0].toUpperCase() : "U";

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
          <Link href="/" className="flex items-center gap-2.5 group shrink-0" onClick={() => setMobileMenu(false)}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl blur-md opacity-60 group-hover:opacity-100 transition" />
              <div className="relative bg-gradient-to-br from-indigo-600 to-cyan-500 p-2 rounded-xl text-white">
                <GraduationCap size={18} />
              </div>
            </div>
            <span className="text-lg font-black tracking-tight text-white font-[Syne]">
              tika<span className="grad-indigo-cyan">joshi</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition">
              Home
            </Link>
            {navLinks.map((nav) => (
              <div key={nav.name} className="relative group">
                <button
                  className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition`}
                  onMouseEnter={() => setActiveDrop(nav.name)}
                  onMouseLeave={() => setActiveDrop(null)}
                >
                  {nav.name}
                  <ChevronDown size={12} className={`transition-transform duration-300 ${activeDrop === nav.name ? "rotate-180 text-indigo-400" : ""}`} />
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
            <Link href="/news" className="px-3 py-1.5 text-sm font-medium text-cyan-400 hover:text-cyan-300 rounded-lg hover:bg-cyan-500/10 transition">
              News
            </Link>
            <Link href="/chill-zone" className="px-3 py-1.5 text-sm font-medium text-violet-400 hover:text-violet-300 rounded-lg hover:bg-violet-500/10 transition">
              Chill Zone
            </Link>
            <Link href="/vehicles" className="px-3 py-1.5 text-sm font-medium text-amber-400 hover:text-amber-300 rounded-lg hover:bg-amber-500/10 transition">
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
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition relative"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-400 absolute" />
              <Moon className="h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-indigo-400 absolute" />
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
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/8 hover:border-red-500/40 transition group"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {initial}
                  </div>
                  <LogOut size={13} className="text-slate-500 group-hover:text-red-400 transition" />
                </button>
              ) : (
                <Link
                  href="/login"
                  className="relative px-4 py-2 rounded-full text-xs font-bold text-white overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-cyan-600 transition group-hover:opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-cyan-600 blur-md opacity-0 group-hover:opacity-60 transition" />
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
                      <p className="font-semibold text-white text-sm">{user.name}</p>
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
                  { href: "/chill-zone", label: "Chill Zone", icon: "🍿" },
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