'use client';

import React from 'react';
import { AnalysisStatus, VideoAnalysisResponse } from '@/types';

interface ResultsDisplayProps {
  videoId: string | null;
  uploadedFilename?: string | null;
  status: AnalysisStatus;
  analysisResult: VideoAnalysisResponse | null;
  errorMessage?: string | null;
}

// Canonical order specified by protocol
const CANONICAL_CLASSES = [
  { key: 'SMASH', label: 'SMASH' },
  { key: 'CLEAR', label: 'CLEAR' },
  { key: 'DROP', label: 'DROP' },
  { key: 'DRIVE', label: 'DRIVE' },
  { key: 'NET_SHOT', label: 'NET SHOT' },
] as const;

export default function ResultsDisplay({
  videoId,
  uploadedFilename,
  status,
  analysisResult,
  errorMessage,
}: ResultsDisplayProps) {
  const isAnalyzing = status === 'analyzing';
  const isCompleted = status === 'completed' && analysisResult !== null;

  return (
    <div className="w-full spark-card rounded-2xl p-6 transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-[var(--border-subtle)] gap-3">
        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)] tracking-wide flex items-center space-x-2">
            <span>Recognition & Analysis Results</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-mono border border-[var(--border-subtle)]">
              EXP23_C Model
            </span>
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {isCompleted
              ? 'Model inference completed. Displaying real predictions and probability distribution.'
              : isAnalyzing
              ? 'Executing deep visual temporal sequence modeling across 16 frames...'
              : status === 'uploaded'
              ? 'Video uploaded successfully. Click "Analyze Video" to run inference.'
              : 'Upload a video to begin automated shot recognition analysis.'}
          </p>
        </div>

        {/* Dynamic Status Badge */}
        <div>
          {isCompleted ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Inference Complete</span>
            </span>
          ) : isAnalyzing ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-semibold border border-cyan-500/20">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
              <span>Analyzing Video...</span>
            </span>
          ) : status === 'uploaded' ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Ready for Analysis</span>
            </span>
          ) : status === 'error' ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Analysis Error</span>
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--bg-secondary)] text-[var(--text-muted)] text-xs font-mono border border-[var(--border-subtle)]">
              Awaiting Video
            </span>
          )}
        </div>
      </div>

      {/* Loading State Banner */}
      {isAnalyzing && (
        <div className="mb-6 p-5 rounded-xl bg-cyan-500/5 dark:bg-cyan-950/20 border border-cyan-500/30 flex items-center space-x-4 animate-pulse">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin flex-shrink-0" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">
              Analyzing video with the SPARK recognition model...
            </h4>
            <p className="text-xs text-[var(--text-secondary)]">
              Sampling 16 chronological frames → Frozen ResNet-18 spatial extraction → Transformer+LSTM sequence classification
            </p>
          </div>
        </div>
      )}

      {/* Error Alert Banner */}
      {status === 'error' && errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-xs text-rose-700 dark:text-rose-300">
          <svg className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="space-y-1">
            <span className="font-semibold block">Analysis could not be completed:</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Highlighted Primary Result Banner (Active when completed) */}
      {isCompleted && (
        <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/30 dark:border-emerald-500/20 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">
              Predicted Shot
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
              {analysisResult.predicted_shot}
            </div>
            <span className="text-xs text-[var(--text-secondary)] mt-1 block">
              Confidence:{' '}
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {(analysisResult.confidence * 100).toFixed(2)}%
              </span>
            </span>
          </div>

          <div className="flex sm:flex-col items-end sm:items-end gap-2 text-right">
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono font-medium border border-emerald-500/20">
              16-Frame Temporal Window
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              Latency: {analysisResult.processing_time_ms.toFixed(2)} ms
            </span>
          </div>
        </div>
      )}

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Metric 1: Predicted Shot */}
        <div className="spark-card-inner rounded-xl p-4">
          <span className="text-xs uppercase font-mono tracking-wider text-[var(--text-secondary)] block mb-1">
            Predicted Shot
          </span>
          <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">
            {isCompleted ? analysisResult.predicted_shot : '—'}
          </div>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            {isCompleted ? 'Argmax Model Prediction' : 'Class: Unassigned'}
          </span>
        </div>

        {/* Metric 2: Confidence */}
        <div className="spark-card-inner rounded-xl p-4">
          <span className="text-xs uppercase font-mono tracking-wider text-[var(--text-secondary)] block mb-1">
            Confidence
          </span>
          <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">
            {isCompleted ? `${(analysisResult.confidence * 100).toFixed(2)}%` : '—'}
          </div>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            {isCompleted ? 'Softmax Probability' : 'Awaiting Inference'}
          </span>
        </div>

        {/* Metric 3: Processing Time */}
        <div className="spark-card-inner rounded-xl p-4">
          <span className="text-xs uppercase font-mono tracking-wider text-[var(--text-secondary)] block mb-1">
            Processing Time
          </span>
          <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">
            {isCompleted ? `${analysisResult.processing_time_ms.toFixed(2)} ms` : '—'}
          </div>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            {isCompleted ? 'End-to-End CPU Execution' : 'Latency Benchmark'}
          </span>
        </div>

        {/* Metric 4: Video ID */}
        <div className="spark-card-inner rounded-xl p-4">
          <span className="text-xs uppercase font-mono tracking-wider text-[var(--text-secondary)] block mb-1">
            Video ID / Frames
          </span>
          <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 truncate" title={videoId || '—'}>
            {videoId ? videoId : '—'}
          </div>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block truncate">
            {isCompleted 
              ? `Frames Used: ${analysisResult.frames_used}` 
              : uploadedFilename 
              ? `File: ${uploadedFilename}` 
              : 'Storage Reference'}
          </span>
        </div>
      </div>

      {/* Five-Class Probability Distribution (Active when completed) */}
      {isCompleted && (
        <div className="mb-6 spark-card-inner rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs uppercase font-mono tracking-wider text-[var(--text-secondary)]">
              Class Probability Distribution
            </h4>
            <span className="text-[11px] font-mono text-[var(--text-muted)]">
              Softmax Output (Sum ≈ 100%)
            </span>
          </div>

          <div className="space-y-3">
            {CANONICAL_CLASSES.map(({ key, label }) => {
              const probValue = analysisResult.probabilities[key as keyof typeof analysisResult.probabilities] ?? 0;
              const probPercent = (probValue * 100).toFixed(2);
              const isPredicted = analysisResult.predicted_shot === key;

              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-mono font-semibold flex items-center space-x-2 ${
                      isPredicted ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--text-primary)]'
                    }`}>
                      <span>{label}</span>
                      {isPredicted && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-sans uppercase">
                          Selected
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-[var(--text-secondary)]">
                      {probPercent}%
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isPredicted
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : 'bg-[var(--border-subtle)] dark:bg-zinc-700'
                      }`}
                      style={{ width: `${Math.max(Number(probPercent), 0.5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Information Notice */}
      <div className="bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4 flex items-start space-x-3">
        <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">AI Inference Pipeline:</span> Video frames are sampled across the clip duration, normalized using ImageNet parameters, processed through frozen ResNet-18 spatial pooling (512-D), and classified by the EXP23_C Transformer+LSTM temporal network into the 5 standard badminton shot categories.
        </div>
      </div>
    </div>
  );
}
