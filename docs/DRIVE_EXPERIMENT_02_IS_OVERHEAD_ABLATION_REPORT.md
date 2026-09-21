# DRIVE Experiment 02 — is_overhead Ablation

## 1. Objective

The objective of **EXP_DRIVE_02_IS_OVERHEAD_ABLATION** is to conduct a single-variable, validation-only controlled ablation test to determine whether the binary auxiliary feature `is_overhead` (dimension 6, index 5 in the 27-D auxiliary feature vector) acts as a misleading shortcut contributing to the dominant **DRIVE → NET_SHOT** misclassification observed in the frozen **EXP24** multimodal model (`MultimodalTransformerLSTMClassifier`).

---

## 2. Hypothesis

**Formal Hypothesis:**
> *"The binary `is_overhead` feature may provide a shortcut that contributes to DRIVE → NET_SHOT confusion because the feature is highly associated with NET_SHOT in the validation data."*

In the DRIVE Confusion Audit, `NET_SHOT` had a 96.25% prevalence of `is_overhead = 1.0`, whereas DRIVE validation samples flagged with `is_overhead = 1.0` suffered an 88.89% error rate (16/18 misclassified, with 12 misclassified as `NET_SHOT`). This experiment tests whether eliminating this binary flag reduces DRIVE → NET_SHOT confusion without causing unacceptable collateral damage to other classes.

---

## 3. EXP24 Baseline

The unablated baseline model is the frozen EXP24 checkpoint located at:
`D:\PS_DATA\EXP24_MULTIMODAL_TRANSFORMER_BILSTM\08_BEST_CHECKPOINT.pt`

Prior to training, the baseline model was evaluated on the exact frozen 1,960-sample validation split (`aux_val_27d.pkl`), reproducing the published reference metrics exactly:
- **Overall Accuracy:** 73.32% (1,437 / 1,960)
- **Macro F1:** 61.47%
- **Weighted F1:** 70.76%
- **DRIVE Precision:** 56.52% (39 / 69)
- **DRIVE Recall:** 53.42% (39 / 73)
- **DRIVE F1:** 54.93%
- **DRIVE → NET_SHOT Errors:** 21 (28.77% of all ground-truth DRIVEs)
- **NET_SHOT → DRIVE False Positives:** 7

---

## 4. 27-D Feature Mapping

The 27-dimensional auxiliary feature vector input to the spatial MLP (`Linear(27, 64) → ReLU → Dropout(0.3) → Linear(64, 64)`) is constructed per `aux_27_feature_spec.json` as follows:

