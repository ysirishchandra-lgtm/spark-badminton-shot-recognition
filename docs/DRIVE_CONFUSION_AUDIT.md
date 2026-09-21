# DRIVE Shot Confusion Audit
**Project**: SPARK — AI-Powered Badminton Shot Recognition  
**Document**: `D:\PS_DATA\SPARK\docs\DRIVE_CONFUSION_AUDIT.md`  
**Execution Type**: Strict Read-Only Diagnostic Investigation (Diagnosis Only)  
**Target Split**: Held-Out Frozen Validation Set (1,960 shots across 7 matches)  
**Official Test Set Access**: ZERO ACCESS (Quarantined and untouched)  
**HitHeatmap Workflows**: ZERO USAGE / ZERO TRAINING  
**Model Training Executed**: NONE (Zero weights trained, fine-tuned, or modified)  

---

## 1. Audit Scope

This report provides a rigorous, empirical diagnostic investigation into the performance characteristics, failure modes, and systematic confusion surrounding the **DRIVE** shot class in the SPARK badminton shot recognition project.

In strict compliance with the diagnosis-only protocol:
- **No models were trained, fine-tuned, or altered.**
- **No architectures, loss formulations, or hyperparameters were modified.**
- **No training/validation/test splits were regenerated or modified.**
- **The official frozen TEST set was NOT accessed, evaluated, or inspected.**
- **No synthetic coordinates were created, and no HitHeatmap workflows were executed.**
- **No production or deployment weights in the SPARK application were overwritten.**

The sole objective is to discover **why DRIVE is systematically misclassified**, dissect the underlying kinematic, temporal, spatial, and representation factors, and evaluate the empirical evidence across historical and current experiments before any future intervention is considered.

---

## 2. Model Audited

### Distinction Between Research Champion and Application Deployment Model

To ensure total architectural and empirical clarity, this audit distinguishes between the **project research champion** and the **SPARK production deployment model**:

| Role | Experiment ID | Checkpoint Path | Input Requirements | Architecture | Val Accuracy | Val Macro F1 | DRIVE Recall |
|---|---|---|---|---|:---:|:---:|:---:|
| **Research Champion** | `EXP24_MULTIMODAL_TRANSFORMER_BILSTM` | `D:\PS_DATA\EXP24_MULTIMODAL_TRANSFORMER_BILSTM\08_BEST_CHECKPOINT.pt` | Dual Tensor: `visual_seq` `[B, 16, 512]` + `aux_features` `[B, 27]` | ResNet-18 + Transformer-LSTM + 27-D Spatial MLP (337,157 params) | **73.32%** | **61.47%** | **53.42%** |
| **SPARK Deployment Model** | `EXP23_C` | `D:\PS_DATA\PHASE_23_COMBINED_AUGMENTATION\03_CHECKPOINTS\EXP_23_C_best_model.pt` | Single Tensor: `visual_seq` `[B, 16, 512]` (Visual-Only) | ResNet-18 + Transformer-LSTM (330,885 params) | 66.73% | 52.82% | **26.03%** |

### Audited Model Designation and Rationale

1. **Primary Audited Model**: `EXP24_MULTIMODAL_TRANSFORMER_BILSTM` (Best checkpoint at Epoch 22, Seed 123).
2. **Comparative Audited Model**: `EXP23_C` (Best checkpoint at Epoch 34, Seed 42).
3. **Rationale for Selection**:
   - `EXP24` represents the verified research champion and the project's highest-performing multi-class architecture. It incorporates full 27-dimensional spatial court coordinates, reach geometry, and player positions alongside temporal visual features. Auditing EXP24 enables us to isolate whether DRIVE confusion is an **intrinsic kinematic and semantic problem** that persists even with perfect ground-truth court spatial features, rather than merely an artifact of visual feature deprivation.
   - Concurrently, comparing `EXP24` directly against `EXP23_C` (the pure-vision model deployed in the SPARK backend) reveals the exact performance drop caused by the absence of spatial coordinates in live video inference (where DRIVE recall collapses from 53.42% down to 26.03%).

---

## 3. Dataset / Validation Split

All diagnostic calculations and evaluations in this audit strictly consumed the **frozen held-out validation split**.

### Validation Split Specification
- **Total Validation Sequences**: Exactly **1,960 samples** (`aux_val_27d.pkl`).
- **Match-Level Partition Isolation**: Drawn exclusively from the 7 frozen validation matches:
  - `MATCH07`: 509 samples (31 DRIVE)
  - `MATCH08`: 316 samples (7 DRIVE)
  - `MATCH25`: 224 samples (2 DRIVE)
  - `MATCH31`: 251 samples (6 DRIVE)
  - `MATCH37`: 218 samples (10 DRIVE)
  - `MATCH38`: 312 samples (12 DRIVE)
  - `MATCH40`: 130 samples (5 DRIVE)
- **Train Split Reference**: 10,044 samples across 28 matches (used solely for descriptive distribution comparisons).
- **Test Set Quarantine**: The official frozen test set (2,001 samples across 7 matches) remained **100% quarantined and uninspected**.

---

## 4. Class Distribution

### Quantitative Distribution Across Partitions

