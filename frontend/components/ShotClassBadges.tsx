'use client';

import React from 'react';
import { ShotInfo } from '@/types';

const TARGET_SHOTS: ShotInfo[] = [
  {
    name: 'SMASH',
    description: 'High-velocity downward attack executed from mid/rear court.',
    tagColor: 'border-rose-500/30 text-rose-400 bg-rose-500/10'
  },
  {
    name: 'CLEAR',
    description: 'High, deep trajectory shot directed towards the opponent rear court.',
    tagColor: 'border-sky-500/30 text-sky-400 bg-sky-500/10'
  },
  {
    name: 'DROP',
    description: 'Deceptive downward trajectory softly placed just over the net.',
    tagColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
  },
  {
    name: 'DRIVE',
    description: 'Fast, flat, horizontal exchange traveling parallel to the floor.',
    tagColor: 'border-amber-500/30 text-amber-400 bg-amber-500/10'
  },
  {
    name: 'NET SHOT',
    description: 'Delicate finesse shot played tightly tumbling across the tape.',
    tagColor: 'border-purple-500/30 text-purple-400 bg-purple-500/10'
  }
];

export default function ShotClassBadges() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs uppercase font-mono tracking-widest text-slate-400">
          Target Classification Taxonomy (5 Classes)
        </h3>
        <span className="text-xs text-slate-500 font-mono">EXP24 Taxonomy</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {TARGET_SHOTS.map((shot) => (
          <div
            key={shot.name}
            className={`p-3 rounded-xl border ${shot.tagColor} transition-all duration-200 hover:scale-[1.02]`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm tracking-wide">{shot.name}</span>
              <span className="text-[10px] uppercase font-mono opacity-70">Class</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
              {shot.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
