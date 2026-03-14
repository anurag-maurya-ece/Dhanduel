"use client";

import { motion } from "framer-motion";
import { Briefcase, TrendingUp, TrendingDown } from "lucide-react";

export interface StockHolding {
  symbol: string;
  label: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
}

interface MyStocksProps {
  holdings: StockHolding[];
  prefix?: string;
}

export default function MyStocks({ holdings, prefix = "$" }: MyStocksProps) {
  const activeHoldings = holdings.filter((h) => h.shares > 0);

  if (activeHoldings.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-5 transition-colors duration-300">
        <h3 className="text-sm font-bold flex items-center gap-2 mb-3 uppercase tracking-wider text-gray-500">
          <Briefcase className="w-4 h-4" /> My Stocks
        </h3>
        <div className="text-center text-gray-500 dark:text-gray-400 py-6 text-sm">
          No stocks owned yet. Start trading! 📈
        </div>
      </div>
    );
  }

  const totalValue = activeHoldings.reduce((sum, h) => sum + h.currentPrice * h.shares, 0);
  const totalInvested = activeHoldings.reduce((sum, h) => sum + h.avgPrice * h.shares, 0);
  const totalPnl = totalValue - totalInvested;
  const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  return (
    <div className="glass-panel rounded-2xl p-5 transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-gray-500">
          <Briefcase className="w-4 h-4" /> My Stocks
        </h3>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">Portfolio</span>
          <span className={`font-mono font-bold transition-colors ${totalPnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {totalPnl >= 0 ? "+" : ""}{prefix}{Math.abs(totalPnl).toFixed(2)}
            <span className="text-gray-500 ml-1">({totalPnlPct.toFixed(1)}%)</span>
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {activeHoldings.map((h, i) => {
          const value = h.currentPrice * h.shares;
          const pnl = value - h.avgPrice * h.shares;
          const pnlPct = h.avgPrice > 0 ? ((h.currentPrice - h.avgPrice) / h.avgPrice) * 100 : 0;
          const isUp = pnl >= 0;

          return (
            <motion.div
              key={h.symbol}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/[0.03] hover:bg-black/10 dark:hover:bg-white/[0.06] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${isUp ? "bg-green-500/15 text-green-600 dark:text-green-400" : "bg-red-500/15 text-red-600 dark:text-red-400"}`}>
                  {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                </div>
                <div>
                  <div className="font-bold text-sm text-gray-900 dark:text-white transition-colors">{h.symbol}</div>
                  <div className="text-[10px] text-gray-500">{h.shares} shares · avg {prefix}{h.avgPrice.toFixed(2)}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm font-bold text-gray-900 dark:text-white transition-colors">{prefix}{value.toFixed(2)}</div>
                <div className={`text-[10px] font-mono transition-colors ${isUp ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {isUp ? "+" : ""}{prefix}{pnl.toFixed(2)} ({pnlPct.toFixed(1)}%)
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Total */}
      <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10 flex justify-between items-center text-xs transition-colors">
        <span className="text-gray-500">Total Value</span>
        <span className="font-mono font-bold text-gray-900 dark:text-white transition-colors">{prefix}{totalValue.toFixed(2)}</span>
      </div>
    </div>
  );
}