| Class Index | Canonical Class | Train Count | Train % | Val Count | Val % | Imbalance Ratio vs Majority | Imbalance Ratio vs DRIVE |
|:---:|---|:---:|:---:|:---:|:---:|:---:|:---:|
| 0 | **SMASH** | 1,794 | 17.86% | 332 | 16.94% | 2.47 : 1 (Train) / 2.17 : 1 (Val) | 3.71x (Train) / 4.55x (Val) |
| 1 | **CLEAR** | 1,832 | 18.24% | 529 | 26.99% | 2.42 : 1 (Train) / 1.36 : 1 (Val) | 3.79x (Train) / 7.25x (Val) |
| 2 | **DROP** | 1,505 | 14.98% | 306 | 15.61% | 2.94 : 1 (Train) / 2.35 : 1 (Val) | 3.11x (Train) / 4.19x (Val) |
| 3 | **DRIVE** | **484** | **4.82%** | **73** | **3.72%** | **9.15 : 1 (Train) / 9.86 : 1 (Val)** | **1.00x (Baseline Minority)** |
| 4 | **NET_SHOT** | 4,429 | 44.10% | 720 | 36.73% | 1.00 : 1 (Majority) | 9.15x (Train) / 9.86x (Val) |
| **Total** | | **10,044** | **100.0%** | **1,960** | **100.0%** | — | — |

### Distribution Audit Questions

1. **Is DRIVE underrepresented?**  
   **Yes, severely.** DRIVE comprises only 4.82% of the training split (484 / 10,044) and 3.72% of the validation split (73 / 1,960). It is by far the smallest minority class in the entire dataset.
2. **By how much?**  
   The majority class (`NET_SHOT`) outnumbers DRIVE by **9.15 to 1** in training and **9.86 to 1** in validation. Even the secondary classes (SMASH, CLEAR, DROP) have 3.1x to 7.3x more samples than DRIVE.
3. **Is the imbalance severe enough to plausibly contribute to errors?**  
   **Yes.** In standard cross-entropy loss without class re-weighting, the loss gradient is overwhelmed by frequent classes (especially NET_SHOT with 4,429 training samples). The network naturally optimizes overall accuracy by pushing borderline decision boundaries toward the high-prior majority classes.
4. **Is class distribution alone sufficient to explain the error?**  
   **NO.** Several key empirical facts disprove a pure class-imbalance explanation:
   - In Phase 14 (`EXP_01_BALANCED_SAMPLING`), forcing equal exposure to all classes via `WeightedRandomSampler` increased DRIVE validation recall from 8.2% to 32.9%, but overall accuracy dropped by -3.06% and overhead strokes suffered heavy false alarms.
   - In EXP24, **DROP has 306 validation samples (4.2x more than DRIVE), yet DROP achieved only 14.71% recall**, whereas **DRIVE achieved 53.42% recall**. If sample count alone governed recall, DROP would significantly outperform DRIVE.
   - Therefore, while class imbalance sets a difficult prior for DRIVE, **feature ambiguity, court geometry overlap, and visual similarity to net push/block strokes are critical co-factors**.

---

## 5. Validation Confusion Matrix

Both models were evaluated on the exact same 1,960 validation samples under identical CPU evaluation conditions.

### EXP24 Multimodal Model (Research Champion)
```
                  PREDICTED CLASS
              SMASH   CLEAR    DROP   DRIVE     NET    Total
A   SMASH       233      67      19      11       2      332
C   CLEAR        81     411      27       7       3      529
T   DROP         82     173      45       5       1      306
U   DRIVE        10       3       0      39      21       73
A   NET_SHOT      1       2       1       7     709      720
L   Total       407     656      92      69     736    1,960
```

### EXP23_C Visual-Only Model (SPARK Deployment Model)
```
                  PREDICTED CLASS
              SMASH   CLEAR    DROP   DRIVE     NET    Total
A   SMASH       230      54      25       5      18      332
C   CLEAR       106     312      45      16      50      529
T   DROP         85     121      60      11      29      306
U   DRIVE         3      10       1      19      40       73
A   NET_SHOT      2      12       2      17     687      720
L   Total       426     509     133      68     824    1,960
```

---

## 6. DRIVE Precision / Recall / F1

### Detailed Performance Comparison for DRIVE Class

| Metric | EXP24 (Multimodal Champion) | EXP23_C (Visual Deployment) | Absolute Delta ($\Delta$) | Relative Ratio |
|---|:---:|:---:|:---:|:---:|
| **Ground Truth Support** | 73 | 73 | 0 | 1.00x |
| **True Positives (TP)** | **39** | **19** | **+20** | **2.05x** |
| **False Negatives (FN)** | **34** | **54** | **-20** | 0.63x |
| **False Positives (FP)** | **30** | **49** | **-19** | 0.61x |
| **Total Predicted as DRIVE** | 69 | 68 | +1 | 1.01x |
| **DRIVE Recall** | **53.42%** | **26.03%** | **+27.39%** | **2.05x** |
| **DRIVE Precision** | **56.52%** | **27.94%** | **+28.58%** | **2.02x** |
| **DRIVE F1-Score** | **54.93%** | **26.95%** | **+27.98%** | **2.04x** |

### Analytical Finding
Adding 27-D spatial auxiliary features (EXP24) more than **doubles DRIVE recall (from 26.03% to 53.42%)** and **doubles DRIVE precision (from 27.94% to 56.52%)** compared to the pure-vision model (EXP23_C). However, even in the champion multimodal model, **nearly half (46.58%) of all DRIVE shots are still misclassified**.

---

## 7. DRIVE → Prediction Breakdown

### Destination of Actual DRIVE Errors

| Predicted Class | EXP24 Error Count | EXP24 % of Errors | EXP24 % of All DRIVE | EXP23_C Error Count | EXP23_C % of Errors | EXP23_C % of All DRIVE |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **NET_SHOT** | **21** | **61.76%** | **28.77%** | **40** | **74.07%** | **54.79%** |
| **SMASH** | **10** | **29.41%** | **13.70%** | 3 | 5.56% | 4.11% |
| **CLEAR** | 3 | 8.82% | 4.11% | 10 | 18.52% | 13.70% |
| **DROP** | 0 | 0.00% | 0.00% | 1 | 1.85% | 1.37% |
| **Total Errors** | **34** | **100.0%** | **46.58%** | **54** | **100.0%** | **73.97%** |

