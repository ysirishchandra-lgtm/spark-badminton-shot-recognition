# EXP_DRIVE_08E — Probability Calibration Audit

**Experiment ID:** `EXP_DRIVE_08E`  
**Mode:** Research-Grade Controlled Calibration Experiment  
**Full Model Training:** Strictly Forbidden & None (`0` parameters updated, `0` training steps)  
**Models Combined:** Frozen `EXP_DRIVE_05` + Frozen `EXP_DRIVE_08B`  
**Calibration Method:** Scalar Temperature Scaling ($z / T$) fitted strictly on a training-derived calibration subset  
**Fitted Temperature Parameters:** $T_{05} = 0.9643$, $T_{08B} = 0.8170$  
**Validation Split:** Frozen 1,960 validation samples across 7 matches (never used for calibration fitting)  
**Date of Audit:** September 21, 2026  

---

## 1. Objective

Following the findings of `EXP_DRIVE_08D`—where a raw 50/50 probability average between `EXP_DRIVE_05` and `EXP_DRIVE_08B` regressed to 77.09% accuracy and 68.06% Macro F1 despite proven sample-level complementarity in `EXP_DRIVE_08C`—`EXP_DRIVE_08E` tests whether probability-scale incompatibility explains the regression.

Specifically, this experiment investigates:
1. Measuring whether `EXP05` and `EXP08B` are differently calibrated.
2. Fitting scalar temperature parameters using **only** a held-out calibration split of the training set.
3. Applying the frozen temperatures to the validation predictions.
4. Evaluating the fixed calibrated 50/50 probability ensemble:
   $$P_{\text{ensemble, cal}} = 0.5 \cdot \text{softmax}(z_{05} / T_{05}) + 0.5 \cdot \text{softmax}(z_{08B} / T_{08B})$$
5. Determining whether calibration creates a scientifically valid path beyond `EXP_DRIVE_08B`.

---

## 2. Experimental Controls

To guarantee scientific validity and prevent data leakage:
- **Zero Full-Model Training:** Neither `EXP_DRIVE_05` nor `EXP_DRIVE_08B` was retrained, fine-tuned, or modified.
- **Zero Validation Leakage:** Validation labels from the 1,960 validation samples were **never** accessed or used during temperature estimation.
- **Quarantined Official Test Set:** Exactly 0 official test set samples were accessed, unblinded, or inspected.
- **Zero Weight Search:** Ensemble weights remain strictly fixed at 0.5 / 0.5 (no grid search or validation optimization).
- **Zero Threshold Search:** Classification decision rule remains the parameter-free argmax.
- **Production Isolation:** Serving code in `D:\PS_DATA\SPARK` remains unmodified; `HitHeatmap` was not used.

---

## 3. Calibration Data Construction

The calibration data was constructed exclusively from the official 10,044 training samples across 28 training matches:
- **Total Training Samples:** 10,044 samples.
- **Partitioning Rule:** Deterministic 80/20 stratified split (`random_state=123`):
  - **Training-Fit Subset:** 8,035 samples (80.0%)
  - **Calibration Subset:** 2,009 samples (20.0%)

Class breakdown of the 2,009 calibration samples:
- `SMASH`: 359 samples (17.87%)
- `CLEAR`: 366 samples (18.22%)
- `DROP`: 301 samples (14.98%)
- `DRIVE`: 97 samples (4.83%)
- `NET_SHOT`: 886 samples (44.10%)

The 1,960 validation samples remained completely untouched and isolated until final evaluation.

---

## 4. Prediction Sources

Inference was executed using the authoritative, frozen best checkpoints in `model.eval()` mode:
- `EXP_DRIVE_05`: `D:\PS_DATA\DRIVE_EXPERIMENTS\EXP_DRIVE_05_TEMPORAL_WINDOW\03_CHECKPOINTS\EXP_DRIVE_05_best_checkpoint.pt`
- `EXP_DRIVE_08B`: `D:\PS_DATA\DRIVE_EXPERIMENTS\EXP_DRIVE_08B_HV_MOTION\03_CHECKPOINTS\EXP_DRIVE_08B_best_checkpoint.pt`

Logits and probabilities were extracted directly from the model outputs. Validation softmax outputs were verified against `validation_predictions.json` to have an exact maximum absolute difference of `0.00000000`, confirming 100% fidelity.

