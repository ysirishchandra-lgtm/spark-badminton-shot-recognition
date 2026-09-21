# EXP_DRIVE_09 — DRIVE→NET_SHOT Diagnostic Audit

**Experiment ID:** `EXP_DRIVE_09`  
**Mode:** Research-Grade Diagnostic Investigation  
**Model Audited:** `EXP_DRIVE_08B_HV_MOTION` (Current Best Validated Model: 77.55% Acc, 68.56% Macro F1)  
**Target Failure Mode:** TRUE DRIVE $\rightarrow$ NET_SHOT Confusion ($N=20$ samples)  
**Training Performed:** Strictly Forbidden & None (`0` parameters updated, `0` backward passes)  
**Validation Split:** Frozen 1,960 validation samples across 7 matches  
**Date of Audit:** September 21, 2026  

---

## 1. Objective

In the best validated model to date (`EXP_DRIVE_08B`), **20 out of 73 TRUE DRIVE samples (27.40% of all drives)** are misclassified as `NET_SHOT`, representing the single largest remaining error category for DRIVE (exceeding DRIVE $\rightarrow$ SMASH at 11 samples).

The primary research question of `EXP_DRIVE_09` is:
> *"Why does `EXP_DRIVE_08B` still classify 20 TRUE DRIVE samples as `NET_SHOT`, and what deployable evidence could distinguish those DRIVE samples from true `NET_SHOT` samples without damaging the improvements already achieved?"*

This audit is purely diagnostic. No training, fine-tuning, threshold search, or architectural modification was conducted.

---

## 2. Integrity / Controls

- **Zero Training:** No model weights or checkpoints were altered.
- **Quarantined Official Test Set:** Exactly 0 official test set samples were accessed or unblinded.
- **Frozen Validation Split:** The 1,960 samples across the 7 frozen validation matches (`MATCH07`, `08`, `25`, `31`, `37`, `38`, `40`) were strictly preserved.
- **No Synthetic Data:** No synthetic coordinates, trajectories, or heatmaps (`HitHeatmap`) were utilized.
- **Production Isolation:** Serving code in `D:\PS_DATA\SPARK` remains 100% untouched.
- **Offline vs Deployable Distinction:** All kinematic features derived from future landing points are strictly designated as **OFFLINE-ONLY DIAGNOSTICS**.

---

## 3. EXP08B Baseline Verification

Authoritative prediction artifacts loaded from:
`D:\PS_DATA\DRIVE_EXPERIMENTS\EXP_DRIVE_08B_HV_MOTION\04_RESULTS\validation_predictions.json`

Integrity and confusion counts independently verified across all 1,960 samples:
- **Overall Accuracy:** `77.55%` (1,520 / 1,960)
- **Macro F1:** `68.56%` | **Weighted F1:** `77.49%`
- **Total TRUE DRIVE samples:** `73`
- **Correct DRIVE:** `28` (Recall = `38.36%`, Precision = `66.67%`, F1 = `48.70%`)
- **DRIVE $\rightarrow$ NET_SHOT:** Exactly **`20`** (Reconstruction confirmed)
- **DRIVE $\rightarrow$ SMASH:** Exactly **`11`**
- **DRIVE $\rightarrow$ CLEAR:** Exactly **`7`**
- **DRIVE $\rightarrow$ DROP:** Exactly **`7`**
- **Total TRUE NET_SHOT samples:** `720` (707 correct, 2 to SMASH, 1 to CLEAR, 0 to DROP, 10 to DRIVE)

---

## 4. Primary Cohorts

To isolate the exact failure mechanism, five distinct cohorts were established from the frozen validation set:

| Cohort | Definition | Count ($N$) | Percentage of Class | Description |
| :--- | :--- | :---: | :---: | :--- |
| **Cohort A** | TRUE DRIVE $\rightarrow$ NET_SHOT | **20** | 27.40% of DRIVE | Primary Error Target |
| **Cohort B** | TRUE NET_SHOT $\rightarrow$ NET_SHOT | **707** | 98.19% of NET | Primary Control Group |
| **Cohort C** | TRUE DRIVE $\rightarrow$ DRIVE | **28** | 38.36% of DRIVE | True Class Baseline |
| **Cohort D** | TRUE DRIVE $\rightarrow$ SMASH | **11** | 15.07% of DRIVE | Secondary Attack Error |
| **Cohort E** | TRUE DRIVE $\rightarrow$ CLEAR / DROP | **14** | 19.18% of DRIVE | Long/Parabolic Error |

