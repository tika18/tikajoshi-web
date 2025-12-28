"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { GraduationCap, Moon, Sun, Search, Menu, X, ChevronDown, LogOut, ChevronRight, Home, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  
  // State
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileActive, setMobileActive] = useState<string | null>(null);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) setMobileMenu(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenu) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [mobileMenu]);

  // Mobile Accordion Toggle
  const toggleMobileSection = (section: string) => {
    setMobileActive(mobileActive === section ? null : section);
  };

  // Helper: Desktop Dropdown Item
  const NavItem = ({ title, href, links }: { title: string, href: string, links?: { name: string, href: string }[] }) => (
    <div className="relative group h-16 flex items-center cursor-pointer">
      <Link href={href} className="flex items-center gap-1 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition">
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

  // Helper: Mobile Accordion Item
  const MobileNavItem = ({ title, links }: { title: string, links: { name: string, href: string }[] }) => (
    <div className="border-b border-slate-100 dark:border-slate-800">
        <button 
            onClick={() => toggleMobileSection(title)} 
            className="flex justify-between items-center w-full py-4 text-slate-800 dark:text-slate-200 font-bold text-lg"
        >
            {title}
            <ChevronDown size={20} className={`transition-transform duration-300 ${mobileActive === title ? "rotate-180 text-emerald-500" : ""}`}/>
        </button>
        
        <AnimatePresence>
            {mobileActive === title && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: "auto", opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <div className="flex flex-col gap-1 pb-4 pl-4 border-l-2 border-slate-200 dark:border-slate-700 ml-2">
                        {links.map((link, i) => (
                            <Link 
                                key={i} 
                                href={link.href} 
                                onClick={() => setMobileMenu(false)}
                                className="text-slate-500 dark:text-slate-400 py-2 text-base font-medium hover:text-emerald-500 transition flex items-center gap-2"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );

  return (
    <>
    <header className="fixed top-0 w-full z-[100] bg-white/90 dark:bg-[#020817]/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group z-[101]" onClick={() => setMobileMenu(false)}>
          <div className="bg-emerald-600 p-1.5 rounded-lg text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition">
             <GraduationCap size={20} />
          </div>
          <span className="text-lg md:text-xl font-black tracking-tight text-slate-900 dark:text-white">Tikajoshi</span>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition">Home</Link>
          
          <NavItem title="Study Hub" href="/study" links={[
            { name: "Engineering (IOE)", href: "/study/ioe" },
            { name: "Loksewa Prep", href: "/study/loksewa" },
            { name: "NEB (+2)", href: "/study/neb" },
            { name: "License Exams", href: "/study/license" }
          ]} />
          
          <NavItem title="Smart Tools" href="/tools" links={[
            { name: "TU Result Hub", href: "/tools/tu-result" },
            { name: "Date Converter", href: "/tools/date-converter" },
            { name: "Passport Photo", href: "/tools/passport-photo" },
            { name: "Image Compressor", href: "/tools/compressor" },
            { name: "PDF Converter", href: "/tools/img-to-pdf" }
          ]} />

          <NavItem title="Market" href="/market" links={[
            { name: "Share Market", href: "/market" },
            { name: "Forex Rates", href: "/market/forex" },
            { name: "EMI Calculator", href: "/tools/emi-calculator" }
          ]} />

          <Link href="/chill-zone" className="text-sm font-bold text-pink-600 dark:text-pink-400 hover:scale-105 transition">Chill Zone 🏖️</Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-3 z-[101]">
          {/* Search Toggle */}
          <div className={`flex items-center bg-slate-100 dark:bg-slate-800 rounded-full transition-all duration-300 ${searchOpen ? "w-40 md:w-64 px-3 border border-emerald-500" : "w-9 h-9 justify-center"}`}>
             <button onClick={() => setSearchOpen(!searchOpen)} className="text-slate-500 dark:text-slate-400 hover:text-emerald-500">
                {searchOpen ? <X size={16}/> : <Search size={18}/>}
             </button>
             {searchOpen && (
                <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-slate-900 dark:text-white text-sm ml-2 w-full" autoFocus />
             )}
          </div>

          {/* Theme Toggle */}
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-orange-500" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
          </button>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X size={20}/> : <Menu size={20}/>}
          </button>

          {/* Desktop Auth */}
          <div className="hidden md:block">
            {user ? (
                <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold cursor-pointer shadow-lg" onClick={logout}>
                    {user.name[0].toUpperCase()}
                </div>
            ) : (
                <Link href="/login" className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-full text-xs font-bold transition shadow-lg shadow-emerald-500/20">
                    Login
                </Link>
            )}
          </div>
        </div>
      </div>
    </header>

    {/* MOBILE MENU FULLSCREEN */}
    <AnimatePresence>
        {mobileMenu && (
            <motion.div 
                initial={{ opacity: 0, x: "100%" }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-0 top-16 bg-white dark:bg-[#020817] z-[99] overflow-y-auto md:hidden"
            >
                <div className="p-6 pb-32 flex flex-col min-h-full">
                    {/* User Mobile */}
                    <div className="mb-8 p-4 bg-slate-50 dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">{user.name[0].toUpperCase()}</div>
                                <button onClick={() => { logout(); setMobileMenu(false); }} className="text-red-500 bg-red-500/10 p-2 rounded-lg"><LogOut size={18}/></button>
                            </div>
                        ) : (
                            <Link href="/login" onClick={() => setMobileMenu(false)} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-center flex items-center justify-center gap-2"><LogIn size={18}/> Login</Link>
                        )}
                    </div>

                    <div className="flex-1 space-y-1">
                        <div className="border-b border-slate-100 dark:border-slate-800"><Link href="/" onClick={() => setMobileMenu(false)} className="flex items-center gap-3 py-4 text-slate-800 dark:text-slate-200 font-bold text-lg"><Home size={20} className="text-emerald-500"/> Home</Link></div>
                        <MobileNavItem title="Study Hub 📚" links={[{ name: "Engineering (IOE)", href: "/study/ioe" }, { name: "Loksewa Prep", href: "/study/loksewa" }, { name: "NEB Notes", href: "/study/neb" }, { name: "License Exams", href: "/study/license" }]}/>
                        <MobileNavItem title="Smart Tools 🛠️" links={[{ name: "TU Result Hub", href: "/tools/tu-result" }, { name: "Date Converter", href: "/tools/date-converter" }, { name: "Passport Photo", href: "/tools/passport-photo" }, { name: "Image Compressor", href: "/tools/compressor" }, { name: "PDF Converter", href: "/tools/img-to-pdf" }]}/>
                        <MobileNavItem title="Market 📈" links={[{ name: "Share Market", href: "/market" }, { name: "Forex Exchange", href: "/market/forex" }, { name: "EMI Calculator", href: "/tools/emi-calculator" }]}/>
                        <div className="border-b border-slate-100 dark:border-slate-800 py-4"><Link href="/chill-zone" onClick={() => setMobileMenu(false)} className="flex items-center justify-between text-lg font-bold text-pink-600 dark:text-pink-400">Chill Zone 🏖️ <ChevronRight size={20}/></Link></div>
                        <div className="border-b border-slate-100 dark:border-slate-800 py-4"><Link href="/quiz" onClick={() => setMobileMenu(false)} className="flex items-center justify-between text-lg font-bold text-yellow-600 dark:text-yellow-400">Daily Quiz ⚡ <ChevronRight size={20}/></Link></div>
                    </div>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
    </>
  );
}