'use client';

import React from 'react';

interface ResultsDisplayProps {
  videoId: string | null;
  uploadedFilename?: string | null;
  isUploaded: boolean;
}

export default function ResultsDisplay({ videoId, uploadedFilename, isUploaded }: ResultsDisplayProps) {
  return (
    <div className="w-full bg-[#0F172A] border border-white/10 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
        <div>
          <h3 className="text-base font-bold text-white tracking-wide flex items-center space-x-2">
            <span>Inference & Recognition Results</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono border border-white/10">
              ML Pipeline Skeleton
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Official EXP24 Multimodal Model boundary. Predictions pending Day 19 integration.
          </p>
        </div>
        {isUploaded ? (
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Video Queued</span>
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-500 text-xs font-mono">
            Awaiting Video
          </span>
        )}
      </div>

      {/* Metrics & Prediction Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Metric 1: Predicted Shot */}
        <div className="bg-[#141E33] border border-white/5 rounded-xl p-4">
          <span className="text-xs uppercase font-mono tracking-wider text-slate-400 block mb-1">
            Predicted Shot
          </span>
          <div className="text-2xl font-bold font-mono text-slate-200">
            —
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Class: Unassigned
          </span>
        </div>

        {/* Metric 2: Confidence */}
        <div className="bg-[#141E33] border border-white/5 rounded-xl p-4">
          <span className="text-xs uppercase font-mono tracking-wider text-slate-400 block mb-1">
            Confidence
          </span>
          <div className="text-2xl font-bold font-mono text-slate-200">
            —
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Softmax Probability
          </span>
        </div>

        {/* Metric 3: Processing Time */}
        <div className="bg-[#141E33] border border-white/5 rounded-xl p-4">
          <span className="text-xs uppercase font-mono tracking-wider text-slate-400 block mb-1">
            Processing Time
          </span>
          <div className="text-2xl font-bold font-mono text-slate-200">
            —
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Latency Benchmark
          </span>
        </div>

        {/* Metric 4: Video ID */}
        <div className="bg-[#141E33] border border-white/5 rounded-xl p-4">
          <span className="text-xs uppercase font-mono tracking-wider text-slate-400 block mb-1">
            Video ID
          </span>
          <div className="text-sm font-bold font-mono text-emerald-400 truncate" title={videoId || '—'}>
            {videoId ? videoId : '—'}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block truncate">
            {uploadedFilename ? `File: ${uploadedFilename}` : 'Storage Reference'}
          </span>
        </div>
      </div>

      {/* Integration Roadmap Notice */}
      <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4 flex items-start space-x-3">
        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-semibold text-emerald-400">Day 18 Foundation Stage:</span> Video ingestion, validation, and storage workflows are fully active. Full EXP24 multimodal transformer-BiLSTM inference integration will be linked to the backend service boundary on Day 19. All prediction placeholders strictly adhere to non-fabricated authentic status (<code className="font-mono text-emerald-300">—</code>).
        </div>
      </div>
    </div>
  );
}
