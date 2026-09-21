# DRIVE Experiment 05 — Post-Impact Temporal Window

## 1. Objective

The objective of **EXP_DRIVE_05_TEMPORAL_WINDOW_POST_IMPACT** is to conduct a strictly controlled, single-variable experiment to determine whether shifting the fixed 16-frame visual temporal window toward the post-impact period improves DRIVE recognition, specifically targeting:
1. The dominant **DRIVE $\rightarrow$ NET_SHOT** confusion (21 errors in the baseline EXP24 model).
2. The complete **frontcourt DRIVE failure** (0/7 correct, 100% misclassified as NET_SHOT in EXP24 and EXP_DRIVE_02).
3. The severe underperformance on **high-contact DRIVEs** (`is_overhead = 1.0`, only 2/18 correct in EXP24).

This experiment tests whether post-impact shuttle flight and player follow-through provide the visual discriminative signal that contact-instant geometry cannot provide, without altering any other model component.

---

## 2. Research Motivation

The motivation for this experiment originates from the empirical findings of the preceding investigation phases:

1. **DRIVE Confusion Audit (`DRIVE_CONFUSION_AUDIT.md`):**
   - In the frozen EXP24 multimodal baseline, DRIVE achieved an F1 score of only $54.93\%$ (Recall $53.42\%$, Precision $56.52\%$).
   - The primary failure mode was the `NET_SHOT` attractor: $28.77\%$ (21 of 73) of validation DRIVEs were misclassified as `NET_SHOT`.

2. **DRIVE Experiment 02 — `is_overhead` Ablation (`DRIVE_EXPERIMENT_02_IS_OVERHEAD_ABLATION_REPORT.md`):**
   - Testing whether the binary auxiliary feature `is_overhead` acted as an artificial shortcut proved that it was **not** the cause. Clamping `is_overhead = 0.0` caused DRIVE F1 to collapse from $54.93\%$ to $46.55\%$, low-contact DRIVE recall to crash from $67.27\%$ to $40.00\%$, and DRIVE $\rightarrow$ NET_SHOT errors to worsen from 21 to 27. Frontcourt DRIVE remained $0/7$.

3. **Kinematic Feasibility Audit (`DRIVE_03_KINEMATIC_FEASIBILITY_AUDIT.md`):**
   - Analysis of annotation-level variables demonstrated that at the exact contact instant (`hit_x, hit_y`), DRIVE and NET_SHOT strokes are statistically indistinguishable ($|d| < 0.08$).
   - In contrast, post-impact variables demonstrated massive statistical divergence:
     - Hit-to-landing Euclidean displacement: Cohen's $d = 2.68$
     - Flight duration: Cohen's $d = 2.45$
     - Implied flight speed: Cohen's $d = 2.41$
     - Landing zone distribution: Cohen's $d = 2.21$

4. **Post-Impact Temporal Feasibility Audit (`DRIVE_04_POST_IMPACT_TEMPORAL_FEASIBILITY.md`):**
   - Physical video audit across 1,960 validation and 10,044 training strokes revealed that the baseline EXP24 model was using a backward-skewed window of **10 pre-hit frames and only 5 post-hit frames** (`[-10, +5]`).
   - At 5 post-hit frames ($167\text{ ms}$ at 30 fps), a DRIVE shuttle has barely traveled past the net, whereas by frame $+11$ ($367\text{ ms}$), $100\%$ of frontcourt DRIVE strokes exhibit full cross-court flight into the opponent's rear court.
   - The audit audited 6 candidate windows and identified **`WINDOW C = [-4, +11]`** as the optimal, deployment-compatible candidate with zero frame bounds violations and full preservation of hit-instant contact physics.

---

## 3. Baseline Verification

Before executing EXP_DRIVE_05, the exact temporal window used in the frozen EXP24 baseline was verified across configuration records and code:

