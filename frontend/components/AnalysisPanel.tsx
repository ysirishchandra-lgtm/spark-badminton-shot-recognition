'use client';

import React from 'react';
import { VideoAnalysisResponse, AnalysisStatus } from '@/types';

interface AnalysisPanelProps {
  analysisResult: VideoAnalysisResponse;
  status: AnalysisStatus;
}

const CANONICAL_CLASSES = [
  { key: 'SMASH', label: 'SMASH', barColor: 'from-rose-500 to-rose-600', textColor: 'text-rose-600 dark:text-rose-400' },
  { key: 'CLEAR', label: 'CLEAR', barColor: 'from-sky-500 to-sky-600', textColor: 'text-sky-600 dark:text-sky-400' },
  { key: 'DROP', label: 'DROP', barColor: 'from-emerald-500 to-emerald-600', textColor: 'text-emerald-600 dark:text-emerald-400' },
  { key: 'DRIVE', label: 'DRIVE', barColor: 'from-amber-500 to-amber-600', textColor: 'text-amber-600 dark:text-amber-400' },
  { key: 'NET_SHOT', label: 'NET SHOT', barColor: 'from-purple-500 to-purple-600', textColor: 'text-purple-600 dark:text-purple-400' },
] as const;

export default function AnalysisPanel({
  analysisResult,
  status,
}: AnalysisPanelProps) {
  const isCompleted = status === 'completed';

  return (
    <div className="w-full spark-card rounded-xl p-5 sm:p-6 space-y-5 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-muted)] font-bold block">
            AI ANALYSIS RESULT
          </span>
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            Stroke Classification
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
          EXP_DRIVE_11
        </span>
      </div>

      {/* Main Prediction Box */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200/80 dark:border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
            PREDICTED SHOT
          </span>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            {analysisResult.processing_time_ms.toFixed(1)} ms latency
          </span>
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <div className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)]">
            {analysisResult.predicted_shot}
          </div>
          <div className="text-right">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              {(analysisResult.confidence * 100).toFixed(1)}%
            </span>
            <span className="block text-[10px] font-mono text-[var(--text-muted)]">
              Confidence
            </span>
          </div>
        </div>
      </div>

      {/* 5-Class Probability Distribution */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Probability Distribution
          </span>
          <span className="font-mono text-[10px] text-[var(--text-muted)]">
            Softmax (16 Frames)
          </span>
        </div>

        <div className="space-y-2.5">
          {CANONICAL_CLASSES.map(({ key, label, barColor, textColor }) => {
            const probValue =
              analysisResult.probabilities[key as keyof typeof analysisResult.probabilities] ?? 0;
            const probPercent = (probValue * 100).toFixed(1);
            const isPredicted = analysisResult.predicted_shot === key;

            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`font-mono font-semibold flex items-center space-x-1.5 ${
                      isPredicted ? textColor : 'text-[var(--text-primary)]'
                    }`}
                  >
                    <span>{label}</span>
                    {isPredicted && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono uppercase font-bold">
                        Top
                      </span>
                    )}
                  </span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">
                    {probPercent}%
                  </span>
                </div>

                {/* Progress bar track */}
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isPredicted
                        ? `bg-gradient-to-r ${barColor}`
                        : 'bg-slate-300 dark:bg-zinc-700'
                    }`}
                    style={{ width: `${Math.max(Number(probPercent), 0.5)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
