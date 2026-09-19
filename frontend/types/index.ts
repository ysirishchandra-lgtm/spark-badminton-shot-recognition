/**
 * TypeScript interface definitions for SPARK Badminton Shot Recognition.
 */

export interface VideoUploadResponse {
  video_id: string;
  filename: string;
  status: string;
  size_bytes?: number;
  message?: string;
}

export interface BackendHealthResponse {
  status: string;
  project: string;
  service: string;
}

export interface AnalysisPlaceholderState {
  videoId: string | null;
  predictedShot: string | null;
  confidence: number | null;
  processingTimeSec: number | null;
  status: 'idle' | 'uploaded' | 'pending_ml_integration' | 'error';
}

export type ShotClass = 'SMASH' | 'CLEAR' | 'DROP' | 'DRIVE' | 'NET SHOT';

export interface ShotInfo {
  name: ShotClass;
  description: string;
  tagColor: string;
}