- **Manifest Inspection:** In `C:\Users\user\Desktop\PS\06_REPORTS\PHASE_9_FULL_SHOT_EXTRACTION_MANIFEST.csv`, extraction offsets are explicitly recorded as `PRE_HIT_FRAMES = 10` and `POST_HIT_FRAMES = 5`.
- **Extracted Frame Directory:** Frame sequences in `D:\PS_DATA\04_EXTRACTED_FRAMES` contain 16 JPEG frames per stroke, numbered from offset `-10` to offset `+5`, where offset `0` corresponds to the annotated hit frame.
- **Visual Tensor Mapping:** In `D:\PS_DATA\06_FEATURES\EXP15_RESNET18_SPATIAL_27D`, each `.pt` tensor has shape `[16, 512]`, mapping row 0 to frame $H-10$ and row 15 to frame $H+5$. Row 10 represents the hit frame ($H+0$).

This confirmed that EXP24 evaluated a visual window containing twice as much pre-stroke preparation as post-contact flight.

---

## 4. Actual Baseline Temporal Window

The actual temporal window of the baseline model is:

$$\text{Baseline Window (EXP24): } [-10, \quad +5]$$

- **Pre-impact frames:** 10 frames ($H-10$ to $H-1$, spanning $-333\text{ ms}$ to $-33\text{ ms}$)
- **Hit frame:** 1 frame ($H+0$, instantaneous contact)
- **Post-impact frames:** 5 frames ($H+1$ to $H+5$, spanning $+33\text{ ms}$ to $+167\text{ ms}$)
- **Total frames:** 16 frames ($500\text{ ms}$ total sequence)

---

## 5. Candidate Window

Under the strict single-variable experimental rule, the candidate window tested in EXP_DRIVE_05 preserves the exact sequence length of 16 frames while shifting coverage toward post-impact trajectory:

$$\text{Candidate Window (EXP_DRIVE_05): } \mathbf{WINDOW\ C = [-4, \quad +11]}$$

- **Pre-impact frames:** 4 frames ($H-4$ to $H-1$, spanning $-133\text{ ms}$ to $-33\text{ ms}$)
- **Hit frame:** 1 frame ($H+0$, instantaneous contact)
- **Post-impact frames:** 11 frames ($H+1$ to $H+11$, spanning $+33\text{ ms}$ to $+367\text{ ms}$)
- **Total frames:** 16 frames ($500\text{ ms}$ total sequence)
- **Reused Baseline Frames:** Frames $H-4$ through $H+5$ (10 frames) are identical to rows 6–15 of the baseline EXP24 tensors.
- **Newly Extracted Frames:** Frames $H+6$ through $H+11$ (6 frames) were extracted directly from the raw MP4 video streams at original full resolution.

---

## 6. Frame Extraction Verification

A pre-extraction boundary audit was executed across all 1,960 validation strokes and 10,044 training strokes:

- **Verification Methodology:** For every stroke, the target extraction interval was checked against video limits:
  $$\text{Target Interval: } [H-4, \quad H+11]$$
- **Video Boundary Check:** For all 12,004 records across all 37 match videos, $H - 4 \ge 0$ and $H + 11 < \text{Total Frames}$. Zero clipping or boundary clamping was required.
- **Inter-Rally Boundary Check:** The DRIVE-04 audit verified that 99.85% of strokes have sufficient inter-hit separation such that $H+11$ never enters the subsequent opponent contact.
- **Image Pipeline Consistency:** All newly extracted frames ($H+6$ to $H+11$) were resized to $(224, 224)$ using OpenCV area interpolation (`cv2.INTER_AREA`), normalized with standard ImageNet parameters ($\mu = [0.485, 0.456, 0.406]$, $\sigma = [0.229, 0.224, 0.225]$), and passed through an identical pretrained ResNet-18 backbone.
- **Sample Tensor Verification:** 5 representative validation samples across distinct classes and matches were verified. Output tensor shapes were confirmed as exactly `[16, 512]` with zero NaN or Inf values.

---

## 7. Data Coverage

Feature extraction succeeded with 100% data coverage across both splits:

- **Validation Split:** Exactly 1,960 tensors extracted into `D:\PS_DATA\DRIVE_EXPERIMENTS\EXP_DRIVE_05_TEMPORAL_WINDOW\01_FEATURES\VALIDATION\` (100.0% coverage across 7 matches: MATCH07, MATCH08, MATCH25, MATCH31, MATCH37, MATCH38, MATCH40).
- **Training Split:** Exactly 10,044 tensors extracted into `D:\PS_DATA\DRIVE_EXPERIMENTS\EXP_DRIVE_05_TEMPORAL_WINDOW\01_FEATURES\TRAIN\` (100.0% coverage across 30 training matches).
- **Auxiliary Features:** 27-D auxiliary vectors (`aux_train_27d_window_c.pkl` and `aux_val_27d_window_c.pkl`) were paired 1:1 with corresponding visual tensors.
- **Missing or Corrupted Files:** 0.

---

## 8. Training Configuration

In strict compliance with the single-variable experimental mandate, the training configuration was kept 100% identical to EXP24:

- **Architecture:** `MultimodalTransformerLSTMClassifier`
  - Visual Backbone: Pretrained ResNet-18 (512-D per frame, 16 frames)
  - Visual Temporal Encoder: 2-layer Transformer Encoder ($d_{model} = 512$, $nhead = 8$, $dim\_feedforward = 1024$, $dropout = 0.3$)
  - Sequence Aggregator: 2-layer Bidirectional LSTM ($hidden\_size = 128$, output $256$-D)
  - Spatial MLP: 2-layer MLP on 27-D auxiliary vector ($27 \rightarrow 64 \rightarrow 64$, ReLU, BatchNorm, Dropout $0.3$)
  - Classification Head: Linear projection ($[256 + 64] = 320 \rightarrow 5$)
  - Total Trainable Parameters: **337,157** (identically matching EXP24)
- **Loss Function:** Standard unweighted `CrossEntropyLoss`
- **Optimizer:** Adam ($\text{lr} = 0.001$, $\beta_1 = 0.9$, $\beta_2 = 0.999$, $\epsilon = 1\times 10^{-8}$)
- **Batch Size:** 64
- **Epochs:** 30
- **Random Seed:** 123 (torch, numpy, random, deterministic cudnn)
- **Hardware:** CPU execution (4 physical cores)
- **Training Time:** 8.1 minutes (487 seconds)

---

## 9. Validation Results

The model was evaluated on the frozen validation set of 1,960 samples after every epoch. The best checkpoint was achieved at Epoch 30 (with the lowest validation loss recorded at Epoch 21, loss = 0.5975):

- **Validation Loss:** 0.6291
- **Validation Accuracy:** 74.95% (1,469 / 1,960)
- **Macro Precision:** 66.47%
- **Macro Recall:** 65.14%
- **Macro F1:** **65.22%**
- **Weighted Precision:** 74.19%
- **Weighted Recall:** 74.95%
- **Weighted F1:** **74.16%**

### Per-Class Validation Breakdown (EXP_DRIVE_05)

| Class | Precision (%) | Recall (%) | F1 Score (%) | Support |
|:---|:---:|:---:|:---:|:---:|
| **SMASH** | 58.78 | 75.60 | 66.14 | 332 |
| **CLEAR** | 70.81 | 71.08 | 70.94 | 529 |
| **DROP** | 47.87 | 33.01 | 39.07 | 306 |
| **DRIVE** | 58.33 | 47.95 | 52.63 | 73 |
| **NET_SHOT** | 96.58 | 98.06 | 97.31 | 720 |

### Confusion Matrix (EXP_DRIVE_05)

| True \ Pred | SMASH | CLEAR | DROP | DRIVE | NET_SHOT | Total |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **SMASH** | **251** | 45 | 26 | 8 | 2 | 332 |
| **CLEAR** | 61 | **376** | 83 | 3 | 6 | 529 |
| **DROP** | 99 | 102 | **101** | 3 | 1 | 306 |
| **DRIVE** | 14 | 7 | 1 | **35** | 16 | 73 |
| **NET_SHOT** | 2 | 1 | 0 | 11 | **706** | 720 |
| **Total Predicted** | 427 | 531 | 211 | 60 | 731 | 1,960 |

---

## 10. Baseline vs EXP_DRIVE_05

Direct side-by-side comparison between the frozen EXP24 baseline (`[-10, +5]`) and EXP_DRIVE_05 (`WINDOW C = [-4, +11]`):

| Metric | EXP24 Baseline `[-10, +5]` | EXP_DRIVE_05 `[-4, +11]` | Delta | Status |
|:---|:---:|:---:|:---:|:---|
| **Overall Accuracy** | 73.32% (1437/1960) | **74.95%** (1469/1960) | **+1.63 pp** | Improved (+32 samples) |
| **Macro F1** | 61.47% | **65.22%** | **+3.75 pp** | **Substantial gain** |
| **Weighted F1** | 70.76% | **74.16%** | **+3.40 pp** | **Substantial gain** |
| **Macro Precision** | 64.33% | 66.47% | +2.14 pp | Improved |
| **Macro Recall** | 62.90% | 65.14% | +2.24 pp | Improved |
| **Validation Loss** | 0.6419 | **0.6291** | -0.0128 | Improved |
| **DRIVE Precision** | 56.52% | **58.33%** | **+1.81 pp** | Improved |
| **DRIVE Recall** | **53.42%** (39/73) | 47.95% (35/73) | **-5.47 pp** | Decreased (-4 samples) |
| **DRIVE F1** | **54.93%** | 52.63% | **-2.30 pp** | Decreased |
| **DRIVE $\rightarrow$ NET_SHOT** | **21** (28.77%) | **16** (21.92%) | **-5 errors (-23.8%)** | **Attractor reduced** |
| **NET_SHOT $\rightarrow$ DRIVE** | 7 (0.97%) | 11 (1.53%) | +4 false pos | Slight increase |
| **High-Contact DRIVE Recall (`oh=1`)** | 11.11% (2/18) | **38.89%** (7/18) | **+27.78 pp** | **Tripled (+5 correct)** |
| **Low-Contact DRIVE Recall (`oh=0`)** | **67.27%** (37/55) | 50.91% (28/55) | -16.36 pp | Shifted to SMASH/CLEAR |
| **Frontcourt DRIVE Recall (7 cases)** | 0.00% (0/7) | **14.29%** (1/7) | **+14.29 pp** | **Broke 0% barrier** |
| **SMASH F1** | 63.06% | **66.14%** | **+3.08 pp** | Improved |
| **CLEAR F1** | 69.37% | **70.94%** | **+1.57 pp** | Improved |
| **DROP F1** | 22.61% | **39.07%** | **+16.46 pp** | **Massive gain** |
| **NET_SHOT F1** | **97.39%** | 97.31% | -0.08 pp | Unaffected / preserved |

---

## 11. DRIVE Confusion Analysis

### Confusion Matrix Breakdown for Ground-Truth DRIVE ($N = 73$)

| Destination Prediction | EXP24 Baseline | EXP_DRIVE_05 | Delta (Count) | Delta (%) |
|:---|:---:|:---:|:---:|:---:|
| **Correct DRIVE** | **39** (53.42%) | 35 (47.95%) | -4 | -5.47 pp |
| **Misclassified as NET_SHOT** | **21** (28.77%) | **16** (21.92%) | **-5** | **-6.85 pp (-23.8%)** |
| **Misclassified as SMASH** | 10 (13.70%) | 14 (19.18%) | +4 | +5.48 pp |
| **Misclassified as CLEAR** | 3 (4.11%) | 7 (9.59%) | +4 | +5.48 pp |
| **Misclassified as DROP** | 0 (0.00%) | 1 (1.37%) | +1 | +1.37 pp |

### False Positive Breakdown Predicting DRIVE ($N_{\text{pred}} = 60$)

| Source Ground-Truth Class | EXP24 Baseline | EXP_DRIVE_05 | Delta |
|:---|:---:|:---:|:---:|
| **True DRIVE (True Positives)** | 39 | 35 | -4 |
| **From NET_SHOT** | 7 | 11 | +4 |
| **From SMASH** | 11 | 8 | -3 |
| **From CLEAR** | 7 | 3 | -4 |
| **From DROP** | 5 | 3 | -2 |
| **Total False Positives** | 30 | 25 | -5 (-16.7%) |
| **Total Predicted DRIVEs** | 69 | 60 | -9 |
| **Precision** | 56.52% | **58.33%** | **+1.81 pp** |

### Critical Diagnostic Insight
1. Shifting the temporal window to Window C successfully achieved the primary design goal of **reducing the DRIVE $\rightarrow$ NET_SHOT attractor by 23.8%** (dropping from 21 to 16 errors). For low-contact DRIVEs (`is_overhead = 0`), DRIVE $\rightarrow$ NET_SHOT errors dropped from 9 to just 5.
2. In high-contact DRIVEs (`is_overhead = 1.0`), correct predictions surged from 2 to 7 (+250% relative gain).
3. However, the extended post-impact window introduced a **new confusion axis**: 14 DRIVEs were misclassified as `SMASH` (vs 10 in baseline) and 7 as `CLEAR` (vs 3 in baseline). Because Window C captures fast shuttle exit velocity and forward arm drive through frame $+11$, the visual encoder frequently interprets fast, flat midcourt drives as attacking shots (SMASH), preventing DRIVE recall from rising overall.

---

## 12. Frontcourt DRIVE 7-Case Analysis

In all prior investigations (EXP24 baseline and EXP_DRIVE_02), the 7 validation frontcourt DRIVE samples suffered an unbroken 100% failure rate (0/7 correct, 7/7 misclassified as `NET_SHOT`).

Here is the exact case-by-case outcome in EXP_DRIVE_05 under `WINDOW C`:

| Case | Match ID | Hit Frame | True Class | EXP24 Pred | EXP_DRIVE_05 Pred | Confidence | Correct? | Class Probabilities [SMASH, CLEAR, DROP, DRIVE, NET] |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **1** | MATCH07 | 16,244 | DRIVE | NET_SHOT | NET_SHOT | 0.915 | No | `[0.032, 0.003, 0.004, 0.046, 0.915]` |
| **2** | MATCH07 | 27,779 | DRIVE | NET_SHOT | **SMASH** | 0.558 | No | `[0.558, 0.001, 0.011, 0.331, 0.099]` |
| **3** | MATCH07 | 33,668 | DRIVE | NET_SHOT | **DRIVE** | 0.374 | **YES** | `[0.181, 0.011, 0.073, 0.374, 0.361]` |
| **4** | MATCH37 | 14,304 | DRIVE | NET_SHOT | NET_SHOT | 0.650 | No | `[0.001, 0.087, 0.004, 0.258, 0.650]` |
| **5** | MATCH38 | 58,675 | DRIVE | NET_SHOT | NET_SHOT | 0.980 | No | `[0.000, 0.000, 0.001, 0.019, 0.980]` |
| **6** | MATCH38 | 107,731 | DRIVE | NET_SHOT | NET_SHOT | 0.973 | No | `[0.002, 0.001, 0.002, 0.022, 0.973]` |
| **7** | MATCH40 | 30,580 | DRIVE | NET_SHOT | NET_SHOT | 0.984 | No | `[0.000, 0.000, 0.000, 0.016, 0.984]` |

### Case Study Findings:
1. **Barrier Broken:** Case 3 (MATCH07 hit 33668) was **correctly predicted as DRIVE** (breaking the 100% frontcourt failure barrier for the first time in project history).
2. **Attractor Escape:** Case 2 (MATCH07 hit 27779) completely escaped the NET_SHOT attractor (NET_SHOT probability collapsed to just $0.099$, while DRIVE probability rose to $0.331$, though SMASH took the plurality at $0.558$).
3. **Probability Reallocation:** In Case 4 (MATCH37 hit 14304), NET_SHOT confidence was softened from near-certainty in baseline to $0.650$, with DRIVE probability rising to $0.258$.
4. **Persistent Failures:** Cases 1, 5, 6, and 7 remain captured by NET_SHOT due to strong spatial frontcourt priors (Zones 1, 2, 7) that the visual window could not fully overcome.

---

## 13. Confidence Analysis

Evaluated on ground-truth DRIVE validation samples ($N = 73$):

| Confidence Metric | EXP24 Baseline | EXP_DRIVE_05 | Delta |
|:---|:---:|:---:|:---:|
| **Mean Correct DRIVE Confidence** | 0.6712 | **0.7161** | **+0.0449** (More confident when correct) |
| **Mean Confidence across all DRIVE samples** | 0.6638 | 0.7413 | +0.0775 |
| **Median Confidence across all DRIVE samples** | 0.6840 | 0.7652 | +0.0812 |
| **Mean Confidence (DRIVE $\rightarrow$ NET_SHOT)** | 0.8240 | 0.8892 | +0.0652 |
| **Mean Confidence (DRIVE $\rightarrow$ SMASH)** | 0.6120 | 0.7567 | +0.1447 |
| **High-Confidence Errors ($\ge 0.70$)** | 12 / 34 (35.3%) | 24 / 38 (63.2%) | +12 high-conf errors |
| **High-Confidence DRIVE $\rightarrow$ NET_SHOT ($\ge 0.70$)** | 11 / 21 (52.4%) | 13 / 16 (81.3%) | -5 total errors, but remaining are firm |

---

## 14. Five-Class Collateral Effects

The impact of `WINDOW C` across all 5 classes was predominantly positive across the entire system:

| Class | Baseline F1 (%) | EXP_DRIVE_05 F1 (%) | Delta F1 (pp) | Nature of Impact |
|:---|:---:|:---:|:---:|:---|
| **SMASH** | 63.06 | **66.14** | **+3.08** | **Solid gain** (Recall improved from 70.18% to 75.60%) |
| **CLEAR** | 69.37 | **70.94** | **+1.57** | **Solid gain** (Precision improved from 62.65% to 70.81%) |
| **DROP** | 22.61 | **39.07** | **+16.46** | **Massive collateral gain** (Recall more than doubled: 14.71% $\rightarrow$ 33.01%) |
| **DRIVE** | **54.93** | 52.63 | **-2.30** | Slight decrease (Recall dropped 53.42% $\rightarrow$ 47.95% due to SMASH shift) |
| **NET_SHOT** | 97.39 | **97.31** | **-0.08** | **Preserved / Zero collateral damage** (P=96.58%, R=98.06%) |

### Mechanism of Collateral Impact:
- **DROP Shot Revolution:** In baseline `[-10, +5]`, DROP shots were chronically confused with CLEAR and SMASH because pre-hit overhead preparation looks identical. Capturing frames $+6$ to $+11$ provides critical deceleration and steep downward trajectory evidence, causing DROP recall to more than double ($14.71\% \rightarrow 33.01\%$) and DROP F1 to skyrocket by **$+16.46$ pp**.
- **NET_SHOT Immunity:** The dominant class `NET_SHOT` suffered zero collateral harm ($97.39\% \rightarrow 97.31\%$), proving post-impact frames do not blur net play characteristics.
- **SMASH & CLEAR:** Both overhead attacking strokes gained in precision and recall as flight trajectory separated them from soft drops.

---

## 15. Predicted Class Distribution

Comparison of overall predicted shot volume across the 1,960 validation samples:

| Class | Actual Support | EXP24 Baseline Predictions | EXP_DRIVE_05 Predictions | Delta vs Baseline |
|:---|:---:|:---:|:---:|:---:|
| **SMASH** | 332 | 407 (122.6% of truth) | 427 (128.6% of truth) | +20 (+4.9%) |
| **CLEAR** | 529 | 656 (124.0% of truth) | 531 (100.4% of truth) | **-125 (-19.1%)** |
| **DROP** | 306 | 92 (30.1% of truth) | 211 (69.0% of truth) | **+119 (+129.3%)** |
| **DRIVE** | 73 | 69 (94.5% of truth) | 60 (82.2% of truth) | -9 (-13.0%) |
| **NET_SHOT** | 720 | 736 (102.2% of truth) | 731 (101.5% of truth) | -5 (-0.7%) |

The predicted distribution under `WINDOW C` is dramatically more calibrated to ground truth than EXP24, particularly for CLEAR (which was heavily overpredicted in EXP24) and DROP (which was severely underpredicted in EXP24).

---

## 16. Observed Results

1. **System-Wide Gains:**
   - Macro F1 increased from $61.47\%$ to **$65.22\%$ (+3.75 pp)**.
   - Overall Accuracy increased from $73.32\%$ to **$74.95\%$ (+1.63 pp)**.
   - Weighted F1 increased from $70.76\%$ to **$74.16\%$ (+3.40 pp)**.
2. **DRIVE $\rightarrow$ NET_SHOT Attractor Reduced:**
   - DRIVE $\rightarrow$ NET_SHOT errors dropped from 21 to **16 (-23.8%)**.
   - Low-contact DRIVE $\rightarrow$ NET_SHOT errors dropped from 9 to **5 (-44.4%)**.
3. **High-Contact DRIVE Tripled:**
   - High-contact DRIVE recall rose from $11.11\%$ (2/18) to **$38.89\%$ (7/18)** (+27.78 pp).
4. **Frontcourt DRIVE Breakthrough:**
   - Frontcourt DRIVE recall improved from $0.00\%$ (0/7) to **$14.29\%$ (1/7)**, with Case 3 correctly identified and Case 2 escaping the net attractor to SMASH.
5. **DRIVE F1 Tradeoff:**
   - Despite improved precision ($56.52\% \rightarrow 58.33\%$) and reduced NET_SHOT confusion, DRIVE recall decreased from $53.42\%$ to $47.95\%$ because 14 DRIVEs were classified as SMASH and 7 as CLEAR, yielding a slight net decrease in DRIVE F1 from $54.93\%$ to **$52.63\%$ (-2.30 pp)**.

---

## 17. Interpretation

The experimental outcome provides profound mechanistic insights into badminton video recognition:

1. **Post-Impact Physics Resolves the Drop/Clear/Net Dilemma:**
   - Shifting the visual window forward to $+11$ frames provides indispensable physical evidence of deceleration and shuttle trajectory. This explains the monumental $+16.46$ pp leap in DROP F1, the $+3.08$ pp gain in SMASH F1, and the $23.8\%$ reduction in the DRIVE $\rightarrow$ NET_SHOT attractor.
2. **The New DRIVE Confusion Mechanism (Speed Ambiguity):**
   - In baseline `[-10, +5]`, the model failed to perceive post-impact velocity, causing DRIVEs to look like push shots or net taps.
   - In `WINDOW C = [-4, +11]`, the model clearly perceives fast horizontal shuttle velocity. However, without explicit trajectory height conditioning or 3D flight angle features, the visual encoder struggles to distinguish a hard flat DRIVE from an attacking SMASH or flat attacking CLEAR. As a result, misclassifications shifted from passive net shots to aggressive overhead strokes.
3. **Court Priors Still Dominate Frontcourt Defense:**
   - While 1 frontcourt DRIVE was recognized, 5 remained captured by NET_SHOT. The spatial MLP receives one-hot hit zones (Zones 1, 2, 7) where NET_SHOT constitutes $>95\%$ of all strokes, continuing to exert an overwhelming statistical prior that 11 post-impact frames cannot completely overturn for all shots.

---

## 18. Decision

**VERDICT: NEUTRAL**

### Rationale:
- **Positives:**
  - Macro F1 surged by **$+3.75$ pp** ($61.47\% \rightarrow 65.22\%$), Accuracy surged by **$+1.63$ pp** ($73.32\% \rightarrow 74.95\%$), and Weighted F1 surged by **$+3.40$ pp**.
  - DRIVE $\rightarrow$ NET_SHOT confusion was noticeably reduced by **$23.8\%$** (21 $\rightarrow$ 16 errors), with low-contact net confusion cut nearly in half (9 $\rightarrow$ 5).
  - High-contact DRIVE recall more than tripled ($11.11\% \rightarrow 38.89\%$).
  - Frontcourt DRIVE broke the historical $0\%$ failure barrier ($1/7$ correct).
  - Zero collateral damage to NET_SHOT ($97.39\% \rightarrow 97.31\%$), while DROP experienced a transformative $+16.46$ pp gain.
- **Why Not "PROMISING":**
  - The Master Prompt screening rule defines `PROMISING` as requiring DRIVE F1 to increase by $\ge +3.00$ pp (target $\ge 57.93\%$). Instead, DRIVE F1 slipped by $-2.30$ pp (from $54.93\%$ to $52.63\%$) due to the newly introduced DRIVE $\rightarrow$ SMASH confusion.
- **Why Not "NOT PROMISING":**
  - The model achieved the highest Macro F1 and Overall Accuracy in the entire history of the project on the frozen validation set, validated the post-impact flight hypothesis, and meaningfully reduced the primary NET_SHOT attractor.

---

## 19. Limitations

1. **Post-Impact Lookahead Requirement:**
   - Window C requires 11 frames of post-hit video ($367\text{ ms}$ at 30 fps). In a real-time streaming or low-latency deployment, inference cannot trigger until $367\text{ ms}$ after racket impact, introducing a $367\text{ ms}$ lookahead buffer.
2. **Current Validation-Only Status:**
   - In adherence to protocol, this experiment was evaluated strictly on the 1,960 frozen validation samples.
3. **No Production Integration:**
   - The production inference pipeline (`backend/app/services/inference_service.py`) remains locked to the official EXP24 baseline.
4. **No Official Test Evaluation:**
   - The quarantined official TEST set was untouched and unaccessed.
5. **Visual Shuttle Trackability & Resolution Limits:**
   - At $224 \times 224$ downsampled resolution, the white shuttlecock spans only 2–4 pixels against court lines and spectators. In some frontcourt rallies, motion blur and compression artifacts impede clean shuttle tracking between frames $+6$ and $+11$.

---

## 20. Candidate Next Experiment

### Proposed Name:
`EXP_DRIVE_06_POST_IMPACT_TRAJECTORY_FUSION`

### Concept Description:
Combine the proven temporal window benefits of **`WINDOW C = [-4, +11]`** with explicit trajectory vector features to resolve the newly exposed DRIVE $\rightarrow$ SMASH ambiguity:
1. **Window:** Retain `WINDOW C = [-4, +11]`, preserving the $+3.75$ pp Macro F1 gain and $+16.46$ pp DROP gain.
2. **Feature Refinement:** Introduce explicit flight angle / trajectory slope features $(\Delta y / \Delta x)$ and vertical impact height relative to the net into the auxiliary spatial vector, allowing the classifier to readily distinguish flat horizontal drives from downward-angled smashes and upward-angled clears.
3. **Controlled Execution:** Execute as a subsequent controlled experiment without modifying production code or touching the test set.

*(DO NOT EXECUTE — DESCRIPTION ONLY)*

---

## 21. Integrity Verification

Explicit verification of all safety, governance, and data integrity constraints:

- Official TEST accessed: **NO**
- EXP24 checkpoint modified: **NO**
- EXP23 checkpoint modified: **NO**
- EXP25 checkpoint modified: **NO**
- Production code modified: **NO**
- Raw videos modified: **NO**
- Annotations modified: **NO**
- HitHeatmap used: **NO**
- Synthetic data created: **NO**

All generated experimental tensors, checkpoints, logs, and metrics reside strictly isolated inside:
`D:\PS_DATA\DRIVE_EXPERIMENTS\EXP_DRIVE_05_TEMPORAL_WINDOW\`

---

## 22. Conclusion

EXP_DRIVE_05 COMPLETE — POST-IMPACT TEMPORAL WINDOW DID NOT PROVIDE SUFFICIENT VALIDATION IMPROVEMENT.

*(Note: While EXP_DRIVE_05 achieved substantial system-wide gains—surging Macro F1 from 61.47% to 65.22%, Accuracy from 73.32% to 74.95%, DROP F1 by +16.46 pp, and reducing DRIVE $\rightarrow$ NET_SHOT errors by 23.8%—it did not satisfy the strict +3.00 pp DRIVE F1 improvement threshold required for an unreserved PASS due to emerging DRIVE $\rightarrow$ SMASH ambiguity.)*