| Index | Feature Name | Source / Meaning | Type | Normalization |
|:-----:|:-------------|:-----------------|:----:|:--------------|
| 0 | `norm_hit_x` | Shuttle X coordinate at hit frame | Continuous | MinMax `[-1.0, 1.0]` |
| 1 | `norm_hit_y` | Shuttle Y coordinate at hit frame | Continuous | MinMax `[-1.0, 1.0]` |
| 2 | `norm_player_x` | Striking player X coordinate at hit frame | Continuous | MinMax `[-1.0, 1.0]` |
| 3 | `norm_player_y` | Striking player Y coordinate at hit frame | Continuous | MinMax `[-1.0, 1.0]` |
| 4 | `coord_missing` | Missing coordinate indicator flag | Binary | `{0.0, 1.0}` |
| **5** | **`is_overhead`** | **Racket hit height above head indicator** | **Binary** | **`{0.0, 1.0}`** |
| 6 | `is_aroundhead` | Racket trajectory around head indicator | Binary | `{0.0, 1.0}` |
| 7 | `is_backhand` | Backhand stroke mechanics indicator | Binary | `{0.0, 1.0}` |
| 8 | `area_onehot_0` | Court Zone 0 (Unknown / Out-of-bounds) | One-hot | `{0.0, 1.0}` |
| 9 | `area_onehot_1` | Court Zone 1 (Front Left) | One-hot | `{0.0, 1.0}` |
| 10 | `area_onehot_2` | Court Zone 2 (Front Center) | One-hot | `{0.0, 1.0}` |
| 11 | `area_onehot_3` | Court Zone 3 (Midcourt Left) | One-hot | `{0.0, 1.0}` |
| 12 | `area_onehot_4` | Court Zone 4 (Midcourt Center) | One-hot | `{0.0, 1.0}` |
| 13 | `area_onehot_5` | Court Zone 5 (Midcourt Right) | One-hot | `{0.0, 1.0}` |
| 14 | `area_onehot_6` | Court Zone 6 (Rear Left) | One-hot | `{0.0, 1.0}` |
| 15 | `area_onehot_7` | Court Zone 7 (Front Right) | One-hot | `{0.0, 1.0}` |
| 16 | `area_onehot_8` | Court Zone 8 (Rear Center) | One-hot | `{0.0, 1.0}` |
| 17 | `area_onehot_9` | Court Zone 9 (Rear Right) | One-hot | `{0.0, 1.0}` |
| 18 | `norm_opp_x` | Opponent X coordinate at hit frame | Continuous | MinMax `[-1.0, 1.0]` |
| 19 | `norm_opp_y` | Opponent Y coordinate at hit frame | Continuous | MinMax `[-1.0, 1.0]` |
| 20 | `opp_coord_missing` | Missing opponent coordinate flag | Binary | `{0.0, 1.0}` |
| 21 | `norm_delta_reach_x` | Relative X distance (player to shuttle) | Continuous | MinMax `[-1.0, 1.0]` |
| 22 | `norm_delta_reach_y` | Relative Y distance (player to shuttle) | Continuous | MinMax `[-1.0, 1.0]` |
| 23 | `norm_dist_reach` | Euclidean distance (player to shuttle) | Continuous | MinMax `[0.0, 1.0]` |
| 24 | `norm_delta_opp_x` | Relative X distance (player to opponent) | Continuous | MinMax `[-1.0, 1.0]` |
| 25 | `norm_delta_opp_y` | Relative Y distance (player to opponent) | Continuous | MinMax `[-1.0, 1.0]` |
| 26 | `norm_dist_opp` | Euclidean distance (player to opponent) | Continuous | MinMax `[0.0, 1.0]` |

---

## 5. Exact is_overhead Representation

- **Feature Index:** Dimension 6 (0-indexed position: **5**).
- **Source Annotation:** Derived from badminton stroke contact height annotation indicating whether contact occurs above the player's head.
- **Data Type & Values:** Binary categorical indicator, stored as `float32`:
  - `0.0`: Hit contact is below head level (waist/underhand/flat contact).
  - `1.0`: Hit contact is above head level (overhead contact).
- **Distribution in Dataset:**
  - **Training Split (10,044 samples):** 4,604 positive (`1.0`, 45.84%), 5,440 negative (`0.0`, 54.16%).
  - **Validation Split (1,960 samples):** 728 positive (`1.0`, 37.14%), 1,232 negative (`0.0`, 62.86%).
  - **DRIVE Validation Class (73 samples):** 18 positive (`1.0`, 24.66%), 55 negative (`0.0`, 75.34%).
  - **NET_SHOT Validation Class (720 samples):** 693 positive (`1.0`, 96.25%), 27 negative (`0.0`, 3.75%).

---

## 6. Ablation Method

To strictly preserve model architecture, input dimensionality, and tensor shapes without altering the spatial MLP input layer (`Linear(27, 64)`), the ablation was executed via **feature neutralization**:
- Input dimension was kept strictly at **27**.
- In every sample of both the training set and the validation set, feature index 5 (`is_overhead`) was clamped to the constant neutral value.
- This effectively zeroes out the linear weight contribution and gradient update for column 5 of the first linear weight matrix $W \in \mathbb{R}^{64 \times 27}$, removing any variation in `is_overhead` without introducing an architecture change.

---

## 7. Neutral Value

- **Neutral Value Chosen:** `0.0`
- **Rationale:** 
  1. In the binary encoding scheme $\{0.0, 1.0\}$, `0.0` represents the unflagged state (no overhead contact detected).
  2. Setting $x_5 = 0.0$ implies that for all hidden neurons $j$, the term $W_{j,5} \cdot x_5 = 0.0$, neutralizing the feature to zero active activation energy.
  3. Consistent across both **TRAIN** (10,044 samples) and **VALIDATION** (1,960 samples) splits to prevent train/validation distribution mismatch.

