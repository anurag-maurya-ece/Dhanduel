"use client";

import AuthGuard from "@/components/AuthGuard";
import NewsSentimentFeed from "@/components/NewsSentimentFeed";
import { Newspaper, Activity, Brain, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

export default function NewsPage() {
  return (
    <AuthGuard>
      <main className="min-h-screen bg-background text-foreground relative overflow-hidden pb-28 transition-colors duration-300">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none opacity-50 dark:opacity-100">
          <motion.div
            animate={{ x: [0, 20, -20, 0], y: [0, -15, 10, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-600/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -30, 15, 0], y: [0, 20, -10, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-40 right-10 w-[400px] h-[300px] bg-blue-600/8 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-full text-purple-600 dark:text-purple-400 text-sm font-medium mb-4"
            >
              <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <Activity className="w-4 h-4" />
              </motion.div>
              Live AI Analysis
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-gray-900 via-purple-700 to-indigo-700 dark:from-white dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent animate-gradient-shift"
            >
              AI News Sentiment Feed
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto"
            >
              Real-time market headlines powered by AI. Instantly analyze any headline to see if it&apos;s <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Bullish</span>, <span className="text-red-500 dark:text-red-400 font-semibold">Bearish</span>, or <span className="text-amber-500 dark:text-amber-400 font-semibold">Neutral</span>.
            </motion.p>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center gap-6 mt-6"
            >
              {[
                { icon: Brain, label: "Gemini 2.0 Flash", color: "text-purple-500" },
                { icon: BarChart3, label: "Live Yahoo Finance", color: "text-blue-500" },
                { icon: Newspaper, label: "Auto-Refresh 90s", color: "text-emerald-500" },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                  {label}
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <NewsSentimentFeed />
          </motion.div>
        </div>
      </main>
    </AuthGuard>
  );
}