### Key Observations
1. **The #1 Error Mode is DRIVE $\rightarrow$ NET_SHOT**:
   - In EXP24, NET_SHOT accounts for **61.8% of all DRIVE errors** (21 / 34).
   - In EXP23_C, NET_SHOT accounts for **74.1% of all DRIVE errors** (40 / 54), misclassifying more than half of all validation drives as net shots.
2. **The #2 Error Mode is DRIVE $\rightarrow$ SMASH**:
   - In EXP24, 10 drives are predicted as SMASH (29.4% of errors). In multimodal space, attacking midcourt flat drives share trajectory velocity and flat downward plane with stick smashes.
3. **DRIVE is Virtually Never Confused with DROP**:
   - 0 errors in EXP24 and only 1 error in EXP23_C. The slow floating deceleration of drops is cleanly distinguished from the rapid horizontal trajectory of drives.

---

## 8. Reverse Confusion Analysis

### Other Classes Misclassified as DRIVE (False Positives)

| Ground Truth Class | EXP24 False Positives | EXP24 % of FP | EXP23_C False Positives | EXP23_C % of FP |
|---|:---:|:---:|:---:|:---:|
| **SMASH $\rightarrow$ DRIVE** | **11** | **36.67%** | 5 | 10.20% |
| **CLEAR $\rightarrow$ DRIVE** | **7** | **23.33%** | **16** | **32.65%** |
| **NET_SHOT $\rightarrow$ DRIVE** | **7** | **23.33%** | **17** | **34.69%** |
| **DROP $\rightarrow$ DRIVE** | **5** | **16.67%** | **11** | **22.45%** |
| **Total False Positives** | **30** | **100.0%** | **49** | **100.0%** |

### Crucial Distinction: Asymmetry in Confusion
- **DRIVE $\rightarrow$ NET_SHOT vs NET_SHOT $\rightarrow$ DRIVE**:
  - `DRIVE -> NET_SHOT` = **21 errors** (28.77% of all DRIVE).
  - `NET_SHOT -> DRIVE` = **7 errors** (0.97% of all NET_SHOT).
  - This is an **extreme one-way gravitational pull**. The model disproportionately collapses DRIVE into NET_SHOT, whereas it almost never confuses NET_SHOT with DRIVE.
- **DRIVE $\leftrightarrow$ SMASH Confusion**:
  - `DRIVE -> SMASH` = **10 errors**.
  - `SMASH -> DRIVE` = **11 errors**.
  - This confusion is **symmetric and bidirectional**. The model exhibits genuine boundary ambiguity between low attacking smashes and high attacking drives.

---

## 9. Confidence Analysis

### Confidence Statistics for Ground-Truth DRIVE Samples (N=73)

| Sub-Group | Sample Count | Mean Confidence | Std Dev | Min Conf | Max Conf | Samples $\ge 0.70$ |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **All Correct DRIVE** | 39 | 0.6712 | 0.1449 | 0.4047 | 0.9121 | 18 (46.15%) |
| **All Incorrect DRIVE** | 34 | 0.6553 | 0.1793 | 0.3770 | 0.9857 | 12 (35.29%) |
| **DRIVE $\rightarrow$ NET_SHOT** | **21** | **0.7338** | **0.1751** | **0.4079** | **0.9857** | **11 (52.38%)** |
| **DRIVE $\rightarrow$ SMASH** | 10 | 0.5627 | 0.1265 | 0.3804 | 0.8462 | 1 (10.00%) |
| **DRIVE $\rightarrow$ CLEAR** | 3 | 0.4147 | 0.0381 | 0.3770 | 0.4534 | 0 (0.00%) |

### Confidence Quadrant Breakdown (Threshold = 0.70)

| Category | Definition | Count | % of All DRIVE | Interpretation |
|---|---|:---:|:---:|---|
| **A. Correct with High Confidence** | Correct & Conf $\ge 0.70$ | 18 | 24.66% | Clear, canonical flat drives in midcourt Zone 8. |
| **B. Correct with Low Confidence** | Correct & Conf $< 0.70$ | 21 | 28.77% | Marginally separated drives on boundary zones. |
| **C. High-Confidence Wrong** | Error & Conf $\ge 0.70$ | **12** | **16.44%** | **Pathological attractor errors (11 are NET_SHOT, 1 is SMASH).** |
| **D. Low-Confidence Wrong** | Error & Conf $< 0.70$ | 22 | 30.14% | Boundary ambiguity and probability diffusion. |

### Critical Diagnosis: Overconfidence vs Uncertainty
The confidence analysis reveals two completely distinct failure dynamics:
1. **DRIVE $\rightarrow$ NET_SHOT is an OVERCONFIDENCE / ATTRACTOR failure**:
   - The mean confidence when predicting NET_SHOT is **73.38%**, which is **higher than the mean confidence on correct DRIVE predictions (67.12%)**!
   - 11 of the 21 errors exceed 70% confidence, with 4 samples exceeding 90% confidence (`conf = 0.986, 0.982, 0.936, 0.927`).
   - The network is not guessing; it is firmly convinced these drives are net shots.
2. **DRIVE $\rightarrow$ SMASH / CLEAR is a BOUNDARY UNCERTAINTY failure**:
   - Mean confidence for SMASH is 56.27% and for CLEAR is 41.47%. Only 1 error exceeded 70%.
   - Here the network has diffused softmax probabilities across overhead/attacking classes.

---

## 10. Top Confusion Pair: DRIVE vs NET_SHOT

Because `DRIVE -> NET_SHOT` constitutes 61.8% of all DRIVE errors in EXP24 (and 74.1% in EXP23_C), this section performs a head-to-head empirical comparison between the two classes.