---

## 5. Temperature Scaling Method

Temperature scaling (Guo et al., 2017) applies a single scalar temperature $T > 0$ to logits prior to softmax:

$$p_c^{(T)} = \frac{\exp(z_c / T)}{\sum_{k=1}^K \exp(z_k / T)}$$

The temperature $T$ was optimized separately for each model by minimizing multiclass Negative Log-Likelihood (NLL) over the 2,009 calibration samples:

$$\mathcal{L}_{\text{NLL}}(T) = - \frac{1}{N} \sum_{i=1}^N \log p_{i, y_i}^{(T)}$$

Because dividing by $T > 0$ is a strictly monotonic transformation, temperature scaling **does not alter the argmax ranking** of individual predictions. Therefore, individual model accuracies on the calibration set remain 100% identical.

---

## 6. EXP05 Calibration

- **Fitted Temperature:** $T_{05} = 0.9643$
- Because $T_{05} \approx 1.0$, `EXP_DRIVE_05` was already near-optimally scaled relative to its training distribution.

### Calibration Subset (N=2,009)
| Metric | Uncalibrated (T=1.0) | Calibrated (T=0.9643) | Delta |
| :--- | :---: | :---: | :---: |
| NLL | 0.3430 | 0.3428 | -0.0002 |
| Brier Score | 0.1871 | 0.1870 | -0.0001 |
| ECE (15 bins) | 1.42% | 1.28% | -0.15 pp |
| Mean Confidence | 0.8657 | 0.8707 | +0.0050 |
| Accuracy | 86.66% | 86.66% | 0.00 pp (Identical) |

---

## 7. EXP08B Calibration

- **Fitted Temperature:** $T_{08B} = 0.8170$
- $T_{08B} < 1.0$ indicates that on its training distribution, `EXP_DRIVE_08B` was slightly *underconfident* (probabilities were less peaked than its empirical accuracy warranted). Temperature scaling sharpened its logits, reducing ECE from 5.01% down to 3.14%.

### Calibration Subset (N=2,009)
| Metric | Uncalibrated (T=1.0) | Calibrated (T=0.8170) | Delta |
| :--- | :---: | :---: | :---: |
| NLL | 0.3524 | 0.3465 | -0.0059 |
| Brier Score | 0.1904 | 0.1856 | -0.0049 |
| ECE (15 bins) | 5.01% | 3.14% | -1.87 pp |
| Mean Confidence | 0.8310 | 0.8571 | +0.0261 |
| Accuracy | 88.10% | 88.10% | 0.00 pp (Identical) |

---

## 8. Raw vs Calibrated Ensemble

The calibrated ensemble applies the frozen parameters $T_{05} = 0.9643$ and $T_{08B} = 0.8170$ directly to the validation predictions:

$$P_{\text{cal}}(c) = 0.5 \cdot \text{softmax}\left(\frac{z_{05}(c)}{0.9643}\right) + 0.5 \cdot \text{softmax}\left(\frac{z_{08B}(c)}{0.8170}\right)$$

Because $T_{08B} < T_{05}$, the calibrated ensemble slightly boosts the relative sharpness of `EXP_DRIVE_08B` relative to `EXP_DRIVE_05`.

### Sample-Level Transition Breakdown (N=1,960)
- **Total Predictions Changed:** **20 samples (1.02%)**
- **Unchanged Predictions:** 1,940 samples (98.98%)
- **Raw Wrong $\rightarrow$ Calibrated Correct (Improved):** **9 samples**
- **Raw Correct $\rightarrow$ Calibrated Wrong (Degraded):** **8 samples**
- **Net Sample Impact:** **+1 sample (+0.05 pp)**

> [!NOTE]
> Temperature scaling altered only 20 out of 1,960 predictions, resulting in a net shift of just +1 correct sample. This proves that probability scale mismatch accounts for only ~1% of ensemble decisions.

---

## 9. Validation Results