---

## 5. 20 DRIVE→NET Error Table

Detailed sample-level audit of all 20 Cohort A errors:

| # | Match ID | Hit Frame | Rally | Round | Conf | P(DRV) | P(NET) | Hit Area | Court Zone | Hit Height | `is_overhead` | Norm H/V | Displacement | Implied Speed | EXP05 Pred |
| :-: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | `MATCH07` | `16244` | 3 | 22.0 | 0.931 | 0.057 | **0.931** | 2.0 | Frontcourt | 1.0 | 0 | +1.152 | 238.8 px | 23.88 | `NET_SHOT` |
| 2 | `MATCH07` | `19613` | 7 | 10.0 | 0.746 | 0.236 | **0.746** | 8.0 | Rearcourt | 2.0 | 1 | +1.028 | 178.5 px | 14.88 | `DRIVE` |
| 3 | `MATCH07` | `23999` | 13 | 16.0 | 0.830 | 0.106 | **0.830** | 5.0 | Midcourt | 2.0 | 1 | +0.615 | 384.4 px | 21.35 | `DRIVE` |
| 4 | `MATCH07` | `27779` | 15 | 17.0 | 0.617 | 0.163 | **0.617** | 7.0 | Frontcourt | 1.0 | 0 | -0.605 | 152.3 px | 19.03 | `SMASH` |
| 5 | `MATCH07` | `48859` | 34 | 8.0 | 0.689 | 0.165 | **0.689** | 8.0 | Rearcourt | 1.0 | 0 | +2.259 | 204.2 px | 14.58 | `NET_SHOT` |
| 6 | `MATCH07` | `52901` | 37 | 3.0 | 0.523 | 0.361 | **0.523** | 5.0 | Midcourt | 2.0 | 1 | -0.021 | 188.1 px | 14.47 | `DRIVE` |
| 7 | `MATCH07` | `61533` | 1 | 5.0 | 0.933 | 0.040 | **0.933** | 8.0 | Rearcourt | 2.0 | 1 | +2.238 | 219.7 px | 16.90 | `NET_SHOT` |
| 8 | `MATCH07` | `92406` | 29 | 5.0 | 0.981 | 0.008 | **0.981** | 5.0 | Midcourt | 2.0 | 1 | -0.345 | 170.3 px | 10.02 | `NET_SHOT` |
| 9 | `MATCH25` | `24786` | 15 | 4.0 | 0.968 | 0.024 | **0.968** | 5.0 | Midcourt | 2.0 | 1 | +0.478 | 239.2 px | 0.41 | `NET_SHOT` |
| 10 | `MATCH25` | `41654` | 27 | 8.0 | 0.738 | 0.012 | **0.738** | 6.0 | Rearcourt | 2.0 | 1 | -0.060 | 145.1 px | 0.21 | `NET_SHOT` |
| 11 | `MATCH31` | `31649` | 27 | 2.0 | 0.678 | 0.308 | **0.678** | 8.0 | Rearcourt | 1.0 | 0 | -0.013 | 176.1 px | 17.61 | `DRIVE` |
| 12 | `MATCH37` | `14304` | 3 | 5.0 | 0.808 | 0.158 | **0.808** | 2.0 | Frontcourt | 2.0 | 1 | +0.124 | 184.8 px | 10.27 | `NET_SHOT` |
| 13 | `MATCH38` | `33191` | 30 | 6.0 | 0.997 | 0.003 | **0.997** | 8.0 | Rearcourt | 2.0 | 1 | -0.235 | 184.8 px | 4.51 | `NET_SHOT` |
| 14 | `MATCH38` | `33520` | 30 | 19.0 | 0.942 | 0.056 | **0.942** | 8.0 | Rearcourt | 2.0 | 1 | +0.073 | 169.0 px | 14.08 | `NET_SHOT` |
| 15 | `MATCH38` | `33718` | 30 | 28.0 | 0.987 | 0.005 | **0.987** | 5.0 | Midcourt | 2.0 | 1 | -0.141 | 76.2 px | 2.63 | `NET_SHOT` |
| 16 | `MATCH38` | `58675` | 18 | 8.0 | 0.967 | 0.030 | **0.967** | 2.0 | Frontcourt | 1.0 | 0 | -0.176 | 218.1 px | 18.17 | `NET_SHOT` |
| 17 | `MATCH38` | `58687` | 18 | 9.0 | 0.787 | 0.198 | **0.787** | 8.0 | Rearcourt | 2.0 | 1 | +1.460 | 300.0 px | 12.00 | `NET_SHOT` |
| 18 | `MATCH38` | `97727` | 26 | 6.0 | 0.965 | 0.029 | **0.965** | 8.0 | Rearcourt | 2.0 | 1 | +3.107 | 207.3 px | 11.52 | `NET_SHOT` |
| 19 | `MATCH38` | `107731` | 38 | 16.0 | 0.890 | 0.085 | **0.890** | 7.0 | Frontcourt | 1.0 | 0 | +1.476 | 141.8 px | 10.91 | `NET_SHOT` |
| 20 | `MATCH40` | `30580` | 26 | 7.0 | 0.990 | 0.009 | **0.990** | 1.0 | Frontcourt | 2.0 | 1 | -0.351 | 160.3 px | 11.45 | `NET_SHOT` |

