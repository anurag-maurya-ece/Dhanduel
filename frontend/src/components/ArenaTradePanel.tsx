"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createChart, ColorType, CandlestickSeries, ISeriesApi } from "lightweight-charts";
import { fetchRealChartData, MarketResponse } from "@/lib/marketApi";
import { initSocket } from "@/lib/socketClient";
import { useTheme } from "next-themes";
import { TrendingUp, TrendingDown, DollarSign, RefreshCw, IndianRupee } from "lucide-react";
import MyStocks, { StockHolding } from "./MyStocks";

const ARENA_STOCKS = [
  { value: "AAPL", label: "Apple" },
  { value: "TSLA", label: "Tesla" },
  { value: "NVDA", label: "NVIDIA" },
  { value: "GOOGL", label: "Google" },
  { value: "BTC-USD", label: "Bitcoin" },
  { value: "RELIANCE.NS", label: "Reliance" },
];

interface ArenaProps {
  roomId: string;
  userId: string;
}

export default function ArenaTradePanel({ roomId, userId }: ArenaProps) {
  const { resolvedTheme } = useTheme();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);

  const [symbol, setSymbol] = useState("AAPL");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [marketMeta, setMarketMeta] = useState<MarketResponse["meta"] | null>(null);

  // Portfolio
  const [wallet, setWallet] = useState(10000);
  const [shares, setShares] = useState(0);
  const [invested, setInvested] = useState(0);
  const [qty, setQty] = useState(1);

  // Multi-stock holdings
  const [holdings, setHoldings] = useState<Record<string, { shares: number; totalCost: number }>>({});

  const isINR = marketMeta?.currency === "INR";
  const prefix = isINR ? "₹" : "$";
  const pnl = currentPrice * shares - invested;
  const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;

  // Build StockHolding[] for MyStocks component
  const stockHoldings: StockHolding[] = Object.entries(holdings)
    .filter(([, h]) => h.shares > 0)
    .map(([sym, h]) => {
      const stock = ARENA_STOCKS.find((s) => s.value === sym);
      return {
        symbol: sym,
        label: stock?.label || sym,
        shares: h.shares,
        avgPrice: h.totalCost / h.shares,
        currentPrice: sym === symbol ? currentPrice : h.totalCost / h.shares, // Use live price for active symbol
      };
    });

  // Broadcast P&L to room leaderboard
  useEffect(() => {
    if (!roomId) return;
    const socket = initSocket();
    socket.emit("update-leaderboard", { roomId, userId, pnl: parseFloat(pnl.toFixed(2)) });
  }, [pnl, roomId, userId]);

  // Load chart data
  const loadData = useCallback(async () => {
    const data = await fetchRealChartData(symbol);
    if (data && data.quotes.length > 0 && chartSeriesRef.current) {
      chartSeriesRef.current.setData(data.quotes);
      setCurrentPrice(data.meta.regularMarketPrice);
      setMarketMeta(data.meta);
    }
    setIsLoading(false);
  }, [symbol]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      chartSeriesRef.current = null;
    }

    setIsLoading(true);
    setCurrentPrice(0);

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: resolvedTheme === "dark" ? "#64748b" : "#475569",
      },
      grid: {
        vertLines: { color: resolvedTheme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)" },
        horzLines: { color: resolvedTheme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 250,
      timeScale: { timeVisible: true, secondsVisible: false },
    });

    chartRef.current = chart;

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    chartSeriesRef.current = series;
    loadData();

    const interval = setInterval(loadData, 15000);

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      chartSeriesRef.current = null;
    };
  }, [symbol, loadData, resolvedTheme]);

  const handleBuy = () => {
    const cost = currentPrice * qty;
    if (wallet >= cost) {
      setWallet((p) => p - cost);
      setShares((p) => p + qty);
      setInvested((p) => p + cost);
      // Update holdings
      setHoldings((prev) => {
        const existing = prev[symbol] || { shares: 0, totalCost: 0 };
        return { ...prev, [symbol]: { shares: existing.shares + qty, totalCost: existing.totalCost + cost } };
      });
    }
  };

  const handleSell = () => {
    if (shares >= qty) {
      const revenue = currentPrice * qty;
      const avg = invested / shares;
      setWallet((p) => p + revenue);
      setShares((p) => p - qty);
      setInvested((p) => p - avg * qty);
      // Update holdings
      setHoldings((prev) => {
        const existing = prev[symbol];
        if (!existing || existing.shares < qty) return prev;
        const avgCost = existing.totalCost / existing.shares;
        return { ...prev, [symbol]: { shares: existing.shares - qty, totalCost: (existing.shares - qty) * avgCost } };
      });
    }
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden flex flex-col transition-colors duration-300">
      {/* Header */}
      <div className="px-5 py-3 border-b border-black/10 dark:border-white/10 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span className="text-sm font-bold text-gray-900 dark:text-white transition-colors">Live Trading</span>
        </div>
        <select
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-gray-900 dark:text-white text-xs rounded-lg px-2 py-1 outline-none cursor-pointer transition-colors"
        >
          {ARENA_STOCKS.map((s) => (
            <option key={s.value} value={s.value} className="bg-white dark:bg-[#0A0B10]">
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Chart */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 z-10 flex items-center justify-center backdrop-blur-sm transition-colors duration-300">
            <RefreshCw className="w-6 h-6 text-cyan-500 animate-spin" />
          </div>
        )}
        <div ref={chartContainerRef} className="w-full bg-black/5 dark:bg-transparent transition-colors" style={{ minHeight: 250 }} />
      </div>

      {/* Price + Portfolio */}
      <div className="px-5 py-3 border-t border-black/10 dark:border-white/10 transition-colors">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className={`text-xl font-mono font-bold transition-colors ${pnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {prefix}{currentPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-gray-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
              Live · 15s refresh
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">P&L</div>
            <div className={`text-lg font-mono font-bold transition-colors ${pnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {pnl >= 0 ? "+" : ""}{prefix}{Math.abs(pnl).toFixed(2)}
              <span className="text-[10px] ml-1 text-gray-500">({pnlPct.toFixed(1)}%)</span>
            </div>
          </div>
        </div>

        {/* Mini Portfolio */}
        <div className="flex gap-3 text-xs mb-3">
          <div className="flex-1 bg-black/5 dark:bg-white/[0.03] rounded-lg p-2 text-center transition-colors">
            <div className="text-gray-500 mb-1">Cash</div>
            <div className="font-mono font-bold text-gray-900 dark:text-white transition-colors">{prefix}{wallet.toFixed(0)}</div>
          </div>
          <div className="flex-1 bg-black/5 dark:bg-white/[0.03] rounded-lg p-2 text-center transition-colors">
            <div className="text-gray-500 mb-1">Shares</div>
            <div className="font-mono font-bold text-gray-900 dark:text-white transition-colors">{shares}</div>
          </div>
        </div>

        {/* Buy/Sell */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-black/5 dark:bg-white/[0.03] rounded-lg border border-black/10 dark:border-white/10 overflow-hidden transition-colors">
            <button onClick={() => setQty((p) => Math.max(1, p - 1))} className="px-2 py-1.5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-900 dark:text-white text-sm font-bold transition-colors">-</button>
            <span className="px-3 font-mono text-sm text-gray-900 dark:text-white transition-colors">{qty}</span>
            <button onClick={() => setQty((p) => p + 1)} className="px-2 py-1.5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-900 dark:text-white text-sm font-bold transition-colors">+</button>
          </div>
          <button
            onClick={handleBuy}
            className="flex-1 bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500 hover:text-black py-2 rounded-lg text-sm font-bold transition-all"
          >
            BUY
          </button>
          <button
            onClick={handleSell}
            className="flex-1 bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white py-2 rounded-lg text-sm font-bold transition-all"
          >
            SELL
          </button>
        </div>
      </div>

      {/* My Stocks */}
      {stockHoldings.length > 0 && (
        <div className="border-t border-black/10 dark:border-white/10 transition-colors">
          <MyStocks holdings={stockHoldings} prefix={prefix} />
        </div>
      )}
    </div>
  );
}
