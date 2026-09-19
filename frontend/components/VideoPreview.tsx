'use client';

import React, { useEffect, useState } from 'react';

interface VideoPreviewProps {
  file: File | null;
  onClear: () => void;
}

export default function VideoPreview({ file, onClear }: VideoPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
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

  return (
    <div className="w-full bg-[#0F172A] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
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
            <h4 className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
              {file.name}
            </h4>
            <p className="text-xs text-slate-400 font-mono">
              Size: <span className="text-emerald-400">{formatSize(file.size)}</span> • Type: {file.type || 'video'}
            </p>
          </div>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-slate-400 hover:text-rose-400 px-3 py-1.5 rounded-lg border border-white/10 hover:border-rose-500/30 transition-colors"
        >
          Change Video
        </button>
      </div>

      <div className="relative rounded-xl overflow-hidden bg-black/60 border border-white/5 aspect-video flex items-center justify-center">
        <video
          src={previewUrl}
          controls
          className="w-full h-full max-h-[360px] object-contain rounded-xl"
          preload="metadata"
        >
          Your browser does not support the video preview tag.
        </video>
      </div>
    </div>
  );
}
