# SPARK Final Pre-Deployment Verification Report

**Audit Date:** September 21, 2026  
**Auditor Role:** Senior Production QA Engineer & ML Deployment Engineer  
**Project Path:** `D:\PS_DATA\SPARK`  
**Repository:** `https://github.com/ysirishchandra-lgtm/spark-badminton-shot-recognition`  

---

## 1. PROJECT
- **Project Name:** SPARK — AI-Powered Badminton Shot Recognition
- **Frontend Stack:** Next.js 16 (Turbopack), React 19, TypeScript, Tailwind CSS
- **Backend Stack:** FastAPI, Uvicorn, PyTorch, OpenCV, Pydantic

---

## 2. MODEL
- **Target Production Model:** EXP_DRIVE_11
- **Checkpoint Inspected:** `D:\PS_DATA\DRIVE_EXPERIMENTS\EXP_DRIVE_11_PROTECTED_DRIVE_GATE\03_CHECKPOINTS\EXP_DRIVE_11_best_checkpoint.pt`
- **Observed Checkpoint SHA256:** `9ef77e6bdba535a20e330b2e41a502d37ea58fa7a75d2ec0f9af69519fe5924a`
- **Prompt Expected SHA256:** `0b296996d8cd7a63a5449a0a6fb21d4e84817be0bed3aeb1b837da4dfc75f164`
- **Checksum Verification Result:** **FAIL (MISMATCH)**
- **Forensic Diagnosis:** The expected hash `0b296996...` is the exact checksum of upstream base model `EXP_DRIVE_08B_best_checkpoint.pt`. `EXP_DRIVE_11_best_checkpoint.pt` is a decision-gate model requiring 28-D auxiliary tracking features, whereas the deployed service processes raw video frames. In accordance with the protocol rule (*"If checksum fails: STOP"*), deployment must not proceed until this checkpoint specification is resolved.
- **Validation Metrics (Reference Only):** Accuracy: 77.55% | Macro F1: 69.35% | Weighted F1: 77.63% (Empirical frozen validation split; official test set permanently isolated).

---

## 3. FRONTEND
- **Build:** PASS (`npm run build` compiled cleanly via Turbopack with zero errors)
- **Dark Mode:** PASS (Approved high-contrast dark arena theme with clear readability and no unreadable cards)
- **Light Mode:** PASS (Approved sports-tech soft-white `#F8FAFA` theme with faint BWF court geometry and deep graphite `#0F172A` text)
- **Theme Persistence:** PASS (Immediate theme application via inline anti-flash script; localStorage persistence verified across reloads)
- **Responsive Design:** PASS (Verified across 1920×1080, 1440×900, 1366×768, 1024×768, 768×1024, and 390×844 mobile viewports with no horizontal overflow)

---

## 4. VIDEO PLAYBACK
- **MP4 Upload:** PASS (Validated format, size limit enforcement up to 200MB, drag-and-drop support)
- **Video Preview:** PASS (Immediate client-side object URL rendering without waiting for backend inference)
- **Metadata Loading:** PASS (Duration, dimensions `videoWidth > 0`, `videoHeight > 0` parsed on `onLoadedMetadata`)
- **Playback:** PASS (`video.play()` advances `currentTime > 0`)
- **Pause:** PASS (`video.pause()` stops playback cleanly)
- **Seek:** PASS (Scrubbing and timestamp seeking verified)
- **Fullscreen:** PASS (Native HTML5 fullscreen capability enabled)
- **Universal MP4 Transcode Fallback:** PASS (Non-browser-native codecs like FMP4 automatically convert via Windows Media Foundation MSMF H.264 streaming)

---

## 5. BACKEND
- **Health Endpoint (`GET /health`):** PASS (HTTP 200 `{"status":"ok","project":"SPARK","service":"badminton-shot-recognition-api"}`)
- **API Endpoints:** PASS (`POST /upload`, `POST /analyze`, `GET /stream/{video_id}`, `POST /transcode/{video_id}`)
- **Model Loading:** PASS (ResNet-18 frozen backbone + Transformer-LSTM sequence classifier load in memory)
- **Inference Pipeline:** PASS (16-frame uniform sampling, bilinear 224×224 resize, ImageNet normalization, feature extraction, temporal classification, softmax)

---

## 6. TESTS
- **Backend Test Suite:** **22 / 22 PASS** (All unit, service, API, transcode, and E2E integration tests passing)
- **Frontend Build:** **PASS** (Zero TypeScript or Next.js errors)
- **Browser E2E:** **PASS** (Full user flow from landing, file selection, playback, inference, and theme switching verified)
- **Inference Smoke Test:** **PASS**
  - Sample video: `demo_badminton_match16.mp4`
  - Prediction: `NET_SHOT`
  - Confidence: `92.26%`
  - Softmax probabilities: SMASH: 1.59%, CLEAR: 0.58%, DROP: 0.59%, DRIVE: 4.97%, NET_SHOT: 92.26% (Sum: 0.9999, no NaN/Inf)

---

## 7. SECURITY & PROTECTION
- **Secrets Exposed:** **NO** (Zero API keys, JWT secrets, or cloud credentials committed)
- **Git Safety:** **PASS** (Working tree clean, `.gitignore` excludes video binaries, `.pt` checkpoints, and `.env`)
- **Official Test Set Access:** **NO** (`MATCH09, MATCH13, MATCH20, MATCH34, MATCH39, MATCH41, MATCH43` strictly untouched)
- **Model Modified:** **NO** (Zero weight modifications or retraining)
- **Research Experiments Modified:** **NO** (All research directories frozen)

---

## 8. ISSUES LOG

| ID | Issue Description | Severity | Status | Action Taken / Recommendation |
|:---:|:---|:---:|:---:|:---|
| **ISS-01** | `EXP_DRIVE_11_best_checkpoint.pt` SHA256 mismatch against prompt specification (`9ef77e6b...` vs `0b296996...`). | **CRITICAL** | **OPEN** | **BLOCKED PER PROTOCOL**: `0b296996...` is the hash of `EXP_DRIVE_08B_best_checkpoint.pt`. `EXP_DRIVE_11` checkpoint was preserved without unauthorized modifications. Awaiting user resolution. |
| **ISS-02** | Legacy test clips in dataset encoded in ISO MPEG-4 Part 2 (`FMP4`) unsupported natively by Chromium. | **HIGH** | **FIXED** | Implemented automatic two-tier fallback: native H.264 plays directly; unsupported codecs automatically transcode to H.264 via MSMF stream endpoint. |
| **ISS-03** | Light mode background image bleed causing visual noise. | **MEDIUM** | **FIXED** | Isolated arena photo to dark mode; rendered clean, subtle BWF court geometry SVG on soft-white `#F8FAFA` in light mode. |

---

## 9. FINAL STATUS

### **BLOCKED — FIX REQUIRED**

**Exact Blocking Issue:**
Per protocol Step 11 (*"Verify SHA256: 0b296996d8cd7a63a5449a0a6fb21d4e84817be0bed3aeb1b837da4dfc75f164. If checksum fails: STOP"*), the actual SHA256 of `EXP_DRIVE_11_best_checkpoint.pt` is `9ef77e6bdba535a20e330b2e41a502d37ea58fa7a75d2ec0f9af69519fe5924a`. The expected hash `0b296996...` belongs to `EXP_DRIVE_08B_best_checkpoint.pt`. Deployment is halted until the project researcher approves this checkpoint attribution.
