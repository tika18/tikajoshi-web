"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { GraduationCap, Moon, Sun, Search, Menu, X, ChevronDown, LogOut, LogIn, Home } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveMobileDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMobileSection = (section: string) => {
    setActiveMobileDropdown(activeMobileDropdown === section ? null : section);
  };

  const getUserInitial = () => {
    if (!user?.name) return "U";
    const name = String(user.name).trim();
    return name.length > 0 ? name.charAt(0).toUpperCase() : "U";
  };

  const navLinks = [
    {
      name: "Study Hub", href: "/study",
      items: [
        { name: "Engineering (IOE)", href: "/study/ioe" },
        { name: "Loksewa Prep", href: "/study/loksewa" },
        { name: "NEB Notes", href: "/study/neb" },
        { name: "License Exams", href: "/study/license" }
      ]
    },
    {
      name: "Smart Tools", href: "/tools",
      items: [
        { name: "Voice Typing 🎙️", href: "/tools/voice-to-text" },
        { name: "QR Generator", href: "/tools/qr-generator" },
        { name: "Merge PDFs", href: "/tools/merge-pdf" },
        { name: "TU Result Hub", href: "/tools/tu-result" },
        { name: "Image Compressor", href: "/tools/compressor" },
        { name: "PDF Converter", href: "/tools/img-to-pdf" }
      ]
    },
    {
      name: "Market", href: "/market",
      items: [
        { name: "Share Market", href: "/market" },
        { name: "Forex & Converter", href: "/market/forex" },
        { name: "EMI Calculator", href: "/tools/emi-calculator" }
      ]
    }
  ];

  const DesktopNavItem = ({ title, href, items }: { title: string; href: string; items?: { name: string; href: string }[] }) => (
    <div className="relative group h-full flex items-center">
      <Link href={href} className="flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-white transition py-2 px-3 rounded-full hover:bg-white/5">
        {title} {items && <ChevronDown size={14} className="group-hover:rotate-180 transition duration-300" />}
      </Link>
      {items && (
        <div className="absolute top-12 left-0 w-60 glass-card rounded-2xl p-2 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-out z-[9999]">
          {items.map((link, i) => (
            <Link key={i} href={link.href} className="block px-4 py-3 rounded-xl text-sm text-slate-300 hover:bg-white/10 hover:text-cyan-400 transition">
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <header className="fixed top-4 left-4 right-4 md:left-10 md:right-10 z-[1000] glass-nav rounded-2xl shadow-2xl border border-white/5" ref={dropdownRef}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">

          <Link href="/" className="flex items-center gap-3 group z-[1001]" onClick={() => setMobileMenu(false)}>
            <div className="bg-gradient-to-br from-violet-600 to-cyan-500 p-2 rounded-xl text-white shadow-lg shadow-violet-500/20 group-hover:scale-110 transition">
              <GraduationCap size={20} />
            </div>
            <span className="text-xl font-black tracking-tight text-white">Tikajoshi</span>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <Link href="/" className="text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 px-4 py-2 rounded-full transition">Home</Link>
            {navLinks.map((nav, idx) => (
              <DesktopNavItem key={idx} title={nav.name} href={nav.href} items={nav.items} />
            ))}
            <Link href="/news" className="text-sm font-bold text-cyan-400 hover:scale-105 transition px-3">News</Link>
            <Link href="/chill-zone" className="text-sm font-bold text-violet-400 hover:scale-105 transition px-3">Chill Zone</Link>
          </nav>

          <div className="flex items-center gap-3 z-[1001]">
            <div className={`flex items-center bg-white/5 rounded-full transition-all duration-300 ${searchOpen ? "w-40 md:w-64 px-3 border border-violet-500/50" : "w-10 h-10 justify-center hover:bg-white/10"}`}>
              <button onClick={() => setSearchOpen(!searchOpen)} className="text-slate-400 hover:text-white transition">
                {searchOpen ? <X size={16} /> : <Search size={18} />}
              </button>
              {searchOpen && (
                <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-white text-sm ml-2 w-full placeholder:text-slate-500" autoFocus />
              )}
            </div>

            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-400" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-violet-400" />
            </button>

            <button className="md:hidden w-10 h-10 flex items-center justify-center text-white bg-white/5 rounded-full hover:bg-white/10 transition z-[1002]" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="hidden md:block">
              {user ? (
                <div className="flex items-center gap-2 cursor-pointer bg-white/5 py-1 px-1.5 rounded-full border border-white/5 hover:border-violet-500/50 transition" onClick={logout}>
                  <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner">
                    {getUserInitial()}
                  </div>
                </div>
              ) : (
                <Link href="/login" className="bg-violet-600 hover:bg-violet-500 text-white px-5 py-2 rounded-full text-xs font-bold transition shadow-lg shadow-violet-500/20">Login</Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenu && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed inset-0 top-24 mx-4 z-[999] md:hidden">
            <div className="glass-card rounded-3xl p-6 shadow-2xl border border-white/10 max-h-[85vh] overflow-y-auto">
              <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {getUserInitial()}
                    </div>
                    <div>
                      <p className="font-bold text-white">{user.name || "User"}</p>
                      <button onClick={() => { logout(); setMobileMenu(false); }} className="text-xs text-red-400 font-bold flex items-center gap-1 mt-1">
                        Log Out <LogOut size={12} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link href="/login" onClick={() => setMobileMenu(false)} className="w-full bg-violet-600 text-white py-3 rounded-xl font-bold text-center flex items-center justify-center gap-2">
                    <LogIn size={18} /> Login / Sign Up
                  </Link>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <Link href="/" onClick={() => setMobileMenu(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-slate-200 font-bold">
                  <Home size={20} className="text-violet-500" /> Home
                </Link>
                {navLinks.map((nav, i) => (
                  <div key={i} className="rounded-xl overflow-hidden bg-white/5 mb-2">
                    <button onClick={() => toggleMobileSection(nav.name)} className="flex justify-between items-center w-full p-4 text-slate-200 font-bold">
                      {nav.name}
                      <ChevronDown size={20} className={`transition-transform duration-300 ${activeMobileDropdown === nav.name ? "rotate-180 text-violet-500" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {activeMobileDropdown === nav.name && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}>
                          <div className="flex flex-col gap-1 pb-4 px-4">
                            {nav.items.map((link, j) => (
                              <Link key={j} href={link.href} onClick={() => setMobileMenu(false)} className="text-slate-400 py-2.5 px-3 rounded-lg text-sm hover:bg-white/10 hover:text-cyan-400 transition flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-slate-600"></div>{link.name}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Link href="/news" onClick={() => setMobileMenu(false)} className="bg-blue-500/10 p-4 rounded-xl text-center font-bold text-blue-400 border border-blue-500/20">News Hub 📰</Link>
                  <Link href="/chill-zone" onClick={() => setMobileMenu(false)} className="bg-pink-500/10 p-4 rounded-xl text-center font-bold text-pink-400 border border-pink-500/20">Chill Zone 🍿</Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