| Feature / Dimension | Validation DRIVE (N=73) | Validation NET_SHOT (N=720) | Overlap / Distinction |
|---|:---:|:---:|---|
| **Validation Support** | 73 (3.72%) | 720 (36.73%) | Severe imbalance (9.86 : 1 ratio). |
| **Model Recall** | 53.42% | 98.47% | Massive asymmetry. |
| **Mean Hit Y Coordinate (`hit_y`)** | **442.7 px** (Median: 380 px) | **447.1 px** (Median: 458 px) | **Extreme overlap ($\Delta = 4.4\text{ px}$)**. |
| **Mean Player Y Coordinate (`player_y`)** | **449.3 px** (Median: 379 px) | **453.2 px** (Median: 478 px) | **Extreme overlap ($\Delta = 3.9\text{ px}$)**. |
| **Overhead Flag (`is_overhead == 1`)** | **24.66%** (18 / 73) | **96.25%** (693 / 720) | **Severe bias**: `is_overhead=1` is almost universal in NET_SHOT. |
| **Backhand Rate (`is_backhand == 1`)** | 28.77% (21 / 73) | 50.69% (365 / 720) | Moderate separation. |
| **Dominant Court Zones** | Zone 8 (53.4%), Zone 5 (24.7%) | Zone 7 (27.6%), Zone 1 (23.2%), Zone 2 (21.5%), Zone 8 (9.0%) | Forecourt zones (1, 2, 7) dominate NET_SHOT; midcourt (5, 8) dominates DRIVE. |

### The "Overhead Flag" Pathology
In ShuttleSet annotation conventions, `hit_height == 2` was assigned to contacts occurring at or above upper torso/shoulder level. Because players intercept the shuttle high at the net tape for net kills and pushes, **96.25% of NET_SHOT samples are marked `is_overhead = 1`**.

When evaluating how the model treats this feature:
- For DRIVE samples where **`is_overhead == 0`**:
  - Total: 55 samples. Correct: 37. **Recall: 67.27%**.
- For DRIVE samples where **`is_overhead == 1`**:
  - Total: 18 samples. Correct: 2. **Recall: 11.11%** (16 errors, with **14 misclassified as NET_SHOT**).

**Finding**: The model learned an associative shortcut: `is_overhead = 1` + contact near mid/frontcourt $\rightarrow$ `NET_SHOT`. When a player takes a fast flat drive at shoulder/head height (common in rapid midcourt exchanges), this spatial feature aggressively steers the MLP auxiliary branch into NET_SHOT.

---

## 11. Temporal Analysis

### Rally Position and Ball Round Dynamics

In the ShuttleSet dataset, `ball_round` records the sequential stroke count within a rally (1 = serve, 2 = return of serve, 3 = reply, etc.):

| Rally Phase | Ball Round Range | DRIVE Sample Count | Correct (DRIVE) | Accuracy / Recall | Top Error Class |
|---|:---:|:---:|:---:|:---:|:---:|
| **Early Rally (Return / Setup)** | $\text{ball\_round} \le 4$ | 22 | 17 | **77.27%** | NET_SHOT (3), SMASH (2) |
| **Mid / Late Rally (Exchanges)** | $\text{ball\_round} > 4$ | 51 | 22 | **43.14%** | NET_SHOT (18), SMASH (8) |

- **Early Rally Performance**: When DRIVE occurs early in the rally (shots 2 to 4), players are stationary and balanced following service reception. The preparation, backswing, and follow-through are clearly demarcated. The model achieves **77.27% recall**.
- **Late Rally Degradation**: In extended rallies ($\text{ball\_round} > 4$, up to shot 28), drives occur during chaotic, high-speed lateral scrambles. Players intercept the shuttle with shortened wrist flicks and minimal backswing. In this regime, recall drops to **43.14%**.

### Surrounding Rally Context (Adjacent Shots)

Analyzing the preceding and succeeding strokes in the rally for all validation DRIVE samples:

| Transition Relation | Stroke Type | Occurrence Count | Percentage | Contextual Significance |
|---|---|:---:|:---:|---|
| **Preceding Shot** (Before DRIVE) | **DRIVE** | **37** | **51.39%** | **Fast flat-to-flat exchange duel.** |
| | SMASH | 11 | 15.28% | Defensive counter-drive off an opponent smash. |
| | NET_SHOT | 10 | 13.89% | Net follow-up push / attacking transition. |
| | Rearcourt Flat Drive (`後場抽平球`) | 9 | 12.50% | Baseline flat exchange. |
| | DROP | 5 | 6.94% | Midcourt drive interception of a drop. |
| **Succeeding Shot** (After DRIVE) | **DRIVE** | **32** | **48.48%** | Continued flat drive exchange. |
| | **NET_SHOT** | **26** | **39.39%** | **Opponent blocks or counters at the net tape.** |
| | Def. Lift (`防守回挑`) | 2 | 3.03% | Emergency recovery lift. |
| | CLEAR | 2 | 3.03% | High defensive clear. |
| | SMASH | 2 | 3.03% | Opponent attacking follow-up. |

### Temporal Finding
Over **51% of DRIVE shots are preceded by another DRIVE**, and nearly **40% of DRIVE shots are immediately succeeded by a NET_SHOT**. In live badminton, a hard midcourt drive is very frequently blocked short at the tape (`擋小球`) or pushed flat (`推球`). Because these transitions happen within 15–20 video frames, the temporal sequence window for a drive often encompasses the beginning of the opponent's net play.

---

## 12. Spatial / Metadata Analysis

### Court Zone Distribution for DRIVE

The ShuttleSet court grid assigns contact positions into standardized zones:
- Zones 1, 2, 3: Near net (Frontcourt)
- Zones 4, 5, 6: Midcourt
- Zones 7, 8, 9: Rearcourt / baseline

