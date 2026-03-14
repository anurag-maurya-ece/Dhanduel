"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scenario } from "../lib/caseStudies";
import { BrainCircuit, X, History, ChevronRight } from "lucide-react";

interface CaseStudyModalProps {
    scenario: Scenario;
    isOpen: boolean;
    onClose: () => void;
}

export default function CaseStudyModal({ scenario, isOpen, onClose }: CaseStudyModalProps) {
    const [selectedAction, setSelectedAction] = useState<string | null>(null);
    const [showInsight, setShowInsight] = useState(false);

    const handleSelect = (action: string) => {
        setSelectedAction(action);
        // Simulate thinking time for Gemini AI Insight
        setTimeout(() => {
            setShowInsight(true);
        }, 800);
    };

    const reset = () => {
        setSelectedAction(null);
        setShowInsight(false);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={reset}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-space-900 border border-brand-purple/30 shadow-[0_0_40px_rgba(179,136,235,0.15)] rounded-3xl w-full max-w-2xl overflow-hidden pointer-events-auto"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                                <div className="flex items-center text-brand-purple">
                                    <History className="w-5 h-5 mr-2" />
                                    <span className="font-bold tracking-widest text-sm uppercase">Historical Archive</span>
                                </div>
                                <button onClick={reset} className="text-gray-400 hover:text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-8">
                                <h2 className="text-3xl font-bold mb-4">{scenario.title}</h2>
                                <p className="text-gray-300 text-lg leading-relaxed mb-8">
                                    {scenario.description}
                                </p>

                                {!showInsight ? (
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Make Your Decision</h3>
                                        {scenario.options.map((opt, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSelect(opt.action)}
                                                disabled={selectedAction !== null}
                                                className={`w-full p-4 rounded-xl text-left border flex justify-between items-center transition-all
                                                    ${selectedAction === null ? 'border-white/20 hover:border-brand-cyan hover:bg-brand-cyan/5' : 
                                                      selectedAction === opt.action ? 'border-brand-purple bg-brand-purple/10' : 'border-white/5 opacity-50'}
                                                `}
                                            >
                                                <span className="font-semibold text-lg">{opt.label}</span>
                                                <ChevronRight className={`w-5 h-5 ${selectedAction === opt.action ? 'text-brand-purple' : 'text-gray-500'}`} />
                                            </button>
                                        ))}

                                        {selectedAction !== null && !showInsight && (
                                            <motion.div 
                                                initial={{ opacity: 0 }} 
                                                animate={{ opacity: 1 }} 
                                                className="flex items-center justify-center py-4 text-brand-purple"
                                            >
                                                <BrainCircuit className="w-5 h-5 mr-2 animate-pulse" />
                                                <span>Gemini is analyzing historical data...</span>
                                            </motion.div>
                                        )}
                                    </div>
                                ) : (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-brand-purple/10 border border-brand-purple/30 rounded-2xl p-6"
                                    >
                                        <div className="flex items-center text-brand-purple mb-4">
                                            <BrainCircuit className="w-6 h-6 mr-2" />
                                            <h3 className="text-lg font-bold">AI Historical Insight</h3>
                                        </div>
                                        <p className="text-gray-900 dark:text-white text-lg leading-relaxed mb-4">
                                            {scenario.historicalOutcome.insight}
                                        </p>
                                        <div className="inline-flex py-1 px-3 bg-black/5 dark:bg-white/10 rounded text-sm text-gray-700 dark:text-gray-300">
                                            Your move: <strong className="ml-1 text-black dark:text-white">{selectedAction}</strong>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
