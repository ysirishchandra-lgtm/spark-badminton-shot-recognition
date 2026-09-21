'use client';

import React from 'react';
import { AnalysisStatus } from '@/types';

interface AnalysisPlaceholderProps {
  status: AnalysisStatus;
  onAnalyze: () => void;
}

export default function AnalysisPlaceholder({
  status,
  onAnalyze,
}: AnalysisPlaceholderProps) {
  const isAnalyzing = status === 'analyzing';

  return (
    <div className="w-full spark-card rounded-xl p-5 sm:p-6 space-y-5 transition-all duration-200">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-muted)] font-bold block">
            AI ANALYSIS WORKSPACE
          </span>
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            {isAnalyzing ? 'Analyzing Clip...' : 'Ready for Classification'}
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
          EXP_DRIVE_11
        </span>
      </div>

      {isAnalyzing ? (
        <div className="p-6 rounded-xl bg-cyan-500/5 dark:bg-cyan-950/20 border border-cyan-500/30 text-center space-y-3 animate-pulse">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">
              Executing Deep Temporal Inference
            </h4>
            <p className="text-xs text-[var(--text-secondary)]">
              Sampling 16 chronological frames → Frozen ResNet-18 spatial extraction → Transformer-LSTM classification
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Your badminton video is loaded and playable in the HTML5 player. Click below to begin automated frame sampling and stroke recognition.
          </p>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200/80 dark:border-white/10 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-[var(--text-secondary)]">
              <span>Pipeline:</span>
              <span className="font-semibold text-[var(--text-primary)]">ResNet-18 + BiLSTM</span>
            </div>
            <div className="flex items-center justify-between text-[var(--text-secondary)]">
              <span>Sampling Window:</span>
              <span className="font-semibold text-[var(--text-primary)]">16 Uniform Frames</span>
            </div>
            <div className="flex items-center justify-between text-[var(--text-secondary)]">
              <span>Target Taxonomy:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">5 Classes</span>
            </div>
            <div className="flex items-center justify-between text-[var(--text-secondary)]">
              <span>Test Set Isolation:</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">Strictly Enforced</span>
            </div>
          </div>

          <button
            id="spark-workspace-analyze-btn"
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="w-full py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center space-x-2 shadow-xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>ANALYZE VIDEO</span>
          </button>
        </div>
      )}
    </div>
  );
}
