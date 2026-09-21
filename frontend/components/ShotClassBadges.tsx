'use client';

import React from 'react';
import { ShotInfo } from '@/types';

interface ExtendedShotInfo extends ShotInfo {
  category: string;
  speed: string;
  svgPath: React.ReactNode;
}

const TARGET_SHOTS: ExtendedShotInfo[] = [
  {
    name: 'SMASH',
    description: 'High-velocity downward attack executed with steep angle from mid/rear court.',
    tagColor: 'border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:border-rose-500/50',
    category: 'Primary Attack',
    speed: '> 300 km/h',
    svgPath: (
      <svg className="w-full h-8" viewBox="0 0 120 36" fill="none">
        <path d="M 10 6 L 105 30" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
        <polygon points="108,31 100,27 103,34" fill="#f43f5e" />
        <line x1="60" y1="16" x2="60" y2="34" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" className="text-zinc-400 dark:text-zinc-600" />
      </svg>
    ),
  },
  {
    name: 'CLEAR',
    description: 'High, deep trajectory sending the shuttle deep to the opponent rear court.',
    tagColor: 'border-sky-500/30 text-sky-600 dark:text-sky-400 bg-sky-500/10 hover:border-sky-500/50',
    category: 'Defensive / Reset',
    speed: '~ 180 km/h',
    svgPath: (
      <svg className="w-full h-8" viewBox="0 0 120 36" fill="none">
        <path d="M 10 30 Q 60 4 105 28" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
        <polygon points="108,29 101,24 104,32" fill="#0ea5e9" />
        <line x1="60" y1="16" x2="60" y2="34" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" className="text-zinc-400 dark:text-zinc-600" />
      </svg>
    ),
  },
  {
    name: 'DROP',
    description: 'Deceptive downward trajectory softly placed just over the opponent net tape.',
    tagColor: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:border-emerald-500/50',
    category: 'Deceptive Placement',
    speed: '~ 120 km/h',
    svgPath: (
      <svg className="w-full h-8" viewBox="0 0 120 36" fill="none">
        <path d="M 10 8 Q 55 12 75 30" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
        <polygon points="78,32 72,26 77,24" fill="#10b981" />
        <line x1="60" y1="16" x2="60" y2="34" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" className="text-zinc-400 dark:text-zinc-600" />
      </svg>
    ),
  },
  {
    name: 'DRIVE',
    description: 'Fast, flat, horizontal exchange traveling tightly parallel across the net.',
    tagColor: 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:border-amber-500/50',
    category: 'Counter-Attack',
    speed: '~ 220 km/h',
    svgPath: (
      <svg className="w-full h-8" viewBox="0 0 120 36" fill="none">
        <path d="M 10 20 L 105 20" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
        <polygon points="108,20 101,16 101,24" fill="#f59e0b" />
        <line x1="60" y1="16" x2="60" y2="34" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" className="text-zinc-400 dark:text-zinc-600" />
      </svg>
    ),
  },
  {
    name: 'NET SHOT',
    description: 'Delicate finesse shot played tightly tumbling across the opponent tape.',
    tagColor: 'border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:border-purple-500/50',
    category: 'Forecourt Finesse',
    speed: '~ 60 km/h',
    svgPath: (
      <svg className="w-full h-8" viewBox="0 0 120 36" fill="none">
        <path d="M 45 28 Q 60 14 75 28" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
        <polygon points="77,29 74,22 71,28" fill="#a855f7" />
        <line x1="60" y1="16" x2="60" y2="34" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" className="text-zinc-400 dark:text-zinc-600" />
      </svg>
    ),
  },
];

export default function ShotClassBadges() {
  return (
    <div id="classes" className="w-full scroll-mt-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-2 border-b border-[var(--border-subtle)] gap-2">
        <div>
          <h3 className="text-sm uppercase font-mono tracking-widest text-[var(--text-primary)] font-bold">
            Badminton Stroke Taxonomy (5 Standard Classes)
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Kinematic trajectory profiles and physical classification characteristics modeled by SPARK.
          </p>
        </div>
        <span className="text-xs text-[var(--text-muted)] font-mono">
          Rigid 5-Class Categorization
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {TARGET_SHOTS.map((shot) => (
          <div
            key={shot.name}
            className={`p-4 rounded-2xl border ${shot.tagColor} transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-base tracking-wide">{shot.name}</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 font-medium">
                  {shot.category}
                </span>
              </div>
              
              <div className="my-2 p-1.5 rounded-lg bg-black/5 dark:bg-black/20 flex items-center justify-center">
                {shot.svgPath}
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-snug mt-2">
                {shot.description}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
              <span>EST. SPEED</span>
              <span className="font-semibold text-[var(--text-primary)]">{shot.speed}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
