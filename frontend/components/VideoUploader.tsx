'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';

const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];

interface VideoUploaderProps {
  onFileSelected: (file: File) => void;
  errorMessage: string | null;
  onDismissError: () => void;
}

export default function VideoUploader({
  onFileSelected,
  errorMessage,
  onDismissError,
}: VideoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    onDismissError();

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      alert(`Invalid format: ${ext}. Supported formats: MP4, MOV, AVI, MKV, WEBM`);
      return;
    }

    onFileSelected(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full spark-card rounded-xl p-6 sm:p-8 text-center transition-all duration-200">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-4 ${
          isDragging
            ? 'border-emerald-500 bg-emerald-500/5'
            : 'border-slate-300 dark:border-white/10 hover:border-emerald-500/50 hover:bg-slate-50/50 dark:hover:bg-white/5'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp4,.mov,.avi,.mkv,.webm,video/*"
          onChange={handleFileInput}
          className="hidden"
          id="spark-video-file-input"
          aria-label="Upload badminton match video"
        />

        <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>

        <div className="space-y-1 max-w-sm">
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            UPLOAD BADMINTON VIDEO
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Drop your badminton match clip here or <span className="text-emerald-600 dark:text-emerald-400 font-semibold underline underline-offset-2">browse files</span>
          </p>
          <p className="text-[11px] text-[var(--text-muted)] font-mono pt-1">
            Supported: MP4, MOV, AVI, MKV, WEBM (H.264 recommended)
          </p>

          <div className="pt-2">
            <button
              type="button"
              id="spark-load-sample-btn"
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  const res = await fetch('/demo_badminton_match16.mp4');
                  const blob = await res.blob();
                  const file = new File([blob], 'demo_badminton_match16.mp4', { type: 'video/mp4' });
                  onFileSelected(file);
                } catch (err) {
                  console.error('Failed to load sample clip', err);
                }
              }}
              className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-500/30 hover:bg-emerald-100 transition-colors"
            >
              <span>⚡ Load Sample Match Clip (H.264)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-mono">{errorMessage}</span>
          </div>
          <button
            onClick={onDismissError}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] ml-2 text-xs"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