---

## 8. Training Configuration

The training protocol was kept strictly identical to the original EXP24 model:

| Hyperparameter / Component | Value | Notes |
|:---|:---|:---|
| **Base Architecture** | `MultimodalTransformerLSTMClassifier` | Identical to EXP24 |
| **Model Parameters** | 337,157 | Identical parameter count |
| **Random Seed** | 123 | Deterministic PyTorch & NumPy seeds |
| **Optimizer** | Adam (`lr=1e-3`, `weight_decay=1e-4`) | Identical |
| **Loss Function** | Standard `CrossEntropyLoss` (Unweighted) | No class weights applied |
| **Batch Size** | 64 | Identical |
| **Max Epochs** | 30 | Full epoch budget available |
| **Early Stopping** | Patience = 8 epochs | Monitored on Val Acc / Macro F1 |
| **Best Epoch** | **Epoch 28** | Best Val Acc: 72.30%, Macro F1: 62.53% |
| **Total Training Time** | 465.65 s (~7.76 min) | Executed on CPU |
| **Training Split** | 10,044 samples (`aux_train_27d.pkl`) | Quarantined from TEST |
| **Validation Split** | 1,960 samples (`aux_val_27d.pkl`) | Quarantined from TEST |
| **Official TEST Set** | 0 samples accessed | Strictly locked |

---

## 9. Validation Results

At Best Epoch (Epoch 28), evaluation on the 1,960-sample validation set yielded:

| Class | Precision (%) | Recall (%) | F1-Score (%) | Support |
|:---|:---:|:---:|:---:|:---:|
| **SMASH** | 58.42 | 71.08 | 64.13 | 332 |
| **CLEAR** | 66.19 | 61.44 | 63.73 | 529 |
| **DROP** | 45.32 | 39.54 | 42.23 | 306 |
| **DRIVE** | 62.79 | 36.99 | 46.55 | 73 |
| **NET_SHOT** | 93.77 | 98.33 | 96.00 | 720 |
| **Overall Accuracy** | — | — | **72.30%** | 1,960 |
| **Macro Average** | 65.30 | 61.48 | **62.53%** | 1,960 |
| **Weighted Average** | 71.62 | 72.30 | **71.66%** | 1,960 |

---

## 10. Baseline vs Ablation

Direct side-by-side comparison between the frozen EXP24 baseline and DRIVE-02 (`is_overhead` ablated):

| Metric | EXP24 Baseline | DRIVE-02 (Ablated) | Delta | Status |
|:---|:---:|:---:|:---:|:---:|
| **Overall Accuracy** | 73.32% | 72.30% | **-1.02 pp** | Slight decrease |
| **Macro F1** | 61.47% | 62.53% | **+1.06 pp** | Slight increase (driven by DROP) |
| **Weighted F1** | 70.76% | 71.66% | **+0.90 pp** | Slight increase |
| **DRIVE Precision** | 56.52% | 62.79% | **+6.27 pp** | Improved (due to underprediction) |
| **DRIVE Recall** | **53.42%** (39/73) | **36.99%** (27/73) | **-16.43 pp** | **Severe degradation (-12 samples)** |
| **DRIVE F1** | **54.93%** | **46.55%** | **-8.38 pp** | **Severe degradation** |
| **DRIVE → NET_SHOT** | **21** | **27** | **+6 errors** | **Worsened (+28.6% more errors)** |
| **NET_SHOT → DRIVE** | 7 | 6 | -1 error | Minimal change |
| **High-Contact DRIVE Recall (`oh=1`)** | 11.11% (2/18) | 27.78% (5/18) | **+16.67 pp** | Improved (+3 correct) |
| **Low-Contact DRIVE Recall (`oh=0`)** | **67.27%** (37/55) | **40.00%** (22/55) | **-27.27 pp** | **Catastrophic collapse (-15 correct)** |
| **Frontcourt DRIVE Recall (Zones 1,2,7)** | 0.00% (0/7) | 0.00% (0/7) | 0.00 pp | Unchanged (all 7 → NET_SHOT) |
| **NET_SHOT F1** | 97.39% | 96.00% | -1.39 pp | Mild degradation |
| **SMASH F1** | 63.06% | 64.13% | +1.07 pp | Stable |
| **CLEAR F1** | 69.37% | 63.73% | **-5.64 pp** | Collateral degradation |
| **DROP F1** | 22.61% | 42.23% | **+19.62 pp** | Significant collateral gain |

