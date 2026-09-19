'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { uploadVideoFile } from '@/lib/api';
import { VideoUploadResponse, AnalysisStatus } from '@/types';

const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];

interface VideoUploaderProps {
  selectedFile: File | null;
  onFileSelected: (file: File | null) => void;
  onUploadSuccess: (response: VideoUploadResponse) => void;
  onAnalyzeClick: () => void;
  status: AnalysisStatus;
  errorMessage: string | null;
  onDismissError: () => void;
  videoId: string | null;
}

export default function VideoUploader({
  selectedFile,
  onFileSelected,
  onUploadSuccess,
  onAnalyzeClick,
  status,
  errorMessage,
  onDismissError,
  videoId,
}: VideoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAnalyzing = status === 'analyzing';
  const isUploaded = status === 'uploaded' || status === 'completed';

  const validateAndSetFile = (file: File) => {
    onDismissError();

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      onFileSelected(null);
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

  const handleUploadClick = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    onDismissError();

    try {
      const result = await uploadVideoFile(selectedFile);
      onUploadSuccess(result);
    } catch {
      // Error handled upstream
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full spark-card rounded-2xl p-6">
      <h3 className="text-base font-bold text-[var(--text-primary)] tracking-wide mb-1 flex items-center space-x-2">
        <span>Upload Match Video</span>
      </h3>
      <p className="text-xs text-[var(--text-secondary)] mb-4">
        Supported: MP4, MOV, AVI, MKV, WEBM • Maximum size: 200 MB
      </p>

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-emerald-500 bg-emerald-500/10'
            : selectedFile
            ? 'border-emerald-500/50 bg-emerald-500/5'
            : 'border-[var(--border-subtle)] hover:border-emerald-500/40 hover:bg-[var(--bg-secondary)]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp4,.mov,.avi,.mkv,.webm,video/*"
          onChange={handleFileInput}
          className="hidden"
          id="spark-video-file-input"
          aria-label="Upload match video"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)]">
            <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {isDragging
                ? 'Drop the video here'
                : selectedFile
                ? 'Click or drop a different video to replace'
                : 'Drag & drop your video here, or browse files'}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">
              MP4, MOV, AVI, MKV, WEBM (up to 200 MB)
            </p>
          </div>
        </div>
      </div>

      {/* Selected File Details */}
      {selectedFile && (
        <div className="mt-4 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center space-x-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="text-xs font-mono text-[var(--text-primary)] truncate">
              {selectedFile.name}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono flex-shrink-0">
              ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-mono flex-shrink-0 ml-2">
            {isUploaded ? 'Uploaded' : 'Ready'}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-5 space-y-3">
        {!isUploaded ? (
          /* Step 1: Upload Video Button */
          <button
            id="spark-upload-video-btn"
            onClick={handleUploadClick}
            disabled={!selectedFile || isUploading}
            className={`w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm ${
              !selectedFile || isUploading
                ? 'bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border-subtle)]'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20 border border-emerald-500/30'
            }`}
          >
            {isUploading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Uploading Video...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Upload Video</span>
              </>
            )}
          </button>
        ) : (
          /* Step 2: Analyze Video Button */
          <button
            id="spark-analyze-video-btn"
            onClick={onAnalyzeClick}
            disabled={!videoId || isAnalyzing}
            className={`w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm ${
              !videoId || isAnalyzing
                ? 'bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border-subtle)]'
                : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 text-white shadow-emerald-500/20 border border-emerald-500/30'
            }`}
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Analyzing video...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{status === 'completed' ? 'Re-analyze Video' : 'Analyze Video'}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Upload Success Alert */}
      {isUploaded && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-xs text-emerald-700 dark:text-emerald-300">
          <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-mono font-medium">Video uploaded successfully.</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
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
