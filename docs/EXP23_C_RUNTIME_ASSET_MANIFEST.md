# SPARK EXP_23_C Runtime Asset Manifest

**Date:** September 21, 2026  
**Pipeline:** SPARK Badminton Shot Recognition (EXP_23_C Visual-Only)  
**Target Architecture:** BadmintonTransformerLSTMClassifier + Frozen ResNet-18 Backbone  

---

## 1. Runtime Asset Inventory

| Asset Name | Target Relative Path | Source Location | Purpose | Size | SHA256 Checksum | Required at Runtime |
|---|---|---|---|---|---|:---:|
| **EXP_23_C Model Checkpoint** | `backend/model/EXP_23_C_best_model.pt` | `D:\PS_DATA\PHASE_23_COMBINED_AUGMENTATION\03_CHECKPOINTS\EXP_23_C_best_model.pt` | Trained PyTorch weights for BadmintonTransformerLSTMClassifier | 1,341,480 bytes (~1.34 MB) | `cd511db28d5df5d0e400ecce957ce0db79ea57c553d862fdf6c2be0360a31e59` | **YES** |
| **Model Architecture Definition** | `backend/app/models/architecture.py` | `D:\PS_DATA\PHASE_23_COMBINED_AUGMENTATION\02_TRAINING\models.py` | Standalone PyTorch neural network definition (Sinusoidal PE, TransformerBlock, LSTM, Classifier) | ~3.8 KB | `e97148eb847a...` | **YES** |
| **Models Package Initializer** | `backend/app/models/__init__.py` | New module | Exports `BadmintonTransformerLSTMClassifier` | ~380 bytes | N/A | **YES** |
| **ResNet-18 Spatial Feature Extractor** | PyTorch Hub Cache (`~/.cache/torch/hub/checkpoints/resnet18-f37072fd.pth`) or auto-download | Canonical PyTorch TorchVision (`models.ResNet18_Weights.IMAGENET1K_V1`) | Pretrained ImageNet-1k convolutional backbone for 512-D spatial feature extraction per frame | 46,830,571 bytes (~46.8 MB) | `f37072fd47e89c5e827621c5baffa7500819f7896bbacec160b1a16c560e07ec` | **YES** |
| **Inference Service Boundary** | `backend/app/services/inference_service.py` | `backend/app/services/inference_service.py` | OpenCV frame extraction, temporal subsampling, normalization, feature extraction, and argmax/softmax logic | ~8.5 KB | N/A | **YES** |

---

## 2. Preprocessing & Normalization Configuration

| Parameter | Value | Details |
|---|---|---|
| **Input Modality** | Raw Video (`.mp4`, `.mov`, `.avi`, `.mkv`, `.webm`) | Monocular court-level or broadcast video |
| **Temporal Sampling Window** | `16` uniform frames | Linearly spaced timestamps across entire clip: `np.linspace(0, total_frames - 1, 16, dtype=int)` |
| **Frame Dimensions** | `224 × 224` pixels | Bilinear interpolation via `cv2.INTER_LINEAR` |
| **Color Space** | `RGB` | Converted from OpenCV default BGR: `cv2.COLOR_BGR2RGB` |
| **Pixel Scaling** | `x / 255.0` | Scaled to `[0.0, 1.0]` float32 tensor |
| **ImageNet Normalization Mean** | `[0.485, 0.456, 0.406]` | Subtracted per RGB channel |
| **ImageNet Normalization Std** | `[0.229, 0.224, 0.225]` | Divided per RGB channel |
| **Feature Extraction Vector** | `[16, 512]` | ResNet-18 truncated at penultimate pooling layer (`fc = nn.Identity()`) |

---

## 3. Target Class Taxonomy

| Class Index | Class Name | Output Logit Index | Description |
|:---:|---|:---:|---|
| `0` | **SMASH** | 0 | Steep downward offensive stroke |
| `1` | **CLEAR** | 1 | High parabolic deep baseline stroke |
| `2` | **DROP** | 2 | Soft tumbling front-court deceptive placement |
| `3` | **DRIVE** | 3 | Fast flat horizontal midcourt exchange |
| `4` | **NET_SHOT** | 4 | Delicate tumbling net tape finesse stroke |

---

## 4. Protected Assets (Explicitly Excluded from Production Package)

- **Official Test Set Matches:** `MATCH09`, `MATCH13`, `MATCH20`, `MATCH34`, `MATCH39`, `MATCH41`, `MATCH43` (Strictly protected and not packaged).
- **Training Datasets:** Full raw match video archives, extracted training frame directories, and intermediate augmented features (Excluded).
- **Experimental & Auxiliary Checkpoints:** `EXP_DRIVE_08B`, `EXP_DRIVE_11`, `EXP_DROP_SMASH_*`, `EXP_DROP_CLEAR_*` (Excluded; only verified production model `EXP_23_C` is packaged).
