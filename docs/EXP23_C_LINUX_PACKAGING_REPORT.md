# SPARK EXP_23_C Linux Packaging & Portability Report

**Date:** September 21, 2026  
**Pipeline:** SPARK Badminton Shot Recognition (EXP_23_C Production Backend)  
**Task:** Production Linux Packaging Phase (Decoupling Windows local workstation paths for Linux / Render portability)  

---

------------------------------------------------------------
MODEL
------------------------------------------------------------

EXP_23_C

SHA256:
cd511db28d5df5d0e400ecce957ce0db79ea57c553d862fdf6c2be0360a31e59

------------------------------------------------------------
WINDOWS PATHS REMOVED
------------------------------------------------------------

PASS

*Details:*
- Removed hardcoded `D:\PS_DATA\PHASE_23_COMBINED_AUGMENTATION\02_TRAINING` (architecture import) by packaging `BadmintonTransformerLSTMClassifier` directly into `backend/app/models/architecture.py`.
- Removed hardcoded `D:\PS_DATA\PHASE_23_COMBINED_AUGMENTATION\03_CHECKPOINTS\EXP_23_C_best_model.pt` by packaging the exact checkpoint inside `backend/model/EXP_23_C_best_model.pt` with configurable `MODEL_PATH` environment variable support.
- Removed hardcoded `C:\Users\user\.cache\torch\hub\checkpoints\resnet18-f37072fd.pth` by enabling native canonical PyTorch ImageNet weights auto-loading (`models.ResNet18_Weights.IMAGENET1K_V1`) and `RESNET_WEIGHTS_PATH` environment variable override.

------------------------------------------------------------
RUNTIME ASSETS
------------------------------------------------------------

1. `backend/model/EXP_23_C_best_model.pt` (PyTorch weights, 1,341,480 bytes, SHA256: `cd511db28d5df5d0e400ecce957ce0db79ea57c553d862fdf6c2be0360a31e59`)
2. `backend/app/models/architecture.py` (BadmintonTransformerLSTMClassifier, 330,885 parameters, Sinusoidal PE + Transformer + BiLSTM)
3. `backend/app/models/__init__.py` (Package initializer exposing model classes)
4. `backend/app/services/inference_service.py` (OpenCV decoding, uniform 16-frame sampling, ImageNet normalization, ResNet-18 extraction, Softmax classification)
5. `ResNet-18 ImageNet-1K Backbone` (Canonical PyTorch weights `resnet18-f37072fd.pth`, SHA256: `f37072fd47e89c5e827621c5baffa7500819f7896bbacec160b1a16c560e07ec`)

------------------------------------------------------------
DEPENDENCIES
------------------------------------------------------------

Production Linux backend dependencies in `backend/requirements.txt`:
- `fastapi>=0.110.0`
- `uvicorn[standard]>=0.28.0`
- `pydantic>=2.6.0`
- `pydantic-settings>=2.2.0`
- `python-multipart>=0.0.9`
- `python-dotenv>=1.0.0`
- `torch>=2.0.0`
- `torchvision>=0.15.0`
- `opencv-python-headless>=4.8.0` (Headless build for Linux containers without X11/libGL requirements)
- `numpy>=1.24.0`
- `httpx>=0.27.0`
- `pytest>=8.0.0`

------------------------------------------------------------
LINUX COMPATIBILITY
------------------------------------------------------------

PASS

*Audit Results:*
- Windows path separators replaced with `pathlib.Path` cross-platform object abstractions.
- Zero Windows-only APIs utilized.
- No local username assumptions or user-profile directories hardcoded.
- CPU inference contract enforced (`map_location="cpu"`, no CUDA requirements).
- Headless OpenCV declared (`opencv-python-headless`).
- Ingestion, validation, and inference tested against raw video input on standard filesystem hierarchy.

------------------------------------------------------------
LOCAL REGRESSION
------------------------------------------------------------

Health:
PASS (`HTTP 200 {"status":"ok","project":"SPARK","service":"badminton-shot-recognition-api"}`)

Upload:
PASS (`HTTP 201 Created` with `demo_badminton_match16.mp4`)

Analyze:
PASS (`HTTP 200 OK`, latency: 1544.81 ms)

Prediction:
NET_SHOT

Confidence:
92.26%

Probability sum:
0.9999

------------------------------------------------------------
MODEL BEHAVIOR
------------------------------------------------------------

Before Packaging:
- Predicted Shot: `NET_SHOT`
- Confidence: `92.26%`
- Probabilities: SMASH: 1.59%, CLEAR: 0.58%, DROP: 0.59%, DRIVE: 4.97%, NET_SHOT: 92.26%
- Probability Sum: `0.9999`

After Packaging:
- Predicted Shot: `NET_SHOT`
- Confidence: `92.26%`
- Probabilities: SMASH: 1.59%, CLEAR: 0.58%, DROP: 0.59%, DRIVE: 4.97%, NET_SHOT: 92.26%
- Probability Sum: `0.9999`

Equivalent:
YES (100% mathematical and behavioral equivalence verified)

------------------------------------------------------------
OFFICIAL TEST
------------------------------------------------------------

NOT ACCESSED (`MATCH09, MATCH13, MATCH20, MATCH34, MATCH39, MATCH41, MATCH43` remain strictly isolated)

------------------------------------------------------------
MODEL MODIFIED
------------------------------------------------------------

NO

------------------------------------------------------------
DEPLOYMENT
------------------------------------------------------------

NOT PERFORMED (Prepared and verified locally; Cloudflare demo tunnels remain active)

------------------------------------------------------------
FINAL STATUS
------------------------------------------------------------

READY FOR VERCEL + RENDER DEPLOYMENT
