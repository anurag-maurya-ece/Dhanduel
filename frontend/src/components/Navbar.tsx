"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Home,
  BarChart3,
  Users,
  Newspaper,
  BookOpen,
  LogOut,
  LogIn,
  Sun,
  Moon
} from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home, color: "#f44336" },
  { href: "/solo", label: "Trade", icon: BarChart3, color: "#06b6d4" },
  { href: "/multiplayer", label: "Arena", icon: Users, color: "#a855f7" },
  { href: "/news", label: "News", icon: Newspaper, color: "#f59e0b" },
  { href: "/casestudies", label: "Cases", icon: BookOpen, color: "#22c55e" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), []);

  // Hide navbar on login page
  if (pathname === "/login") return null;

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      {/* Top Brand Logo */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-5 left-8 z-50 flex items-center gap-3"
      >
        <Link href="/" className="flex items-center gap-3 group cursor-pointer hover:scale-105 transition-transform">
          {/* Circular Logo Image */}
          <div className="bg-white/80 dark:bg-white/90 p-1.5 rounded-full aspect-square flex items-center justify-center shadow-lg border border-white/20 dark:border-white/10 overflow-hidden h-10 w-10 sm:h-12 sm:w-12 animate-breathing-glow relative">
            <img 
              src="/logo.png" 
              alt="Dhan Duel Logo" 
              className="h-full w-full object-contain dark:drop-shadow-sm transform hover:rotate-6 transition-transform"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <span className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-blue-700 to-indigo-800 dark:from-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent tracking-tight drop-shadow-sm">
            DhanDuel
          </span>
        </Link>
      </motion.div>

      {/* Bottom Glowing Navigation */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 glow-nav-container">
        <div className="glow-nav-bar">
          <ul className="glow-nav-list">
            {navItems.map(({ href, label, icon: Icon, color }) => {
              const isActive = pathname === href;
              return (
                <li
                  key={href}
                  className={`glow-nav-item ${isActive ? "active" : ""}`}
                  style={{ "--clr": color } as React.CSSProperties}
                >
                  <Link href={href} className="glow-nav-link">
                    <span className="glow-nav-icon">
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="glow-nav-label">{label}</span>
                  </Link>
                </li>
              );
            })}

            {/* Theme Toggle */}
            <li className="glow-nav-item" style={{ "--clr": "#facc15" } as React.CSSProperties}>
              <button 
                onClick={toggleTheme} 
                className="glow-nav-link"
                title="Toggle Theme"
              >
                <span className="glow-nav-icon">
                  {mounted && theme === "light" ? (
                    <Moon className="w-5 h-5" />
                  ) : (
                    <Sun className="w-5 h-5" />
                  )}
                </span>
                <span className="glow-nav-label">Theme</span>
              </button>
            </li>

            {/* Auth button */}
            <li className="glow-nav-item" style={{ "--clr": "#64748b" } as React.CSSProperties}>
              {user ? (
                <button onClick={handleLogout} className="glow-nav-link">
                  <span className="glow-nav-icon">
                    <LogOut className="w-5 h-5" />
                  </span>
                  <span className="glow-nav-label">Logout</span>
                </button>
              ) : (
                <Link href="/login" className="glow-nav-link">
                  <span className="glow-nav-icon">
                    <LogIn className="w-5 h-5" />
                  </span>
                  <span className="glow-nav-label">Login</span>
                </Link>
              )}
            </li>
          </ul>
        </div>

        {/* User greeting — floating above the nav */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-xs text-gray-400 whitespace-nowrap"
          >
            👋 {user.displayName || user.email}
          </motion.div>
        )}
      </nav>

      {/* Bottom spacer to prevent content from hiding behind nav */}
      <div className="h-24" />
    </>
  );
}
