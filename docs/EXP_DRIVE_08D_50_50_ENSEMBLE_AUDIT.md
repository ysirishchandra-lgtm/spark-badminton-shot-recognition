# EXP_DRIVE_08D — 50/50 Probability Ensemble Audit

**Experiment ID:** `EXP_DRIVE_08D`  
**Mode:** Read-Only Post-Hoc Ensemble Feasibility Test  
**Training Performed:** Strictly Forbidden & None (`0` parameters updated, `0` training steps)  
**Models Combined:** Frozen `EXP_DRIVE_05` + Frozen `EXP_DRIVE_08B`  
**Ensemble Rule:** Fixed parameter-free probability average: $P_{\text{ensemble}} = 0.5 \cdot P_{\text{EXP05}} + 0.5 \cdot P_{\text{EXP08B}}$  
**Decision Rule:** $\hat{y} = \arg\max(P_{\text{ensemble}})$  
**Date of Audit:** September 21, 2026  

---

## 1. Objective

The primary objective of `EXP_DRIVE_08D` is to evaluate whether a simple, transparent, parameter-free 50/50 probability-average ensemble of the two existing frozen models—`EXP_DRIVE_05` (temporal window baseline) and `EXP_DRIVE_08B` (horizontal-to-vertical visual motion fusion)—can improve classification performance over `EXP_DRIVE_08B` alone.

Key audit constraints maintained throughout:
- **Zero Training:** No model weights, checkpoints, or architectures were altered.
- **Zero Tuning:** No ensemble weight search, class-specific weight search, threshold tuning, or temperature scaling was permitted (fixed 0.5 / 0.5).
- **Quarantined Official Test Set:** Exactly 0 official test set samples were accessed or unblinded.
- **Frozen Validation Split:** The exact 1,960 validation samples across 7 matches were evaluated.
- **Production Isolation:** Serving code in `D:\PS_DATA\SPARK` remains unmodified.

---

## 2. Data Integrity

Both base models were evaluated on the exact frozen validation split comprising **1,960 samples** across 7 matches:
- `MATCH07` (515 samples)
- `MATCH08` (303 samples)
- `MATCH25` (215 samples)
- `MATCH31` (253 samples)
- `MATCH37` (221 samples)
- `MATCH38` (215 samples)
- `MATCH40` (238 samples)

Data integrity checks verified:
1. `validation_predictions.json` files for both models exist and were loaded from their authoritative experiment directories.
2. No synthetic samples, corrupted frames, or duplicate records were introduced.
3. `HitHeatmap` was strictly absent.

---

## 3. Prediction Alignment

Alignment was checked at the individual sample level for all 1,960 samples:
- **Sample Count:** Exactly 1,960 samples in both prediction artifacts.
- **Match ID Alignment:** 1,960 / 1,960 (100.00%) identical match IDs in identical sequence.
- **Hit Frame Alignment:** 1,960 / 1,960 (100.00%) identical hit frames in identical sequence.
- **Ground-Truth Class Alignment:** 1,960 / 1,960 (100.00%) identical ground-truth classes.

No sample re-indexing, filtering, or manual reordering was performed.

---

## 4. Probability Validation

Before ensemble computation, probability vectors were rigorously validated across all 1,960 samples:
1. **Vector Dimension:** Exactly 5 class probabilities per sample in both models.
2. **Finite Values:** 100% of probability values are finite (`NaN` = 0, `Inf` = 0).
3. **Simplex Constraint:** All probability vectors sum to $1.0 \pm 10^{-4}$.
4. **Class Ordering:** Identical 5-class canonical ordering resolved from metadata:
   `[0: SMASH, 1: CLEAR, 2: DROP, 3: DRIVE, 4: NET_SHOT]`

---

## 5. Ensemble Definition

For every validation sample $i \in \{1, \dots, 1960\}$ and class $c \in \{0, \dots, 4\}$:

$$P_{\text{ensemble}}(c) = 0.5 \cdot P_{\text{EXP05}}(c) + 0.5 \cdot P_{\text{EXP08B}}(c)$$

The predicted class index is:

$$\hat{y}_{\text{ensemble}} = \arg\max_{c} P_{\text{ensemble}}(c)$$

Associated ensemble confidence is defined as $\max_{c} P_{\text{ensemble}}(c)$.

---

## 6. Overall Results

| Metric | EXP_DRIVE_05 | EXP_DRIVE_08B | 50/50 Ensemble | Delta vs EXP05 | Delta vs EXP08B |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Validation Accuracy** | 74.95% | **77.55%** | 77.09% | +2.14 pp | **-0.46 pp** |
| **Macro F1** | 65.22% | **68.56%** | 68.06% | +2.84 pp | **-0.51 pp** |
| **Weighted F1** | 74.16% | **77.49%** | 76.72% | +2.56 pp | **-0.77 pp** |
| **Correct Samples** | 1,469 / 1,960 | **1,520 / 1,960** | 1,511 / 1,960 | +42 samples | **-9 samples** |

> [!WARNING]
> The fixed 50/50 probability ensemble regresses against `EXP_DRIVE_08B` on both primary metrics: **Accuracy drops by -0.46 pp** (from 77.55% to 77.09%, net loss of 9 samples) and **Macro F1 drops by -0.51 pp** (from 68.56% to 68.06%).

---

## 7. Per-Class Results

### F1-Score Comparison
| Class | Support | EXP_DRIVE_05 F1 | EXP_DRIVE_08B F1 | 50/50 Ensemble F1 | Delta vs EXP05 | Delta vs EXP08B |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **SMASH** | 332 | 66.14% | 69.16% | 68.93% | +2.79 pp | **-0.23 pp** |
| **CLEAR** | 529 | 70.94% | 73.20% | 73.24% | +2.30 pp | **+0.05 pp** |
| **DROP** | 306 | 39.07% | 54.65% | 48.96% | +9.89 pp | **-5.70 pp** |
| **DRIVE** | 73 | 52.63% | 48.70% | 51.97% | -0.66 pp | **+3.27 pp** |
| **NET_SHOT** | 720 | 97.31% | 97.12% | 97.18% | -0.13 pp | **+0.07 pp** |

### Recall Comparison
| Class | Support | EXP_DRIVE_05 Recall | EXP_DRIVE_08B Recall | 50/50 Ensemble Recall | Delta vs EXP05 | Delta vs EXP08B |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **SMASH** | 332 | 75.60% | 66.87% | 73.49% | -2.11 pp | **+6.63 pp** |
| **CLEAR** | 529 | 71.08% | 72.02% | 72.97% | +1.89 pp | **+0.95 pp** |
| **DROP** | 306 | 33.01% | 59.48% | 46.08% | +13.07 pp | **-13.40 pp** |
| **DRIVE** | 73 | 47.95% | 38.36% | 45.21% | -2.74 pp | **+6.85 pp** |
| **NET_SHOT** | 720 | 98.06% | 98.19% | 98.19% | +0.14 pp | **+0.00 pp** |

### Precision Comparison
| Class | Support | EXP_DRIVE_05 Precision | EXP_DRIVE_08B Precision | 50/50 Ensemble Precision | Delta vs EXP05 | Delta vs EXP08B |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **SMASH** | 332 | 58.78% | 71.61% | 64.89% | +6.11 pp | **-6.72 pp** |
| **CLEAR** | 529 | 70.81% | 74.41% | 73.52% | +2.71 pp | **-0.89 pp** |
| **DROP** | 306 | 47.87% | 50.56% | 52.22% | +4.35 pp | **+1.67 pp** |
| **DRIVE** | 73 | 58.33% | 66.67% | 61.11% | +2.78 pp | **-5.56 pp** |
| **NET_SHOT** | 720 | 96.58% | 96.06% | 96.19% | -0.39 pp | **+0.13 pp** |

