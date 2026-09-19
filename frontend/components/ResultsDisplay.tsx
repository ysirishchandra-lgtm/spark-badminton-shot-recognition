'use client';

import React from 'react';

interface ResultsDisplayProps {
  videoId: string | null;
  uploadedFilename?: string | null;
  isUploaded: boolean;
}

export default function ResultsDisplay({ videoId, uploadedFilename, isUploaded }: ResultsDisplayProps) {
  return (
    <div className="w-full spark-card rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[var(--border-subtle)] gap-2">
        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)] tracking-wide flex items-center space-x-2">
            <span>Recognition & Analysis Results</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-mono border border-[var(--border-subtle)]">
              Model Pipeline
            </span>
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {isUploaded 
              ? 'Video uploaded successfully. Ready for shot recognition inference.' 
              : 'Upload a video to begin analysis.'}
          </p>
        </div>
        {isUploaded ? (
          <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20 flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Video Registered</span>
          </span>
        ) : (
          <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-[var(--bg-secondary)] text-[var(--text-muted)] text-xs font-mono border border-[var(--border-subtle)]">
            Awaiting Video
          </span>
        )}
      </div>

      {/* Metrics & Prediction Placeholders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Metric 1: Predicted Shot */}
        <div className="spark-card-inner rounded-xl p-4">
          <span className="text-xs uppercase font-mono tracking-wider text-[var(--text-secondary)] block mb-1">
            Predicted Shot
          </span>
          <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">
            —
          </div>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            Class: Unassigned
          </span>
        </div>

        {/* Metric 2: Confidence */}
        <div className="spark-card-inner rounded-xl p-4">
          <span className="text-xs uppercase font-mono tracking-wider text-[var(--text-secondary)] block mb-1">
            Confidence
          </span>
          <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">
            —
          </div>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            Softmax Probability
          </span>
        </div>

        {/* Metric 3: Processing Time */}
        <div className="spark-card-inner rounded-xl p-4">
          <span className="text-xs uppercase font-mono tracking-wider text-[var(--text-secondary)] block mb-1">
            Processing Time
          </span>
          <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">
            —
          </div>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            Latency Benchmark
          </span>
        </div>

        {/* Metric 4: Video ID */}
        <div className="spark-card-inner rounded-xl p-4">
          <span className="text-xs uppercase font-mono tracking-wider text-[var(--text-secondary)] block mb-1">
            Video ID
          </span>
          <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 truncate" title={videoId || '—'}>
            {videoId ? videoId : '—'}
          </div>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block truncate">
            {uploadedFilename ? `File: ${uploadedFilename}` : 'Storage Reference'}
          </span>
        </div>
      </div>

      {/* Professional Information Notice */}
      <div className="bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4 flex items-start space-x-3">
        <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">AI Inference Pipeline:</span> Video ingestion, format validation, and secure storage are operational. Deep learning sequence modeling processes video frames across temporal windows to recognize executed badminton strokes. Prediction indicators will reflect verified model inference results.
        </div>
      </div>
    </div>
  );
}
