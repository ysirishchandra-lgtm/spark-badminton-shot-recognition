# EXP_DRIVE_08B — H/V Visual Motion Fusion

## 1. Executive Summary & Recovery Status

- **Experiment ID:** `EXP_DRIVE_08B`
- **Session Shutdown & Recovery:**
  - **Prior State Discovered:** The previous session was unexpectedly terminated during training set feature extraction. Audit confirmed that 7/7 validation matches (1,960 shots) and 22/28 training matches (7,775 shots) were safely cached on disk. Training had not yet started (0 epochs, empty checkpoints/logs).
  - **Work Reused:** All 29 completed cache files were verified and reused without recomputation. Zero duplicate optical-flow work was performed.
  - **Resumed Operations:** Feature extraction was executed strictly for the 6 missing training matches (MATCH30, MATCH32, MATCH35, MATCH36, MATCH42, MATCH44; 2,269 shots). Normalization parameters were fitted strictly on the 10,044 training samples. The single authorized model training run was executed for 30 epochs.
- **Key Outcome:** Overall Validation Accuracy reached **77.55%** (+2.60 pp vs EXP05), and Macro F1 reached **68.56%** (+3.34 pp vs EXP05).
- **Targeted Metric Impact:** DRIVE $\rightarrow$ SMASH errors dropped from 14 to 11 (**-21.4%**), and 2 of the 6 targeted DRIVE $\rightarrow$ SMASH cases were recovered to DRIVE. However, DRIVE recall decreased from 47.95% to 38.36% due to lateral/downward confusions shifting into NET_SHOT and DROP, resulting in a **MIXED RESULT** classification.

---

## 2. Objective

To execute a rigorously controlled, single-variable machine learning experiment testing whether fusing the deployable **Horizontal-to-Vertical Visual Motion Ratio ($|u| / |v|$)** into the multimodal auxiliary vector resolves DRIVE $\rightarrow$ SMASH confusion and improves overall shot recognition over the validated **EXP_DRIVE_05** baseline.

The motion ratio feature is extracted strictly from the observed 16 video frames of Window C (`[-4, +11]`), utilizing **zero future landing information** (fully deployable).

---

## 3. Baseline EXP05

EXP_DRIVE_05 established the Window C `[-4, +11]` temporal paradigm, improving overall recognition over EXP24 but introducing 6 new DRIVE $\rightarrow$ SMASH errors:
- **Validation Accuracy:** 74.95%
- **Macro F1:** 65.22%
- **Weighted F1:** 74.16%
- **DRIVE Precision:** 58.33%
- **DRIVE Recall:** 47.95% (35/73)
- **DRIVE F1:** 52.63%
- **DRIVE $\rightarrow$ NET_SHOT:** 16
- **DRIVE $\rightarrow$ SMASH:** 14

---

## 4. Exact Feature Definition