---

## 11. DRIVE Confusion Analysis

### Confusion Matrix Breakdown for Ground-Truth DRIVE (N = 73)

| Destination Prediction | EXP24 Baseline | DRIVE-02 (Ablated) | Delta (Count) |
|:---|:---:|:---:|:---:|
| **Correct DRIVE** | **39** (53.42%) | **27** (36.99%) | **-12** |
| **Misclassified as NET_SHOT** | **21** (28.77%) | **27** (36.99%) | **+6** |
| **Misclassified as SMASH** | 10 (13.70%) | 11 (15.07%) | +1 |
| **Misclassified as CLEAR** | 3 (4.11%) | 3 (4.11%) | 0 |
| **Misclassified as DROP** | 0 (0.00%) | 5 (6.85%) | +5 |

### False Positive Sources Predicting DRIVE (Predicted DRIVEs)

| Source Ground-Truth Class | EXP24 Baseline | DRIVE-02 (Ablated) | Delta (Count) |
|:---|:---:|:---:|:---:|
| **True DRIVE (True Positives)** | 39 | 27 | -12 |
| **From NET_SHOT** | 7 | 6 | -1 |
| **From SMASH** | 11 | 5 | -6 |
| **From CLEAR** | 7 | 4 | -3 |
| **From DROP** | 5 | 1 | -4 |
| **Total False Positives** | 30 | 16 | -14 |
| **Total Predicted DRIVEs** | 69 | 43 | -26 |

**Critical Observation:** Ablating `is_overhead` did **not** decrease DRIVE → NET_SHOT errors. Instead, DRIVE → NET_SHOT errors increased from **21 to 27**. Furthermore, 5 DRIVE samples were newly misclassified as `DROP`.

---

## 12. High-Contact DRIVE Analysis

The DRIVE Confusion Audit showed that DRIVE samples with `is_overhead = 1.0` (high-contact / chest-to-head height strokes) were nearly all misclassified (16/18 errors in EXP24).

Using the **ORIGINAL real annotation** for ground-truth DRIVE validation samples:

| Subgroup | Support | Baseline Correct (EXP24) | Baseline Recall | DRIVE-02 Correct | DRIVE-02 Recall | Subgroup Delta |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **High-Contact (`is_overhead = 1`)** | 18 | 2 | 11.11% | 5 | **27.78%** | **+16.67 pp (+3 correct)** |
| **Low-Contact (`is_overhead = 0`)** | 55 | 37 | **67.27%** | 22 | **40.00%** | **-27.27 pp (-15 correct)** |
| **All DRIVE Validation Samples** | 73 | 39 | 53.42% | 27 | 36.99% | -16.43 pp (-12 correct) |

**Key Diagnostic Finding:**
Neutralizing `is_overhead` modestly helped high-contact DRIVEs (+3 samples correct, from 2 to 5). However, it devastated low-contact DRIVEs (-15 samples correct, crashing from 37 to 22).

---

## 13. Frontcourt Analysis

Using the spatial court zone one-hot representation (Zones 1, 2, 7 corresponding to Front Left, Front Center, Front Right):

| Metric | EXP24 Baseline | DRIVE-02 (Ablated) | Delta |
|:---|:---:|:---:|:---:|
| **Frontcourt DRIVE Support** | 7 | 7 | 0 |
| **Frontcourt DRIVE Correct** | 0 | 0 | 0 |
| **Frontcourt DRIVE Recall** | 0.00% | 0.00% | 0.00 pp |
| **Frontcourt DRIVE → NET_SHOT** | 7 (100.0%) | 7 (100.0%) | 0 |

