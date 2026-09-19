# Day 19 Step 3A — EXP23_C Model Validation
## Empirical Single-Sample Verification of Pure Visual Temporal Inference

**Project**: SPARK — AI-Powered Badminton Shot Recognition  
**Task**: Day 19 — Step 3A (Model-Only Inference Validation)  
**Date**: 19 September 2026  
**Execution Environment**: Windows 11, Python 3.13.0rc3, PyTorch 2.13.0, CPU execution  

---

## Objective

The objective of Step 3A is to perform a controlled, non-destructive verification that the audited visual-only model candidate (**EXP23_C**) can be successfully loaded from its research checkpoint and perform a mathematically valid forward inference pass using an existing real 16-frame validation visual feature sequence.

This test serves as the technical gate before connecting the model to the SPARK application service pipeline.

---

## Model Source

- **Architecture Class**: `BadmintonTransformerLSTMClassifier`
- **Definition Path**: `D:\PS_DATA\PHASE_23_COMBINED_AUGMENTATION\02_TRAINING\models.py`
- **Architecture Pipeline**:
  1. `proj`: Linear projection layer ($512 \to 128$)
  2. `pos_encoder`: Sinusoidal positional encoding ($16 \times 128$)
  3. `transformer_block`: 1-layer Transformer Encoder ($d_{\text{model}}=128$, 4 attention heads, $d_{\text{ff}}=256$, Pre-LayerNorm, dropout=0.1)
  4. `lstm`: 1-layer Unidirectional LSTM ($128 \to 128$, batch_first=True)
  5. Temporal Slicing: Final timestep aggregation (`lstm_out[:, -1, :]`)
  6. `fc`: Classifier head with Dropout(0.5) $\to$ Linear($128 \to 5$)

---

## Checkpoint

- **Checkpoint Path**: `D:\PS_DATA\PHASE_23_COMBINED_AUGMENTATION\03_CHECKPOINTS\EXP_23_C_best_model.pt`
- **File Size**: `1,341,480 bytes` (~1.34 MB)
- **Saved Checkpoint State**: Epoch 34
- **State Dict Integrity**:
  - Missing keys: `0`
  - Unexpected keys: `0`
- **Parameter Count**:
  - Trainable parameters: `330,885`
  - Frozen eval parameters: `330,885` (`requires_grad = False`)

---

## Input Contract

- **Input Tensor Dimensions**: `[1, 16, 512]`
  - Batch size: `1`
  - Sequence length: `16` frames
  - Feature dimensionality: `512` (ResNet-18 penultimate feature pooling)
- **Data Type**: `torch.float32`
- **Execution Device**: `CPU`
- **Input Source**: Real precomputed visual feature sequence (zero synthetic or zero-filled data).

---

## Validation Sample Source

To ensure zero leakage and preserve test integrity, the validation sample was drawn exclusively from the **frozen validation partition**:

- **Sample File**: `D:\PS_DATA\09_CNN_SPATIAL_FEATURES\VALIDATION\SMASH\SMASH_MATCH07_MATCH07_SHOT0001_HITFRAME00014554.pt`
- **Partition**: `VALIDATION` (Match 07)
- **Ground Truth Category**: `SMASH` (Class Index `0`)
- **Sample File Size**: `34,774 bytes`
- **Loaded Tensor Shape**: `[16, 512]` $\to$ Unsqueezed to `[1, 16, 512]`
- **Official Test Set**: **ZERO ACCESS** (`09_CNN_SPATIAL_FEATURES/TEST` untouched).

---

## Model Loading Result

```
[OK] Model loaded: BadmintonTransformerLSTMClassifier
[OK] Checkpoint: EXP_23_C_best_model.pt (Epoch 34)
[OK] Missing keys: 0 | Unexpected keys: 0
[OK] Total parameters: 330,885 | Trainable: 0 (Frozen in eval mode)
```

The checkpoint was loaded onto CPU without errors or architecture modifications.

---

## Forward Pass Result

The model forward pass was executed under `torch.no_grad()` on CPU:

