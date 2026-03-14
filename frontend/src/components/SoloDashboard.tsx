"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createChart, ColorType, CandlestickSeries, ISeriesApi } from "lightweight-charts";
import { fetchRealChartData, MarketResponse } from "../lib/marketApi";
import { useTheme } from "next-themes";
import { TrendingUp, TrendingDown, DollarSign, Activity, RefreshCw, IndianRupee } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import { saveTrade, getUserProfile, updateUserPortfolio, saveHoldings, getHoldings } from "@/lib/firestoreService";
import MyStocks, { StockHolding } from "./MyStocks";

const STOCK_OPTIONS = [
  { value: "AAPL", label: "Apple (AAPL)", region: "US" },
  { value: "TSLA", label: "Tesla (TSLA)", region: "US" },
  { value: "NVDA", label: "NVIDIA (NVDA)", region: "US" },
  { value: "MSFT", label: "Microsoft (MSFT)", region: "US" },
  { value: "GOOGL", label: "Google (GOOGL)", region: "US" },
  { value: "BTC-USD", label: "Bitcoin (BTC-USD)", region: "CRYPTO" },
  { value: "^NSEI", label: "Nifty 50 (^NSEI)", region: "IN" },
  { value: "RELIANCE.NS", label: "Reliance (RELIANCE.NS)", region: "IN" },
  { value: "TCS.NS", label: "TCS (TCS.NS)", region: "IN" },
  { value: "INFY.NS", label: "Infosys (INFY.NS)", region: "IN" },
];