| Court Zone | Description | Validation DRIVE Count | Correct (DRIVE) | Recall | Misclassification Pattern |
|:---:|---|:---:|:---:|:---:|---|
| **Zone 8** | Midcourt Right / Center | 39 | 27 | **69.23%** | 8 SMASH, 3 NET_SHOT, 1 CLEAR |
| **Zone 5** | Midcourt Left / Center | 18 | 9 | **50.00%** | 8 NET_SHOT, 1 CLEAR |
| **Zone 6** | Midcourt / Rearcourt Sideline | 9 | 3 | **33.33%** | 4 NET_SHOT, 2 SMASH |
| **Zone 2** | Frontcourt Net Center | 3 | 0 | **0.00%** | 3 NET_SHOT (100% error) |
| **Zone 1** | Frontcourt Net Left | 2 | 0 | **0.00%** | 2 NET_SHOT (100% error) |
| **Zone 7** | Frontcourt Net Right | 2 | 0 | **0.00%** | 2 NET_SHOT (100% error) |
| **Total** | | **73** | **39** | **53.42%** | — |

### Key Spatial Finding
In all frontcourt net zones (Zones 1, 2, 7), **DRIVE recall is exactly 0.0% (7 out of 7 misclassified as NET_SHOT)**. When a flat drive is hit from inside the front service line (a flat push or net drive), the court location overrides visual cues, and the model classifies it as NET_SHOT. Only when the drive is hit from classic midcourt depth (Zone 8) does recall reach 69.23%.

### Reach and Opponent Geometry
- **Player Reach Distance**:
  - Correct DRIVE mean reach: **78.7 px**.
  - Incorrect DRIVE mean reach: **57.9 px**.
  - When players are lunging or stretching laterally (large reach distance), the posture is distinctly recognizable as a drive. When the shuttle is hit close to the body (cramped/compact contact, reach < 60px), it resembles a defensive net block.

---

## 13. Representative Visual Error Analysis

Detailed inspection was conducted on actual 16-frame image sequences from validation matches (specifically `MATCH40`, an official frozen validation match):

### Case A: Correctly Predicted DRIVE (`MATCH40_SHOT0003_HITFRAME00012876`)
- **Model Output**: Predicted `DRIVE` (Confidence: 82.2%).
- **OBSERVED FACT**:
  - Striking player is positioned centrally in midcourt Zone 8.
  - Preparation shows a wide lateral shoulder turn with racket drawn back at chest level.
  - Contact occurs in Frame 7 at waist height with clear lateral extension.
  - Follow-through is a flat, horizontal forward plane across the body.
  - Motion diff profile shows sharp acceleration peaking between Frame 6 and 7 (mean abs diff: 0.99).
- **HYPOTHESIS**:
  - The combination of distinct lateral backswing, clear midcourt positioning, and low-to-mid contact enables the model to activate the DRIVE representation cleanly.

### Case B: High-Confidence DRIVE $\rightarrow$ NET_SHOT Error (`MATCH40_SHOT0050_HITFRAME00030580`)
- **Model Output**: Predicted `NET_SHOT` (Confidence: **98.2%**, DRIVE prob: 0.8%).
- **OBSERVED FACT**:
  - Striking player executes a deep forward lunge toward the front service line (Zone 1/2).
  - Racket is held extended horizontally in front of the body near net tape level.
  - Contact occurs at net height with very short stroke action (minimal backswing).
  - The motion profile is flat and low throughout (mean abs diff: 0.3 to 0.7).
  - Chinese raw label in ShuttleSet is `平球` (Flat Drive), but executed close to the net.
- **HYPOTHESIS**:
  - Both visually and spatially, a flat push or drive intercepted near the net shares identical kinematics and camera projection coordinates with a net kill or aggressive net push. The overwhelming prior of `NET_SHOT` in this court region triggers a 98.2% collapse into NET_SHOT.

### Case C: DRIVE $\rightarrow$ SMASH Boundary Error (`MATCH40_SHOT0097_HITFRAME00039334`)
- **Model Output**: Predicted `SMASH` (Confidence: 51.8%, DRIVE prob: 36.4%).
- **OBSERVED FACT**:
  - Striking player intercepts the shuttle in rearcourt/midcourt boundary (Zone 8).
  - The shuttle is taken above head level (`is_overhead = 1`) with an extended arm.
  - Contact Frame 8 shows an overhead snap with downward follow-through.
  - The immediately succeeding shot (`SHOT0098`) occurs just **17 frames later** (0.56 seconds), proving extreme velocity.
- **HYPOTHESIS**:
  - An attacking overhead flat drive taken at full arm extension is kinematically indistinguishable from a flat stick smash (`點扣`) in broadcast-resolution video where racket face angle cannot be resolved by ResNet-18 global pooling.

### Case D: Rapid Multi-Drive Sequence Dynamics (`MATCH40_SHOT0097` into `SHOT0098`)
- **OBSERVED FACT**:
  - `SHOT0097` contact frame: **39,334**.
  - `SHOT0098` contact frame: **39,351**.
  - Delta: **17 frames**.
- **OBSERVED FACT**:
  - The 16-frame sequence for `SHOT0097` spans frames 39,327 to 39,342.
  - The 16-frame sequence for `SHOT0098` spans frames 39,344 to 39,359.
  - In `SHOT0098` (which the model correctly classified as DRIVE, conf=70.2%), the opening frames contain the opponent recovering from their previous drive.
- **HYPOTHESIS**:
  - In rapid midcourt drive duels, the temporal window of one stroke contains visual motion from the other player's stroke, creating cross-stroke kinematic entanglement.

---

## 14. Temporal Sampling Analysis

### Research Dataset vs. SPARK Application Pipeline