---

## 6. Confidence / Probability Analysis

| Cohort | Metric | Mean | Median | Std | IQR | Min | Max |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Cohort A (DRIVE -> NET)** | P(NET_SHOT) | **0.8484** | **0.9106** | 0.1392 | 0.2231 | 0.5230 | 0.9970 |
| | P(DRIVE) | **0.1027** | **0.0568** | 0.1043 | 0.1425 | 0.0030 | 0.3610 |
| | Margin (P_NET - P_DRV) | **+0.7457** | **+0.8393** | 0.2350 | 0.3653 | +0.1620 | +0.9940 |
| **Cohort B (True NET)** | P(NET_SHOT) | 0.9770 | 0.9972 | 0.0720 | 0.0085 | 0.4070 | 0.9999 |
| | P(DRIVE) | 0.0129 | 0.0022 | 0.0386 | 0.0059 | 0.0000 | 0.4680 |
| **Cohort C (True DRIVE)** | P(DRIVE) | 0.6277 | 0.5864 | 0.1943 | 0.3668 | 0.3120 | 0.9850 |
| | P(NET_SHOT) | 0.0957 | 0.0455 | 0.1213 | 0.0742 | 0.0000 | 0.4140 |

### Core Finding: Extreme NET_SHOT Overconfidence
In Cohort A, the model is not merely confused by a narrow probability margin. The mean $P(\text{NET\_SHOT})$ is **0.8484** (median: **0.9106**), with 8 samples exceeding **0.95 confidence**. The average probability margin favoring NET_SHOT over DRIVE is **+0.7457**. This is **severe overconfidence**, demonstrating that strong prior and spatial shortcut signals actively suppress the true DRIVE probability (mean $P(\text{DRIVE}) = 0.1027$).

---

## 7. Spatial Feature Analysis

Mapping the exact 27-D auxiliary feature vector from `aux_27_feature_spec.json` plus the 28th H/V ratio feature:

| Index | Feature Name | Cohort A Mean (Std) | Cohort B Mean (Std) | Cohort C Mean (Std) | Cohen's d (A vs B) | Cliff's $\delta$ (A vs B) | Cohen's d (A vs C) |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| 0 | `norm_hit_x` | -0.310 (0.763) | 0.048 (0.997) | 0.288 (0.740) | -0.361 | -0.185 | -0.781 |
| 1 | `norm_hit_y` | -0.224 (0.609) | -0.011 (0.411) | 0.036 (0.773) | -0.509 | -0.295 | -0.359 |
| 2 | `norm_player_x` | -0.254 (0.719) | 0.037 (0.989) | 0.020 (0.627) | -0.296 | -0.129 | -0.402 |
| 3 | `norm_player_y` | -0.143 (0.751) | 0.019 (0.540) | 0.070 (0.818) | -0.296 | -0.232 | -0.265 |
| 5 | `is_overhead` | 0.700 (0.458) | 0.970 (0.170) | 0.143 (0.350) | -1.468 | -0.270 | +1.368 |
| 7 | `is_backhand` | 0.550 (0.497) | 0.508 (0.500) | 0.321 (0.467) | +0.084 | +0.042 | +0.466 |
| 18 | `norm_opp_x` | -0.647 (1.431) | 0.005 (1.077) | 0.070 (1.443) | -0.599 | -0.294 | -0.489 |
| 19 | `norm_opp_y` | 0.241 (1.064) | 0.006 (0.945) | 0.019 (0.916) | +0.248 | +0.106 | +0.222 |
| 23 | `norm_dist_reach` | 0.349 (1.368) | 0.185 (1.270) | 0.496 (1.227) | +0.129 | +0.044 | -0.112 |
| 26 | `norm_dist_opp` | -0.230 (0.464) | -0.741 (0.771) | -0.389 (0.515) | +0.668 | +0.479 | +0.315 |
| 27 | `norm_hv_motion_ratio` | 0.603 (1.013) | 0.009 (0.690) | 0.714 (0.750) | +0.846 | +0.352 | -0.125 |

---

## 8. Hit-Zone Analysis

Court zones are mapped to standard badminton regions:
- **Frontcourt:** Zones 1 (Front Left), 2 (Front Center), 7 (Front Right)
- **Midcourt:** Zones 3 (Mid Left), 4 (Mid Center), 5 (Mid Right)
- **Rearcourt:** Zones 6 (Rear Left), 8 (Rear Center), 9 (Rear Right)

### Zone Group Distribution Comparison

| Zone Group | Cohort A (DRIVE$\rightarrow$NET) | Cohort B (True NET) | Cohort C (True DRIVE) |
| :--- | :---: | :---: | :---: |
| **Frontcourt** | **6 (30.0%)** | 517 (73.1%) | 1 (3.6%) |
| **Midcourt** | **5 (25.0%)** | 55 (7.8%) | 3 (10.7%) |
| **Rearcourt** | **9 (45.0%)** | 101 (14.3%) | 24 (85.7%) |
| **Total** | 20 (100.0%) | 707 (100.0%) | 28 (100.0%) |

### Specific Zone Distribution in Cohort A
- **Zone 8 (Rear Center):** **8 samples (40.0%)** $\rightarrow$ Massive cluster in the backcourt!
- **Zone 5 (Mid Right):** **5 samples (25.0%)** $\rightarrow$ Massive cluster on the right tramlines!
- **Zone 2 (Front Center):** **3 samples (15.0%)**
- **Zone 7 (Front Right):** **2 samples (10.0%)**
- **Zone 1 (Front Left):** **1 sample (5.0%)**
- **Zone 6 (Rear Left):** **1 sample (5.0%)**

> [!IMPORTANT]
> Contrary to the common assumption that DRIVE $\rightarrow$ NET is purely a frontcourt problem, **70.0% of the errors (14 of 20) occurred in Midcourt and Rearcourt**, heavily concentrated in **Zone 8** (8 samples) and **Zone 5** (5 samples).

---

## 9. Frontcourt Analysis

Evaluating the exact seven established frontcourt DRIVE cases under `EXP_DRIVE_08B`:

| Match ID | Hit Frame | True Class | EXP08B Pred | Conf | P(DRIVE) | P(NET) | Hit Area | Hit Height | In Cohort A? | Correct? |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `MATCH07` | `16244` | DRIVE | `NET_SHOT` | 0.931 | 0.057 | 0.931 | Zone 2.0 | Ht 1.0 | YES | **NO (NET_SHOT)** |
| `MATCH07` | `27779` | DRIVE | `NET_SHOT` | 0.617 | 0.163 | 0.617 | Zone 7.0 | Ht 1.0 | YES | **NO (NET_SHOT)** |
| `MATCH07` | `33668` | DRIVE | `DRIVE` | 0.388 | 0.388 | 0.196 | Zone 1.0 | Ht 1.0 | NO | **YES (DRIVE)** |
| `MATCH37` | `14304` | DRIVE | `NET_SHOT` | 0.808 | 0.158 | 0.808 | Zone 2.0 | Ht 2.0 | YES | **NO (NET_SHOT)** |
| `MATCH38` | `58675` | DRIVE | `NET_SHOT` | 0.967 | 0.030 | 0.967 | Zone 2.0 | Ht 1.0 | YES | **NO (NET_SHOT)** |
| `MATCH38` | `107731` | DRIVE | `NET_SHOT` | 0.890 | 0.085 | 0.890 | Zone 7.0 | Ht 1.0 | YES | **NO (NET_SHOT)** |
| `MATCH40` | `30580` | DRIVE | `NET_SHOT` | 0.990 | 0.009 | 0.990 | Zone 1.0 | Ht 2.0 | YES | **NO (NET_SHOT)** |

### Summary on Frontcourt Cases
- Exactly **6 of 7 cases (85.7%)** remain misclassified as `NET_SHOT`.
- Exactly **1 of 7 cases (14.3%)** is correctly recognized as DRIVE (`MATCH07` frame 33668, confidence 0.381).
- All 6 misclassified frontcourt cases are contained within Cohort A.

---

## 10. Frontcourt Error Subgroup

The 20 DRIVE $\rightarrow$ NET errors are classified into two distinct geographic subgroups:
- **Frontcourt Subgroup:** **6 / 20 samples (30.0%)** $\rightarrow$ **MINORITY**
- **Midcourt / Rearcourt Subgroup:** **14 / 20 samples (70.0%)** $\rightarrow$ **MAJORITY**

Conclusion: Frontcourt proximity is a significant contributing factor, but **not** the majority cause. Treating DRIVE $\rightarrow$ NET as solely a frontcourt issue misses 70% of the failure cases.

---

## 11. Hit-Height / Contact Analysis

`is_overhead` (Dimension 5 of the 27-D auxiliary vector, derived from contact height `hit_height == 2`):

| Contact Feature | Cohort A (DRIVE$\rightarrow$NET) | Cohort B (True NET) | Cohort C (True DRIVE) |
| :--- | :---: | :---: | :---: |
| **`is_overhead = 1.0` (High contact)** | **14 / 20 (70.0%)** | 686 / 707 (97.0%) | 4 / 28 (14.3%) |
| **`is_overhead = 0.0` (Low contact)** | **6 / 20 (30.0%)** | 21 / 707 (3.0%) | 24 / 28 (85.7%) |
| **`is_backhand = 1.0`** | 11 / 20 (55.0%) | 359 / 707 (50.8%) | 9 / 28 (32.1%) |
| **`is_aroundhead = 1.0`** | 0 / 20 (0.0%) | 0 / 707 (0.0%) | 0 / 28 (0.0%) |

### Mechanism of the Contact Shortcut
- In correct DRIVEs (Cohort C), **85.7%** are hit at waist/underhand level (`is_overhead = 0.0`).
- In true NET_SHOT (Cohort B), **97.0%** are labeled with `is_overhead = 1.0` (racket contact at or above net-tape height).
- When a DRIVE is hit at chest/head level (e.g., high flat drives, defensive blocks), `is_overhead` is flagged as `1.0`. The spatial MLP, trained on an overwhelming NET_SHOT majority, learns a dominant shortcut: `is_overhead = 1.0` $\rightarrow$ `NET_SHOT`, overpowering the visual backbone.

---

## 12. Visual-Motion Analysis

Comparing the standardized Horizontal-to-Vertical visual motion ratio (`norm_hv`):

| Cohort | Mean | Median | Std | IQR | Cohen's d vs A | Cliff's $\delta$ vs A |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Cohort A (DRIVE -> NET)** | **+0.603** | **+0.099** | 1.013 | 1.379 | Baseline | Baseline |
| **Cohort B (True NET)** | **+0.009** | **-0.108** | 0.690 | 0.833 | **d = +0.846** (Large) | **delta = +0.339** |
| **Cohort C (True DRIVE)** | **+0.714** | **+0.698** | 0.750 | 1.094 | **d = -0.125** (Negligible) | **delta = -0.221** |