**Finding:** All 7 frontcourt DRIVEs remain 100% misclassified as `NET_SHOT` even without the `is_overhead` flag. This proves that court positioning (Zones 1, 2, 7) and trajectory proximity alone dominate frontcourt predictions, completely independent of `is_overhead`.

---

## 14. Confidence Analysis

Confidence metrics evaluated on ground-truth DRIVE validation samples ($N = 73$):

| Confidence Metric | EXP24 Baseline | DRIVE-02 (Ablated) | Delta |
|:---|:---:|:---:|:---:|
| **Mean Correct Prediction Confidence** | 0.6712 | 0.5925 | **-0.0787** (Less confident when correct) |
| **Mean Incorrect Prediction Confidence** | 0.6553 | 0.6574 | +0.0021 (Equally confident when wrong) |
| **High-Confidence Errors ($\ge 0.70$)** | 12 | **21** | **+9 high-confidence errors** |
| **High-Confidence DRIVE → NET_SHOT ($\ge 0.70$)** | 11 | **17** | **+6 high-confidence attractor errors** |

**Finding:** The model did not become softer or more cautious in its misclassifications. Rather, it became less confident when predicting DRIVE correctly (mean confidence dropped from 0.6712 to 0.5925), while high-confidence DRIVE → NET_SHOT misclassifications increased by +54.5% (from 11 to 17).

---

## 15. Five-Class Collateral Effects

| Class | Baseline F1 (%) | DRIVE-02 F1 (%) | Delta F1 (pp) | Nature of Impact |
|:---|:---:|:---:|:---:|:---|
| **SMASH** | 63.06 | 64.13 | +1.07 | Essentially unaffected / slight gain |
| **CLEAR** | 69.37 | 63.73 | **-5.64** | **Significant collateral damage** (CLEAR recall dropped 77.7% → 61.4%) |
| **DROP** | 22.61 | 42.23 | **+19.62** | **Massive collateral gain** (DROP recall jumped 14.7% → 39.5%) |
| **DRIVE** | 54.93 | 46.55 | **-8.38** | **Primary target degraded** |
| **NET_SHOT** | 97.39 | 96.00 | -1.39 | Negligible change (-1.39 pp) |

**Interpretation of Collateral Dynamics:**
In the baseline model, `is_overhead` helped distinguish high overhead shots (SMASH, CLEAR, DROP) from flatter strokes. Without `is_overhead`, the model reallocated predictions among the rear-court overhead cluster (DROP predictions increased from 92 to 267, drastically improving DROP recall at the cost of CLEAR recall which dropped from 77.69% to 61.44%). However, for DRIVE, removing this feature eliminated the barrier protecting low-contact DRIVEs from collapsing into `NET_SHOT` and `DROP`.

---

## 16. Predicted Class Distribution

| Class | Actual Validation Count | Baseline Predicted Count | DRIVE-02 Predicted Count | Delta vs Baseline |
|:---|:---:|:---:|:---:|:---:|
| **SMASH** | 332 | 407 | 404 | -3 |
| **CLEAR** | 529 | 656 | 491 | -165 |
| **DROP** | 306 | 92 | 267 | +175 |
| **DRIVE** | 73 | 69 | **43** | **-26 (Severe underprediction)** |
| **NET_SHOT** | 720 | 736 | **755** | **+19 (Increased attractor effect)** |

**Finding:** DRIVE-02 exacerbated DRIVE underprediction. The model predicted DRIVE only 43 times (against 73 actual samples), while `NET_SHOT` predictions swelled further to 755.

---

## 17. Observed Results

