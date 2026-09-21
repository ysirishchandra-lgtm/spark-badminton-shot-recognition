'use client';

import React from 'react';

export default function ArchitectureSection() {
  const steps = [
    {
      step: '01',
      title: 'Uniform Temporal Sampling',
      desc: 'Raw match MP4 is ingested and decoded via OpenCV into exactly 16 chronological video frames evenly spanning the stroke duration.',
      badge: '16 Frames • 224×224',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      step: '02',
      title: 'ResNet-18 Spatial Extraction',
      desc: 'Each frame is normalized to ImageNet distribution and passed through a frozen ResNet-18 backbone, extracting a dense 512-D spatial feature embedding.',
      badge: '512-D Embedding Vector',
      color: 'from-teal-500 to-cyan-500',
    },
    {
      step: '03',
      title: 'Transformer + LSTM Temporal Modeling',
      desc: 'The 16×512 sequence is processed through multi-head self-attention and bi-directional recurrent layers to capture stroke kinematics and shuttle speed changes.',
      badge: 'Temporal Attention + Bi-LSTM',
      color: 'from-cyan-500 to-blue-500',
    },
    {
      step: '04',
      title: '5-Class Calibrated Softmax',
      desc: 'Dense projection produces class logits mapped through calibrated softmax, delivering probabilistic confidence scores across all 5 shot types.',
      badge: 'Argmax & Probability Array',
      color: 'from-blue-500 to-indigo-500',
    },
  ];

  const metrics = [
    { label: 'Validation Accuracy', value: '77.55%', desc: 'Frozen Validation Split' },
    { label: 'Macro F1-Score', value: '69.35%', desc: 'Balanced 5-Class Mean' },
    { label: 'Weighted F1-Score', value: '77.63%', desc: 'Class-Weighted Representation' },
    { label: 'Net Shot F1', value: '96.90%', desc: 'Highest Class Precision' },
  ];

  return (
    <section id="architecture" className="scroll-mt-20 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[var(--border-subtle)] pb-4 gap-2">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-mono mb-2">
            <span>PIPELINE ARCHITECTURE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            Deep Computer Vision & Temporal Sequence Modeling
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            End-to-end architecture bridging frame-level spatial feature extraction and deep temporal sequence classification.
          </p>
        </div>
        <div className="text-xs font-mono text-[var(--text-muted)] sm:text-right">
          Backbone: ResNet-18 (512-D) • Model: EXP_DRIVE_11 Baseline
        </div>
      </div>

      {/* 4 Pipeline Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((item) => (
          <div
            key={item.step}
            className="spark-card rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px] hover:border-emerald-500/40"
          >
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color}`} />
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl font-black font-mono text-[var(--text-muted)] opacity-40">
                {item.step}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
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

      {/* Validation Benchmark Stats Grid */}
      <div className="spark-card rounded-2xl p-6 bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-[var(--bg-secondary)] border border-[var(--border-card)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-3 border-b border-[var(--border-subtle)] gap-2">
          <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-[var(--text-primary)]">
            Rigorous Empirical Validation Benchmarks
          </h4>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Official Test Partition Strictly Isolated</span>
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="spark-card-inner rounded-xl p-4 text-center">
              <span className="text-xs text-[var(--text-secondary)] block font-medium mb-1">
                {m.label}
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                {m.value}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] block mt-1 font-mono">
                {m.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
