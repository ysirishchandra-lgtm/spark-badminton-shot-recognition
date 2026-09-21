'use client';

import React, { useState, useEffect } from 'react';
import ShotClassBadges from '@/components/ShotClassBadges';
import VideoUploader from '@/components/VideoUploader';
import VideoPlayer from '@/components/VideoPlayer';
import AnalysisPanel from '@/components/AnalysisPanel';
import AnalysisPlaceholder from '@/components/AnalysisPlaceholder';
import ResultsDisplay from '@/components/ResultsDisplay';
import ArchitectureSection from '@/components/ArchitectureSection';
import LimitationsSection from '@/components/LimitationsSection';
import { VideoUploadResponse, VideoAnalysisResponse, AnalysisStatus } from '@/types';
import { uploadVideoFile, analyzeVideo, transcodeVideo, getVideoStreamUrl } from '@/lib/api';

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<VideoUploadResponse | null>(null);
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResponse | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clean up object URL on unmount or URL change
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  const handleFileSelected = (file: File) => {
    // Revoke old object URL if present
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }

    // Create fresh object URL for immediate browser playback
    const newUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setVideoUrl(newUrl);
    setStatus('selected');
    setUploadResult(null);
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  const handleClearVideo = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setSelectedFile(null);
    setVideoUrl(null);
    setUploadResult(null);
    setAnalysisResult(null);
    setStatus('idle');
    setErrorMessage(null);
  };

  const handleFallbackTranscode = async (): Promise<string | null> => {
    if (!selectedFile) return null;
    try {
      let currentUpload = uploadResult;
      if (!currentUpload) {
        currentUpload = await uploadVideoFile(selectedFile);
        setUploadResult(currentUpload);
      }
      const transcodeRes = await transcodeVideo(currentUpload.video_id);
      if (transcodeRes.status === 'ready') {
        return getVideoStreamUrl(currentUpload.video_id);
      }
      return null;
    } catch (err) {
      console.warn('Fallback transcode error:', err);
      return null;
    }
  };

  const handleAnalyzeClick = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a video before analyzing.');
      return;
    }

    setStatus('analyzing');
    setErrorMessage(null);

    try {
      // Step 1: Upload to backend if not already uploaded
      let currentUpload = uploadResult;
      if (!currentUpload) {
        currentUpload = await uploadVideoFile(selectedFile);
        setUploadResult(currentUpload);
      }

      // Step 2: Trigger model inference with video_id
      const result = await analyzeVideo(currentUpload.video_id);
      setAnalysisResult(result);
      setStatus('completed');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Video analysis failed. Please try again.';
      setErrorMessage(msg);
      setStatus('error');
    }
  };

  const handleDismissError = () => {
    setErrorMessage(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* =========================================================================
          HERO SECTION: Light Sports-Tech Theme + Deep Graphite Typography
          ========================================================================= */}
      <section className="text-center space-y-4 max-w-4xl mx-auto pt-6 pb-2">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            <span>SPARK</span>
          </div>

          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 text-xs font-mono">
            <span>Validation Benchmark: <strong className="text-emerald-700 dark:text-emerald-400">77.55% Acc</strong> • <strong className="text-emerald-700 dark:text-emerald-400">69.35% F1</strong></span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          AI-POWERED BADMINTON{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400">
            SHOT RECOGNITION
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-300 leading-relaxed max-w-2xl mx-auto">
          Analyze badminton videos using computer vision and temporal motion analysis.
        </p>

        {/* Action Buttons in Hero */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href="#analyze"
            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm transition-all duration-200 shadow-xs flex items-center space-x-2"
          >
            <span>ANALYZE VIDEO</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>

          <a
            href="#architecture"
            className="px-5 py-2.5 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-white/10 font-semibold text-xs sm:text-sm transition-all duration-200 shadow-xs"
          >
            HOW IT WORKS
          </a>
        </div>
      </section>

      {/* Target Stroke Taxonomy Badges */}
      <ShotClassBadges />

      {/* =========================================================================
          ANALYSIS WORKSPACE SECTION (#analyze): Video Player + Prediction Panel
          ========================================================================= */}
      <section id="analyze" className="scroll-mt-20 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border-subtle)] pb-3 gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight">
              VIDEO ANALYSIS STUDIO
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Upload an isolated match stroke clip to activate browser playback and deep temporal sequence classification.
            </p>
          </div>
          <div className="text-xs font-mono text-[var(--text-muted)]">
            HTML5 Native Player • 16 Chronological Frames
          </div>
        </div>

        {/* STATE 1: No Video Selected -> Show Clean Upload Dropzone */}
        {!selectedFile || !videoUrl ? (
          <VideoUploader
            onFileSelected={handleFileSelected}
            errorMessage={errorMessage}
            onDismissError={handleDismissError}
          />
        ) : (
          /* STATE 2, 3, 4, 5: Video Selected / Analyzing / Completed / Error */
          /* Desktop: Side-by-Side (Video Left, AI Prediction Right) | Mobile: Stacked */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (lg:col-span-7): Real HTML5 Video Player */}
            <div className="lg:col-span-7 space-y-4">
              <VideoPlayer
                file={selectedFile}
                videoUrl={videoUrl}
                status={status}
                onClear={handleClearVideo}
                onAnalyze={handleAnalyzeClick}
                onFallbackTranscode={handleFallbackTranscode}
                errorMessage={errorMessage}
              />
            </div>

            {/* Right Column (lg:col-span-5): Prediction Panel or Placeholder Workspace */}
            <div className="lg:col-span-5 space-y-4">
              {status === 'completed' && analysisResult ? (
                <AnalysisPanel
                  analysisResult={analysisResult}
                  status={status}
                />
              ) : (
                <AnalysisPlaceholder
                  status={status}
                  onAnalyze={handleAnalyzeClick}
                />
              )}
            </div>
          </div>
        )}
      </section>

      {/* Sports Analytics Results (KPI Cards + Stepper) */}
      {status === 'completed' && analysisResult && (
        <section id="results" className="scroll-mt-20">
          <ResultsDisplay
            status={status}
            analysisResult={analysisResult}
            errorMessage={errorMessage}
          />
        </section>
      )}

      {/* Technical Architecture Section */}
      <ArchitectureSection />

      {/* Scientific Disclosures & Limitations Section */}
      <LimitationsSection />
    </div>
  );
}