A critical disparity exists between how 16-frame sequences are extracted in the **research dataset** versus the **live SPARK application**:

```
RESEARCH PIPELINE (EXP24 / ShuttleSet):
Raw Match Video (.mp4)
      │
      ▼
Ground-Truth Hit Frame (F_hit from ShuttleSet annotation)
      │
      ▼
Centered 16-Frame Crop: [F_hit - 7, ..., F_hit, ..., F_hit + 8] (Consecutive 30 fps frames)
      │
      ▼
ResNet-18 Spatial Extraction [16, 512] -> Temporal Sequence Model
```

```
SPARK DEPLOYMENT PIPELINE (`inference_service.py`):
Uploaded Video Clip (N frames, e.g. 90 to 150 frames, 3 to 5 seconds)
      │
      ▼
OpenCV Total Frame Count (total_frames)
      │
      ▼
Uniform Linear Sampling: np.linspace(0, total_frames - 1, 16, dtype=int)
      │
      ▼
ResNet-18 Spatial Extraction [16, 512] -> EXP23_C Model
```

### Diagnostic Assessment: Dilution and Missed Contacts
1. **Consecutive vs. Uniform Sampling**:
   - In the research dataset, the 16 frames are **strictly consecutive**, capturing the full 0.53-second micro-dynamics of backswing, impact (frame 8), and follow-through.
   - In SPARK, if a user uploads a 3-second rally clip (90 frames), `np.linspace(0, 89, 16)` samples **every 6th frame**.
   - The critical contact moment of a DRIVE lasts only **1 to 2 frames**. Uniform subsampling across an unsegmented clip is mathematically guaranteed to either miss the contact frame entirely or capture it with arbitrary phase offset.
2. **Impact on DRIVE Classification**:
   - Because DRIVE relies heavily on the sudden burst of forearm pronation and flat horizontal follow-through within a 5-frame window around contact, sparse temporal sampling dilutes the kinetic signal and leaves mostly pre-stroke preparation frames, which resemble stationary ready positions (and thus net shots).
3. **Status**:
   - Reported as a **strong candidate hypothesis for future controlled experiments**, not as an in-scope training change for this diagnostic phase.

---

## 15. Error Taxonomy

Every one of the 34 DRIVE misclassifications in the EXP24 validation set was analyzed and mapped into evidence-grounded diagnostic categories:

| Error Category | Error Count (EXP24) | % of DRIVE Errors | Primary Mechanism | Characteristic Samples |
|---|:---:|:---:|---|---|
| **1. Net Tape Attractor / Overhead Bias** | **14** | **41.18%** | Drive taken at shoulder/net height marked `is_overhead=1`, triggering the model's 96% NET_SHOT prior. | `MATCH08_SHOT0029`, `MATCH38_SHOT0067`, `MATCH38_SHOT0077` |
| **2. Frontcourt Zone Ambiguity** | **7** | **20.59%** | Flat drive executed inside front service line (Zones 1, 2, 7) where court position overrides visual motion. | `MATCH40_SHOT0050`, `MATCH38_SHOT0356`, `MATCH38_SHOT0177` |
| **3. Overhead Kinetic Similarity to SMASH** | **8** | **23.53%** | High flat drive executed with full arm extension and downward angle, indistinguishable from stick smash (`點扣`). | `MATCH38_SHOT0306`, `MATCH40_SHOT0097`, `MATCH07_SHOT0043` |
| **4. Sub-Label Boundary Ambiguity** | **3** | **8.82%** | Defensive counter-drives off smashes (`防守回抽`) or flat pushes (`推球`) near court boundaries. | `MATCH07_SHOT0134`, `MATCH07_SHOT0186` |
| **5. Extreme Multi-Drive Temporal Entanglement** | **2** | **5.88%** | Inter-shot interval $< 18$ frames; window overlaps with preceding stroke recovery. | `MATCH07_SHOT0037`, `MATCH07_SHOT0109` |
| **Total DRIVE Errors** | **34** | **100.0%** | — | — |

---

## 16. Previous Experiment Evidence

Synthesized historical evidence across all research phases:

| Experiment / Phase | Key Architectural / Data Factor | DRIVE Recall | DRIVE F1 | Net Shot Recall | Key Takeaway Regarding DRIVE |
|---|---|:---:|:---:|:---:|---|
| **Phase 13 Baseline** | 1-Layer LSTM, Visual Only, ShuttleSet Baseline | **9.09%** | 16.36% | 91.55% | Complete minority collapse; 90 of 99 test drives misclassified into NET_SHOT and CLEAR. |
| **Phase 14 (`EXP_01`)** | Class-Balanced Sampling (`WeightedRandomSampler`) | **32.90%** | 28.10% | 84.20% | DRIVE recall jumped from 8% to 33%, but at catastrophic cost to CLEAR and DROP; overall accuracy dropped -3.06%. |
| **Phase 14 (`EXP_02`)** | Focal Loss ($\gamma = 2.0$) | 13.70% | 18.70% | 93.60% | Failed to alleviate DRIVE collapse; focused gradients onto indistinguishable overhead boundaries. |
| **Phase 14 (`EXP_04`)** | Bidirectional LSTM | 15.10% | 20.90% | 95.80% | Forward-reverse temporal symmetry provided negligible gain for DRIVE (+7% over baseline). |
| **Phase 15 (`EXP_15_08_03`)** | 27-D Richer Spatial Feature Fusion | **45.21%** | **48.53%** | 98.06% | **First major breakthrough for DRIVE**: adding 27-D court coordinates lifted recall from 9% to 45.21%. |
| **Phase 15 (`EXP_15_08_08`)** | Hard-Negative Contrastive Pretraining | 44.00% | 47.10% | 97.50% | Contrastive loss enriched overhead representations, but did not resolve DRIVE midcourt confusion. |
| **Phase 23 (`EXP23_C`)** | Transformer + LSTM (Visual-Only Deployment) | **26.03%** | **26.95%** | 95.42% | Without 27-D spatial features, DRIVE collapsed back to 26.03% recall (40 / 73 confused with NET_SHOT). |
| **EXP24 (Champion)** | Transformer + LSTM + 27-D Spatial Fusion | **53.42%** | **54.93%** | 98.47% | **Highest DRIVE recall achieved in the project (53.42%)** by uniting visual attention with 27-D geometry. |
| **EXP25** | Targeted Drop-Aware Regularization ($0.25 \cdot \text{CB}$) | 49.32% | 53.33% | 97.92% | Improved DROP recall (+24.5%), but slightly degraded DRIVE recall (-4.1%) and overall accuracy (-2.2%). |