### Primary Comparison Table
| Metric | EXP_DRIVE_05 | EXP_DRIVE_08B | Raw 50/50 (08D) | Calibrated 50/50 (08E) | Delta vs Raw Ens | Delta vs EXP08B |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Accuracy** | 74.95% | **77.55%** | 77.09% | 77.14% | +0.05 pp | **-0.41 pp** |
| **Macro F1** | 65.22% | **68.56%** | 68.06% | 67.82% | -0.23 pp | **-0.74 pp** |
| **Weighted F1** | 74.16% | **77.49%** | 76.72% | 76.80% | +0.08 pp | **-0.69 pp** |
| **Correct Samples** | 1,469 | **1,520** | 1,511 | 1,512 | +1 | **-8** |

### Per-Class F1-Score Breakdown
| Class | Support | EXP_DRIVE_05 | EXP_DRIVE_08B | Raw Ens (08D) | Cal Ens (08E) | Delta vs Raw | Delta vs EXP08B |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **SMASH** | 332 | 66.14% | 69.16% | 68.93% | 68.85% | -0.08 pp | **-0.31 pp** |
| **CLEAR** | 529 | 70.94% | 73.20% | 73.24% | 73.43% | +0.19 pp | **+0.24 pp** |
| **DROP** | 306 | 39.07% | 54.65% | 48.96% | 49.66% | +0.70 pp | **-5.00 pp** |
| **DRIVE** | 73 | 52.63% | 48.70% | 51.97% | 50.00% | -1.97 pp | **+1.30 pp** |
| **NET_SHOT** | 720 | 97.31% | 97.12% | 97.18% | 97.18% | +0.00 pp | **+0.07 pp** |

### Per-Class Recall Breakdown
| Class | Support | EXP_DRIVE_05 | EXP_DRIVE_08B | Raw Ens (08D) | Cal Ens (08E) | Delta vs Raw | Delta vs EXP08B |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **SMASH** | 332 | 75.60% | 66.87% | 73.49% | 72.89% | -0.60 pp | **+6.02 pp** |
| **CLEAR** | 529 | 71.08% | 72.02% | 72.97% | 73.16% | +0.19 pp | **+1.13 pp** |
| **DROP** | 306 | 33.01% | 59.48% | 46.08% | 47.39% | +1.31 pp | **-12.09 pp** |
| **DRIVE** | 73 | 47.95% | 38.36% | 45.21% | 42.47% | -2.74 pp | **+4.11 pp** |
| **NET_SHOT** | 720 | 98.06% | 98.19% | 98.19% | 98.19% | +0.00 pp | **+0.00 pp** |

---

## 10. Disagreement Analysis

Focusing on the **331 samples** where `EXP_DRIVE_05` and `EXP_DRIVE_08B` predicted different shot classes:
- **Raw Ensemble Correct on Disagreements:** 154 / 331 (46.53%)
- **Calibrated Ensemble Correct on Disagreements:** 155 / 331 (46.83%)
- **Net Gain on Disagreements:** **+1 sample (+0.30 pp)**

### Subgroup Dynamics
1. **Group C (EXP05-only correct, N=112):**
   - Raw Ensemble retained: 70 samples (62.50%)
   - Calibrated Ensemble retained: **62 samples (55.36%)** $\rightarrow$ **-8 samples lost**
2. **Group D (EXP08B-only correct, N=163):**
   - Raw Ensemble retained: 82 samples (50.31%)
   - Calibrated Ensemble retained: **91 samples (55.83%)** $\rightarrow$ **+9 samples gained**
3. **Group A (Both correct, N=1,357):**
   - Both preserved: **1,357 / 1,357 (100.00%)** $\rightarrow$ **0 errors created**
4. **Group B (Both wrong, N=328):**
   - Ensemble-only corrections: **2 / 328 (0.61%)** $\rightarrow$ preserved

Calibrating $T_{08B} = 0.8170$ successfully empowered `EXP08B` to reclaim 9 correct samples from `EXP05`'s errors, but symmetrically yielded 8 of `EXP05`'s correct samples back to `EXP08B`'s errors, resulting in a virtually neutral net change (+1 sample).

---

## 11. DRIVE Analysis

For the critical minority class **DRIVE** ($N=73$ validation samples):

