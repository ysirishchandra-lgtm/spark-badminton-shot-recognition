'use client';

import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-[var(--border-subtle)] bg-[var(--header-bg)]/80 backdrop-blur-md transition-colors duration-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Project Info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black text-sm">
                S
              </div>
              <span className="text-base font-bold tracking-wider text-[var(--text-primary)]">
                SPARK BADMINTON AI
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                Production Release
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-md">
              State-of-the-art computer vision and deep temporal sequence modeling system designed for automated stroke classification in competitive badminton match footage.
            </p>
            <div className="text-[11px] font-mono text-[var(--text-muted)] pt-1">
              Retained Baseline Architecture: ResNet-18 (512-D) + Transformer-BiLSTM Classifier
            </div>
          </div>

          {/* Col 2: Research Team */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Research & Development Team
            </h4>
            <ul className="text-xs text-[var(--text-secondary)] space-y-1">
              <li>• Sirish Chandra</li>
              <li>• Priyanshu</li>
              <li>• Ashwidha</li>
              <li>• Thakur Swetan Singh</li>
              <li>• Kaustub</li>
            </ul>
          </div>

          {/* Col 3: Specifications */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Technical Specifications
            </h4>
            <ul className="text-xs text-[var(--text-secondary)] space-y-1 font-mono">
              <li>Validation Acc: <span className="text-emerald-500 font-semibold">77.55%</span></li>
              <li>Macro F1: <span className="text-emerald-500 font-semibold">69.35%</span></li>
              <li>Sampling: 16 Frames Uniform</li>
              <li>Input Res: 224 × 224 RGB</li>
              <li>Official Test Set: <span className="text-amber-500 font-semibold">Protected</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[var(--border-subtle)] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-muted)] font-mono gap-3">
          <div>
            © {new Date().getFullYear()} SPARK Badminton Analytics • Academic Research Project
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="#analyze"
              className="hover:text-emerald-500 transition-colors"
            >
              Analyze Video
            </a>
            <a
              href="#classes"
              className="hover:text-emerald-500 transition-colors"
            >
              Taxonomy
            </a>
            <a
              href="#architecture"
              className="hover:text-emerald-500 transition-colors"
            >
              Architecture
            </a>
            <a
              href="#limitations"
              className="hover:text-emerald-500 transition-colors"
            >
              Disclosures
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