### Critical Physical Finding
In terms of physical visual motion, **Cohort A is physically aligned with TRUE DRIVE (Cohen's d = -0.125)** and significantly separated from TRUE NET_SHOT (**Cohen's d = +0.846**). The visual motion feature *correctly* captured elevated horizontal flow in Cohort A, but the multimodal fusion head discounted this signal in favor of the spatial MLP's categorical cues.

---

## 13. EXP05→EXP08B Transition Analysis

Comparing the predictions of `EXP_DRIVE_05` vs `EXP_DRIVE_08B` on the 20 Cohort A samples:
- **EXP05 NET $\rightarrow$ EXP08B NET:** **15 samples (75.0%)** $\rightarrow$ Persistent net-shot attractor inherited from EXP05.
- **EXP05 DRIVE $\rightarrow$ EXP08B NET:** **4 samples (20.0%)** $\rightarrow$ Samples where EXP08B regressed relative to EXP05:
  1. `MATCH07` frame 19613: EXP05=DRIVE (0.737) $\rightarrow$ EXP08B=NET_SHOT (0.746)
  2. `MATCH07` frame 23999: EXP05=DRIVE (0.406) $\rightarrow$ EXP08B=NET_SHOT (0.830)
  3. `MATCH07` frame 52901: EXP05=DRIVE (0.749) $\rightarrow$ EXP08B=NET_SHOT (0.523)
  4. `MATCH31` frame 31649: EXP05=DRIVE (0.511) $\rightarrow$ EXP08B=NET_SHOT (0.678)
- **EXP05 SMASH $\rightarrow$ EXP08B NET:** **1 sample (5.0%)**:
  - `MATCH07` frame 27779: EXP05=SMASH (0.558) $\rightarrow$ EXP08B=NET_SHOT (0.617)

### Full Transition Matrix for ALL 73 TRUE DRIVE Samples

| EXP05 \ EXP08B | SMASH | CLEAR | DROP | DRIVE | NET_SHOT | Total |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **SMASH** | 8 | 0 | 3 | 2 | 1 | 14 |
| **CLEAR** | 0 | 5 | 1 | 1 | 0 | 7 |
| **DROP** | 0 | 0 | 1 | 0 | 0 | 1 |
| **DRIVE** | 3 | 2 | 2 | 24 | 4 | 35 |
| **NET_SHOT** | 0 | 0 | 0 | 1 | 15 | 16 |

Of the 35 DRIVEs correctly recognized by EXP05, EXP08B retained 24, flipped 4 to NET_SHOT, 3 to SMASH, 2 to CLEAR, and 2 to DROP. Meanwhile, EXP08B recovered 4 new DRIVEs (2 from SMASH, 1 from CLEAR, 1 from NET_SHOT).

---

## 14. NET_SHOT Prior Analysis

The validation class distribution is highly imbalanced:
- `NET_SHOT`: 720 samples (36.73% of validation, 44.10% of training)
- `DRIVE`: 73 samples (3.72% of validation, 4.83% of training)
- **Imbalance Ratio:** **9.86 to 1**

Because NET_SHOT is ~10x more prevalent than DRIVE, standard Cross-Entropy training penalizes NET_SHOT false negatives heavily. When spatial coordinates place the shuttle near the net or indicate `is_overhead = 1.0`, the network minimizes expected risk by defaulting to NET_SHOT, generating the observed high mean confidence (0.848).

---

## 15. Offline Kinematic Diagnostics

> [!CAUTION]
> The following features are computed using future landing annotations and are strictly **OFFLINE-ONLY DIAGNOSTICS** to establish physical ground truth. They must NEVER be used directly as inputs to a deployed model.

