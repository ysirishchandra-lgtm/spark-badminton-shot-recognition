'use client';

import React from 'react';
import { AnalysisStatus, VideoAnalysisResponse } from '@/types';

interface ResultsDisplayProps {
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
  }
> = {
  SMASH: {
    phase: 'Aggressive Offensive Attack',
    trajectory: 'Steep downward vector (>300 km/h) targeted toward opponent court boundaries.',
    threatIndex: 94,
    threatLabel: 'Critical Threat',
    counterTactic: 'Block softly into opposing forecourt corners; avoid lifting mid-court.',
    badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30',
  },
  CLEAR: {
    phase: 'Defensive Rally Reset / Baseline Shift',
    trajectory: 'High parabolic arc driven deep into the opponent rear baseline corners.',
    threatIndex: 42,
    threatLabel: 'Neutral / Reset',
    counterTactic: 'Execute an attacking drop or smash if shuttle is short; otherwise reset footwork.',
    badgeColor: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400 border border-sky-200 dark:border-sky-500/30',
  },
  DROP: {
    phase: 'Deceptive Front-Court Attack',
    trajectory: 'Dipping decelerating arc clearing the net tape and plunging into the short service zone.',
    threatIndex: 78,
    threatLabel: 'High Tactical Threat',
    counterTactic: 'Lunge quickly for a hairpin net tumble or punch lift deep into rear court.',
    badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30',
  },
  DRIVE: {
    phase: 'Fast Flat Counter-Exchange',
    trajectory: 'High-speed flat trajectory traveling tightly parallel within 30cm of net height.',
    threatIndex: 74,
    threatLabel: 'Moderate Attack',
    counterTactic: 'Keep racket head upright in front of body; intercept early before shuttle dips.',
    badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30',
  },
  NET_SHOT: {
    phase: 'Forecourt Finesse / Control',
    trajectory: 'Tight spinning tumble clearing millimeters over the tape into extreme forecourt corners.',
    threatIndex: 68,
    threatLabel: 'Tactical Control',
    counterTactic: 'Reply with a counter-hairpin net shot or perform a deceptive flick lift.',
    badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30',
  },
};

export default function ResultsDisplay({
  status,
  analysisResult,
  errorMessage,
}: ResultsDisplayProps) {
  const isCompleted = status === 'completed' && analysisResult !== null;

  const currentTactic = isCompleted && analysisResult
    ? SHOT_TACTICS[analysisResult.predicted_shot] || SHOT_TACTICS.SMASH
    : null;

  if (!isCompleted || !currentTactic) {
    return null;
  }

  return (
    <div className="w-full spark-card rounded-xl p-5 sm:p-6 transition-all duration-200 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[var(--border-subtle)] gap-2">
        <div>
          <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-[var(--text-primary)]">
            Badminton Sports Intelligence & Match Analytics
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Decoded stroke kinematics and tactical recommendations for competitive performance analysis.
          </p>
        </div>
        <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-medium ${currentTactic.badgeColor}`}>
          {currentTactic.phase}
        </span>
      </div>

      {/* 4 Sports Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tactical Phase */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200/70 dark:border-white/10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] uppercase font-mono tracking-wider text-[var(--text-secondary)]">
              Tactical Phase
            </span>
            <span className="text-xs">🏸</span>
          </div>
          <div className="text-sm sm:text-base font-bold text-[var(--text-primary)] line-clamp-1">
            {currentTactic.phase}
          </div>
          <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
            Strategic Intent
          </span>
        </div>

        {/* Card 2: Kinematic Trajectory */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200/70 dark:border-white/10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] uppercase font-mono tracking-wider text-[var(--text-secondary)]">
              Trajectory Dynamics
            </span>
            <span className="text-xs">📐</span>
          </div>
          <div className="text-xs font-medium text-[var(--text-primary)] line-clamp-2 leading-tight">
            {currentTactic.trajectory}
          </div>
          <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
            Decoded Vector
          </span>
        </div>

        {/* Card 3: Counter-Tactic Advice */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200/70 dark:border-white/10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] uppercase font-mono tracking-wider text-[var(--text-secondary)]">
              Counter-Tactic
            </span>
            <span className="text-xs">🛡️</span>
          </div>
          <div className="text-xs font-medium text-[var(--text-primary)] line-clamp-2 leading-tight">
            {currentTactic.counterTactic}
          </div>
          <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
            Coach Recommendation
          </span>
        </div>

        {/* Card 4: Threat Index */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200/70 dark:border-white/10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] uppercase font-mono tracking-wider text-[var(--text-secondary)]">
              Threat Index
            </span>
            <span className="text-xs">⚡</span>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black font-mono text-[var(--text-primary)]">
              {currentTactic.threatIndex}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">/100</span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold block">
            {currentTactic.threatLabel}
          </span>
        </div>
      </div>

      {/* 5-Step Pipeline Stepper */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200/70 dark:border-white/10">
        <h5 className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] font-bold mb-2.5">
          End-to-End Inference Verification
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs">
          <div className="p-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400">
            <div className="font-mono font-bold text-[10px]">STAGE 1</div>
            <div className="text-[11px] font-medium mt-0.5">MP4 Ingestion</div>
          </div>
          <div className="p-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400">
            <div className="font-mono font-bold text-[10px]">STAGE 2</div>
            <div className="text-[11px] font-medium mt-0.5">16-Frame Sampling</div>
          </div>
          <div className="p-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400">
            <div className="font-mono font-bold text-[10px]">STAGE 3</div>
            <div className="text-[11px] font-medium mt-0.5">ResNet-18 (512-D)</div>
          </div>
          <div className="p-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400">
            <div className="font-mono font-bold text-[10px]">STAGE 4</div>
            <div className="text-[11px] font-medium mt-0.5">Transformer-LSTM</div>
          </div>
          <div className="p-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400">
            <div className="font-mono font-bold text-[10px]">STAGE 5</div>
            <div className="text-[11px] font-medium mt-0.5">Softmax Class</div>
          </div>
        </div>
      </div>
    </div>
  );
}
