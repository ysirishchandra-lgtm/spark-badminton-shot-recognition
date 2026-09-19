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

export interface VideoAnalysisResponse {
  video_id: string;
  status: string;
  predicted_shot: string;
  confidence: number;
  probabilities: {
    SMASH: number;
    CLEAR: number;
    DROP: number;
    DRIVE: number;
    NET_SHOT: number;
  };
  frames_used: number;
  processing_time_ms: number;
  message: string;
}

export type AnalysisStatus = 
  | 'idle'
  | 'selected'
  | 'uploading'
  | 'uploaded'
  | 'analyzing'
  | 'completed'
  | 'error';

export type ShotClass = 'SMASH' | 'CLEAR' | 'DROP' | 'DRIVE' | 'NET SHOT';

export interface ShotInfo {
  name: ShotClass;
  description: string;
  tagColor: string;
}