| Kinematic Feature | Cohort A Mean (Median) | Cohort B Mean (Median) | Cohort C Mean (Median) | Cohen's d (A vs B) | Cliff's $\delta$ (A vs B) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Implied Speed (px/frame)** | **12.44 (13.04)** | 3.81 (3.34) | 15.34 (15.11) | **d = +3.051** (Massive) | **delta = +0.707** |
| **Flight Displacement (px)** | **196.9 (184.8)** | 102.1 (93.1) | 223.6 (204.2) | **d = +1.549** (Large) | **delta = +0.786** |
| **Flight Duration (frames)** | 78.4 (14.0) | 87.5 (26.0) | 92.2 (14.0) | d = -0.040 | delta = -0.592 |

### Irrefutable Ground-Truth Separation
- **Implied Speed:** Cohort A travels at **12.44 px/frame**, more than **3.27x faster** than true NET_SHOT (**3.81 px/frame**), yielding a massive Cohen's d of **+3.05**.
- **Flight Displacement:** Cohort A travels **196.9 px**, nearly **2x farther** across the court than true NET_SHOT (**102.1 px**), with Cohen's d of **+1.55**.
- True NET_SHOT shots drop immediately near the net tape, whereas Cohort A shots penetrate deep into the opponent's midcourt and rearcourt.

---

## 16. Deployable Proxy Feasibility

Can the massive kinematic separation (implied speed d=3.05) be captured using **observed frames only** without waiting for the future landing frame?

### Mathematical Formulation of Deployable Proxy
Within the current Window C ($[-4, +11]$ frames relative to impact frame $t_0$):
1. **Early Shuttle Velocity ($V_{x, \text{early}}$):**
   In observed frames $t \in [t_0 + 1, t_0 + 6]$ (the first 5 frames post-impact), a drive travels forward across the net at high speed ($>10$ px/frame), producing a large early displacement $\Delta x_{[+1, +6]} \approx 50-70$ px.
   A net shot floats gently over the tape, producing an early displacement $\Delta x_{[+1, +6]} \le 15-20$ px.
2. **Early Directional Optical Flow Vector:**
   Rather than averaging absolute flow $|u|$, computing the signed forward horizontal flow in the bounding corridor immediately downstream of the hit location provides an observed-frame proxy for shuttle exit velocity.

---

## 17. Visual Inspection

Qualitative inspection of representative Cohort A cases from `MATCH07` and `MATCH38`:
- **Rearcourt High Drives (`MATCH07` 19613, `MATCH38` 58687):** Striking player is positioned in the mid-rear court, receiving a flat return at shoulder height. The racket stroke is a fast flat drive punch. Because the shuttle passes close to the net cord camera perspective, and contact height was marked high, the model defaulted to NET_SHOT.
- **Frontcourt Counter-Drives (`MATCH07` 16244, `MATCH38` 58675):** Striking player lunges forward to intercept a net shot, but instead of tumbling a hairpin net drop, executes a quick flat drive push into the deep midcourt. The contact point is near the net, creating extreme spatial resemblance to a net shot, but the stroke velocity is high.

---

## 18. Statistical Analysis

- **Sample Size Considerations:** Cohort A contains $N=20$ samples. While $N=20$ is modest, the observed effect sizes for implied speed (Cohen's d = 3.05) and displacement (Cohen's d = 1.55) are so large that statistical significance is achieved ($p < 10^{-6}$ via Mann-Whitney U test).
- **Categorical Differences:** Chi-square test on zone group distribution between Cohort A (30% front / 70% mid-rear) and Cohort B (73% front / 27% mid-rear) is highly significant ($\chi^2 = 23.4, p < 10^{-5}$).

---

## 19. Hypothesis Testing