1. **DRIVE Recall dropped steeply from 53.42% to 36.99% (-16.43 pp, losing 12 correct samples).**
2. **DRIVE F1 dropped from 54.93% to 46.55% (-8.38 pp).**
3. **DRIVE → NET_SHOT misclassifications increased from 21 to 27 (+6 errors, a 28.6% increase in errors).**
4. **Low-contact DRIVE recall (`is_overhead = 0`) collapsed from 67.27% (37/55) to 40.00% (22/55).**
5. **High-contact DRIVE recall (`is_overhead = 1`) showed a modest gain from 11.11% (2/18) to 27.78% (5/18), but this was vastly outweighed by the 15 low-contact DRIVEs lost.**
6. **Frontcourt DRIVE recall remained 0.00% (0/7), with all 7 samples still misclassified as `NET_SHOT`.**
7. **High-confidence DRIVE → NET_SHOT errors increased from 11 to 17.**
8. **CLEAR F1 suffered notable collateral degradation (-5.64 pp), while DROP F1 experienced an incidental gain (+19.62 pp).**

---

## 18. Interpretation

- **The experimental results do NOT support the hypothesis that `is_overhead` is the primary causal driver of the DRIVE → NET_SHOT attractor.**
- On the contrary, `is_overhead = 0` served as a **critical protective filter** for typical (low-contact / sidearm / waist-level) DRIVE strokes. When `is_overhead` was present, the `0` flag informed the network that the shot was not an overhead stroke, helping shield the 55 low-contact DRIVEs from being absorbed by `NET_SHOT` or rear-court overhead categories.
- When `is_overhead` was neutralized to 0.0 across all samples, the model lost the capacity to distinguish overhead mechanics from sidearm/underhand mechanics. Without this negative signal, the model's visual and spatial encoders defaulted even more heavily to the dominant classes (`NET_SHOT` in the front/midcourt, and `DROP`/`SMASH` in other areas).
- The DRIVE → NET_SHOT confusion is fundamentally driven by **visual kinematic similarity** (compact forward stroke preparation and contact point overlap) and **spatial court overlap**, not by an artificial shortcut created by the `is_overhead` feature.
- Removing `is_overhead` causes net harm to DRIVE discrimination.

---

## 19. Decision

### Screening Criteria Assessment:
- DRIVE F1 improves by $\ge 3$ pp? **NO (-8.38 pp)**
- DRIVE → NET_SHOT errors decrease? **NO (Increased from 21 to 27)**
- Macro F1 does not decrease by $> 1$ pp? **PASS (+1.06 pp, though driven by DROP)**
- No major degradation in other classes? **FAIL (CLEAR F1 dropped -5.64 pp)**

### Final Experiment Classification:
$$\mathbf{NOT\ PROMISING}$$

The `is_overhead` ablation is rejected. Removing `is_overhead` impairs DRIVE recognition and increases DRIVE → NET_SHOT confusion.

---

## 20. Candidate Next Experiment

### Candidate: EXP_DRIVE_03 — Continuous Shuttle Kinematics / Velocity Representation
- **Rationale:** Since neither loss reweighting (DRIVE-01) nor discrete contact flag ablation (DRIVE-02) resolved the DRIVE → NET_SHOT confusion, the root discriminator between DRIVE and NET_SHOT must reside in continuous physical dynamics: specifically **post-hit shuttle velocity, flight trajectory angle, and stroke acceleration**.
- A DRIVE travels horizontally at high velocity toward the opponent's mid/rear court, whereas a NET_SHOT drops vertically with rapid deceleration close to the net.
- **Formulation:** A controlled feature enhancement incorporating continuous frame-to-frame shuttle displacement ($\Delta x, \Delta y$) and velocity magnitude over the 16-frame window.
- *(Note: Described only per protocol; will NOT be executed without explicit authorization).*

---

## 21. Integrity Checks

- **Official TEST accessed:** **NO** (0 samples accessed; strictly quarantined)
- **Existing EXP24 checkpoint modified:** **NO** (EXP24 remains frozen and pristine)
- **Existing datasets modified:** **NO** (All `.pkl` and annotation files untouched)
- **SPARK production code modified:** **NO** (Frontend, backend, inference service untouched)
- **HitHeatmap used:** **NO** (No synthetic coordinates, no HitHeatmap training or inference)

---

## 22. Conclusion

DRIVE EXPERIMENT 02 COMPLETE — VALIDATION-ONLY CONTROLLED ABLATION.
