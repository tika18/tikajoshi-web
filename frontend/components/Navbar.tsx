"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { GraduationCap, Moon, Sun, Search, Menu, X, ChevronDown, LogOut, LogIn, Home, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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
    return user?.name ? user.name.charAt(0).toUpperCase() : 'U';
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
        { name: "Voice Typing 🎙️", href: "/tools/voice-to-text" }, // NEW ADDED
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

  const DesktopNavItem = ({ title, href, items }: { title: string, href: string, items?: { name: string, href: string }[] }) => (
    <div className="relative group h-16 flex items-center">
      <Link href={href} className="flex items-center gap-1 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition py-4">
        {title} {items && <ChevronDown size={14} className="group-hover:rotate-180 transition duration-300"/>}
      </Link>
      {items && (
        <div className="absolute top-14 left-0 w-56 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-2 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-out z-[9999]">
          {items.map((link, i) => (
            <Link key={i} href={link.href} className="block px-4 py-3 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-500 transition">
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
    <header className="fixed top-0 w-full z-[1000] bg-white/95 dark:bg-[#020817]/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800" ref={dropdownRef}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group z-[1001]" onClick={() => setMobileMenu(false)}>
          <div className="bg-emerald-600 p-1.5 rounded-lg text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition">
             <GraduationCap size={20} />
          </div>
          <span className="text-lg md:text-xl font-black tracking-tight text-slate-900 dark:text-white">Tikajoshi</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition">Home</Link>
          {navLinks.map((nav, idx) => (
            <DesktopNavItem key={idx} title={nav.name} href={nav.href} items={nav.items} />
          ))}
          <Link href="/news" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:scale-105 transition">News Hub 📰</Link>
          <Link href="/chill-zone" className="text-sm font-bold text-pink-600 dark:text-pink-400 hover:scale-105 transition">Chill Zone 🍿</Link>
        </nav>

        <div className="flex items-center gap-2 md:gap-3 z-[1001]">
          <div className={`flex items-center bg-slate-100 dark:bg-slate-800 rounded-full transition-all duration-300 ${searchOpen ? "w-40 md:w-64 px-3 border border-emerald-500" : "w-9 h-9 justify-center"}`}>
             <button onClick={() => setSearchOpen(!searchOpen)} className="text-slate-500 dark:text-slate-400 hover:text-emerald-500">
                {searchOpen ? <X size={16}/> : <Search size={18}/>}
             </button>
             {searchOpen && (
                <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-slate-900 dark:text-white text-sm ml-2 w-full" autoFocus />
             )}
          </div>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition">
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-orange-500" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
          </button>
          
          <button className="md:hidden p-2 text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition z-[1002]" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X size={20}/> : <Menu size={20}/>}
          </button>

          <div className="hidden md:block">
            {user ? (
                <div className="flex items-center gap-2 cursor-pointer bg-slate-100 dark:bg-slate-800 py-1 px-2 rounded-full border border-slate-200 dark:border-slate-700" onClick={logout}>
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">{getUserInitial()}</div>
                </div>
            ) : (
                <Link href="/login" className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-full text-xs font-bold transition shadow-lg shadow-emerald-500/20">Login</Link>
            )}
          </div>
        </div>
      </div>
    </header>

    <AnimatePresence>
        {mobileMenu && (
            <motion.div initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="fixed inset-0 top-16 bg-white dark:bg-[#020817] z-[999] overflow-y-auto md:hidden">
                <div className="p-6 pb-32 flex flex-col min-h-full">
                    <div className="mb-8 p-4 bg-slate-50 dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">{getUserInitial()}</div>
                                <div><p className="font-bold text-slate-900 dark:text-white">{user.name || "User"}</p><button onClick={() => { logout(); setMobileMenu(false); }} className="text-xs text-red-500 font-bold flex items-center gap-1 mt-1">Log Out <LogOut size={12}/></button></div>
                            </div>
                        ) : (
                            <Link href="/login" onClick={() => setMobileMenu(false)} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"><LogIn size={18}/> Login / Sign Up</Link>
                        )}
                    </div>
                    <div className="flex-1 space-y-1">
                        <div className="border-b border-slate-100 dark:border-slate-800"><Link href="/" onClick={() => setMobileMenu(false)} className="flex items-center gap-3 py-4 text-slate-800 dark:text-slate-200 font-bold text-lg"><Home size={20} className="text-emerald-500"/> Home</Link></div>
                        {navLinks.map((nav, i) => (
                          <div key={i} className="border-b border-slate-100 dark:border-slate-800">
                            <button onClick={() => toggleMobileSection(nav.name)} className="flex justify-between items-center w-full py-4 text-slate-800 dark:text-slate-200 font-bold text-lg">{nav.name}<ChevronDown size={20} className={`transition-transform duration-300 ${activeMobileDropdown === nav.name ? "rotate-180 text-emerald-500" : ""}`}/></button>
                            <AnimatePresence>{activeMobileDropdown === nav.name && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="flex flex-col gap-1 pb-4 pl-4 border-l-2 border-slate-200 dark:border-slate-700 ml-2">{nav.items.map((link, j) => (<Link key={j} href={link.href} onClick={() => setMobileMenu(false)} className="text-slate-500 dark:text-slate-400 py-2 text-base font-medium hover:text-emerald-500 transition flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>{link.name}</Link>))}</div></motion.div>)}</AnimatePresence>
                          </div>
                        ))}
                        <div className="border-b border-slate-100 dark:border-slate-800 py-4"><Link href="/news" onClick={() => setMobileMenu(false)} className="flex items-center justify-between text-lg font-bold text-blue-600 dark:text-blue-400">News Hub 📰 <ChevronRight size={20}/></Link></div>
                        <div className="border-b border-slate-100 dark:border-slate-800 py-4"><Link href="/chill-zone" onClick={() => setMobileMenu(false)} className="flex items-center justify-between text-lg font-bold text-pink-600 dark:text-pink-400">Chill Zone 🍿 <ChevronRight size={20}/></Link></div>
                    </div>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
    </>
  );
}