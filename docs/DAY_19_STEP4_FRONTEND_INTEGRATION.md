# Day 19 Step 4 — Frontend Inference Integration
## Interactive Real Video Upload and EXP23_C Model Inference User Interface

**Project**: SPARK — AI-Powered Badminton Shot Recognition  
**Phase**: Day 19 — Step 4 (Frontend Inference Integration)  
**Date**: 19 September 2026  
**Implementation**: Next.js 16 (App Router), TypeScript, Tailwind CSS, FastAPI Backend Integration  

---

## Objective

The objective of Step 4 is to connect the SPARK web frontend to the verified backend video inference pipeline (`POST /api/video/analyze`), replacing static placeholders with real predictions, confidence scores, and five-class probability distributions produced by the **EXP23_C Transformer+LSTM temporal model**.

---

## API Integration

The frontend client in `frontend/lib/api.ts` connects directly to the FastAPI service via `analyzeVideo(videoId: string)`:

- **Endpoint**: `POST /api/video/analyze`
- **Payload**:
  ```json
  {
    "video_id": "7b8b56e5-d085-499e-a10b-483ea4082191"
  }
  ```
- **Response Format**:
  ```json
  {
    "video_id": "7b8b56e5-d085-499e-a10b-483ea4082191",
    "status": "completed",
    "predicted_shot": "SMASH",
    "confidence": 0.9726,
    "probabilities": {
      "SMASH": 0.9726,
      "CLEAR": 0.0090,
      "DROP": 0.0181,
      "DRIVE": 0.0003,
      "NET_SHOT": 0.0001
    },
    "frames_used": 16,
    "processing_time_ms": 4166.09,
    "message": "Video analysis completed successfully."
  }
  ```
- **Security & Reliability**: The client sends only the sanitized `video_id` returned from upload, never arbitrary filesystem paths. It parses structured backend error details and provides fallback notifications.

---

## Upload → Analyze Flow

The user journey transitions through distinct stages without requiring redundant video uploads:

```
[1] Select Video File (.mp4, .mov, etc.)
       │
       ▼
[2] Client Video Player Preview (Playback & duration verification)
       │
       ▼
[3] Click "Upload Video" (POST /api/video/upload)
       │
       ▼
[4] "Video uploaded successfully." → Activates [ Analyze Video ] Button
       │
       ▼
[5] Click "Analyze Video" (POST /api/video/analyze)
       │
       ▼
[6] Backend Pipeline (OpenCV decode → 16-frame sample → ResNet-18 → EXP23_C)
       │
       ▼
[7] Dynamic Results Display (Prediction banner, 4 metrics, 5 probability bars)
```

---

## Frontend State Machine

State management in `frontend/app/page.tsx` is driven by an explicit `AnalysisStatus` union type:

| State | UI View | Available Actions |
|---|---|---|
| `idle` | Initial dropzone, placeholder metrics (`—`) | Drag & drop or browse files |
| `selected` | Video preview active, file details displayed | Click "Upload Video" or clear file |
| `uploading` | Spinner on upload button (`"Uploading Video..."`) | Disabled to prevent duplicate submissions |
| `uploaded` | Green success alert (`"Video uploaded successfully."`) | Click **"Analyze Video"** |
| `analyzing` | Dedicated loading banner, animated spinner | Disabled to prevent concurrent requests |
| `completed` | Prominent prediction banner, 4 metrics, 5 probability bars | Click "Re-analyze Video" or upload new video |
| `error` | Dismissible alert with safe error description | Click "Retry" or replace file |

---

## Results Display

The `ResultsDisplay` component renders authentic model metrics only after receiving a completed API response:

1. **Prominent Predicted Shot Banner**:
   - Class name rendered in bold, extra-large typography.
   - Confidence percentage formatted as `(confidence * 100).toFixed(2)%`.
   - Subtle badge indicating the 16-frame temporal sequence window and processing latency.
2. **Four Metrics Cards**:
   - **Predicted Shot**: Exact predicted category (e.g. `SMASH`).
   - **Confidence**: Model softmax probability (e.g. `97.26%`).
   - **Processing Time**: Exact measured CPU execution time (e.g. `4166.09 ms`).
   - **Video ID / Frames**: Server identifier and frame count (`16`).

---

## Probability Visualization

All five project classes are displayed in strict canonical order:

1. **SMASH**
2. **CLEAR**
3. **DROP**
4. **DRIVE**
5. **NET SHOT** (mapped from `NET_SHOT` schema key)

### Visualization Features:
- Each row contains the class name, an animated horizontal progress bar matching the exact probability percentage, and the formatted numeric value (e.g. `97.26%`, `1.81%`, `0.90%`).
- The predicted class bar is prominently highlighted with an emerald gradient and a `"Selected"` tag.
- All numbers originate directly from the API response object; zero values are hardcoded.

---

## Loading and Error States

- **Loading State**: An animated processing banner displays:
  `"Analyzing video with the SPARK recognition model..."`
  `"Sampling 16 chronological frames → Frozen ResNet-18 spatial extraction → Transformer+LSTM sequence classification"`
- **Error Handling**: Displays safe user-facing error messages (e.g. network disconnects, unreadable formats, or videos with fewer than 16 frames) with a clear dismiss button. Zero internal server paths, stack traces, or model file locations are exposed.

---

## Theme Compatibility

The user interface seamlessly supports both Dark Mode and Light Mode:
- Theme preferences persist in local storage via the `theme` cookie/storage key.
- Anti-flash script in `layout.tsx` prevents theme flashing on initial page load.
- Tested and verified in browser subagent in both Light and Dark color schemes.

---

## E2E Verification & Smoke Test

An automated end-to-end user verification was executed via the browser subagent:

1. **Test Environment**: Next.js on port 3000, FastAPI on port 8000.
2. **Uploaded Demonstration Clip**: `2022-08-30_18-00-09_dataset_set1_001_000952_000988_A_12.mp4` (from external `videobadminton_pilot`).
3. **Execution Steps**:
   - File dropped into file input.
   - Video player loaded and played preview.
   - Clicked "Upload Video" $\to$ Uploaded in <1s (`201 Created`).
   - Clicked "Analyze Video" $\to$ Executed ResNet-18 and EXP23_C on CPU.
   - Results displayed on UI in **4,166.09 ms**.
4. **Displayed Results**:
   - **Predicted Shot**: `SMASH`
   - **Confidence**: `97.26%`
   - **Processing Time**: `4166.09 ms`
   - **Frames Used**: `16`
   - **Probabilities**:
     - `SMASH`: `97.26%`
     - `CLEAR`: `0.90%`
     - `DROP`: `1.81%`
     - `DRIVE`: `0.03%`
     - `NET SHOT`: `0.01%`
5. **Artifacts Saved**:
   - Browser Recording: `frontend_inference_e2e_1789812587712.webp`
   - UI Screenshot: `analysis_results_1789812969377.png`

*Label: Deployment smoke test — NOT an accuracy evaluation.*

---

## Safety Verification

```
OFFICIAL_TEST_ACCESS: ZERO
OFFICIAL_TEST_EVALUATION: ZERO
CHECKPOINT_MODIFIED: ZERO
RESEARCH_FILES_MODIFIED: ZERO
DATASETS_MODIFIED: ZERO
SYNTHETIC_COORDINATES_USED: ZERO
EXP24_ATTEMPTED: ZERO
HITHEATMAP_STARTED: ZERO
MODEL_WEIGHTS_IN_GIT: ZERO
LARGE_VIDEOS_IN_GIT: ZERO
HARDCODED_PREDICTION_NUMBERS: ZERO
```

---

## Known Limitations

> [!IMPORTANT]
> 1. **Results are Real Model Outputs**: All values shown on the UI reflect the mathematical output of ResNet-18 + EXP23_C. No values are fabricated or altered.
> 2. **Smoke Testing is NOT Accuracy Evaluation**: Running inference on sample clips demonstrates mechanical pipeline operation, not benchmark test accuracy.
> 3. **Fixed 16-Frame Temporal Sampling**: The pipeline samples 16 chronological frames across the video. It assumes the clip is a single stroke or rally sequence.
> 4. **Multi-Rally Videos**: An unsegmented full match video contains hundreds of shots. Uniform sampling across a full match will not automatically segment individual strokes.
> 5. **No Shuttle / Contact Localization**: Court coordinates and hit coordinates are not inferred by this visual-only model.
> 6. **No Multi-Person Tracking**: Player bounding boxes and person selection are outside the scope of this visual sequence architecture.
