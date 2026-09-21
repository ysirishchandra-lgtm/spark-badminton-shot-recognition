'use client';

import React from 'react';
import { AnalysisStatus, VideoAnalysisResponse } from '@/types';

interface ResultsDisplayProps {
  videoId: string | null;
  uploadedFilename?: string | null;
  status: AnalysisStatus;
  analysisResult: VideoAnalysisResponse | null;
  errorMessage?: string | null;
}

const SHOT_TACTICS: Record<
  string,
  {
    phase: string;
    trajectory: string;
    threatIndex: number;
    threatLabel: string;
    counterTactic: string;
    badgeColor: string;
    barColor: string;
  }
> = {
  SMASH: {
    phase: 'Aggressive Offensive Attack',
    trajectory: 'Steep downward vector (>300 km/h) targeted toward opponent court boundaries.',
    threatIndex: 94,
    threatLabel: 'Critical Threat',
    counterTactic: 'Block softly into opposing forecourt corners; avoid lifting mid-court.',
    badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
    barColor: 'from-rose-500 to-red-600',
  },
  CLEAR: {
    phase: 'Defensive Rally Reset / Baseline Shift',
    trajectory: 'High parabolic arc driven deep into the opponent rear baseline corners.',
    threatIndex: 42,
    threatLabel: 'Neutral / Reset',
    counterTactic: 'Execute an attacking drop or smash if shuttle is short; otherwise reset footwork.',
    badgeColor: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
    barColor: 'from-sky-500 to-blue-600',
  },
  DROP: {
    phase: 'Deceptive Front-Court Attack',
    trajectory: 'Dipping decelerating arc clearing the net tape and plunging into the short service zone.',
    threatIndex: 78,
    threatLabel: 'High Tactical Threat',
    counterTactic: 'Lunge quickly for a hairpin net tumble or punch lift deep into rear court.',
    badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    barColor: 'from-emerald-500 to-teal-600',
  },
  DRIVE: {
    phase: 'Fast Flat Counter-Exchange',
    trajectory: 'High-speed flat trajectory traveling tightly parallel within 30cm of net height.',
    threatIndex: 74,
    threatLabel: 'Moderate Attack',
    counterTactic: 'Keep racket head upright in front of body; intercept early before shuttle dips.',
    badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    barColor: 'from-amber-500 to-orange-600',
  },
  NET_SHOT: {
    phase: 'Forecourt Finesse / Control',
    trajectory: 'Tight spinning tumble clearing millimeters over the tape into extreme forecourt corners.',
    threatIndex: 68,
    threatLabel: 'Tactical Control',
    counterTactic: 'Reply with a counter-hairpin net shot or perform a deceptive flick lift.',
    badgeColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
    barColor: 'from-purple-500 to-indigo-600',
  },
};

const CANONICAL_CLASSES = [
  { key: 'SMASH', label: 'SMASH', defaultColor: 'from-rose-500 to-red-600' },
  { key: 'CLEAR', label: 'CLEAR', defaultColor: 'from-sky-500 to-blue-600' },
  { key: 'DROP', label: 'DROP', defaultColor: 'from-emerald-500 to-teal-600' },
  { key: 'DRIVE', label: 'DRIVE', defaultColor: 'from-amber-500 to-orange-600' },
  { key: 'NET_SHOT', label: 'NET SHOT', defaultColor: 'from-purple-500 to-indigo-600' },
] as const;