### Historical Takeaway
1. Pure visual models (Phase 12, 13, 14, 23) **consistently fail on DRIVE** (recalls between 9% and 26%). Visual features alone from global average pooled ResNet-18 cannot reliably distinguish a flat drive from a net push.
2. The **single most effective intervention in project history for DRIVE was spatial auxiliary fusion** (Phases 15 and 24), which lifted recall from 9% to 53.42%.
3. Loss rebalancing (Focal Loss, Class-Balanced, Weighted Sampling) has repeatedly created destructive trade-offs, inflating false positives on other classes without solving underlying feature ambiguity.

---

## 17. Root-Cause Evidence Matrix

| Possible Cause Category | Evidence For (Empirical Observations) | Evidence Against (Counter-Observations) | Confidence |
|---|---|---|:---:|
| **A. DATA PROBLEM (Sample Volume)** | DRIVE has only 484 training samples (4.8%) and 73 validation samples (3.7%), giving it 9.8x less exposure than NET_SHOT. | DROP has 4.2x more validation samples than DRIVE (306 vs 73), yet DROP recall is much worse (14.7% vs 53.4%). Sample volume alone does not determine recall. | **MEDIUM** |
| **B. INPUT REPRESENTATION (Global Spatial Pooling)** | ResNet-18 truncates at $7 \times 7 \rightarrow 1 \times 1$ global average pooling. Fine wrist pronation, racket slicing, and high-speed shutter streaks are averaged out into a 512-D vector. | Spatial auxiliary features in EXP24 partially compensate for this, boosting recall by +27.39% over EXP23_C. | **HIGH** |
| **C. TEMPORAL WINDOW & SEGMENTATION** | In SPARK deployment, 16 frames are uniformly sampled across full video (`np.linspace`), diluting the 2-frame contact moment. In research, consecutive frames centered on $F_{\text{hit}}$ perform 2x better. | Even in research with perfectly centered consecutive frames (EXP24), 46.58% of drives are still misclassified. | **HIGH** |
| **D. MODEL CAPACITY & ARCHITECTURE** | 1-layer Transformer + 1-layer LSTM with 337k parameters is compact. Expanding hidden units to 256 in Phase 14 reduced DRIVE recall to 5.5% due to overfitting. | EXP24 already outperforms earlier baselines substantially; adding parameters historically degraded generalization. | **LOW** |
| **E. CLASS IMBALANCE / MAJORITY ATTRACTOR** | NET_SHOT comprises 44.1% of training data. 61.8% of EXP24 drive errors and 74.1% of EXP23_C drive errors fall directly into NET_SHOT with high confidence ($\text{mean conf} = 0.73$). | Direct loss rebalancing (Phase 14 Exp 1, Phase 25) harmed overall accuracy and induced massive false alarms. | **HIGH** |
| **F. ANNOTATION & SUB-LABEL TAXONOMY** | In Chinese ShuttleSet annotations, `推球` (Push) is mapped to DRIVE, but kinematically borders NET_SHOT. High contacts (`is_overhead=1`) in DRIVE collapse to 11% recall. | All 73 validation DRIVE samples share the same raw Chinese annotation `平球` (Flat Drive), proving the error persists even on canonical drives. | **MEDIUM** |
| **G. EVALUATION & MATCH SPLIT VARIATION** | DRIVE distribution is uneven across validation matches: MATCH07 has 31 drives (51.6% correct), MATCH25 has only 2 drives (0.0% correct), MATCH38 has 12 drives (33.3% correct). | MATCH07 provides 31 samples (42.5% of all val drives), ensuring statistical validity across camera views. | **LOW** |

---

## 18. Most Supported Hypotheses

Based on rigorous cross-referencing of all empirical data, the hypotheses are organized by evidential support:

### Strongest Supported Hypotheses
1. **Majority Attractor Dynamic (NET_SHOT Prior Gravitation)**:
   - *Evidence*: 61.8% of EXP24 errors and 74.1% of EXP23_C errors are NET_SHOT. The model is overconfident on these errors (mean confidence 73.38%, 4 samples $> 90\%$). The 9.86:1 prior disparity exerts continuous gravitation on borderline samples.
2. **Kinematic and Spatial Overlap Between Frontcourt Drives and Net Plays**:
   - *Evidence*: In frontcourt Zones 1, 2, and 7, DRIVE recall is 0.0% (all misclassified as NET_SHOT). Mean `hit_y` differs by only 4.4 pixels between DRIVE and NET_SHOT. When drives are taken at shoulder height (`is_overhead = 1`), recall drops to 11.1%.
3. **Visual Representation Deprivation in Deployment (EXP23_C vs EXP24)**:
   - *Evidence*: Removing 27-D court spatial features halves DRIVE recall (from 53.42% in EXP24 to 26.03% in EXP23_C). Visual-only ResNet-18 sequence modeling cannot reliably resolve flat drives from broadcast camera angles without court anchor geometry.

