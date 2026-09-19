'use client';

import React, { useEffect, useState, useRef } from 'react';

interface VideoPreviewProps {
  file: File | null;
  onClear: () => void;
}

export default function VideoPreview({ file, onClear }: VideoPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      setDuration(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  if (!file || !previewUrl) {
    return null;
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && !isNaN(videoRef.current.duration)) {
      const durSec = Math.round(videoRef.current.duration);
      const mins = Math.floor(durSec / 60);
      const secs = durSec % 60;
      setDuration(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
    }
  };

  return (
    <div className="w-full spark-card rounded-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate max-w-xs sm:max-w-md">
              {file.name}
            </h4>
            <p className="text-xs text-[var(--text-muted)] font-mono">
              Size: <span className="text-emerald-600 dark:text-emerald-400">{formatSize(file.size)}</span>
              {duration && <span> • Duration: {duration}</span>}
              <span> • Type: {file.type || 'video'}</span>
            </p>
          </div>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-[var(--text-secondary)] hover:text-rose-600 dark:hover:text-rose-400 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] hover:border-rose-500/30 transition-colors"
        >
          Change Video
        </button>
      </div>

      <div className="relative rounded-xl overflow-hidden bg-black/90 border border-[var(--border-subtle)] aspect-video flex items-center justify-center">
        <video
          ref={videoRef}
          src={previewUrl}
          controls
          onLoadedMetadata={handleLoadedMetadata}
          className="w-full h-full max-h-[360px] object-contain rounded-xl"
          preload="metadata"
        >
          Your browser does not support the video preview tag.
        </video>
      </div>
    </div>
  );
}
