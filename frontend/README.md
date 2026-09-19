# SPARK Frontend Application

Next.js + React + TypeScript web application for **SPARK Badminton Shot Recognition**.

## Overview
Provides a sports-tech user interface for badminton video ingestion, interactive video preview, upload validation, and recognition status tracking.

## Tech Stack
- **Framework**: Next.js (App Router)
- **UI & Logic**: React 19, TypeScript
- **Styling**: Tailwind CSS & Modern Custom CSS variables
- **Icons & Graphics**: Inline SVG badminton and analytics iconography

## Project Structure
```
frontend/
├── app/
│   ├── globals.css         # Dark sports-tech theme & court pattern
│   ├── layout.tsx          # Root layout and metadata
│   └── page.tsx            # Main landing and video analysis page
├── components/
│   ├── Header.tsx          # Branding & live FastAPI health badge
│   ├── ShotClassBadges.tsx # 5 badminton shot target classes
│   ├── VideoUploader.tsx   # Drag-and-drop & file picker
│   ├── VideoPreview.tsx    # HTML5 video playback & metadata
│   └── ResultsDisplay.tsx  # Authentic prediction placeholder UI
├── lib/
│   └── api.ts              # API client for health and upload
├── types/
│   └── index.ts            # TypeScript interfaces
├── .env.example            # Environment variable template
├── package.json
└── tsconfig.json
```

## Setup & Running

1. **Install Dependencies** (if not already installed):
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Ensure `NEXT_PUBLIC_API_URL` points to your running FastAPI backend (default: `http://localhost:8000`).

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.
