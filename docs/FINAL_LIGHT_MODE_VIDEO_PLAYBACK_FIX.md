# SPARK Final Light Mode & Video Playback Fix Report

**Date:** September 21, 2026  
**Status:** COMPLETED & VERIFIED  
**Repository:** `d:\PS_DATA\SPARK`  

---

## 1. ROOT CAUSE ANALYSIS

### A. Video Playback Root Causes:
1. **Fleeting Child-Component Object URL Lifecycle:**
   Previously, `URL.createObjectURL(file)` was generated in an inner child component's `useEffect` hook. Whenever parent state shifted (`status`, re-renders during upload/analyze), the child re-mounted or cleaned up, immediately calling `URL.revokeObjectURL(url)` before the browser's media pipeline could finish decoding or seeking the video frames.
2. **Missing Native Video Attributes:**
   The HTML5 `<video>` element was missing `playsInline`, had restrictive CSS constraints (`max-h-[360px]` instead of a true 16:9 container), lacked explicit `onLoadedMetadata`, `onCanPlay`, `onPlay`, and `onPause` listeners, and did not handle codec error diagnostics.
3. **Codec Incompatibility (FMP4 vs H.264):**
   Certain test clips from legacy datasets were encoded in ISO MPEG-4 Part 2 (`FMP4` / `mp4v`), which Chromium browsers deliberately do not support in native HTML5 `<video>` elements. In contrast, standard H.264 (`avc1`) plays natively without issues.
4. **Disconnected UI Layout:**
   The video player was located far away from the prediction display, disappearing or shifting below the fold instead of presenting a unified sports analytics dashboard.

### B. Light Mode Root Causes:
1. **Murky Arena Image Bleed:**
   The dark indoor stadium photo was rendering in light mode at `brightness-[0.75]`, bleeding through a semi-transparent white wash and producing a noisy, unpolished look rather than a crisp sports analytics laboratory aesthetic.
2. **Inconsistent Typography & Card Colors:**
   Generic SaaS borders and overly colorful badges lacked the refined, Apple-level sports performance technology feel.

---

## 2. VIDEO PLAYBACK FIX

1. **Dedicated Top-Level Object URL State:**
   - Hoisted `selectedFile` and `videoUrl` into `app/page.tsx`.
   - When a new file is chosen, any previous `videoUrl` is revoked: `URL.revokeObjectURL(videoUrl)`.
   - A fresh URL is generated: `const newUrl = URL.createObjectURL(file); setVideoUrl(newUrl);`.
   - Unmounting triggers automatic cleanup.
2. **Native HTML5 Video Player (`VideoPlayer.tsx`):**
   - Implemented `<video id="spark-html5-video" ref={videoRef} src={videoUrl} controls playsInline preload="metadata" className="w-full h-full object-contain" />`.
   - Container uses a responsive `aspect-video` (16:9) ratio with a dark cinematic backing.
   - Built-in metadata readers for file size, resolution, and duration.
   - Non-blocking "ANALYZING VIDEO..." overlay during inference.
   - Quick one-click "⚡ Load Sample Match Clip (H.264)" button added to allow instant verification of standard broadcast H.264 playback.
3. **Decoupled Workflow:**
   - Video is 100% playable immediately upon selection, completely independent of backend inference.

---

## 3. LIGHT MODE REDESIGN

1. **Light Sports-Tech Court Geometry (`BadmintonCourtBackground.tsx`):**
   - Dark mode photo background is strictly isolated to dark mode (`hidden dark:block`).
   - In light mode (`block dark:hidden`), a dedicated BWF court geometry SVG is rendered on a soft-white `#F8FAFA` canvas:
     - 5-6% opacity crisp court boundary lines (doubles/singles sidelines, short service line, centre line).
     - Subtle net line with center court coordinates.
     - Very faint trajectory arc and micro-grid pattern.
     - Never competes with content.
2. **Refined Light Mode Color System (`globals.css`):**
   - Canvas: `#F8FAFA` (soft cool-white).
   - Surfaces/Cards: `#FFFFFF` with `#E2E8F0` subtle cool-gray borders and soft Apple-style shadows (`0 1px 3px 0 rgba(0, 0, 0, 0.04)`).
   - Typography: Deep graphite headings (`#0F172A`), slate secondary text (`#475569`).
   - Accents: Professional badminton performance emerald (`#059669`).
3. **Clean Sports-Tech Hero:**
   - Hierarchy: SPARK badge, `AI-POWERED BADMINTON SHOT RECOGNITION`, clear subtitle, `ANALYZE VIDEO` and `HOW IT WORKS` action buttons, and benchmark pill (`77.55% Acc • 69.35% F1`).
4. **Desktop Side-by-Side Analysis Workspace:**
   - Left column: Real HTML5 Video Player (16:9) with playback controls.
   - Right column: AI Analysis Panel with predicted shot, confidence, and 5-class calibrated probability bars.
   - Stacked below: 4 Sports Analytics KPI Cards (Tactical Phase, Trajectory Dynamics, Threat Index, Counter-Tactic Advice) and 5-Stage Stepper.

---

## 4. DARK MODE PRESERVATION

- **Dark Mode Status:** APPROVED & 100% PRESERVED.
- **Dark Theme Tokens:** All dark variables in `globals.css` (`#080c14`, `#0f172a`, `#10b981`, etc.) and dark classes across all components remain completely identical.
- **Dark Mode Regression:** NONE.

---

## 5. VERIFICATION CHECKLIST

- **Video Element:** PASS (`<video id="spark-html5-video">` with `controls`, `playsInline`, `preload="metadata"`)
- **Video Metadata:** PASS (Duration and dimensions parsed on `onLoadedMetadata`)
- **Video Playback:** PASS (`video.play()` starts playback, `currentTime > 0`)
- **Video Pause:** PASS (`video.pause()` stops playback, `video.paused === true`)
- **Video Seeking:** PASS (Seeking to arbitrary timestamp updates `currentTime`)
- **Video Fullscreen:** PASS (Native HTML5 fullscreen enabled)
- **Video Preview Independent of Backend:** PASS (Preview works immediately on local file select)
- **Backend Inference:** PASS (`POST /api/video/upload` and `POST /api/video/analyze`)
- **Frontend Build:** PASS (`npm run build` compiled with Next.js Turbopack, 0 TypeScript errors)
- **Pytest Suite:** PASS (19 of 19 tests passed)
- **Model:** EXP_DRIVE_11 Baseline (Visual ResNet-18 + Transformer-LSTM)
- **Model Modified:** NO
- **Official Test Accessed:** NO
