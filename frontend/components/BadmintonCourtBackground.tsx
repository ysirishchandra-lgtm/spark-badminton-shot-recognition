'use client';

import React from 'react';
import Image from 'next/image';

export default function BadmintonCourtBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
      {/* =========================================================================
          DARK MODE: Professional Indoor Arena Photo + Vignette (APPROVED - PROTECTED)
          ========================================================================= */}
      <div className="hidden dark:block absolute inset-0 w-full h-full">
        {/* Layer 1 & 2: Arena Photo */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/images/badminton_court_arena.jpg"
            alt="Professional Badminton Court Arena"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center scale-105 filter blur-[1.5px] contrast-[1.08] brightness-[0.45]"
          />
        </div>

        {/* Dark Mode Overlay & Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#080c14]/80 via-[#080c14]/75 to-[#080c14]/90 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)]" />

        {/* Dark Mode Minimal Trajectories & Grid */}
        <svg
          className="absolute inset-0 w-full h-full opacity-25"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1920 1080"
        >
          <defs>
            <linearGradient id="smash-grad-dark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="clear-grad-dark" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
            </linearGradient>
            <pattern id="tech-grid-dark" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#10b981" opacity="0.4" />
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#10b981" strokeWidth="0.5" opacity="0.1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tech-grid-dark)" />
          <g stroke="#10b981" strokeWidth="1" strokeDasharray="4 8" opacity="0.3">
            <line x1="200" y1="540" x2="1720" y2="540" />
            <line x1="960" y1="200" x2="960" y2="880" />
            <circle cx="960" cy="540" r="120" fill="none" strokeWidth="0.8" />
            <circle cx="960" cy="540" r="4" fill="#10b981" />
          </g>
          <path d="M 1550 780 Q 960 140 380 720" fill="none" stroke="url(#clear-grad-dark)" strokeWidth="2" strokeDasharray="6 6" />
          <path d="M 1480 320 L 750 820" fill="none" stroke="url(#smash-grad-dark)" strokeWidth="2.5" />
        </svg>
      </div>

      {/* =========================================================================
          LIGHT MODE: Deliberate Light Sports-Tech Theme (Clean Court Geometry)
          No giant competing photo; crisp, subtle court lines, net structure & soft grid
          ========================================================================= */}
      <div className="block dark:hidden absolute inset-0 w-full h-full bg-[#F8FAFA]">
        {/* Soft Radial Vignette for Depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(5,150,105,0.03)_0%,transparent_60%)]" />

        {/* Crisp Analytical Court Architecture (SVG) */}
        <svg
          className="absolute inset-0 w-full h-full opacity-60"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1920 1080"
        >
          <defs>
            {/* Subtle dot matrix for technical precision */}
            <pattern id="light-court-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill="#0F172A" opacity="0.08" />
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0F172A" strokeWidth="0.5" opacity="0.03" />
            </pattern>
            <linearGradient id="light-accent-arc" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Background Micro-Grid */}
          <rect width="100%" height="100%" fill="url(#light-court-grid)" />

          {/* Full Standard BWF Court Geometry (Scaled Elegantly) */}
          <g stroke="#0F172A" strokeWidth="1" opacity="0.07" fill="none">
            {/* Doubles Outer Perimeter: 13.4m x 6.1m */}
            <rect x="260" y="160" width="1400" height="760" rx="4" />

            {/* Singles Sidelines (0.46m inside doubles lines) */}
            <line x1="260" y1="215" x2="1660" y2="215" />
            <line x1="260" y1="865" x2="1660" y2="865" />

            {/* Long Service Lines for Doubles (0.76m inside back boundary) */}
            <line x1="330" y1="160" x2="330" y2="920" />
            <line x1="1590" y1="160" x2="1590" y2="920" />

            {/* Short Service Lines (1.98m from net on each side) */}
            <line x1="720" y1="160" x2="720" y2="920" />
            <line x1="1200" y1="160" x2="1200" y2="920" />

            {/* Center Line dividing right & left service courts */}
            <line x1="260" y1="540" x2="720" y2="540" />
            <line x1="1200" y1="540" x2="1660" y2="540" />
          </g>

          {/* Center Net Line & Posts */}
          <g stroke="#059669" opacity="0.16">
            {/* Net Structure */}
            <line x1="960" y1="130" x2="960" y2="950" strokeWidth="2" strokeDasharray="3 3" />
            {/* Net Posts */}
            <circle cx="960" cy="160" r="4" fill="#059669" />
            <circle cx="960" cy="920" r="4" fill="#059669" />
            {/* Court Center Coordinate */}
            <circle cx="960" cy="540" r="2" fill="#059669" />
          </g>

          {/* Very faint, elegant analytical trajectory vectors */}
          <path
            d="M 1520 780 Q 960 220 400 700"
            fill="none"
            stroke="url(#light-accent-arc)"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />
          <path
            d="M 1440 320 L 780 780"
            fill="none"
            stroke="#059669"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.12"
          />
        </svg>

        {/* Soft Linear Gradient overlay for smooth transition */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAFA]/60 via-transparent to-[#F8FAFA]/80" />
      </div>
    </div>
  );
}