export default function ResultsDisplay({
  videoId,
  uploadedFilename,
  status,
  analysisResult,
  errorMessage,
}: ResultsDisplayProps) {
  const isAnalyzing = status === 'analyzing';
  const isCompleted = status === 'completed' && analysisResult !== null;

  const currentTactic = isCompleted && analysisResult
    ? SHOT_TACTICS[analysisResult.predicted_shot] || SHOT_TACTICS.SMASH
    : null;

  return (
    <div className="w-full spark-card rounded-2xl p-6 transition-all duration-300 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--border-subtle)] gap-3">
        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)] tracking-wide flex items-center space-x-2">
            <span>Recognition & Sports Analytics</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-mono border border-[var(--border-subtle)]">
              Temporal Model EXP_DRIVE_11
            </span>
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {isCompleted
              ? 'Model inference complete. Real 5-class distribution and badminton tactical intelligence.'
              : isAnalyzing
              ? 'Running deep temporal sequence classification across 16 sampled frames...'
              : status === 'uploaded'
              ? 'Video ready in storage. Click "Analyze Video" above to run inference.'
              : 'Select or drag-and-drop a badminton video clip above to begin analysis.'}
          </p>
        </div>

        {/* Dynamic Status Badge */}
        <div>
          {isCompleted ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Inference Complete</span>
            </span>
          ) : isAnalyzing ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-semibold border border-cyan-500/20">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
              <span>Analyzing Video...</span>
            </span>
          ) : status === 'uploaded' ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Ready for Analysis</span>
            </span>
          ) : status === 'error' ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Analysis Error</span>
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--bg-secondary)] text-[var(--text-muted)] text-xs font-mono border border-[var(--border-subtle)]">
              Awaiting Video Clip
            </span>
          )}
        </div>
      </div>

      {/* Loading State Banner */}
      {isAnalyzing && (
        <div className="p-5 rounded-2xl bg-cyan-500/5 dark:bg-cyan-950/20 border border-cyan-500/30 flex items-center space-x-4 animate-pulse">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin flex-shrink-0" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">
              Processing stroke kinematics with deep temporal sequence model...
            </h4>
            <p className="text-xs text-[var(--text-secondary)]">
              16 uniform chronological frames → ResNet-18 spatial embedding → Transformer-LSTM classifier
            </p>
          </div>
        </div>
      )}

      {/* Error Alert Banner */}
      {status === 'error' && errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-xs text-rose-700 dark:text-rose-300">
          <svg className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="space-y-1">
            <span className="font-semibold block">Analysis could not be completed:</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Highlighted Primary Prediction Banner */}
      {isCompleted && analysisResult && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[var(--bg-card-inner)] via-[var(--bg-card)] to-[var(--bg-secondary)] border border-[var(--border-active)] shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
                PREDICTED BADMINTON SHOT
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${currentTactic?.badgeColor}`}>
                {currentTactic?.phase}
              </span>
            </div>
            <div className="text-4xl sm:text-5xl font-black tracking-tight text-[var(--text-primary)]">
              {analysisResult.predicted_shot}
            </div>
            <div className="flex items-center space-x-3 text-xs text-[var(--text-secondary)] pt-1">
              <span>
                Model Confidence:{' '}
                <strong className="font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                  {(analysisResult.confidence * 100).toFixed(2)}%
                </strong>
              </span>
              <span>•</span>
              <span className="font-mono text-[var(--text-muted)]">
                Inference Latency: {analysisResult.processing_time_ms.toFixed(1)} ms
              </span>
            </div>
          </div>

          {/* Threat Gauge Visual */}
          <div className="flex flex-col items-start md:items-end space-y-1 sm:text-right">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)]">
              TACTICAL THREAT INDEX
            </span>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-extrabold font-mono text-[var(--text-primary)]">
                {currentTactic?.threatIndex}
              </span>
              <span className="text-xs text-[var(--text-muted)] font-mono">/100</span>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
              {currentTactic?.threatLabel}
            </span>
          </div>
        </div>
      )}

      {/* 4 Sports Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tactical Phase */}
        <div className="spark-card-inner rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] uppercase font-mono tracking-wider text-[var(--text-secondary)]">
              Tactical Phase
            </span>
            <span className="text-xs text-[var(--text-muted)]">🏸</span>
          </div>
          <div className="text-base font-bold text-[var(--text-primary)] line-clamp-1">
            {isCompleted ? currentTactic?.phase : '—'}
          </div>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            {isCompleted ? 'Strategic Intent' : 'Awaiting Video'}
          </span>
        </div>

        {/* Card 2: Kinematic Trajectory */}
        <div className="spark-card-inner rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] uppercase font-mono tracking-wider text-[var(--text-secondary)]">
              Trajectory Dynamics
            </span>
            <span className="text-xs text-[var(--text-muted)]">📐</span>
          </div>
          <div className="text-xs font-medium text-[var(--text-primary)] line-clamp-2 leading-tight">
            {isCompleted ? currentTactic?.trajectory : '—'}
          </div>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            {isCompleted ? 'Decoded Vector' : 'Kinematic Profiling'}
          </span>
        </div>

        {/* Card 3: Counter-Tactic Advice */}
        <div className="spark-card-inner rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] uppercase font-mono tracking-wider text-[var(--text-secondary)]">
              Counter-Tactic
            </span>
            <span className="text-xs text-[var(--text-muted)]">🛡️</span>
          </div>
          <div className="text-xs font-medium text-[var(--text-primary)] line-clamp-2 leading-tight">
            {isCompleted ? currentTactic?.counterTactic : '—'}
          </div>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            {isCompleted ? 'Coach Recommendation' : 'Tactical Response'}
          </span>
        </div>

        {/* Card 4: Sampling & Latency */}
        <div className="spark-card-inner rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] uppercase font-mono tracking-wider text-[var(--text-secondary)]">
              Model Performance
            </span>
            <span className="text-xs text-[var(--text-muted)]">⚡</span>
          </div>
          <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {isCompleted ? `${analysisResult.processing_time_ms.toFixed(1)} ms` : '—'}
          </div>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block font-mono">
            {isCompleted ? `${analysisResult.frames_used} Frames • CPU Mode` : 'Latency Benchmark'}
          </span>
        </div>
      </div>

      {/* 5-Class Probability Distribution */}
      {isCompleted && analysisResult && (
        <div className="spark-card-inner rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
            <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-[var(--text-primary)]">
              5-Class Calibrated Softmax Distribution
            </h4>
            <span className="text-[11px] font-mono text-[var(--text-muted)]">
              Sum = 100%
            </span>
          </div>

          <div className="space-y-3.5">
            {CANONICAL_CLASSES.map(({ key, label, defaultColor }) => {
              const probValue =
                analysisResult.probabilities[key as keyof typeof analysisResult.probabilities] ?? 0;
              const probPercent = (probValue * 100).toFixed(2);
              const isPredicted = analysisResult.predicted_shot === key;

              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-mono font-bold flex items-center space-x-2 ${
                        isPredicted
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-[var(--text-primary)]'
                      }`}
                    >
                      <span>{label}</span>
                      {isPredicted && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-mono uppercase font-semibold">
                          Selected Argmax
                        </span>
                      )}
                    </span>
                    <span className="font-mono font-bold text-[var(--text-primary)]">
                      {probPercent}%
                    </span>
                  </div>

                  {/* Visual animated bar */}
                  <div className="w-full h-2.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${
                        isPredicted ? defaultColor : 'from-zinc-400 to-zinc-500 opacity-30 dark:opacity-20'
                      }`}
                      style={{ width: `${Math.max(Number(probPercent), 0.5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5-Step Pipeline Stepper */}
      <div className="border border-[var(--border-subtle)] rounded-xl p-4 bg-[var(--bg-card-inner)]/50">
        <h5 className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] font-bold mb-3">
          End-to-End Inference Stages
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs">
          <div className={`p-2 rounded-lg border ${status !== 'idle' ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' : 'border-[var(--border-subtle)] text-[var(--text-muted)]'}`}>
            <div className="font-mono font-bold text-[10px]">STAGE 1</div>
            <div className="text-[11px] font-medium mt-0.5">MP4 Ingestion</div>
          </div>
          <div className={`p-2 rounded-lg border ${status === 'analyzing' || isCompleted ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' : 'border-[var(--border-subtle)] text-[var(--text-muted)]'}`}>
            <div className="font-mono font-bold text-[10px]">STAGE 2</div>
            <div className="text-[11px] font-medium mt-0.5">16-Frame Sampling</div>
          </div>
          <div className={`p-2 rounded-lg border ${status === 'analyzing' || isCompleted ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' : 'border-[var(--border-subtle)] text-[var(--text-muted)]'}`}>
            <div className="font-mono font-bold text-[10px]">STAGE 3</div>
            <div className="text-[11px] font-medium mt-0.5">ResNet-18 (512-D)</div>
          </div>
          <div className={`p-2 rounded-lg border ${status === 'analyzing' || isCompleted ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' : 'border-[var(--border-subtle)] text-[var(--text-muted)]'}`}>
            <div className="font-mono font-bold text-[10px]">STAGE 4</div>
            <div className="text-[11px] font-medium mt-0.5">Transformer+LSTM</div>
          </div>
          <div className={`p-2 rounded-lg border ${isCompleted ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' : 'border-[var(--border-subtle)] text-[var(--text-muted)]'}`}>
            <div className="font-mono font-bold text-[10px]">STAGE 5</div>
            <div className="text-[11px] font-medium mt-0.5">Softmax Class</div>
          </div>
        </div>
      </div>
    </div>
  );
}