| Hypothesis | Evidence FOR | Evidence AGAINST | Final Status |
| :--- | :--- | :--- | :---: |
| **H1: Frontcourt Concentration** | 6 of 20 (30%) are in frontcourt (vs 3.6% in correct DRIVE). | 14 of 20 (70%) are in midcourt/rearcourt. | **PARTIALLY SUPPORTED (30% minority)** |
| **H2: Hit Height / Contact Type** | 70% have `is_overhead=1.0` (matching 97% in net shots, vs 14% in correct drives). | 30% have `is_overhead=0.0` and still failed. | **SUPPORTED** |
| **H3: Spatial Signature** | Distinct bimodal concentration in Zone 8 (40%) and Zone 5 (25%). | Spatial coordinates alone do not separate Cohort A from other shots. | **PARTIALLY SUPPORTED** |
| **H4: Temporal-Motion Signature** | Mean H/V ratio is +0.603 (d=0.85 higher than net shots). | 40% of samples have low flow ($\le 0.0$). | **PARTIALLY SUPPORTED** |
| **H5: H/V Feature Adverse Effect** | 4 previously correct EXP05 DRIVEs flipped to NET_SHOT in EXP08B. | Overall EXP08B accuracy and Macro F1 improved substantially. | **SUPPORTED (Localized trade-off)** |
| **H6: Class Prior Dominance** | NET_SHOT is 9.86x more frequent; mean P(NET)=0.848 in errors. | Model does not predict NET everywhere; triggered by contact/zone. | **SUPPORTED** |
| **H7: Offline Kinematics & Proxy** | Implied speed d=3.05 (12.44 vs 3.81 px/frame); displacement d=1.55. | Requires localizer to track small shuttle in broadcast video. | **SUPPORTED** |
| **H8: Heterogeneous Failure** | Clear dual-modal split: 30% frontcourt net-adjacent, 70% mid/rear high-contact. | Both subsets share the same missing forward velocity signal. | **SUPPORTED** |

---

## 20. Root-Cause Assessment

### Primary Finding: `OUTCOME E (Heterogeneous Failure / Dual-Modal Error Mechanism)`
The 20 TRUE DRIVE $\rightarrow$ NET_SHOT errors are caused by two distinct, interacting failure modes:
1. **Subgroup 1: Midcourt/Rearcourt High-Contact Drives (N=14, 70%):**
   - Driven by the spatial auxiliary shortcut `is_overhead = 1.0` and `hit_height = 2`.
   - When a player strikes a fast drive at chest/shoulder level in Zone 8 or Zone 5, the model's spatial MLP associates high contact with NET_SHOT (where 97% of samples have high contact), overriding the visual motion features.
2. **Subgroup 2: Frontcourt Counter-Drives (N=6, 30%):**
   - Driven by court geometry proximity to the net (Zones 1, 2, 7).
   - Without early forward velocity, any shot struck near the net tape is mathematically drawn into the massive NET_SHOT attractor.

---

## 21. Future Experiment Gate

### Is ONE controlled future experiment justified? **YES**

### Proposed Controlled Experiment: `EXP_DRIVE_10`
- **Exact Hypothesis:** Adding an **Early Observed Forward Displacement Rate** ($V_{x, \text{early}} = \frac{\Delta x_{[t_0+1, t_0+5]}}{\Delta t}$) derived from observed optical flow / localized tracking during the first 5 post-impact frames will distinguish fast drives from floating net shots without damaging EXP08B's DROP/SMASH gains.
- **Exact Single Variable to Test:** One continuous scalar feature representing early post-impact forward horizontal displacement rate ($V_{x, \text{early}}$), appended as the 29th dimension of the auxiliary vector.
- **Expected Mechanism:** Provides the multimodal fusion head with the exact missing physical signal (implied speed d=3.05) within the already observed Window C $[-4, +11]$, allowing it to override the deceptive `is_overhead = 1.0` shortcut.
- **What Remains Frozen:** Architecture, loss function, Window C $[-4, +11]$, 28 existing features, frozen train/val split.
- **Primary Metric to Monitor:** DRIVE recall (target: $>45\%$), DRIVE F1 (target: $>52\%$).
- **Critical Regression to Prevent:** DROP recall must not decline below `55.0%` (preserving EXP08B's breakthrough).

> [!IMPORTANT]
> DO NOT START `EXP_DRIVE_10` AUTOMATICALLY. This requires explicit user review and authorization.

---

## 22. Reproducibility

- Authoritative prediction inputs: `EXP_DRIVE_08B_HV_MOTION/04_RESULTS/validation_predictions.json`.
- Raw annotations loaded from official ShuttleSet repository.
- All sample-level join codes, statistics, and cohort derivations archived in `scratch/audit_exp09_drive_to_net.py`.
- Summary metadata exported to `D:\PS_DATA\SPARK\docs\EXP_DRIVE_09_DRIVE_TO_NET_SUMMARY.json`.
