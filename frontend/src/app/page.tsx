"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  BarChart3,
  Users,
  Newspaper,
  BookOpen,
  TrendingUp,
  Zap,
  Shield,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const features = [
  {
    href: "/solo",
    icon: BarChart3,
    color: "from-cyan-400 to-blue-600",
    glow: "shadow-blue-500/20 hover:shadow-blue-500/40",
    border: "hover:border-blue-500/40",
    label: "Solo Trading",
    tag: "Live Data",
    tagColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    description:
      "Paper trade real stocks — Apple, Tesla, Nifty 50, Bitcoin — with live Yahoo Finance charts. Switch between USD & INR instantly.",
  },
  {
    href: "/multiplayer",
    icon: Users,
    color: "from-purple-400 to-indigo-600",
    glow: "shadow-purple-500/20 hover:shadow-purple-500/40",
    border: "hover:border-purple-500/40",
    label: "Multiplayer Arena",
    tag: "Real-time",
    tagColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    description:
      "Create or join a live trading room using a 6-digit code. Compete on a real-time leaderboard with your friends.",
  },
  {
    href: "/news",
    icon: Newspaper,
    color: "from-pink-400 to-rose-600",
    glow: "shadow-pink-500/20 hover:shadow-pink-500/40",
    border: "hover:border-pink-500/40",
    label: "AI News Feed",
    tag: "Gemini AI",
    tagColor: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
    description:
      "Every major market headline, analyzed in real-time by Gemini AI. See instantly if the news is Bullish, Bearish, or Neutral.",
  },
  {
    href: "/casestudies",
    icon: BookOpen,
    color: "from-amber-400 to-orange-600",
    glow: "shadow-amber-500/20 hover:shadow-amber-500/40",
    border: "hover:border-amber-500/40",
    label: "Case Studies",
    tag: "Historical",
    tagColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    description:
      "Go back in time — the 2008 Crash, the Zomato IPO — and make real decisions. Earn points for historically correct calls.",
  },
];

const pillars = [
  { icon: Zap, text: "Real-time market data" },
  { icon: Shield, text: "Risk-free paper trading" },
  { icon: TrendingUp, text: "Gamified investing lessons" },
];

// Floating particle data
const particles = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  size: Math.random() * 4 + 2,
  x: Math.random() * 100,
  y: Math.random() * 100,
  delay: Math.random() * 4,
  duration: Math.random() * 6 + 6,
}));

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden relative transition-colors duration-300">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 pointer-events-none opacity-50 dark:opacity-100 transition-opacity">
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 10, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-blue-600/10 rounded-full blur-[130px]"
        />
        <motion.div
          animate={{ x: [0, -40, 20, 0], y: [0, 30, -15, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-0 w-[500px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, 20, -30, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-[-10%] w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[120px]"
        />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.5, 0],
              y: [0, -100, -200],
              x: [0, Math.random() * 40 - 20],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeOut",
            }}
            className="absolute rounded-full bg-blue-400/30 dark:bg-blue-400/20"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          {/* Sparkle badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full text-blue-700 dark:text-blue-400 text-sm font-medium mb-6"
          >
            <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <Sparkles className="w-4 h-4" />
            </motion.div>
            Gamified Stock Market Education
          </motion.div>

          {/* Animated heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight"
          >
            Invest Smarter,{" "}
            <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent animate-gradient-shift">
              Risk Nothing.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-gray-600 dark:text-slate-300 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed mb-8"
          >
            Dhan Duel turns financial education into an immersive game.
            Trade real live stocks with virtual money, compete with friends,
            and learn from history — all in one place.
          </motion.p>

          {/* Animated Pillars */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {pillars.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center gap-2 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 px-4 py-2 rounded-full text-sm text-gray-700 dark:text-gray-300 cursor-default"
              >
                <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                {text}
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, type: "spring" }}
          >
            <Link
              href="/solo"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-8 py-4 rounded-2xl text-lg shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_55px_rgba(37,99,235,0.5)] transition-all duration-300 animate-breathing-glow"
            >
              Start Trading Now
              <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map(({ href, icon: Icon, color, glow, border, label, tag, tagColor, description }, i) => (
            <motion.div
              key={href}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.12 + 0.4, type: "spring", stiffness: 150, damping: 20 }}
              whileHover={{ y: -6, scale: 1.02 }}
            >
              <Link
                href={href}
                className={`block glass-panel p-6 rounded-2xl border border-black/5 dark:border-white/10 ${border} shadow-lg ${glow} transition-all duration-300 group`}
              >
                <div className="flex justify-between items-start mb-4">
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
                    transition={{ duration: 0.5 }}
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <span className={`text-xs px-2 py-1 rounded-full border font-semibold ${tagColor}`}>{tag}</span>
                </div>
                <h2 className="text-xl font-bold mb-2 text-foreground transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-300">{label}</h2>
                <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed">{description}</p>
                <div className="flex items-center mt-4 text-sm font-medium text-gray-600 dark:text-blue-400 group-hover:text-blue-600 transition-colors">
                  Explore <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
