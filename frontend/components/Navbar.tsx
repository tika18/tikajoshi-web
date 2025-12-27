"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { GraduationCap, Moon, Sun, Search, Menu, X, ChevronDown, User, LogIn } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Helper for Dropdown
  const NavItem = ({ title, href, links }: { title: string, href: string, links?: { name: string, href: string }[] }) => (
    <div className="relative group h-16 flex items-center cursor-pointer">
      <Link href={href} className="flex items-center gap-1 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition">
        {title} {links && <ChevronDown size={14} className="group-hover:rotate-180 transition"/>}
      </Link>
      {links && (
        <div className="absolute top-12 left-0 w-56 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0 z-50">
          {links.map((link, i) => (
            <Link key={i} href={link.href} className="block px-4 py-3 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#020817]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-1.5 rounded-lg text-white shadow-lg shadow-primary/30 group-hover:scale-110 transition">
             <GraduationCap size={22} />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            Tikajoshi
          </span>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <NavItem title="Study Hub" href="/study" links={[
            { name: "Engineering (IOE)", href: "/study/ioe" },
            { name: "Loksewa Aayog", href: "/study/loksewa" },
            { name: "NEB (+2)", href: "/study/neb" },
            { name: "License Exams", href: "/study/license" }
          ]} />
          
          <NavItem title="Smart Tools" href="/tools" links={[
            { name: "TU Result Hub", href: "/tools/tu-result" },
            { name: "Date Converter", href: "/tools/date-converter" },
            { name: "Passport Photo", href: "/tools/passport-photo" },
            { name: "Image Compressor", href: "/tools/compressor" }
          ]} />

          <NavItem title="Market" href="/market" links={[
            { name: "Share Market", href: "/market" },
            { name: "Forex Rates", href: "/market/forex" }
          ]} />

          <Link href="/chill-zone" className="text-sm font-bold text-pink-600 dark:text-pink-400 hover:scale-105 transition">Chill Zone 🏖️</Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className={`flex items-center bg-slate-100 dark:bg-slate-800 rounded-full transition-all duration-300 ${searchOpen ? "w-64 px-3 border border-primary" : "w-10 px-0 justify-center"} h-10`}>
             <button onClick={() => setSearchOpen(!searchOpen)} className="text-slate-500 dark:text-slate-400 hover:text-primary">
                {searchOpen ? <X size={16}/> : <Search size={18}/>}
             </button>
             {searchOpen && (
                <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-slate-900 dark:text-white text-sm ml-2 w-full" autoFocus />
             )}
          </div>

          {/* Theme Toggle */}
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
            className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-orange-500" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
          </button>

          {/* Auth */}
          {user ? (
            <div className="relative group">
                <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold cursor-pointer shadow-lg">
                    {user.name[0].toUpperCase()}
                </div>
                <button onClick={logout} className="absolute top-10 right-0 bg-red-500 text-white text-xs px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                    Log Out
                </button>
            </div>
          ) : (
            <div className="hidden md:flex gap-2">
                <Link href="/login" className="px-5 py-2 rounded-full text-xs font-bold transition border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                    Login
                </Link>
                <Link href="/login" className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-full text-xs font-bold transition shadow-lg shadow-primary/20">
                    Sign Up
                </Link>
            </div>
          )}

          <button className="md:hidden text-slate-900 dark:text-white" onClick={() => setMobileMenu(!mobileMenu)}>
            <Menu />
          </button>
        </div>
      </div>
    </header>
  );
}