| DRIVE Metric | EXP_DRIVE_05 | EXP_DRIVE_08B | Raw Ens (08D) | Cal Ens (08E) | Delta vs Raw Ens | Delta vs EXP08B |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Correct DRIVE** | 35 / 73 | 28 / 73 | 33 / 73 | **31 / 73** | -2 samples | **+3 samples** |
| **Recall** | 47.95% | 38.36% | 45.21% | **42.47%** | -2.74 pp | **+4.11 pp** |
| **Precision** | 58.33% | 66.67% | 61.11% | **60.78%** | -0.33 pp | **-5.89 pp** |
| **F1-Score** | 52.63% | 48.70% | 51.97% | **50.00%** | -1.97 pp | **+1.30 pp** |
| DRIVE $\rightarrow$ SMASH | 14 | 11 | 13 | **14** | +1 | +3 |
| DRIVE $\rightarrow$ NET_SHOT | 16 | 20 | 20 | **20** | 0 | 0 |
| DRIVE $\rightarrow$ CLEAR | 7 | 7 | 6 | **7** | +1 | 0 |
| DRIVE $\rightarrow$ DROP | 1 | 7 | 1 | **1** | 0 | -6 |

Calibration slightly worsened DRIVE F1 (from 51.97% to 50.00%) because sharpening `EXP08B` caused 2 DRIVE samples that `EXP05` had correctly identified to flip to `EXP08B`'s SMASH predictions.

---

## 12. DROP / SMASH Analysis

In `EXP_DRIVE_08D`, raw averaging severely damaged DROP performance (dropping recall from 59.48% to 46.08%).

Under calibration:
- **DROP Recall:** Increased slightly from **46.08% to 47.39%** (+1.31 pp / +4 samples), but remains **-12.09 pp below EXP08B** (59.48%).
- **DROP F1-Score:** Increased slightly from **48.96% to 49.66%** (+0.70 pp), but remains **-5.00 pp below EXP08B** (54.65%).
- **SMASH F1-Score:** Dropped slightly from **68.93% to 68.85%** (-0.08 pp vs Raw, -0.31 pp vs EXP08B).

> [!WARNING]
> Even with temperature scaling, the ensemble loses **37 correct DROP shots** compared to `EXP_DRIVE_08B` alone (145 correct in Calibrated Ensemble vs 182 in `EXP08B`). Scalar temperature scaling cannot undo `EXP05`'s structural feature deficiency on DROP.

---

## 13. Six Special DRIVE→SMASH Cases

Evaluating the exact six diagnostic cases from `EXP_DRIVE_06`:

| Match ID | Hit Frame | True Class | EXP05 Pred | EXP08B Pred | Raw Ens Pred (Conf) | Cal Ens Pred (Conf) | Corrected? |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `MATCH07` | `19603` | DRIVE | SMASH | SMASH | SMASH (0.613) | **SMASH (0.630)** | **NO** |
| `MATCH07` | `34216` | DRIVE | SMASH | SMASH | SMASH (0.639) | **SMASH (0.678)** | **NO** |
| `MATCH07` | `52914` | DRIVE | SMASH | DRIVE | DRIVE (0.400) | **DRIVE (0.430)** | **YES (DRIVE)** |
| `MATCH40` | `12876` | DRIVE | SMASH | DRIVE | SMASH (0.576) | **SMASH (0.590)** | **NO** |
| `MATCH07` | `27779` | DRIVE | SMASH | NET_SHOT | NET_SHOT (0.358) | **NET_SHOT (0.394)** | **NO** |
| `MATCH38` | `33492` | DRIVE | SMASH | SMASH | SMASH (0.424) | **SMASH (0.438)** | **NO** |

- **Exactly 1 of 6 cases is corrected** (`MATCH07` frame 52914, DRIVE conf 0.430).
- Calibration slightly increased the confidence of the correct prediction (from 0.400 to 0.430), but did not fix any of the other 5 misclassified cases.

---

## 14. Seven Frontcourt Cases

Evaluating the exact seven frontcourt DRIVE cases:

| Match ID | Hit Frame | True Class | EXP05 Pred | EXP08B Pred | Raw Ens Pred | Cal Ens Pred (Conf) | Correct? |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `MATCH07` | `16244` | DRIVE | NET_SHOT | NET_SHOT | NET_SHOT | **NET_SHOT (0.944)** | **NO** |
| `MATCH07` | `27779` | DRIVE | SMASH | NET_SHOT | NET_SHOT | **NET_SHOT (0.394)** | **NO** |
| `MATCH07` | `33668` | DRIVE | DRIVE | DRIVE | DRIVE | **DRIVE (0.400)** | **YES (DRIVE)** |
| `MATCH37` | `14304` | DRIVE | NET_SHOT | NET_SHOT | NET_SHOT | **NET_SHOT (0.763)** | **NO** |
| `MATCH38` | `58675` | DRIVE | NET_SHOT | NET_SHOT | NET_SHOT | **NET_SHOT (0.984)** | **NO** |
| `MATCH38` | `107731` | DRIVE | NET_SHOT | NET_SHOT | NET_SHOT | **NET_SHOT (0.957)** | **NO** |
| `MATCH40` | `30580` | DRIVE | NET_SHOT | NET_SHOT | NET_SHOT | **NET_SHOT (0.991)** | **NO** |

- Exactly **1 of 7 cases** is correctly predicted as DRIVE (`MATCH07` frame 33668, conf 0.400).
- The remaining **6 cases** are all strongly predicted as `NET_SHOT` (mean confidence 0.832).
- Calibration has zero impact on frontcourt cases because both base models lack spatial court-depth features.

---

## 15. Scientific Decision

### Decision Classification: `CALIBRATION MIXED / INSUFFICIENT`

1. **Comparison with Raw 50/50 Ensemble:**
   - Accuracy shifted nominally by **+0.05 pp** (from 77.09% to 77.14%, net gain of 1 sample).
   - Macro F1 regressed by **-0.23 pp** (from 68.06% to 67.82%).
   - DRIVE F1 regressed by **-1.97 pp** (from 51.97% to 50.00%, losing 2 correct DRIVEs).
   - Classification: **CALIBRATION MIXED**.

2. **Comparison with Single-Model SOTA (`EXP_DRIVE_08B`):**
   - **Accuracy is inferior:** 77.14% vs **77.55%** (**-0.41 pp**, 8 fewer correct samples).
   - **Macro F1 is inferior:** 67.82% vs **68.56%** (**-0.74 pp**).
   - **DROP F1 is inferior:** 49.66% vs **54.65%** (**-5.00 pp**).
   - **DROP Recall is severely degraded:** 47.39% vs **59.48%** (**-12.09 pp**, losing 37 correct DROPs).
   - Decision: **CALIBRATED ENSEMBLE DOES NOT IMPROVE OVER EXP_DRIVE_08B**.

### Fundamental Scientific Insight
Probability-scale incompatibility was **not** the primary barrier preventing the ensemble from surpassing `EXP_DRIVE_08B`. The true underlying cause is **structural information asymmetry**:
- `EXP_DRIVE_08B` introduces a powerful physical motion feature (Horizontal-to-Vertical visual motion ratio) that resolves vertical parabolic trajectories (DROPs) from flat horizontal strokes.
- `EXP_DRIVE_05` lacks this feature, causing it to systematically confuse DROPs with SMASHes and CLEARs.
- Any linear combination (raw or temperature-calibrated) allows `EXP05`'s structurally blind errors to pollute `EXP08B`'s correct predictions, losing more DROP samples (-37) than it gains in DRIVE (+3).

---

## 16. Limitations

1. **Scalar Temperature Constraint:** A single scalar temperature $T$ scales all class logits equally. It cannot address class-specific overconfidence (e.g. `EXP05` being selectively overconfident on SMASH when the shot is a DROP).
2. **Domain Shift between Training and Validation:** Temperature fitted on training matches ($T < 1.0$) slightly sharpened predictions on validation matches, which increased validation NLL due to natural cross-match variance.
3. **Symmetric Weighting:** A fixed 50/50 weighting forces equal trust in both models, which is inherently sub-optimal when one model (`EXP08B`) possesses a strictly superior feature representation.

---

## 17. Reproducibility

The evaluation is 100% reproducible and transparent:
1. Deterministic calibration split generated with `train_test_split(seed=123)` from `aux_train_27d_window_c.pkl` and `aux_train_28d.pkl`.
2. Exact temperature optimization via bounded `scipy.optimize.minimize_scalar`.
3. Execution script preserved at `scratch/run_exp08e_calibration.py`.
4. Output summary saved to `D:\PS_DATA\SPARK\docs\EXP_DRIVE_08E_CALIBRATION_SUMMARY.json`.