```
Input Shape:          [1, 16, 512]
Logits Shape:         [1, 5]
Logits Values:        [4.2550, -0.2208, 0.5304, -3.3982, -5.1779]
Probability Shape:    [1, 5]
Class Probabilities:
  - SMASH:     0.9652  (96.52%)
  - CLEAR:     0.0110  ( 1.10%)
  - DROP:      0.0233  ( 2.33%)
  - DRIVE:     0.0005  ( 0.05%)
  - NET_SHOT:  0.0001  ( 0.01%)
Probability Sum:      1.000000
Predicted Class:      SMASH (Index: 0)
Ground Truth:         SMASH
Match:                True (Correct on this sample)
CPU Latency:          14.48 ms
```

---

## Output Contract

The model output conforms to the SPARK API requirements:
1. **Shape**: Exactly `[1, 5]`.
2. **Bounds**: All probabilities lie strictly in $[0.0, 1.0]$.
3. **Normalization**: Softmax probabilities sum to $1.000000 \pm 10^{-6}$.
4. **Finiteness**: All logits and probability values are finite numbers (no `NaN` or `Inf`).

---

## Class Mapping

The model outputs are indexed in the following order:

| Index | Class Name | Output Logit | Softmax Probability |
|:---:|:---:|:---:|:---:|
| **0** | **SMASH** | **+4.2550** | **0.9652** |
| 1 | CLEAR | -0.2208 | 0.0110 |
| 2 | DROP | +0.5304 | 0.0233 |
| 3 | DRIVE | -3.3982 | 0.0005 |
| 4 | NET_SHOT | -5.1779 | 0.0001 |

---

## Auxiliary Feature Requirement

- **Auxiliary Inputs Passed**: `None`
- **Auxiliary Inputs Required**: `None (0-D)`
- **Spatial / Court Coordinates**: `None`
- **Hit-Frame Annotations Required by Forward Method**: `None`

The forward signature `def forward(self, x: torch.Tensor, return_attention: bool = False)` was confirmed to accept *only* the single visual feature tensor `x`.

---

## CPU Inference

- **Execution Device**: Intel/AMD x86_64 CPU (Windows host)
- **Model Forward Latency**: **14.48 ms** (isolated temporal model)
- **Memory Footprint**: Minimal (~5 MB for model weights and intermediate activations)
- **Feasibility**: High throughput and immediate responsiveness for single-stroke queries.

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
BACKEND_API_MODIFIED: ZERO
FRONTEND_MODIFIED: ZERO
```

---

## Separation of Verified Facts and Observations

### VERIFIED FACTS
1. `EXP_23_C_best_model.pt` loaded into `BadmintonTransformerLSTMClassifier` with zero missing keys, zero unexpected keys, and exactly 330,885 parameters.
2. The model executed on CPU and processed a real validation sample tensor of shape `[1, 16, 512]`.
3. The forward pass output `[1, 5]` logits and valid softmax probabilities summing to 1.0.
4. The model required zero auxiliary features, zero court coordinates, and zero hit-frame coordinates.
5. On the tested validation sample (`SMASH_MATCH07_MATCH07_SHOT0001_HITFRAME00014554.pt`), the predicted class was `SMASH` with 96.52% confidence, matching the ground truth.
6. The reusable test script `tests/test_exp23_model_inference.py` passed with exit code 0.

### OBSERVATIONS
1. On an isolated forward pass, temporal model CPU execution completed in ~14.5 ms.
2. An exploratory test on 16 JPEG frames from `04_EXTRACTED_FRAMES` confirmed that re-extracting features through ResNet-18 produces a `[16, 512]` tensor, though subtle differences exist between precomputed tensors and JPEG-reloaded frames due to compression artifacts and resizing nuances.
3. This single-sample test verifies execution compatibility, not statistical deployment accuracy across unseen user video.

---

## Conclusion

EXP23_C model loading and single-sample inference are operational.

*(Note: This validation confirms technical execution viability of the model. It does NOT assert production-readiness, arbitrary video coverage, real-time guarantees, or generalized accuracy across untrimmed multi-rally footage).*