export default function SoloDashboard() {
  const { resolvedTheme } = useTheme();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);

  const [symbol, setSymbol] = useState("AAPL");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [prevPrice, setPrevPrice] = useState(0);
  const [marketMeta, setMarketMeta] = useState<MarketResponse["meta"] | null>(null);

  // INR conversion
  const [usdToInr, setUsdToInr] = useState(83.5);
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");

  // Wallet
  const [walletBalance, setWalletBalance] = useState(10000);
  const [sharesOwned, setSharesOwned] = useState(0);
  const [totalInvested, setTotalInvested] = useState(0);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Multi-stock holdings
  const [holdings, setHoldings] = useState<Record<string, { shares: number; totalCost: number }>>({});

  const isINR = marketMeta?.currency === "INR";
  const conversionRate = (!isINR && currency === "INR") ? usdToInr : 1;
  const symbol_prefix = (isINR || currency === "INR") ? "₹" : "$";
  const displayPrice = currentPrice * conversionRate;
  const displayBalance = walletBalance * conversionRate;

  // Fetch forex rate on mount
  useEffect(() => {
    fetch("/api/forex")
      .then(r => r.json())
      .then(d => setUsdToInr(d.rate ?? 83.5))
      .catch(() => {});
  }, []);

  // Load and poll market data
  const loadData = useCallback(async () => {
    const data = await fetchRealChartData(symbol);
    if (data && data.quotes.length > 0 && chartSeriesRef.current) {
      chartSeriesRef.current.setData(data.quotes);
      setPrevPrice(prev => (prev === 0 ? data.meta.regularMarketPrice : prev));
      setCurrentPrice(data.meta.regularMarketPrice);
      setMarketMeta(data.meta);
      setLastUpdated(new Date());
    }
    setIsLoading(false);
  }, [symbol]);

  // Initialize Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Remove old chart if any
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      chartSeriesRef.current = null;
    }

    setIsLoading(true);
    setCurrentPrice(0);
    setPrevPrice(0);

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: resolvedTheme === "dark" ? "#94A3B8" : "#475569",
      },
      grid: {
        vertLines: { color: resolvedTheme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" },
        horzLines: { color: resolvedTheme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: { timeVisible: true, secondsVisible: false },
    });

    chartRef.current = chart;

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    chartSeriesRef.current = candleSeries;

    loadData();

    // Real-time polling every 15 seconds
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

  const priceChange = currentPrice - prevPrice;
  const priceChangePct = prevPrice > 0 ? (priceChange / prevPrice) * 100 : 0;
  const isUp = priceChange >= 0;

  const pnl = (displayPrice * sharesOwned) - (totalInvested * conversionRate);
  const pnlPercent = totalInvested > 0 ? (pnl / (totalInvested * conversionRate)) * 100 : 0;

  const { user } = useAuth();

  // Load portfolio from Firestore — always runs on mount when user is available
  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;
    console.log("[SoloDashboard] Loading holdings for", user.uid);
    getHoldings(user.uid, "solo").then((data) => {
      if (cancelled) return;
      if (data && Object.keys(data.holdings).length > 0) {
        console.log("[SoloDashboard] Loaded holdings:", JSON.stringify(data.holdings));
        setHoldings(data.holdings);
        setWalletBalance(data.wallet);
        let totalShares = 0;
        let totalCost = 0;
        Object.values(data.holdings).forEach((h) => {
          totalShares += h.shares;
          totalCost += h.totalCost;
        });
        setSharesOwned(totalShares);
        setTotalInvested(totalCost);
      } else {
        console.log("[SoloDashboard] No holdings found, loading profile");
        getUserProfile(user.uid).then((profile) => {
          if (!cancelled && profile) {
            setWalletBalance(profile.walletBalance ?? 10000);
          }
        }).catch((e) => console.error("[SoloDashboard] Profile load error:", e));
      }
    }).catch((e) => {
      console.error("[SoloDashboard] Holdings load error:", e);
      // Retry once after 1 second if client was offline
      setTimeout(() => {
        if (cancelled || !user?.uid) return;
        getHoldings(user.uid, "solo").then((data) => {
          if (cancelled || !data || Object.keys(data.holdings).length === 0) return;
          console.log("[SoloDashboard] Retry loaded holdings:", JSON.stringify(data.holdings));
          setHoldings(data.holdings);
          setWalletBalance(data.wallet);
          let totalShares = 0;
          let totalCost = 0;
          Object.values(data.holdings).forEach((h) => {
            totalShares += h.shares;
            totalCost += h.totalCost;
          });
          setSharesOwned(totalShares);
          setTotalInvested(totalCost);
        }).catch(() => {});
      }, 1500);
    });
    return () => { cancelled = true; };
  }, [user?.uid]);

  const handleBuy = () => {
    const cost = currentPrice * orderQuantity;
    if (walletBalance >= cost) {
      const newBalance = walletBalance - cost;

      // Compute new holdings FIRST (avoid stale closure)
      const existing = holdings[symbol] || { shares: 0, totalCost: 0 };
      const updatedHoldings = {
        ...holdings,
        [symbol]: { shares: existing.shares + orderQuantity, totalCost: existing.totalCost + cost },
      };

      // Update React state
      setWalletBalance(newBalance);
      setSharesOwned(prev => prev + orderQuantity);
      setTotalInvested(prev => prev + cost);
      setHoldings(updatedHoldings);

      // Save to Firestore with the COMPUTED values (not stale state)
      if (user) {
        saveTrade(user.uid, { symbol, action: "buy", quantity: orderQuantity, price: currentPrice, currency: isINR ? "INR" : "USD" }).catch(e => console.error("saveTrade:", e));
        saveHoldings(user.uid, updatedHoldings, newBalance, "solo").catch(e => console.error("saveHoldings:", e));
        updateUserPortfolio(user.uid, newBalance, pnl, sharesOwned + orderQuantity).catch(e => console.error("updatePortfolio:", e));
      }
    } else {
      alert("Insufficient funds!");
    }
  };

  const handleSell = () => {
    const existingH = holdings[symbol];
    if (!existingH || existingH.shares < orderQuantity) {
      alert("Not enough shares of this stock!");
      return;
    }
    if (sharesOwned >= orderQuantity) {
      const revenue = currentPrice * orderQuantity;
      const avgCost = totalInvested / sharesOwned;
      const newBalance = walletBalance + revenue;

      // Compute new holdings FIRST
      const avgH = existingH.totalCost / existingH.shares;
      const updatedHoldings = {
        ...holdings,
        [symbol]: {
          shares: existingH.shares - orderQuantity,
          totalCost: (existingH.shares - orderQuantity) * avgH,
        },
      };

      // Update React state
      setWalletBalance(newBalance);
      setSharesOwned(prev => prev - orderQuantity);
      setTotalInvested(prev => prev - avgCost * orderQuantity);
      setHoldings(updatedHoldings);

      // Save to Firestore with COMPUTED values
      if (user) {
        saveTrade(user.uid, { symbol, action: "sell", quantity: orderQuantity, price: currentPrice, currency: isINR ? "INR" : "USD" }).catch(e => console.error("saveTrade:", e));
        saveHoldings(user.uid, updatedHoldings, newBalance, "solo").catch(e => console.error("saveHoldings:", e));
        updateUserPortfolio(user.uid, newBalance, pnl, sharesOwned - orderQuantity).catch(e => console.error("updatePortfolio:", e));
      }
    } else {
      alert("Not enough shares!");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-7xl mx-auto z-10 p-4">

      {/* Chart Panel */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-panel p-6 rounded-2xl lg:col-span-2 flex flex-col relative transition-colors duration-300"
      >
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-2xl gap-3">
            <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin" />
            <span className="text-sm text-gray-500">Fetching live market data…</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-5">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-5 h-5 text-cyan-500" />
              <h2 className="text-lg font-bold text-foreground">Live Market Data</h2>
            </div>
            {/* Stock selector */}
            <select
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              className="mt-1 bg-black/5 dark:bg-[#13141E] border border-black/10 dark:border-white/15 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 w-full max-w-xs p-2.5 outline-none cursor-pointer transition-colors"
            >
              {STOCK_OPTIONS.map(s => (
                <option key={s.value} value={s.value} className="bg-white dark:bg-[#0A0B10]">{s.label}</option>
              ))}
            </select>
          </div>

          {/* Price + currency toggle */}
          <div className="text-right flex-shrink-0">
            <div className={`text-3xl font-mono font-bold transition-colors ${isUp ? "text-green-400" : "text-red-400"}`}>
              {symbol_prefix}{displayPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </div>
            <div className={`text-sm flex items-center justify-end gap-1 mt-1 ${isUp ? "text-green-400" : "text-red-400"}`}>
              {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {isUp ? "+" : ""}{(priceChange * conversionRate).toFixed(2)} ({priceChangePct.toFixed(2)}%)
            </div>
            {/* Currency Toggle */}
            {!isINR && (
              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  onClick={() => setCurrency("USD")}
                  className={`px-2 py-1 text-xs rounded-md font-semibold transition-colors ${currency === "USD" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" : "text-gray-500 hover:text-white"}`}
                >
                  <DollarSign className="w-3 h-3 inline mr-0.5" />USD
                </button>
                <button
                  onClick={() => setCurrency("INR")}
                  className={`px-2 py-1 text-xs rounded-md font-semibold transition-colors ${currency === "INR" ? "bg-orange-500/20 text-orange-400 border border-orange-500/40" : "text-gray-500 hover:text-white"}`}
                >
                  <IndianRupee className="w-3 h-3 inline mr-0.5" />INR
                </button>
              </div>
            )}
            {lastUpdated && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Updated {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {/* Chart */}
        <div ref={chartContainerRef} className="w-full flex-grow border border-black/5 dark:border-white/8 rounded-xl overflow-hidden bg-black/5 dark:bg-transparent transition-colors" style={{ minHeight: 400 }} />

        {/* Live badge */}
        <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-500">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Auto-refreshes every 15 seconds · Data via Yahoo Finance
        </div>
      </motion.div>

      {/* Portfolio + Trade Panel */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-5"
      >
        {/* Portfolio */}
        <div className="glass-panel p-6 rounded-2xl transition-colors duration-300">
          <h3 className="text-gray-600 dark:text-slate-400 mb-4 uppercase tracking-wider text-xs font-bold">Your Portfolio</h3>

          <div className="mb-5">
            <div className="flex items-center gap-1 text-4xl font-mono font-bold text-foreground transition-colors">
              {currency === "INR" ? <IndianRupee className="w-7 h-7 text-purple-400" /> : <DollarSign className="w-7 h-7 text-purple-400" />}
              {displayBalance.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Available Cash</div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-black/10 dark:border-white/10 pt-4 transition-colors">
            <div>
              <div className="text-gray-600 dark:text-gray-400 text-xs uppercase mb-1">Shares</div>
              <div className="text-xl font-bold text-foreground transition-colors">{sharesOwned}</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400 text-xs uppercase mb-1">Open P&L</div>
              <div className={`text-lg font-bold transition-colors ${pnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {pnl >= 0 ? "+" : ""}{symbol_prefix}{Math.abs(pnl).toFixed(2)}
                <span className="text-xs ml-1 text-gray-600 dark:text-gray-400">({pnlPercent.toFixed(1)}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trade Execution */}
        <div className="glass-panel p-6 rounded-2xl flex-1 transition-colors duration-300">
          <h3 className="text-gray-600 dark:text-slate-400 mb-5 uppercase tracking-wider text-xs font-bold">Execute Trade</h3>

          <div className="mb-5">
            <label className="text-xs text-gray-600 dark:text-gray-400 block mb-2">Quantity (Shares)</label>
            <div className="flex items-center glass-panel rounded-xl overflow-hidden border border-black/10 dark:border-white/10 transition-colors">
              <button
                onClick={() => setOrderQuantity(prev => Math.max(1, prev - 1))}
                className="px-4 py-3 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-lg font-bold text-gray-900 dark:text-white"
              >-</button>
              <input
                type="number"
                value={orderQuantity}
                onChange={e => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-transparent text-center font-mono font-bold outline-none text-gray-900 dark:text-white placeholder-gray-500"
              />
              <button
                onClick={() => setOrderQuantity(prev => prev + 1)}
                className="px-4 py-3 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-lg font-bold text-gray-900 dark:text-white"
              >+</button>
            </div>
          </div>

          <div className="mb-6 border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm flex justify-between items-center transition-colors">
            <span className="text-gray-600 dark:text-gray-400">Estimated Total</span>
            <span className="font-mono font-bold text-gray-900 dark:text-white transition-colors">
              {symbol_prefix}{(displayPrice * orderQuantity).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleBuy}
              className="flex-1 bg-green-500/15 text-green-400 border border-green-500/40 hover:bg-green-500 hover:text-gray-900 py-3 rounded-xl font-bold transition-all shadow-[0_0_12px_rgba(34,197,94,0.15)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]"
            >
              BUY
            </button>
            <button
              onClick={handleSell}
              className="flex-1 bg-red-500/15 text-red-400 border border-red-500/40 hover:bg-red-500 hover:text-white py-3 rounded-xl font-bold transition-all shadow-[0_0_12px_rgba(239,68,68,0.15)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)]"
            >
              SELL
            </button>
          </div>
        </div>
      </motion.div>

      {/* My Stocks - full width below */}
      {Object.values(holdings).some(h => h.shares > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-3"
        >
          <MyStocks
            holdings={Object.entries(holdings)
              .filter(([, h]) => h.shares > 0)
              .map(([sym, h]) => {
                const stock = STOCK_OPTIONS.find(s => s.value === sym);
                return {
                  symbol: sym,
                  label: stock?.label || sym,
                  shares: h.shares,
                  avgPrice: h.totalCost / h.shares,
                  currentPrice: sym === symbol ? currentPrice : h.totalCost / h.shares,
                };
              })}
            prefix={symbol_prefix}
          />
        </motion.div>
      )}
    </div>
  );
}