### Detailed Mechanism of the DROP Collapse
The primary reason for the overall ensemble regression lies in the **DROP** class:
- In `EXP_DRIVE_08B`, the horizontal-to-vertical motion feature elevated DROP recall from 33.01% (101 samples) to 59.48% (182 samples, a gain of +81 correct DROPs).
- In the 50/50 ensemble, DROP recall plummets by **-13.40 pp** back down to 46.08% (141 samples, losing 41 of EXP08B's recovered DROPs).
- Because `EXP_DRIVE_05` had high, overconfident softmax outputs for SMASH and CLEAR when the true class was DROP, equal 50/50 weighting allowed EXP05's erroneous high probabilities to overpower EXP08B's correct DROP predictions.

---

## 8. Confusion Matrix

### 50/50 Ensemble Confusion Matrix (Rows = True, Columns = Predicted)

| True \ Pred | SMASH | CLEAR | DROP | DRIVE | NET_SHOT | Total | Recall |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **SMASH** | 244 | 43 | 37 | 6 | 2 | 332 | 73.49% |
| **CLEAR** | 45 | 386 | 91 | 2 | 5 | 529 | 72.97% |
| **DROP** | 72 | 89 | 141 | 3 | 1 | 306 | 46.08% |
| **DRIVE** | 13 | 6 | 1 | 33 | 20 | 73 | 45.21% |
| **NET_SHOT** | 2 | 1 | 0 | 10 | 707 | 720 | 98.19% |

### EXP_DRIVE_08B Baseline Confusion Matrix (for direct comparison)

| True \ Pred | SMASH | CLEAR | DROP | DRIVE | NET_SHOT | Total | Recall |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **SMASH** | 222 | 47 | 57 | 4 | 2 | 332 | 66.87% |
| **CLEAR** | 29 | 381 | 113 | 0 | 6 | 529 | 72.02% |
| **DROP** | 47 | 74 | 182 | 2 | 1 | 306 | 59.48% |
| **DRIVE** | 11 | 7 | 7 | 28 | 20 | 73 | 38.36% |
| **NET_SHOT** | 1 | 3 | 1 | 8 | 707 | 720 | 98.19% |

---

## 9. Disagreement Analysis

In `EXP_DRIVE_08C`, **331 samples** (16.89% of validation) were identified where `EXP_DRIVE_05` and `EXP_DRIVE_08B` predicted different shot classes.

Analyzing how the 50/50 probability ensemble resolved these 331 disagreements:
- **Ensemble Correct on Disagreements:** **154 samples (46.53%)**
- **Ensemble Wrong on Disagreements:** **177 samples (53.47%)**

Underlying composition of the 331 disagreements:
1. **Group C (EXP05 Correct, EXP08B Wrong, N=112):**
   - Ensemble followed EXP05 (Correct): **70 samples (62.50%)**
   - Ensemble followed EXP08B (Wrong): **42 samples (37.50%)**
2. **Group D (EXP08B Correct, EXP05 Wrong, N=163):**
   - Ensemble followed EXP08B (Correct): **82 samples (50.31%)**
   - Ensemble followed EXP05 (Wrong): **81 samples (49.69%)**
3. **Group F (Both Models Wrong on Disagreement, N=56):**
   - Ensemble produced correct prediction: **2 samples (3.57%)**
   - Ensemble remained wrong: **54 samples (96.43%)**

> [!IMPORTANT]
> Notice the asymmetry: `EXP_DRIVE_08B` was the stronger individual model (163 correct vs 112 for EXP05 on disagreements). However, because `EXP05` exhibited higher average confidence across disagreements (mean 0.814 vs 0.781), equal 50/50 weighting gave undue influence to EXP05. The ensemble retained only 50.31% of EXP08B's correct calls, while converting 81 correct EXP08B predictions into errors.

---

## 10. DRIVE Analysis

For the critical minority class **DRIVE** ($N=73$ validation samples):

| DRIVE Metric | EXP_DRIVE_05 | EXP_DRIVE_08B | 50/50 Ensemble | Delta vs EXP08B |
| :--- | :---: | :---: | :---: | :---: |
| **Correct DRIVE** | 35 / 73 (47.95%) | 28 / 73 (38.36%) | **33 / 73 (45.21%)** | **+5 samples (+6.85 pp)** |
| **DRIVE Precision** | 58.33% | 66.67% | **61.11%** | -5.56 pp |
| **DRIVE F1-Score** | 52.63% | 48.70% | **51.97%** | **+3.27 pp** |
| DRIVE $\rightarrow$ SMASH | 14 | 11 | **13** | +2 |
| DRIVE $\rightarrow$ NET_SHOT | 16 | 20 | **20** | +0 |
| DRIVE $\rightarrow$ CLEAR | 7 | 7 | **6** | -1 |
| DRIVE $\rightarrow$ DROP | 1 | 7 | **1** | -6 |

### Inspection of the 11 EXP05-Correct / EXP08B-Wrong DRIVE Samples
In `EXP_DRIVE_08C`, 11 DRIVE samples were identified where EXP05 was correct but EXP08B failed. The 50/50 ensemble successfully recovered **7 out of 11 (63.6%)**:
- `MATCH07` frame 27765: EXP05=DRIVE (0.688), EXP08B=DROP (0.439) $\rightarrow$ **Ensemble=DRIVE (0.521) [RECOVERED]**
- `MATCH07` frame 52901: EXP05=DRIVE (0.749), EXP08B=NET_SHOT (0.523) $\rightarrow$ **Ensemble=DRIVE (0.555) [RECOVERED]**
- `MATCH31` frame 18703: EXP05=DRIVE (0.614), EXP08B=SMASH (0.423) $\rightarrow$ **Ensemble=DRIVE (0.408) [RECOVERED]**
- `MATCH31` frame 66567: EXP05=DRIVE (0.380), EXP08B=CLEAR (0.390) $\rightarrow$ **Ensemble=DRIVE (0.365) [RECOVERED]**
- `MATCH37` frame 20207: EXP05=DRIVE (0.714), EXP08B=DROP (0.313) $\rightarrow$ **Ensemble=DRIVE (0.502) [RECOVERED]**
- `MATCH37` frame 20343: EXP05=DRIVE (0.532), EXP08B=SMASH (0.471) $\rightarrow$ **Ensemble=DRIVE (0.326) [RECOVERED]**
- `MATCH37` frame 73148: EXP05=DRIVE (0.596), EXP08B=CLEAR (0.643) $\rightarrow$ **Ensemble=DRIVE (0.382) [RECOVERED]**

The remaining 4 samples were lost because EXP08B had high-confidence misclassifications into NET_SHOT or SMASH:
- `MATCH07` frame 19613: EXP05=DRIVE (0.737), EXP08B=NET_SHOT (0.746) $\rightarrow$ Ensemble=NET_SHOT (0.500) [LOST]
- `MATCH07` frame 23999: EXP05=DRIVE (0.406), EXP08B=NET_SHOT (0.830) $\rightarrow$ Ensemble=NET_SHOT (0.603) [LOST]
- `MATCH07` frame 79821: EXP05=DRIVE (0.567), EXP08B=SMASH (0.621) $\rightarrow$ Ensemble=SMASH (0.517) [LOST]
- `MATCH31` frame 31649: EXP05=DRIVE (0.511), EXP08B=NET_SHOT (0.678) $\rightarrow$ Ensemble=NET_SHOT (0.554) [LOST]

### Inspection of the 4 EXP08B-Correct / EXP05-Wrong DRIVE Samples
Of the 4 DRIVE samples where EXP08B was correct and EXP05 was wrong:
- `MATCH07` frame 52914: EXP05=SMASH (0.489), EXP08B=DRIVE (0.478) $\rightarrow$ **Ensemble=DRIVE (0.400) [RETAINED]**
- `MATCH40` frame 38277: EXP05=CLEAR (0.301), EXP08B=DRIVE (0.447) $\rightarrow$ **Ensemble=DRIVE (0.372) [RETAINED]**
- `MATCH38` frame 107536: EXP05=NET_SHOT (0.660), EXP08B=DRIVE (0.421) $\rightarrow$ Ensemble=NET_SHOT (0.480) [LOST]
- `MATCH40` frame 12876: EXP05=SMASH (0.809), EXP08B=DRIVE (0.406) $\rightarrow$ Ensemble=SMASH (0.576) [LOST]

---

## 11. Six Special DRIVE→SMASH Cases

Evaluating the exact six diagnostic cases from `EXP_DRIVE_06`:

| Match ID | Hit Frame | True Class | EXP_DRIVE_05 Pred (Conf) | EXP_DRIVE_08B Pred (Conf) | 50/50 Ensemble Pred (Conf) | P(DRIVE) | P(SMASH) | Corrected? |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `MATCH07` | `19603` | DRIVE | SMASH (0.702) | SMASH (0.525) | **SMASH (0.613)** | 0.355 | 0.613 | **NO** |
| `MATCH07` | `34216` | DRIVE | SMASH (0.550) | SMASH (0.728) | **SMASH (0.639)** | 0.277 | 0.639 | **NO** |
| `MATCH07` | `52914` | DRIVE | SMASH (0.489) | DRIVE (0.478) | **DRIVE (0.400)** | 0.400 | 0.354 | **YES (DRIVE)** |
| `MATCH40` | `12876` | DRIVE | SMASH (0.809) | DRIVE (0.406) | **SMASH (0.576)** | 0.278 | 0.576 | **NO** |
| `MATCH07` | `27779` | DRIVE | SMASH (0.558) | NET_SHOT (0.617) | **NET_SHOT (0.358)** | 0.247 | 0.353 | **NO** |
| `MATCH38` | `33492` | DRIVE | SMASH (0.518) | SMASH (0.330) | **SMASH (0.424)** | 0.139 | 0.424 | **NO** |

### Summary on 6 Diagnostic Cases
- **1 of 6 cases is correctly predicted as DRIVE** (`MATCH07` frame 52914), retained from `EXP08B`.
- In `MATCH40` frame 12876, `EXP08B` had correctly solved the case with DRIVE (0.406), but `EXP05` had an extreme SMASH confidence of 0.809, dragging the ensemble back to SMASH (0.576).
- The remaining 4 cases (`MATCH07` frames 19603, 34216, 27779, and `MATCH38` frame 33492) remain unresolved.

---

## 12. Seven Frontcourt Cases

Evaluating the exact seven frontcourt DRIVE cases:

| Match ID | Hit Frame | True Class | EXP_DRIVE_05 Pred | EXP_DRIVE_08B Pred | 50/50 Ensemble Pred (Conf) | Top-2 Classes & Probs | Correct? |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- | :---: |
| `MATCH07` | `16244` | DRIVE | NET_SHOT | NET_SHOT | **NET_SHOT (0.923)** | `NET_SHOT: 0.923, DRIVE: 0.052` | **NO** |
| `MATCH07` | `27779` | DRIVE | SMASH | NET_SHOT | **NET_SHOT (0.358)** | `NET_SHOT: 0.358, SMASH: 0.353` | **NO** |
| `MATCH07` | `33668` | DRIVE | DRIVE | DRIVE | **DRIVE (0.381)** | `DRIVE: 0.381, NET_SHOT: 0.278` | **YES (DRIVE)** |
| `MATCH37` | `14304` | DRIVE | NET_SHOT | NET_SHOT | **NET_SHOT (0.729)** | `NET_SHOT: 0.729, DRIVE: 0.208` | **NO** |
| `MATCH38` | `58675` | DRIVE | NET_SHOT | NET_SHOT | **NET_SHOT (0.973)** | `NET_SHOT: 0.973, DRIVE: 0.024` | **NO** |
| `MATCH38` | `107731` | DRIVE | NET_SHOT | NET_SHOT | **NET_SHOT (0.931)** | `NET_SHOT: 0.931, DRIVE: 0.054` | **NO** |
| `MATCH40` | `30580` | DRIVE | NET_SHOT | NET_SHOT | **NET_SHOT (0.987)** | `NET_SHOT: 0.987, DRIVE: 0.013` | **NO** |

### Summary on 7 Frontcourt Cases
- Exactly **1 of 7 cases** is correctly predicted as DRIVE (`MATCH07` frame 33668, conf 0.381).
- The remaining **6 cases** are all predicted as `NET_SHOT` with high confidence (mean 0.817).
- Because frontcourt visual trajectory signatures strongly overlap with tight net shots, simple probability averaging cannot resolve frontcourt DRIVE confusion when both base models lack spatial court-depth priors.

---

## 13. Ensemble Corrections

A major diagnostic finding in `EXP_DRIVE_08D` is the discovery of **Ensemble-Only Corrections**:
- **Total Ensemble-Only Corrections:** **2 samples (0.10%)**
- In these cases, **both EXP05 and EXP08B were wrong individually**, but the 50/50 probability average combined their sub-threshold mass onto the true class to produce the correct prediction!

### Detailed Case Breakdown
1. **Sample 357 (`MATCH07`, Frame 31356):**
   - Ground-Truth: `CLEAR`
   - `EXP_DRIVE_05`: Predicted `DRIVE` (0.392), $P(\text{CLEAR}) = 0.354$
   - `EXP_DRIVE_08B`: Predicted `DROP` (0.333), $P(\text{CLEAR}) = 0.220$
   - **Ensemble Result:** $P(\text{CLEAR}) = 0.5(0.354) + 0.5(0.220) = \mathbf{0.287}$.
   - Because EXP05 split mass between DRIVE (0.263 in ensemble) and EXP08B split mass to DROP (0.239 in ensemble), `CLEAR` emerged as the argmax! **[CORRECTED BY ENSEMBLE]**

2. **Sample 555 (`MATCH31`, Frame 16739):**
   - Ground-Truth: `CLEAR`
   - `EXP_DRIVE_05`: Predicted `SMASH` (0.403), $P(\text{CLEAR}) = 0.341$
   - `EXP_DRIVE_08B`: Predicted `DROP` (0.449), $P(\text{CLEAR}) = 0.387$
   - **Ensemble Result:** $P(\text{CLEAR}) = 0.5(0.341) + 0.5(0.387) = \mathbf{0.364}$, outscoring `DROP` (0.352) and `SMASH` (0.283)! **[CORRECTED BY ENSEMBLE]**

---

## 14. Ensemble-Created Errors

We audited whether the ensemble ever broke an existing agreement where both base models were correct:
- **Samples where both EXP05 and EXP08B were correct:** 1,357 samples
- **Samples where ensemble predicted correctly:** **1,357 samples (100.00%)**
- **Ensemble-created errors on agreed correct samples:** **0 samples (0.00%)**

> [!TIP]
> The 50/50 probability ensemble has a **0% error creation rate on unanimous ground-truth agreements**. It never breaks consensus when both models are correct.

However, on disagreement samples where only one model was correct:
- On Group D (where EXP08B was correct and EXP05 was wrong, N=163), the ensemble made an error on **81 samples (49.69%)** by following EXP05's erroneous prediction.
- On Group C (where EXP05 was correct and EXP08B was wrong, N=112), the ensemble made an error on **42 samples (37.50%)** by following EXP08B's erroneous prediction.

---

## 15. Oracle Ceiling Comparison

In `EXP_DRIVE_08C`, the theoretical Oracle Union ceiling was established:
- **Oracle Union Accuracy:** **83.27%** (1,632 / 1,960 samples)
- **Actual 50/50 Ensemble Accuracy:** **77.09%** (1,511 / 1,960 samples)
- **Gap to Oracle Ceiling:** **-6.18 pp** (121 samples)

| System | Accuracy | Correct Samples | Errors | Delta vs EXP08B |
| :--- | :---: | :---: | :---: | :---: |
| EXP_DRIVE_05 | 74.95% | 1,469 | 491 | -2.60 pp |
| EXP_DRIVE_08B | 77.55% | 1,520 | 440 | Baseline |
| **50/50 Ensemble (Actual)** | **77.09%** | **1,511** | **449** | **-0.46 pp** |
| *Theoretical Oracle Ceiling* | *83.27%* | *1,632* | *328* | *+5.72 pp* |

The 50/50 ensemble realized only a fraction of the theoretical union potential because simple probability averaging lacks confidence calibration, causing the higher-confidence (but less accurate) model (`EXP05`) to dominate on critical disagreement boundaries.

---

## 16. Scientific Decision

### Decision Classification: `REGRESSION`

Based on the complete metric profile:
1. **Overall Validation Accuracy:** Dropped from **77.55% to 77.09%** (**-0.46 pp**, net loss of 9 samples).
2. **Macro F1-Score:** Dropped from **68.56% to 68.06%** (**-0.51 pp**).
3. **Weighted F1-Score:** Dropped from **77.49% to 76.72%** (**-0.77 pp**).
4. **DROP Collapse:** DROP F1 dropped by **-5.70 pp** (from 54.65% to 48.96%) and DROP recall collapsed by **-13.40 pp** (from 59.48% to 46.08%, losing 41 correct DROP shots).
5. **DRIVE Trade-off:** Although DRIVE F1 improved (+3.27 pp, from 48.70% to 51.97%) and DRIVE recall gained +5 samples (from 28 to 33), this local gain was heavily outweighed by the global loss across DROP.

Because both overall Validation Accuracy and Macro F1 regressed compared to `EXP_DRIVE_08B`, the fixed 50/50 probability ensemble is formally classified as a **REGRESSION**.

---

## 17. Limitations

1. **Lack of Probability Calibration:** The two models were trained with standard Cross-Entropy without post-hoc temperature scaling or Platt scaling. `EXP_DRIVE_05` produces higher average confidence (0.814) than `EXP_DRIVE_08B` (0.781), creating an inherent bias toward EXP05's errors during linear averaging.
2. **Equal Weight Assumption:** An equal 50/50 split assumes equal model capability across all shot classes, which is violated because `EXP_DRIVE_08B` possesses visual motion features that drastically outperform `EXP_DRIVE_05` on DROP and SMASH/CLEAR separation.
3. **Frontcourt Blind Spot:** Neither model possesses court depth / spatial location features, meaning neither model can reliably differentiate frontcourt drives from tight net shots.

---

## 18. Reproducibility

The evaluation is 100% deterministic, zero-parameter, and reproducible:
1. Base model predictions loaded from:
   - `D:\PS_DATA\DRIVE_EXPERIMENTS\EXP_DRIVE_05_TEMPORAL_WINDOW\05_RESULTS\validation_predictions.json`
   - `D:\PS_DATA\DRIVE_EXPERIMENTS\EXP_DRIVE_08B_HV_MOTION\04_RESULTS\validation_predictions.json`
2. Python audit script executed with scikit-learn standard metrics.
3. Exact script archived in scratch workspace: `analyze_exp08d.py`.
4. Summary metrics exported to `D:\PS_DATA\SPARK\docs\EXP_DRIVE_08D_50_50_ENSEMBLE_SUMMARY.json`.
