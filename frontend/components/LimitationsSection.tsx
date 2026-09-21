'use client';

import React from 'react';

export default function LimitationsSection() {
  const limitations = [
    {
      title: 'Isolated Stroke Clips vs Continuous Match Rallies',
      badge: 'Segmentation Scope',
      desc: 'The current model processes trimmed video clips containing a single isolated stroke execution. Unsegmented multi-rally broadcast streams require an upstream automated shot-boundary detector.',
      color: 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5',
    },
    {
      title: '16-Frame Uniform Temporal Subsampling',
      badge: 'Sampling Window',
      desc: 'To maintain real-time CPU/GPU inference latency under 100ms, each video clip is subsampled to 16 chronological frames, which captures major kinematic acceleration phases.',
      color: 'border-cyan-500/30 text-cyan-600 dark:text-cyan-400 bg-cyan-500/5',
    },
    {
      title: 'Monocular Broadcast Camera Perspective',
      badge: 'Visual Modality',
      desc: 'Trained and calibrated on standard professional BWF singles broadcast court elevation. Extreme side-court angles or low-angle smartphone recordings may exhibit lower classification certainty.',
      color: 'border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/5',
    },
    {
      title: 'Pure Visual Modeling (No External Sensors)',
      badge: 'Deployable Vision',
      desc: 'Operates purely on pixel video frames without requiring high-speed infrared shuttle tracking or wearable player IMU sensors, making it widely deployable to standard video.',
      color: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5',
    },
  ];

  return (
    <section id="limitations" className="scroll-mt-20 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[var(--border-subtle)] pb-4 gap-2">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-mono mb-2">
            <span>SCIENTIFIC DISCLOSURES</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            Operational Scope & Model Limitations
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Transparent academic engineering disclosures regarding operational bounds and camera conditions.
          </p>
        </div>
        <div className="text-xs font-mono text-[var(--text-muted)]">
          BWF Standard • Single Camera Elevation
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {limitations.map((item) => (
          <div
            key={item.title}
            className={`spark-card rounded-2xl p-5 border ${item.color} transition-all duration-200`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold tracking-wider uppercase opacity-90">
                {item.badge}
              </span>
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">
              {item.title}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
