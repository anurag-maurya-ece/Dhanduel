"use client";

import { useState, useEffect, useCallback } from "react";
import { NewsItem } from "../lib/newsApi";
import { BrainCircuit, RefreshCw, TrendingUp, TrendingDown, Minus, Radio, Lightbulb, BarChart3, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EnhancedNewsItem extends NewsItem {
  reasoning?: string;
  suggestion?: string;
  confidence?: number;
  isAnalyzing?: boolean;
}

// Delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function NewsSentimentFeed() {
  const [news, setNews] = useState<EnhancedNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchAndAnalyze = useCallback(async () => {
    try {
      const res = await fetch("/api/news");
      if (!res.ok) return;
      const data: EnhancedNewsItem[] = await res.json();
      if (!data.length) return;

      setNews(data.map(item => ({ ...item, isAnalyzing: true })));
      setLastUpdated(new Date().toLocaleTimeString());
      setLoading(false);

      // Analyze headlines one at a time with 1.5s delay to avoid rate limits
      for (const item of data) {
        try {
          const aiRes = await fetch("/api/ai/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: item.headline, type: "sentiment" }),
          });
          const aiData = await aiRes.json();

          setNews(prev =>
            prev.map(n =>
              n.id === item.id
                ? { ...n, sentiment: aiData.sentiment, reasoning: aiData.reasoning, suggestion: aiData.suggestion, confidence: aiData.confidence, isAnalyzing: false }
                : n
            )
          );
        } catch {
          setNews(prev =>
            prev.map(n => n.id === item.id ? { ...n, isAnalyzing: false } : n)
          );
        }
        // Throttle: wait 1.5s between each call to respect rate limits
        await delay(1500);
      }
    } catch (error) {
      console.error("Failed to load live news:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAndAnalyze();
    const interval = setInterval(fetchAndAnalyze, 120_000);
    return () => clearInterval(interval);
  }, [fetchAndAnalyze]);

  const getSentimentConfig = (sentiment?: "Bullish" | "Bearish" | "Neutral") => {
    const configs = {
      Bullish: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", icon: TrendingUp, label: "BULLISH" },
      Bearish: { color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10 border-red-500/30", icon: TrendingDown, label: "BEARISH" },
      Neutral: { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", icon: Minus, label: "NEUTRAL" },
    };
    return sentiment ? configs[sentiment] : null;
  };

  const ShimmerCard = ({ index }: { index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-5 rounded-2xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]"
    >
      <div className="animate-pulse space-y-3">
        <div className="flex justify-between">
          <div className="h-3 w-24 bg-gray-300 dark:bg-gray-700 rounded-full" />
          <div className="h-5 w-16 bg-purple-200 dark:bg-purple-700/30 rounded-full" />
        </div>
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </motion.div>
  );

  return (
    <div className="glass-panel p-6 rounded-2xl h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
            <BrainCircuit className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </motion.div>
          AI Sentiment Feed
        </h2>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-[10px] text-gray-500 hidden sm:inline">Updated: {lastUpdated}</span>
          )}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-500 dark:text-red-400 text-xs rounded-full border border-red-500/20 font-bold"
          >
            <Radio className="w-3 h-3" />
            LIVE
          </motion.div>
        </div>
      </div>

      {/* News Cards */}
      <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
        {loading ? (
          <>{[0, 1, 2, 3].map(i => <ShimmerCard key={i} index={i} />)}</>
        ) : (
          <AnimatePresence mode="popLayout">
            {news.map((item, index) => {
              const config = getSentimentConfig(item.sentiment);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -30, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ delay: index * 0.06, type: "spring", stiffness: 200, damping: 20 }}
                  className={`p-5 rounded-2xl border transition-all duration-300 group
                    ${config ? `${config.bg}` : "border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]"}
                    hover:shadow-lg hover:scale-[1.01]`}
                >
                  {/* Top Row */}
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-600 dark:text-gray-300 font-medium">{item.source}</span>
                      <span className="text-[11px] text-gray-400">•</span>
                      <span className="text-[11px] text-gray-600 dark:text-gray-300">{item.time}</span>
                    </div>

                    {item.isAnalyzing ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="flex items-center gap-1 text-purple-600 dark:text-purple-400 text-xs">
                        <RefreshCw className="w-3 h-3" />
                        <span className="font-medium">Analyzing...</span>
                      </motion.div>
                    ) : config ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${config.bg} ${config.color}`}
                      >
                        <config.icon className="w-3.5 h-3.5" />
                        {config.label}
                        {item.confidence && <span className="ml-1 opacity-70">{item.confidence}%</span>}
                      </motion.div>
                    ) : null}
                  </div>

                  {/* Headline — clickable to open full article */}
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 group/link"
                    >
                      <h3 className="text-sm sm:text-base font-semibold text-slate-50 leading-snug mb-3 group-hover/link:text-blue-600 dark:group-hover/link:text-blue-300 transition-colors flex-1">
                        {item.headline}
                      </h3>
                      <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-300 group-hover/link:text-blue-500 flex-shrink-0 mt-0.5 transition-colors" />
                    </a>
                  ) : (
                    <h3 className="text-sm sm:text-base font-semibold text-slate-50 leading-snug mb-3">
                      {item.headline}
                    </h3>
                  )}

                  {/* AI Reasoning */}
                  <AnimatePresence>
                    {item.reasoning && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden mt-2">
                        <div className="text-xs text-gray-700 dark:text-gray-200 border-l-2 border-purple-500/40 pl-3 py-1 italic flex items-start gap-1.5">
                          <BrainCircuit className="w-3.5 h-3.5 mt-0.5 text-purple-600 dark:text-purple-300 flex-shrink-0" />
                          <span>{item.reasoning}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Trading Suggestion */}
                  <AnimatePresence>
                    {item.suggestion && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden mt-2">
                        <div className={`text-xs font-semibold px-3 py-2 rounded-xl flex items-start gap-2
                          ${item.sentiment === "Bullish" ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20" :
                            item.sentiment === "Bearish" ? "bg-red-500/10 text-red-800 dark:text-red-300 border border-red-500/20" :
                            "bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20"}`}
                        >
                          <Lightbulb className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          <span><strong>Suggestion:</strong> {item.suggestion}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Footer stats */}
      {!loading && news.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="mt-4 pt-4 border-t border-gray-200 dark:border-white/5 flex items-center justify-between text-[11px] text-gray-500"
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" />{news.filter(n => n.sentiment).length}/{news.length} analyzed</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-500"><TrendingUp className="w-3 h-3" />{news.filter(n => n.sentiment === "Bullish").length} bullish</span>
            <span className="flex items-center gap-1 text-red-500 dark:text-red-400"><TrendingDown className="w-3 h-3" />{news.filter(n => n.sentiment === "Bearish").length} bearish</span>
          </div>
          <span>Auto-refreshes every 2m</span>
        </motion.div>
      )}
    </div>
  );
}
