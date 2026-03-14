"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, History, ChevronRight, BrainCircuit, BarChart2, Trophy, RefreshCw } from "lucide-react";
import { staticScenarios, Scenario } from "@/lib/caseStudies";
import { useAuth } from "@/lib/AuthContext";
import { saveScore, getScores } from "@/lib/firestoreService";
import AuthGuard from "@/components/AuthGuard";

export default function CaseStudiesPage() {
  const { user } = useAuth();
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [showInsight, setShowInsight] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>("");
  const [score, setScore] = useState(0);
  const [attempted, setAttempted] = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);

  // Load existing scores from Firestore
  useEffect(() => {
    if (!user) return;
    getScores(user.uid).then((scores) => {
      const ids = Object.keys(scores);
      setAttempted(ids);
      const total = Object.values(scores).reduce((sum, s) => sum + (s.points || 0), 0);
      setScore(total);
    }).catch(() => {});
  }, [user]);

  const handleSelect = async (action: string) => {
    if (!selectedScenario) return;
    setSelectedAction(action);
    setLoadingAI(true);

    const isCorrect = action === selectedScenario.historicalOutcome.action;
    const points = isCorrect && !attempted.includes(selectedScenario.id) ? 100 : 0;

    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `Scenario: "${selectedScenario.title}" — ${selectedScenario.description}. The user chose: "${action}". The historically correct move was: "${selectedScenario.historicalOutcome.action}". Give educational insight about what happened and what the best strategy was.`,
          type: "casestudy",
        }),
      });
      const data = await res.json();
      setAiInsight(data.insight || selectedScenario.historicalOutcome.insight);
    } catch {
      setAiInsight(selectedScenario.historicalOutcome.insight);
    }

    setShowInsight(true);
    setLoadingAI(false);

    if (!attempted.includes(selectedScenario.id)) {
      setScore(prev => prev + points);
      setAttempted(prev => [...prev, selectedScenario.id]);

      if (user) {
        saveScore(user.uid, selectedScenario.id, action, isCorrect, points).catch(() => {});
      }
    }
  };

  const handleClose = () => {
    setSelectedScenario(null);
    setSelectedAction(null);
    setShowInsight(false);
    setAiInsight("");
  };

  return (
    <AuthGuard>
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden pb-28 transition-colors duration-300">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none opacity-50 dark:opacity-100">
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-amber-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-[400px] h-[300px] bg-purple-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full text-amber-600 dark:text-amber-400 text-sm font-medium mb-4">
              <History className="w-4 h-4" />
              Historical Archive
            </div>
            <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-gray-900 to-amber-600 dark:from-slate-50 dark:to-amber-400 bg-clip-text text-transparent">
              Interactive Case Studies
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-xl">
              Test your investing instincts against real historical events. AI analyzes your decisions in real-time.
            </p>
          </div>
          <div className="flex-shrink-0 glass-panel px-6 py-4 rounded-2xl flex items-center gap-3">
            <Trophy className="w-7 h-7 text-amber-500 dark:text-amber-400" />
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-300 uppercase tracking-widest font-bold">Your Score</div>
              <div className="text-3xl font-mono font-bold text-amber-600 dark:text-amber-400">{score}</div>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {staticScenarios.map((scenario, i) => {
            const done = attempted.includes(scenario.id);
            return (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => { setSelectedScenario(scenario); setSelectedAction(null); setShowInsight(false); setAiInsight(""); }}
                className={`glass-panel p-6 rounded-2xl cursor-pointer border transition-all duration-300 group
                  ${done ? "border-amber-500/30 bg-amber-500/5" : "border-gray-200 dark:border-white/10 hover:border-purple-500/40 hover:bg-purple-500/5"}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
                    <BarChart2 className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                  </div>
                  {done && (
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-400/10 text-amber-600 dark:text-amber-400 border border-amber-400/20 font-semibold">✓ Attempted</span>
                  )}
                </div>
                <h2 className="text-xl font-bold mb-2 text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">{scenario.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">{scenario.description}</p>
                <div className="flex items-center mt-4 text-sm font-bold text-purple-600 dark:text-purple-300 uppercase tracking-tight">
                  Make your decision <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {selectedScenario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-[#0D0E18] border border-gray-200 dark:border-purple-500/30 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <History className="w-5 h-5" />
                <span className="font-bold text-sm uppercase tracking-widest">Historical Archive</span>
              </div>
              <button onClick={handleClose} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors text-xl">✕</button>
            </div>

            <div className="p-8">
              <h2 className="text-2xl font-extrabold mb-4 text-foreground">{selectedScenario.title}</h2>
              <p className="text-gray-600 dark:text-slate-200 leading-relaxed mb-8">{selectedScenario.description}</p>

              {!showInsight ? (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-4">Make Your Decision</h3>
                  {selectedScenario.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelect(opt.action)}
                      disabled={selectedAction !== null}
                      className={`w-full p-4 rounded-xl text-left border flex justify-between items-center transition-all
                        ${selectedAction === null ? "border-white/15 hover:border-purple-400 hover:bg-purple-400/5"
                          : selectedAction === opt.action ? "border-purple-400 bg-purple-400/10" : "border-white/5 opacity-40"}`}
                    >
                      <span className="font-semibold">{opt.label}</span>
                      <ChevronRight className={`w-5 h-5 ${selectedAction === opt.action ? "text-purple-400" : "text-gray-600"}`} />
                    </button>
                  ))}

                  {selectedAction && !showInsight && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center py-6 text-purple-400 gap-2">
                      {loadingAI ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Gemini AI is analyzing historical data…
                        </>
                      ) : (
                        <>
                          <BrainCircuit className="w-5 h-5 animate-pulse" />
                          Processing…
                        </>
                      )}
                    </motion.div>
                  )}
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6">
                  <div className="flex items-center gap-2 text-purple-400 mb-4">
                    <BrainCircuit className="w-6 h-6" />
                    <h3 className="text-lg font-bold">AI Historical Insight</h3>
                  </div>
                  <p className="text-gray-900 dark:text-white leading-relaxed mb-4">{aiInsight}</p>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-3 py-1 bg-black/5 dark:bg-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                      Your move: <strong className="text-black dark:text-white">{selectedAction}</strong>
                    </span>
                    {selectedAction === selectedScenario.historicalOutcome.action ? (
                      <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-400 font-semibold">✓ Correct! +100 pts</span>
                    ) : (
                      <span className="px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 font-semibold">
                        Best move was: {selectedScenario.historicalOutcome.action}
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </main>
    </AuthGuard>
  );
}
