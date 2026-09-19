'use client';

import React, { useState } from 'react';
import ShotClassBadges from '@/components/ShotClassBadges';
import VideoUploader from '@/components/VideoUploader';
import VideoPreview from '@/components/VideoPreview';
import ResultsDisplay from '@/components/ResultsDisplay';
import { VideoUploadResponse, VideoAnalysisResponse, AnalysisStatus } from '@/types';
import { analyzeVideo } from '@/lib/api';

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<VideoUploadResponse | null>(null);
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResponse | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelected = (file: File | null) => {
    setSelectedFile(file);
    setUploadResult(null);
    setAnalysisResult(null);
    setErrorMessage(null);
    setStatus(file ? 'selected' : 'idle');
  };

  const handleUploadSuccess = (response: VideoUploadResponse) => {
    setUploadResult(response);
    setStatus('uploaded');
    setErrorMessage(null);
  };

  const handleAnalyzeClick = async () => {
    if (!uploadResult?.video_id) {
      setErrorMessage('Please upload a video before analyzing.');
      return;
    }

    setStatus('analyzing');
    setErrorMessage(null);

    try {
      const result = await analyzeVideo(uploadResult.video_id);
      setAnalysisResult(result);
      setStatus('completed');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Video analysis failed. Please try again.';
      setErrorMessage(msg);
      setStatus('error');
    }
  };

  const handleClearVideo = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setAnalysisResult(null);
    setStatus('idle');
    setErrorMessage(null);
  };

  const handleDismissError = () => {
    setErrorMessage(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-3 max-w-3xl mx-auto pt-2 pb-1">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono tracking-wide">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Sports AI & Computer Vision</span>
        </div>
        
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight leading-tight">
          AI-Powered Badminton{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400">
            Shot Recognition
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
          Analyze badminton match video and identify the shot being played using deep learning and temporal video analysis.
        </p>
      </section>

      {/* Target Classes Taxonomy Badges */}
      <section className="pt-1">
        <ShotClassBadges />
      </section>

      {/* Main Upload and Preview Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Upload & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <VideoUploader
            selectedFile={selectedFile}
            onFileSelected={handleFileSelected}
            onUploadSuccess={handleUploadSuccess}
            onAnalyzeClick={handleAnalyzeClick}
            status={status}
            errorMessage={errorMessage}
            onDismissError={handleDismissError}
            videoId={uploadResult?.video_id || null}
          />
        </div>

        {/* Right Column: Video Preview or Interactive State */}
        <div className="lg:col-span-7 space-y-6">
          {selectedFile ? (
            <VideoPreview file={selectedFile} onClear={handleClearVideo} />
          ) : (
            <div className="w-full spark-card border-dashed rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[320px]">
              <div className="w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] mb-4 shadow-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-base font-semibold text-[var(--text-primary)]">
                Video Player Preview
              </h4>
              <p className="text-xs text-[var(--text-secondary)] mt-2 max-w-sm">
                Select or drag and drop a badminton match clip to activate preview playback and verify file details prior to analysis.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      <section className="pt-2">
        <ResultsDisplay
          videoId={uploadResult?.video_id || null}
          uploadedFilename={uploadResult?.filename || null}
          status={status}
          analysisResult={analysisResult}
          errorMessage={errorMessage}
        />
      </section>
    </div>
  );
}
