# Day 19 Step 3B — Backend Inference Integration
## Real Video → ResNet-18 → EXP23_C Temporal Model Backend Service Pipeline

**Project**: SPARK — AI-Powered Badminton Shot Recognition  
**Phase**: Day 19 — Step 3B (Backend Inference Integration)  
**Date**: 19 September 2026  
**Implementation**: FastAPI Backend, Torchvision ResNet-18, EXP23_C Transformer-LSTM Classifier  

---

## Objective

The objective of Step 3B is to connect the verified **EXP23_C visual-only temporal model** to the SPARK backend, establishing an end-to-end, fully functional inference pipeline from raw uploaded video files to structured 5-class JSON API predictions without modifying frontend code or compromising research artifacts.

---

## Inference Architecture

The end-to-end inference flow follows a strictly sequential, non-blocking pipeline on CPU:

```
Uploaded Video File (.mp4, .mov, etc.)
  │
  ▼
[1] OpenCV VideoCapture (Frame Decoding)
  │
  ▼
[2] Uniform Temporal Sampling (16 Chronological Frames)
  │
  ▼
[3] Frame Normalization (RGB, 224x224, ImageNet Mean/Std) → Tensor [16, 3, 224, 224]
  │
  ▼
[4] Frozen ResNet-18 Spatial Backbone (Truncated at fc = Identity) → Tensor [16, 512]
  │
  ▼
[5] Sequence Reshaping (unsqueeze(0)) → Tensor [1, 16, 512]
  │
  ▼
[6] BadmintonTransformerLSTMClassifier (EXP23_C weights) → Logits [1, 5]
  │
  ▼
[7] Softmax Normalization → Class Probabilities (sum = 1.0)
  │
  ▼
[8] Pydantic Response Serialization (JSON HTTP 200)
```

---

## Model Loading

- **Singleton Pattern**: Managed via `InferenceManager.get_instance()`.
- **Lifecycle**: Models are initialized once on first call or startup and cached in memory to prevent expensive repeated disk I/O.
- **Components Loaded**:
  1. **ResNet-18**: Standard Torchvision backbone loaded from local cache (`C:\Users\user\.cache\torch\hub\checkpoints\resnet18-f37072fd.pth`), truncated with `resnet.fc = nn.Identity()`, and placed in `eval()` mode with `requires_grad = False`.
  2. **BadmintonTransformerLSTMClassifier**: Verified EXP23_C architecture loaded from `D:\PS_DATA\PHASE_23_COMBINED_AUGMENTATION\02_TRAINING\models.py` with checkpoint `EXP_23_C_best_model.pt` (330,885 parameters), placed in `eval()` mode with `requires_grad = False`.
- **Device**: Strictly CPU (`map_location="cpu"`).

---

## Video Decoding

- **Decoder**: OpenCV `cv2.VideoCapture`.
- **Validation**:
  - Validates that the file exists and can be opened.
  - Decodes all frames into an in-memory sequential buffer.
  - Rejects corrupted or non-video files with an explicit `ValueError`.

---

## Temporal Sampling

- **Strategy**: Uniform chronological sampling across the entire decoded video duration:
  $$\text{indices} = \text{round}\left(\text{linspace}(0, N - 1, 16)\right)$$
- **Minimum Requirement**: Videos must contain at least 16 decodable frames ($N \ge 16$).
- **Rejection Policy**: If $N < 16$, the request is rejected with HTTP 400 (`"Video contains only N decodable frames. A minimum of 16 frames is required."`).
- **Scope Note**: Fixed 16-frame sampling covers the temporal span of short clips; it does not perform automated rally stroke segmentation.

---

## Frame Preprocessing

Each of the 16 selected frames undergoes standard computer vision preprocessing:
1. Color conversion: `cv2.COLOR_BGR2RGB`.
2. Direct bilinear resizing: `cv2.resize(frame, (224, 224), interpolation=cv2.INTER_LINEAR)`.
3. Scaling: uint8 values divided by $255.0$ to range $[0.0, 1.0]$ in `float32`.
4. ImageNet z-score normalization:
   $$\text{norm} = \frac{\mathbf{x} - [0.485, 0.456, 0.406]}{[0.229, 0.224, 0.225]}$$
5. Channel reordering: HWC $\to$ CHW (`np.transpose(norm, (2, 0, 1))`).
6. Stacking: Resulting tensor shape is strictly `[16, 3, 224, 224]`.

---

## ResNet-18 Feature Extraction

- The `[16, 3, 224, 224]` tensor is processed in a single batch pass through the frozen ResNet-18.
- Output shape: `[16, 512]` (512-dimensional spatial embedding per frame).
- Unsqueezed to sequence tensor: `[1, 16, 512]` under `torch.no_grad()`.

---

## EXP23_C Temporal Inference

- The `[1, 16, 512]` tensor is fed directly into `BadmintonTransformerLSTMClassifier`.
- Forward execution:
  1. Linear projection: $512 \to 128$.
  2. Sinusoidal positional encoding ($16 \times 128$).
  3. 1-layer Transformer Encoder (Pre-LN, 4 attention heads, $d_{\text{ff}}=256$).
  4. 1-layer Unidirectional LSTM ($128 \to 128$).
  5. Last-timestep slicing: `lstm_out[:, -1, :]` $\to [1, 128]$.
  6. Classifier head: Dropout(0.5) $\to$ Linear($128 \to 5$).
