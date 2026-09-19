'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { uploadVideoFile } from '@/lib/api';
import { VideoUploadResponse } from '@/types';

const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];

interface VideoUploaderProps {
  onFileSelected: (file: File | null) => void;
  onUploadSuccess: (response: VideoUploadResponse) => void;
  selectedFile: File | null;
}

export default function VideoUploader({
  onFileSelected,
  onUploadSuccess,
  selectedFile,
}: VideoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    setUploadStatus(null);

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setErrorMessage(
        `Unsupported format (${ext}). Supported formats: ${ALLOWED_EXTENSIONS.join(', ')}`
      );
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

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select or drop a badminton video first.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setUploadStatus('Uploading video to SPARK backend...');

    try {
      const result = await uploadVideoFile(selectedFile);
      setUploadStatus('Upload complete! Video safely registered.');
      onUploadSuccess(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setErrorMessage(msg);
      setUploadStatus(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full bg-[#0F172A] border border-white/10 rounded-2xl p-6 shadow-xl">
      <h3 className="text-base font-bold text-white tracking-wide mb-1 flex items-center space-x-2">
        <span>Video Upload & Processing</span>
      </h3>
      <p className="text-xs text-slate-400 mb-4">
        Upload a badminton match rally or shot clip. Supported formats: MP4, MOV, AVI, MKV, WEBM.
      </p>

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-emerald-400 bg-emerald-500/10'
            : selectedFile
            ? 'border-emerald-500/50 bg-emerald-950/10'
            : 'border-white/10 hover:border-emerald-500/30 hover:bg-white/[0.02]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp4,.mov,.avi,.mkv,.webm,video/*"
          onChange={handleFileInput}
          className="hidden"
          id="spark-video-file-input"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300">
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              {isDragging
                ? 'Drop the video here'
                : selectedFile
                ? 'Click or drop a different video to replace'
                : 'Drag and drop your badminton video here, or browse'}
            </p>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Maximum upload size: Configurable (Default: 200MB)
            </p>
          </div>
        </div>
      </div>

      {/* Selected File Badge */}
      {selectedFile && (
        <div className="mt-4 p-3 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-mono text-slate-200 truncate">
              {selectedFile.name}
            </span>
            <span className="text-xs text-emerald-400 font-mono">
              ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
            Ready
          </span>
        </div>
      )}

      {/* Upload & Analyze Action Button */}
      <div className="mt-5 flex items-center space-x-4">
        <button
          id="spark-analyze-video-btn"
          onClick={handleUploadAndAnalyze}
          disabled={!selectedFile || isUploading}
          className={`flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg ${
            !selectedFile || isUploading
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20 border border-emerald-400/30'
          }`}
        >
          {isUploading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Uploading & Processing...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Analyze Video</span>
            </>
          )}
        </button>
      </div>

      {/* Status & Alerts */}
      {uploadStatus && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center space-x-2 text-xs text-emerald-300">
          <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-mono">{uploadStatus}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-mono">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-slate-400 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
