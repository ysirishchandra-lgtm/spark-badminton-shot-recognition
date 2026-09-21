'use client';

import React from 'react';
import Image from 'next/image';

export default function BadmintonCourtBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
      {/* LAYER 1 & 2: Professional Indoor Badminton Court Image with Net & Arena Lighting */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/images/badminton_court_arena.jpg"
          alt="Professional Badminton Court Arena"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105 filter blur-[1.5px] contrast-[1.08] dark:brightness-[0.45] brightness-[0.75] transition-all duration-700"
        />
      </div>

      {/* LAYER 5 & 6: Minimal Shot Trajectories & Analytical CV Grid Overlay (SVG) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20 dark:opacity-25 transition-opacity duration-300"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 1920 1080"
      >
        <defs>
          <linearGradient id="smash-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="clear-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="drop-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
          </linearGradient>
          <pattern id="tech-grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="currentColor" className="text-emerald-500/40" />
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-emerald-500/10" />
          </pattern>
        </defs>

        {/* Technical Sub-Grid */}
        <rect width="100%" height="100%" fill="url(#tech-grid)" />

        {/* Minimal Analytical Court Boundary Guides */}
        <g stroke="currentColor" strokeWidth="1" strokeDasharray="4 8" className="text-emerald-500/30">
          <line x1="200" y1="540" x2="1720" y2="540" />
          <line x1="960" y1="200" x2="960" y2="880" />
          <circle cx="960" cy="540" r="120" fill="none" strokeWidth="0.8" />
          <circle cx="960" cy="540" r="4" fill="currentColor" />
        </g>

        {/* Stylized Trajectory Curves */}
        {/* CLEAR: High deep arc from rear right to back left */}
        <path
          d="M 1550 780 Q 960 140 380 720"
          fill="none"
          stroke="url(#clear-grad)"
          strokeWidth="2"
          strokeDasharray="6 6"
        />
        {/* SMASH: Steep aggressive downward vector */}
        <path
          d="M 1480 320 L 750 820"
          fill="none"
          stroke="url(#smash-grad)"
          strokeWidth="2.5"
        />
        {/* DROP: Arching dip dropping just over net */}
        <path
          d="M 1420 380 Q 1100 420 980 620"
          fill="none"
          stroke="url(#drop-grad)"
          strokeWidth="1.8"
          strokeDasharray="3 3"
        />
        {/* DRIVE: Fast horizontal flat exchange */}
        <line
          x1="1350"
          y1="560"
          x2="570"
          y2="575"
          stroke="#10b981"
          strokeWidth="1.5"
          strokeDasharray="8 4"
          opacity="0.4"
        />
      </svg>

      {/* LAYER 7: Dark Readability & Contrast Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)]/80 via-[var(--bg-primary)]/75 to-[var(--bg-primary)]/90 backdrop-blur-[2px] transition-colors duration-500" />

      {/* LAYER 8: Soft Cinematic Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)]" />
    </div>
  );
}
