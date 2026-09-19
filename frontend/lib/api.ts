/**
 * SPARK Backend API Client.
 * Communicates with FastAPI backend using configurable NEXT_PUBLIC_API_URL.
 */

import { VideoUploadResponse, BackendHealthResponse, VideoAnalysisResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Checks backend health status.
 */
export async function checkBackendHealth(): Promise<BackendHealthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Health check failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unable to connect to backend';
    throw new Error(message);
  }
}

/**
 * Uploads a video file to POST /api/video/upload.
 */
export async function uploadVideoFile(file: File): Promise<VideoUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/api/video/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = `Upload failed with status code ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson?.detail) {
          errorMessage = typeof errorJson.detail === 'string' 
            ? errorJson.detail 
            : JSON.stringify(errorJson.detail);
        }
      } catch {
        // Use default message
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error during upload';
    throw new Error(message);
  }
}

/**
 * Sends a video_id to POST /api/video/analyze to run inference.
 */
export async function analyzeVideo(videoId: string): Promise<VideoAnalysisResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/video/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ video_id: videoId }),
    });

    if (!response.ok) {
      let errorMessage = `Video analysis failed with status code ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson?.detail) {
          errorMessage = typeof errorJson.detail === 'string'
            ? errorJson.detail
            : JSON.stringify(errorJson.detail);
        }
      } catch {
        // Fallback to default message
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unable to connect to the SPARK analysis server';
    throw new Error(message);
  }
}