In strict compliance with Section 6 reproduction requirements, the feature definition reproduces the audited formula from EXP_DRIVE_08A (Cohen's d = 1.100):
- **Optical Flow Algorithm:** Farneback dense optical flow (`cv2.calcOpticalFlowFarneback`)
- **Parameters:** `pyr_scale=0.5, levels=3, winsize=15, iterations=3, poly_n=5, poly_sigma=1.2, flags=0`
- **Frame Resolution:** 320x180 (downscaled with `cv2.INTER_AREA` from broadcast video)
- **Preprocessing:** Grayscale conversion (`cv2.COLOR_BGR2GRAY`)
- **Temporal Window:** 16 chronological frames `[H-4, ..., H+11]`, yielding 15 consecutive transitions $t = 1 \dots 15$
- **Aggregation:**
  $$\bar{u} = \frac{1}{15} \sum_{t=1}^{15} \text{mean}(|u_t|), \quad \bar{v} = \frac{1}{15} \sum_{t=1}^{15} \text{mean}(|v_t|)$$
- **Formula:**
  $$\text{HV\_RATIO} = \frac{\bar{u}}{\bar{v} + 1\times 10^{-5}}$$
- **Epsilon:** $1 \times 10^{-5}$

---

## 5. Data Integrity

- **Training Samples:** 10,044 (28 matches)
- **Validation Samples:** 1,960 (7 matches: MATCH07, MATCH08, MATCH25, MATCH31, MATCH37, MATCH38, MATCH40)
- **Official Test Set:** ZERO access, completely untouched.
- **Future Annotations:** ZERO leakage (no landing coords, landing frames, or flight durations).
- **NaN / Inf:** 0 instances across both train and val.
- **Audit 08A Reproduction Check:** 405 validation DRIVE and SMASH samples checked against EXP_DRIVE_08A; max absolute difference = 0.00000000.

---

## 6. Training Configuration

- **Experiment ID:** `EXP_DRIVE_08B`
- **Architecture:** `MultimodalTransformerLSTMClassifier`
  - Visual branch: ResNet-18 (512-D) $\rightarrow$ Linear(128-D) $\rightarrow$ 1-layer Transformer (4 heads) $\rightarrow$ 1-layer LSTM (128-D)
  - Spatial Auxiliary branch: Linear(28 $\rightarrow$ 64) $\rightarrow$ ReLU $\rightarrow$ Dropout(0.3) $\rightarrow$ Linear(64 $\rightarrow$ 64)
  - Fusion: Concat(128 + 64 = 192-D) $\rightarrow$ Dropout(0.5) $\rightarrow$ Linear(192 $\rightarrow$ 5)
- **Trainable Parameters:** 337,221 (EXP05: 337,157, $\Delta$ = +64 weights)
- **Seed:** 123 (exact EXP05 seed)
- **Optimizer:** Adam (lr=1e-3, weight_decay=1e-4)
- **Batch Size:** 64
- **Max Epochs:** 30 (Patience 8 early stopping)
- **Loss:** Standard CrossEntropyLoss (equal class weights, identical to EXP05)

---

## 7. Training Epoch History

| Epoch | Train Loss | Val Loss | Val Accuracy (%) | Val Macro F1 (%) | Val Weighted F1 (%) | Time (s) | Status |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
|  1 | 0.9789 | 0.7944 | 63.72% | 48.81% | 61.35% | 13.2s |  |
|  2 | 0.7108 | 0.7292 | 63.98% | 49.99% | 62.20% | 10.2s |  |
|  3 | 0.6444 | 0.6862 | 69.95% | 57.86% | 68.72% | 9.8s |  |
|  4 | 0.6002 | 0.6355 | 73.32% | 58.34% | 70.49% | 10.9s |  |
|  5 | 0.5754 | 0.6430 | 73.06% | 61.23% | 72.36% | 8.5s |  |
|  6 | 0.5535 | 0.6445 | 72.91% | 57.90% | 69.16% | 8.9s |  |
|  7 | 0.5362 | 0.6456 | 71.63% | 61.86% | 71.72% | 8.6s |  |
|  8 | 0.5141 | 0.6344 | 73.88% | 57.74% | 71.31% | 9.0s |  |
|  9 | 0.5107 | 0.7405 | 66.43% | 56.16% | 65.38% | 9.7s |  |
| 10 | 0.5108 | 0.6320 | 74.44% | 64.15% | 74.21% | 9.1s |  |
| 11 | 0.4967 | 0.5970 | 75.26% | 62.98% | 74.07% | 9.2s |  |
| 12 | 0.4773 | 0.6631 | 72.40% | 62.40% | 72.39% | 9.9s |  |
| 13 | 0.4868 | 0.5937 | 74.39% | 66.36% | 74.79% | 10.2s |  |
| 14 | 0.4796 | 0.6230 | 73.62% | 61.42% | 71.14% | 10.2s |  |
| 15 | 0.4573 | 0.6051 | 74.74% | 65.78% | 74.24% | 9.3s |  |
| 16 | 0.4622 | 0.6129 | 74.59% | 65.56% | 73.64% | 10.5s |  |
| 17 | 0.4478 | 0.5862 | 76.63% | 67.32% | 76.31% | 12.0s |  |
| 18 | 0.4493 | 0.6082 | 74.69% | 66.07% | 74.33% | 12.9s |  |
| 19 | 0.4505 | 0.6659 | 73.47% | 63.01% | 73.26% | 14.6s |  |
| 20 | 0.4274 | 0.6309 | 75.31% | 66.47% | 74.96% | 15.8s |  |
| 21 | 0.4345 | 0.6866 | 73.52% | 61.81% | 72.58% | 19.2s |  |
| 22 | 0.4369 | 0.6118 | 75.82% | 64.86% | 74.91% | 17.9s |  |
| 23 | 0.4069 | 0.5883 | 77.55% | 68.56% | 77.49% | 18.1s | ★ BEST |
| 24 | 0.4263 | 0.6508 | 74.39% | 65.64% | 74.64% | 19.4s |  |
| 25 | 0.4041 | 0.6353 | 75.61% | 66.21% | 75.35% | 20.5s |  |
| 26 | 0.4164 | 0.5959 | 76.12% | 68.11% | 76.14% | 20.5s |  |
| 27 | 0.4052 | 0.6271 | 74.13% | 60.83% | 72.32% | 22.0s |  |
| 28 | 0.3971 | 0.6392 | 76.63% | 68.00% | 76.58% | 23.3s |  |
| 29 | 0.3918 | 0.6476 | 76.12% | 68.63% | 76.32% | 25.0s |  |
| 30 | 0.3969 | 0.6014 | 77.09% | 69.46% | 76.76% | 25.9s |  |

- **Total Training Time:** 424.8s (7.1 min)
- **Optimal Checkpoint Selection:** Epoch 23 (Acc: **77.55%**, Macro F1: **68.56%**)

---

## 8. Feature Statistics

Normalization parameters were **strictly fitted on the training set only**:
- **Training Mean (mu):** 1.8269
- **Training Std (sigma):** 0.9621
- **Training Min / Max:** 0.4713 / 41.3162
- **Validation Reference Mean / Std:** 1.7914 / 0.6333

Validation Class-wise Raw H/V Ratio:
- **DRIVE (N=73):** Mean = 2.4693, Median = 2.2951, Std = 0.8361
- **SMASH (N=332):** Mean = 1.7260, Median = 1.6070, Std = 0.6331
- **Cohen's d (DRIVE vs SMASH):** +1.100 (Large effect size)

---

## 9. Validation Results

- **Best Validation Epoch:** Epoch 23
- **Validation Accuracy:** **77.55%** (EXP05: 74.95%, $\Delta$: **+2.60 pp**)
- **Macro F1:** **68.56%** (EXP05: 65.22%, $\Delta$: **+3.34 pp**)
- **Weighted F1:** **77.49%** (EXP05: 74.16%, $\Delta$: **+3.33 pp**)
- **Validation Loss:** 0.5883

---

## 10. Per-Class Results

| Class | Precision (%) | Recall (%) | F1 Score (%) | Support | F1 Delta vs EXP05 |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **SMASH** | 71.61% | 66.87% | 69.16% | 332 | **+3.02 pp** |
| **CLEAR** | 74.41% | 72.02% | 73.20% | 529 | **+2.26 pp** |
| **DROP** | 50.56% | 59.48% | 54.65% | 306 | **+15.58 pp** |
| **DRIVE** | 66.67% | 38.36% | 48.70% | 73 | **-3.93 pp** |
| **NET_SHOT** | 96.06% | 98.19% | 97.12% | 720 | **-0.19 pp** |

---

## 11. Confusion Matrix

| True \ Pred | SMASH | CLEAR | DROP | DRIVE | NET_SHOT |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **SMASH** |  222 |   47 |   57 |    4 |    2 |
| **CLEAR** |   29 |  381 |  113 |    0 |    6 |
| **DROP** |   47 |   74 |  182 |    2 |    1 |
| **DRIVE** |   11 |    7 |    7 |   28 |   20 |
| **NET_SHOT** |    1 |    3 |    1 |    8 |  707 |

---

## 12. DRIVE Error Analysis

| DRIVE Metric | EXP05 | EXP08B | Delta | Trend |
| :--- | :---: | :---: | :---: | :---: |
| **Correct DRIVE** | 35/73 | 28/73 | -7 | REGRESSED |
| **DRIVE Recall** | 47.95% | 38.36% | -9.59 pp | REGRESSED |
| **DRIVE Precision** | 58.33% | 66.67% | +8.34 pp | IMPROVED |
| **DRIVE F1** | 52.63% | 48.70% | -3.93 pp | REGRESSED |
| **DRIVE $\rightarrow$ SMASH** | 14 | 11 | -3 | IMPROVED |
| **DRIVE $\rightarrow$ NET_SHOT** | 16 | 20 | +4 | REGRESSED |
| **DRIVE $\rightarrow$ CLEAR** | 7 | 7 | +0 | - |
| **DRIVE $\rightarrow$ DROP** | 1 | 7 | +6 | - |

---

## 13. Six DRIVE→SMASH Diagnostic Cases

Diagnostic tracking of the 6 newly introduced DRIVE $\rightarrow$ SMASH cases from EXP_DRIVE_06:

| Match ID | Hit Frame | True Class | EXP24 Pred | EXP05 Pred | EXP08B Pred | EXP08B Status | Top-2 Probabilities |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `MATCH07` | 19603 | DRIVE | DRIVE | SMASH | **SMASH** | `REMAINING_SMASH` | SMASH (0.525), DRIVE (0.419) |
| `MATCH07` | 27779 | DRIVE | NET_SHOT | SMASH | **NET_SHOT** | `MOVED_TO_NET_SHOT` | NET_SHOT (0.617), DRIVE (0.163) |
| `MATCH07` | 34216 | DRIVE | DRIVE | SMASH | **SMASH** | `REMAINING_SMASH` | SMASH (0.728), DRIVE (0.161) |
| `MATCH07` | 52914 | DRIVE | DRIVE | SMASH | **DRIVE** | `CORRECTED_TO_DRIVE` | DRIVE (0.478), SMASH (0.219) |
| `MATCH38` | 33492 | DRIVE | DRIVE | SMASH | **SMASH** | `REMAINING_SMASH` | SMASH (0.330), DROP (0.292) |
| `MATCH40` | 12876 | DRIVE | DRIVE | SMASH | **DRIVE** | `CORRECTED_TO_DRIVE` | DRIVE (0.406), SMASH (0.343) |

- **Corrected to DRIVE:** 2/6 (MATCH07 52914, MATCH40 12876)
- **Remaining SMASH:** 3/6 (MATCH07 19603, MATCH07 34216, MATCH38 33492)
- **Moved to Other Class:** 1/6 (MATCH07 27779 $\rightarrow$ NET_SHOT)

---

## 14. Seven Frontcourt Cases

Tracking of the 7 frontcourt DRIVE cases:

| Match ID | Hit Frame | True Class | EXP24 Pred | EXP05 Pred | EXP08B Pred | Correct? | Top-2 Probabilities |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `MATCH07` | 16244 | DRIVE | NET_SHOT | NET_SHOT | **NET_SHOT** | `NO` | NET_SHOT (0.931), DRIVE (0.057) |
| `MATCH07` | 27779 | DRIVE | NET_SHOT | SMASH | **NET_SHOT** | `NO` | NET_SHOT (0.617), DRIVE (0.163) |
| `MATCH07` | 33668 | DRIVE | NET_SHOT | NET_SHOT | **DRIVE** | `YES` | DRIVE (0.388), SMASH (0.311) |
| `MATCH37` | 14304 | DRIVE | NET_SHOT | DRIVE | **NET_SHOT** | `NO` | NET_SHOT (0.808), DRIVE (0.158) |
| `MATCH38` | 58675 | DRIVE | NET_SHOT | NET_SHOT | **NET_SHOT** | `NO` | NET_SHOT (0.967), DRIVE (0.030) |
| `MATCH38` | 107731 | DRIVE | NET_SHOT | NET_SHOT | **NET_SHOT** | `NO` | NET_SHOT (0.890), DRIVE (0.085) |
| `MATCH40` | 30580 | DRIVE | NET_SHOT | NET_SHOT | **NET_SHOT** | `NO` | NET_SHOT (0.990), DRIVE (0.009) |

- **EXP24 Correct:** 0/7
- **EXP05 Correct:** 1/7
- **EXP08B Correct:** 1/7 (MATCH07 frame 33668 correctly identified as DRIVE)

---

## 15. Primary Comparison (EXP05 vs EXP08B)

| Metric | EXP05 | EXP08B | Delta |
| :--- | :---: | :---: | :---: |
| **Accuracy (%)** | 74.95% | 77.55% | **+2.60 pp** |
| **Macro F1 (%)** | 65.22% | 68.56% | **+3.34 pp** |
| **Weighted F1 (%)** | 74.16% | 77.49% | **+3.33 pp** |
| **DRIVE Precision (%)** | 58.33% | 66.67% | **+8.34 pp** |
| **DRIVE Recall (%)** | 47.95% | 38.36% | **-9.59 pp** |
| **DRIVE F1 (%)** | 52.63% | 48.70% | **-3.93 pp** |
| **SMASH F1 (%)** | 66.14% | 69.16% | **+3.02 pp** |
| **CLEAR F1 (%)** | 70.94% | 73.20% | **+2.26 pp** |
| **DROP F1 (%)** | 39.07% | 54.65% | **+15.58 pp** |
| **NET_SHOT F1 (%)** | 97.31% | 97.12% | **-0.19 pp** |
| **DRIVE $\rightarrow$ NET_SHOT** | 16 | 20 | **+4** |
| **DRIVE $\rightarrow$ SMASH** | 14 | 11 | **-3** |

---

## 16. Scientific Interpretation

### Mechanistic Analysis
The experimental question posed by EXP_DRIVE_08B was: *Does providing an explicit directional motion ratio ($|u| / |v|$) enable the model to distinguish horizontal drives from downward smashes without requiring unobservable future landing data?*

1. **Resolution of DRIVE $\rightarrow$ SMASH Confusion:** DRIVE $\rightarrow$ SMASH confusion fell from 14 errors in EXP05 to 11 errors in EXP08B (a **21.4% reduction**). Furthermore, 2 out of the 6 targeted error cases from EXP06 (MATCH07 frame 52914 and MATCH40 frame 12876) were successfully corrected to DRIVE. This validates that the high horizontal-to-vertical flow ratio provides effective inductive bias against misclassifying high-speed flat drives as downward smashes.
2. **Global Feature Gains:** Introducing directional motion dramatically improved DROP classification (F1 improved by **+15.58 pp** from 39.07% to 54.65%), SMASH classification (F1 +3.02 pp), and CLEAR classification (F1 +2.26 pp). Overall Validation Accuracy advanced from 74.95% to **77.55%** (+2.60 pp) and Macro F1 climbed from 65.22% to **68.56%** (+3.34 pp).
3. **The Precision/Recall Tradeoff on DRIVE:** While DRIVE Precision increased substantially from 58.33% to **66.67%** (+8.34 pp), DRIVE Recall dropped from 47.95% to **38.36%** (-9.59 pp). The model became more conservative in assigning the rare DRIVE label (only 42 predicted drives in EXP08B vs 60 in EXP05). Errors shifted away from SMASH into NET_SHOT (20 vs 16) and DROP (7 vs 1).

---

## 17. Limitations

1. **Whole-Frame Optical Flow Averaging:** Farneback optical flow computes motion over the entire downsampled frame ($320 \times 180$). While player movement dominates pixel variance, court lines and background elements dilute subtle racket head acceleration.
2. **Early Post-Impact Scope:** Window C captures frames up to $H+11$ (367 ms post-impact). In deep backcourt rallies, downward smash trajectory steepness becomes even more pronounced after $H+11$, but early window restriction limits vertical flow differentiation.
3. **Natural Class Imbalance:** The validation set contains 73 DRIVE samples (representative of natural badminton rally frequency ~3.7%). A difference of 7 shots in recall accounts for 9.59 pp.

---

## 18. Scientific Decision

### Classification: **MIXED RESULT**

Based on the complete metric profile:
- **Accuracy:** 77.55% (**+2.60 pp**)
- **Macro F1:** 68.56% (**+3.34 pp**)
- **Weighted F1:** 77.49% (**+3.33 pp**)
- **DRIVE $\rightarrow$ SMASH Errors:** Reduced from 14 to 11 (**-21.4%**)
- **Six Diagnostic Cases:** 2 corrected to DRIVE, 1 moved to NET_SHOT, 3 remaining SMASH
- **DRIVE F1:** 48.70% (**-3.93 pp**, due to higher precision but lower recall)

The experiment confirms that directional visual motion provides valuable inductive bias that directly reduces DRIVE $\rightarrow$ SMASH confusion and yields major overall system gains (+2.60 pp accuracy, +3.34 pp Macro F1). However, the reduction in DRIVE recall warrants reporting as a mixed result tradeoff rather than an unconditional victory.

---

## 19. Reproducibility

- **Training Script:** `D:\PS_DATA\DRIVE_EXPERIMENTS\EXP_DRIVE_08B_HV_MOTION\train_exp_drive_08b.py`
- **Feature Script:** `D:\PS_DATA\DRIVE_EXPERIMENTS\EXP_DRIVE_08B_HV_MOTION\extract_hv_features.py`
- **Configuration File:** `D:\PS_DATA\DRIVE_EXPERIMENTS\EXP_DRIVE_08B_HV_MOTION\01_CONFIG\config.json`
- **Best Checkpoint:** `D:\PS_DATA\DRIVE_EXPERIMENTS\EXP_DRIVE_08B_HV_MOTION\03_CHECKPOINTS\EXP_DRIVE_08B_best_checkpoint.pt`
- **Latest Checkpoint:** `D:\PS_DATA\DRIVE_EXPERIMENTS\EXP_DRIVE_08B_HV_MOTION\03_CHECKPOINTS\EXP_DRIVE_08B_latest_checkpoint.pt`
- **Training Log:** `D:\PS_DATA\DRIVE_EXPERIMENTS\EXP_DRIVE_08B_HV_MOTION\06_LOGS\training_log.csv`
- **Validation Results JSON:** `D:\PS_DATA\DRIVE_EXPERIMENTS\EXP_DRIVE_08B_HV_MOTION\04_RESULTS\validation_results.json`
- **Random Seed:** `123`
- **Split:** Frozen 10,044 / 1,960 (MATCH07, 08, 25, 31, 37, 38, 40)
- **Compute Hardware:** CPU execution, OpenCV deterministic Farneback dense flow.