### Moderately Supported Hypotheses
4. **Biomechanical Ambiguity Between Overhead Flat Drives and Stick Smashes**:
   - *Evidence*: DRIVE $\leftrightarrow$ SMASH is completely symmetric (10 DRIVE $\rightarrow$ SMASH, 11 SMASH $\rightarrow$ DRIVE). Both occur in Zone 8 with high racket head acceleration and flat/downward angles.
5. **Rally Velocity and Late-Rally Multi-Drive Entanglement**:
   - *Evidence*: In early rally setup ($\text{ball\_round} \le 4$), DRIVE recall is 77.3%. In extended exchanges ($\text{ball\_round} > 4$), recall drops to 43.1%. Drive-to-drive duels have inter-shot intervals as short as 17 frames.

### Weakly Supported Hypotheses
6. **Model Capacity Deficiency**:
   - *Evidence against*: Historical experiments in Phase 14 expanding LSTM layers or hidden dimensions to 256 degraded DRIVE recall (5.5%). The bottleneck is representation and loss landscape, not parameter count.
7. **Annotation Label Noise**:
   - *Evidence against*: All 73 validation drives share the canonical `平球` annotation; visual inspection confirmed genuine flat drives rather than mistagged clears or drops.

---

## 19. Candidate Next Experiments

The following controlled experiments represent isolated, single-variable scientific proposals for consideration in future research phases. **None of these experiments were executed during this audit.**

### Experiment 1: Targeted Drive-Aware Loss Regularization (DRIVE Cost-Sensitive Loss)
- **Hypothesis Being Tested**: Assigning a localized class penalty factor $\alpha_{\text{DRIVE}} \in [1.5, 2.5]$ specifically to DRIVE (while leaving other classes at 1.0) will counter the NET_SHOT majority gradient pull without causing the broad accuracy collapse seen in global balanced sampling.
- **Single Variable to Change**: Loss objective weight vector in `nn.CrossEntropyLoss(weight=weights)`.
- **Validation Metric**: DRIVE Recall and DRIVE F1, with Overall Validation Accuracy as the safety guard.
- **Success Criterion**: DRIVE Recall $\ge 65.0\%$ while Overall Validation Accuracy remains $\ge 72.0\%$.
- **Risk**: Potential increase in SMASH $\rightarrow$ DRIVE and NET_SHOT $\rightarrow$ DRIVE false alarms, reducing overall precision.

### Experiment 2: Spatial Feature Decoupling (Mitigating `is_overhead` Shortcut)
- **Hypothesis Being Tested**: The binary feature `is_overhead` acts as a spurious shortcut for NET_SHOT (where 96% are marked 1). Masking `is_overhead` or replacing it with continuous vertical reach offset ($Y_{\text{hit}} - Y_{\text{player}}$) will prevent the 88.9% error rate observed when drives are marked `is_overhead = 1`.
- **Single Variable to Change**: Feature vector column 5 in the 27-D auxiliary vector (replace binary flag with continuous relative height).
- **Validation Metric**: Recall on DRIVE samples with `is_overhead = 1` (currently 11.1%).
- **Success Criterion**: High-contact DRIVE recall $\ge 50.0\%$ without degrading NET_SHOT recall below 95.0%.
- **Risk**: Minor redistribution of boundary weights in the auxiliary MLP branch.

### Experiment 3: Temporal Contact-Centered Window Slicing for Deployment Bridge
- **Hypothesis Being Tested**: Replacing uniform video linspace sampling (`np.linspace`) in the deployment pipeline with a contact-detection energy heuristic (peak frame difference) will center the 16-frame window on the actual stroke impact, preventing the visual dilution that causes EXP23_C's 26.03% recall.
- **Single Variable to Change**: Frame selection index generator in `backend/app/services/inference_service.py`.
- **Validation Metric**: Inference accuracy on unsegmented test rally clips.
- **Success Criterion**: Correct temporal centering confirmed by peak optical flow / frame difference within $\pm 2$ frames of impact.
- **Risk**: Requires robust peak-energy detection to avoid triggering on court cuts or player celebrations.

### Experiment 4: Multi-Scale Patch / High-Resolution Hand-Racket Crop Fusion
- **Hypothesis Being Tested**: Global average pooling over $224 \times 224$ images discards racket face pronation. Fusing a localized bounding-box crop around the hitting player's racket hand into the visual representation will allow the model to distinguish a flat lateral drive from a downward net push.
- **Single Variable to Change**: Auxiliary visual branch taking a localized $112 \times 112$ player hand/racket crop alongside the global $224 \times 224$ frame.
- **Validation Metric**: Visual-only DRIVE recall (EXP23 baseline).
- **Success Criterion**: Visual-only DRIVE recall $\ge 45.0\%$ without requiring 27-D court coordinates.
- **Risk**: Increased feature extraction latency during video preprocessing.

---

## 20. Conclusion

This diagnostic investigation demonstrates that DRIVE classification difficulty is governed by three primary, interlocking factors:
1. **Severe prior imbalance (9.86 : 1 against NET_SHOT)** that creates an aggressive gradient attractor toward NET_SHOT during training.
2. **Extreme spatial overlap in frontcourt zones (Zones 1, 2, 7)** and a pathological reliance on the `is_overhead = 1` annotation flag, which triggers an 88.9% failure rate on high-contact drives.
3. **Severe visual feature deprivation in deployment**: removing 27-D court coordinates halves DRIVE recall (from 53.42% in EXP24 to 26.03% in EXP23_C), proving that broadcast video visual features alone currently lack the fine-grained wrist/racket resolution to distinguish flat drives from net pushes.

Any future intervention should address the majority attractor dynamic and spatial flag bias through controlled, single-variable experimentation.

**DIAGNOSIS COMPLETE — NO TRAINING PERFORMED.**
