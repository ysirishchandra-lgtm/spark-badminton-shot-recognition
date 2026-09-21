'use client';

import React, { useRef, useState, useEffect } from 'react';
import { AnalysisStatus } from '@/types';

interface VideoPlayerProps {
  file: File;
  videoUrl: string;
  status: AnalysisStatus;
  onClear: () => void;
  onAnalyze?: () => void;
  onFallbackTranscode?: () => Promise<string | null>;
  errorMessage?: string | null;
}

export default function VideoPlayer({
  file,
  videoUrl,
  status,
  onClear,
  onAnalyze,
  onFallbackTranscode,
  errorMessage,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeSrc, setActiveSrc] = useState<string>(videoUrl);
  const [duration, setDuration] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [isTranscoding, setIsTranscoding] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const isAnalyzing = status === 'analyzing';
  const isCompleted = status === 'completed';

  // Sync activeSrc when a new videoUrl is passed from parent
  useEffect(() => {
    setActiveSrc(videoUrl);
    setPlaybackError(null);
    setIsTranscoding(false);
    setIsReady(false);
  }, [videoUrl]);

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Format seconds to mm:ss
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleLoadedMetadata = () => {
    setPlaybackError(null);
    setIsReady(true);
    if (videoRef.current) {
      const vid = videoRef.current;
      if (!isNaN(vid.duration) && vid.duration > 0) {
        setDuration(formatTime(vid.duration));
      }
      if (vid.videoWidth > 0 && vid.videoHeight > 0) {
        setDimensions({ width: vid.videoWidth, height: vid.videoHeight });
      }
    }
  };

  const handleCanPlay = () => {
    setPlaybackError(null);
    setIsReady(true);
  };

  const handleError = async () => {
    if (!videoRef.current) return;
    const mediaErr = videoRef.current.error;

    // Check if error is MEDIA_ERR_SRC_NOT_SUPPORTED (code 4)
    if (mediaErr && mediaErr.code === 4 && onFallbackTranscode && !isTranscoding) {
      // Attempt automatic transcoding fallback
      setIsTranscoding(true);
      setPlaybackError(null);
      try {
        const streamUrl = await onFallbackTranscode();
        if (streamUrl) {
          setActiveSrc(streamUrl);
          setIsTranscoding(false);
          return;
        }
      } catch (err) {
        console.warn('Transcode fallback failed:', err);
      }
      setIsTranscoding(false);
      setPlaybackError(
        'This MP4 uses a video codec that this browser cannot play directly. The video was accepted for AI analysis, but browser preview is unavailable.'
      );
    } else if (mediaErr && mediaErr.code === 3) {
      setPlaybackError('Decoding error during video playback.');
    } else {
      setPlaybackError(
        'This MP4 uses a video codec that this browser cannot play directly. The video was accepted for AI analysis, but browser preview is unavailable.'
      );
    }
  };

  return (
    <div className="w-full spark-card rounded-xl p-4 sm:p-5 transition-all duration-200">
      {/* Header Info Bar */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-[var(--border-subtle)] gap-2">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] truncate max-w-xs sm:max-w-md" title={file.name}>
              {file.name}
            </h4>
            <div className="flex items-center space-x-2 text-[11px] font-mono text-[var(--text-muted)]">
              <span>{formatSize(file.size)}</span>
              {duration && <span>• {duration}</span>}
              {dimensions && <span>• {dimensions.width}×{dimensions.height}</span>}
              {isReady && !playbackError && (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">• READY TO PLAY</span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onClear}
          className="text-xs text-[var(--text-secondary)] hover:text-rose-600 dark:hover:text-rose-400 px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] hover:border-rose-500/30 transition-colors font-medium ml-auto"
        >
          Change Video
        </button>
      </div>

      {/* HTML5 Video Container */}
      <div className="video-container relative w-full aspect-video overflow-hidden rounded-lg bg-black border border-[var(--border-subtle)] shadow-inner flex items-center justify-center">
        <video
          id="spark-html5-video"
          ref={videoRef}
          src={activeSrc}
          controls
          playsInline
          preload="metadata"
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={handleCanPlay}
          onError={handleError}
          className="w-full h-full object-contain"
        >
          Your browser does not support HTML5 video playback.
        </video>

        {/* Transcoding Fallback Overlay */}
        {isTranscoding && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2 pointer-events-none z-20">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-400">
              PREPARING VIDEO FOR PLAYBACK...
            </span>
            <span className="text-[10px] text-zinc-300 font-mono">
              Converting MP4 stream to browser-compatible H.264
            </span>
          </div>
        )}

        {/* Analyzing Overlay */}
        {isAnalyzing && !isTranscoding && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2 pointer-events-none z-20">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-400">
              ANALYZING VIDEO...
            </span>
            <span className="text-[10px] text-zinc-300 font-mono">
              Sampling 16 frames • Spatial ResNet-18 • Transformer-LSTM
            </span>
          </div>
        )}
      </div>

      {/* Playback Error Alert (Clean Fallback Message) */}
      {playbackError && !isTranscoding && (
        <div className="mt-3 p-3 rounded-lg bg-slate-100 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 flex items-start space-x-2 text-xs text-slate-700 dark:text-zinc-300">
          <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="space-y-0.5">
            <span className="font-semibold block">{playbackError}</span>
            <span className="text-[11px] text-[var(--text-muted)] block">
              AI analysis remains fully available: click &quot;Analyze Video&quot; to run the model.
            </span>
          </div>
        </div>
      )}

      {/* Actions Toolbar */}
      {onAnalyze && (
        <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
          <span className="text-xs font-mono text-[var(--text-muted)]">
            {isCompleted ? 'Video ready for re-analysis' : 'Ready for stroke classification'}
          </span>

          <button
            id="spark-player-analyze-btn"
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all duration-200 flex items-center space-x-1.5 shadow-xs ${
              isAnalyzing
                ? 'bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border-subtle)]'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20 border border-emerald-500/30'
            }`}
          >
            {isAnalyzing ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{isCompleted ? 'Re-analyze Video' : 'Analyze Video'}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