- Output logits: `[1, 5]`.
- Softmax normalization: $\mathbf{p} = \text{softmax}(\text{logits}, \text{dim}=1)$.
- Class mapping:
  - `0`: `SMASH`
  - `1`: `CLEAR`
  - `2`: `DROP`
  - `3`: `DRIVE`
  - `4`: `NET_SHOT`
- Predicted class is chosen via $\text{argmax}(\mathbf{p})$, with confidence defined as $\max(\mathbf{p})$.

---

## API Contract

### Request: `POST /api/video/analyze`
```json
{
  "video_id": "9b1deb4d3b7d4ef6"
}
```

### Response: `HTTP 200 OK`
```json
{
  "video_id": "9b1deb4d3b7d4ef6",
  "status": "completed",
  "predicted_shot": "NET_SHOT",
  "confidence": 0.3655,
  "probabilities": {
    "SMASH": 0.2555,
    "CLEAR": 0.2929,
    "DROP": 0.0352,
    "DRIVE": 0.0508,
    "NET_SHOT": 0.3655
  },
  "frames_used": 16,
  "processing_time_ms": 2301.74,
  "message": "Video analysis completed successfully."
}
```

---

## Error Handling

| Scenario | HTTP Code | Error Response Detail |
|---|:---:|---|
| Video ID not found on server | `404 Not Found` | `"Video with ID 'xyz' was not found."` |
| Video has fewer than 16 frames | `400 Bad Request` | `"Video contains only N decodable frames. A minimum of 16 frames is required for shot recognition analysis."` |
| Corrupt / unreadable video | `400 Bad Request` | `"The video file could not be opened or decoded."` |
| Internal inference failure | `500 Server Error` | `"An unexpected error occurred during video analysis."` *(No internal filesystem paths exposed)* |

---

## Tests

Automated testing covers unit, service, and API integration layers:

1. **`tests/test_inference_service.py`** (7/7 Passed):
   - `test_model_loaded_and_frozen`: Confirms singleton loads, models frozen, 330,885 parameters.
   - `test_direct_temporal_forward_shape`: Validates `[1, 5]` logits and softmax sums to 1.0.
   - `test_class_mapping`: Confirms 5 project classes.
   - `test_extract_sampled_frames_valid`: Verifies `[16, 3, 224, 224]` tensor from temporary fixture video.
   - `test_extract_sampled_frames_fewer_than_16_rejected`: Confirms rejection of short videos.
   - `test_extract_sampled_frames_missing_file`: Confirms `FileNotFoundError` on invalid path.
   - `test_end_to_end_video_analysis`: Tests full service pipeline on temporary MP4 fixture.

2. **`tests/test_api_inference.py`** (3/3 Passed):
   - `test_upload_then_analyze_flow`: Tests `POST /api/video/upload` followed by `POST /api/video/analyze`.
   - `test_analyze_non_existent_video_id`: Verifies 404 response.
   - `test_analyze_video_fewer_than_16_frames`: Verifies 400 response.

3. **Total Suite**: 18 tests passing across `test_backend.py`, `test_inference_service.py`, and `test_api_inference.py`.

---

## Smoke Test

A single manual smoke test was executed on an existing non-test demonstration clip from the external VideoBadminton pilot dataset:

- **Source File**: `D:\PS_DATA\scratch\external_data\videobadminton_pilot\02_SELECTED_CLIPS\2022-08-30_18-00-09_dataset_set1_001_000952_000988_A_12.mp4`
- **Clip Duration**: `1.20 seconds`
- **Total Decoded Frames**: `36 frames` (30.0 FPS)
- **Sampled Frames**: `16 frames`
- **Predicted Class**: `NET_SHOT`
- **Confidence**: `0.3655` (36.55%)
- **Class Probabilities**:
  - `SMASH`: 0.2555
  - `CLEAR`: 0.2929
  - `DROP`: 0.0352
  - `DRIVE`: 0.0508
  - `NET_SHOT`: 0.3655
- **Processing Latency**: `2,301.74 ms` (~2.3s total CPU time including video decoding, frame resizing, normalization, ResNet-18 forward pass on 16 frames, and Transformer-LSTM inference).

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
FRONTEND_MODIFIED: ZERO
MODEL_WEIGHTS_IN_GIT: ZERO
LARGE_VIDEOS_IN_GIT: ZERO
```

---

## Known Limitations

> [!IMPORTANT]
> The following limitations are documented for engineering rigor:
> 1. **Fixed 16-Frame Sampling is NOT Exact Stroke Segmentation**: The current pipeline samples 16 frames uniformly across the uploaded video. It assumes the uploaded clip represents a single shot or rally sequence.
> 2. **Multi-Rally Videos Require Segmentation**: An unedited 1-hour match video contains hundreds of shots. Passing a full match through a single 16-frame sample will only classify 16 arbitrary moments, not every stroke in the match. Stroke segmentation remains a separate downstream capability.
> 3. **No Multi-Person Player Selection**: The model attends to the global visual scene and does not isolate individual players by bounding box.
> 4. **No Shuttle / Contact Localization**: Spatial hit coordinates and court zone tracking are not inferred by this visual-only model.
> 5. **CPU Latency**: Full ResNet-18 extraction on 16 frames on an x86_64 CPU requires ~2.3 seconds. On a GPU, this would execute in <50 ms.
> 6. **Deployment Accuracy Scope**: This integration proves that the model inference pipeline is mechanically operational. It does not imply that arbitrary unconstrained user videos will achieve benchmark accuracy without proper framing, lighting, and shot centering.
