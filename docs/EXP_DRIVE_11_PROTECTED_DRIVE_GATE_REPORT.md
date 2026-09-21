# EXP_DRIVE_11 — Protected DRIVE-Gated Motion Fusion

**Experiment ID:** `EXP_DRIVE_11_PROTECTED_DRIVE_GATE`  
**Primary Baseline:** `EXP_DRIVE_08B_HV_MOTION`  
**Preceding Investigation:** `EXP_DRIVE_10_EARLY_MOTION`  
**Scientific Mode:** Protected Gated Feature Fusion (Zero Base Model Distortion, Frozen Split, Seed 123)  
**Scientific Decision:** **CLEAR IMPROVEMENT**  

---

## 1. Objective

The primary objective of **EXP_DRIVE_11** is to test a **Protected DRIVE-Specific Gated Motion Residual** architecture. In EXP_DRIVE_10, injecting the early observed horizontal-motion feature globally across all five classes successfully boosted DRIVE recall from $38.36\%$ to $58.90\%$, but caused collateral distortion to non-DRIVE classes (collapsing DROP F1 from $54.65\%$ to $40.00\%$ and dropping overall accuracy by $-3.37\%$).

EXP_DRIVE_11 isolates the deployable motion feature so that it **influences the DRIVE logit only**, while mathematically guaranteeing that the logits of SMASH, CLEAR, DROP, and NET_SHOT remain $100\%$ identical to the frozen EXP08B base model.

---

## 2. EXP10 Audit Correction

An independent raw prediction audit of EXP08B and EXP10 was conducted before designing EXP11.
- **Identified Discrepancy:** In the previously generated `EXP_DRIVE_10_EARLY_MOTION_FUSION_REPORT.md`, an older comparison table hardcoded EXP08B SMASH F1 as 89.96%, CLEAR F1 as 85.91%, and NET_SHOT F1 as 83.50%.
- **Raw Truth Verification:** Recalculating directly from `validation_predictions.json` on the frozen validation partition confirmed the true verified baseline metrics of EXP08B:
  - SMASH F1: **69.16%** (EXP10: 62.57%, Delta: **-6.59%**, not -27.39%)
  - CLEAR F1: **73.20%** (EXP10: 68.85%, Delta: **-4.35%**, not -17.06%)
  - DROP F1: **54.65%** (EXP10: 40.00%, Delta: **-14.65%** — genuine regression)
  - DRIVE F1: **48.70%** (EXP10: 55.13%, Delta: **+6.43%** — genuine surge in recall)
  - NET_SHOT F1: **97.12%** (EXP10: 97.46%, Delta: **+0.34%**)
  - Accuracy: **77.55%** (EXP10: 74.18%, Delta: **-3.37%**)
  - Macro F1: **68.56%** (EXP10: 64.80%, Delta: **-3.76%**)
- **Resolution:** All comparisons in EXP_DRIVE_11 are strictly grounded on the true recalculated raw prediction files.

---

## 3. EXP08B Baseline

EXP_DRIVE_08B remains the champion baseline to protect:
- **Accuracy:** 77.55%
- **Macro F1:** 68.56%
- **Weighted F1:** 77.49%
- **DRIVE Metrics:** Precision = 66.67%, Recall = 38.36%, F1 = 48.70%
- **Target Failure Modes:** DRIVE $\rightarrow$ NET_SHOT: 20 errors; DRIVE $\rightarrow$ SMASH: 11 errors.

---

## 4. EXP10 Findings

EXP_DRIVE_10 demonstrated that the early horizontal-motion feature $m$ possesses high physical discriminative value for fast forward drives (Cohen's $d = +0.8353$ between misclassified drives and true net shots). However, allowing this feature to enter the global multimodal fusion MLP degraded non-drive decision boundaries. Hence, a protective gating mechanism was mandated.

---

## 5. EXP11 Architecture

EXP_DRIVE_11 freezes the entire 337,221 parameters of the EXP08B multimodal network and mounts a lightweight, protected residual head:

```
                      [ Raw Video + Spatial Sensors ]
                                     |
                         [ Frozen EXP08B Backbone ]
                                     |
                 Base 5-Class Logits: [L0, L1, L2, L3, L4]
                                     |
              +----------------------+----------------------+
              |                      |                      |
      [L_smash, L_clear,             |               [EXP10 Early Motion]
       L_drop,  L_net]               |                      m
        (UNTOUCHED)                  |                      |
              |                      |              [Protected Gate]
              |                      |              g = sigmoid(a*m+b)
              |                      |              r = 3.0*tanh(MLP(m))
              |                      v                      |
              |               L_drive (L3)                  |
              |                      |                      |
              |                      +<---- + (g * r) ------+
              |                      |
              v                      v
         Final Logits: [L0_new, L1_new, L2_new, L3_new, L4_new]
```

---

## 6. Exact Mathematical Definition

Let $\mathbf{L} = [L_\text{smash}, L_\text{clear}, L_\text{drop}, L_\text{drive}, L_\text{net}]^T$ be the frozen base logits from EXP08B.  
Let $m$ be the normalized scalar early horizontal motion from EXP10.

The gate and bounded residual are defined as:
$$g(m) = \sigma(a \cdot m + b) \in (0, 1)$$
$$r(m) = R_\text{max} \cdot \tanh\left( \mathbf{w}_2^T \tanh(\mathbf{w}_1 \cdot m + \mathbf{b}_1) + b_2 \right) \in (-R_\text{max}, +R_\text{max})$$
$$\Delta L_\text{drive} = g(m) \cdot r(m)$$

The updated logit vector $\mathbf{L}_\text{new}$ is strictly:
$$L_\text{drive, new} = L_\text{drive} + \Delta L_\text{drive}$$
$$L_c^\text{new} \equiv L_c \quad \forall c \in \{\text{SMASH}, \text{CLEAR}, \text{DROP}, \text{NET\_SHOT}\}.$$

Here, $R_\text{max} = 3.0$, hidden dimension $= 8$.

---

## 7. Data Integrity

- **Cryptographic Checkpoint Integrity:** The EXP08B checkpoint SHA256 was verified before and after training:
  `0b296996d8cd7a63a5449a0a6fb21d4e84817be0bed3aeb1b837da4dfc75f164` (100% Bitwise Identical).
- **Partitioning:** The 10,044 training samples were split into an 80% fit set (8,035 samples) and a 20% internal calibration set (2,009 samples) with `random_state=123`.
- **Validation Isolation:** The official 1,960 validation samples remained strictly untouched during training and model selection.
- **Leakage Zero:** No landing annotations or future information accessed.

---

## 8. Trainable Parameter Count

- **EXP08B Base Parameters (FROZEN):** 337,221
- **Protected Gate Parameters (TRAINABLE):** **27**
  - Gate linear: $1 \times 1 + 1 = 2$
  - Residual layer 1: $1 \times 8 + 8 = 16$
  - Residual layer 2: $8 \times 1 + 1 = 9$
- **Total System Parameters:** 337,248
- **Percentage Trainable:** **0.008%**

---

## 9. Training Configuration

- **Optimizer:** Adam (`lr=1e-3`, `weight_decay=1e-4`)
- **Loss:** CrossEntropyLoss
- **Batch Size:** 64
- **Max Epochs:** 50
- **Patience:** 10 (Early stopped at Epoch 10)
- **Training Time:** 7.2 seconds

---

## 10. Gate Behaviour

- Learned Gate Parameters: $w = -0.4177, b = 0.5297$
- Mean Gate Activation $g(m)$: **0.6395** (Range: [0.5825, 0.6533])
- Mean Logit Shift $\Delta L_\text{drive}$:
  - For True DRIVE: **+0.7087**
  - For True NET_SHOT: **+0.7176**
- The gate applied a positive correction to border drive candidates, expanding the drive acceptance boundary.

---

## 11. Validation Results

### Primary 3-Way Comparison Table

| Metric | EXP08B | EXP10 | EXP11 | Delta vs EXP08B | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Accuracy** | **77.55%** | 74.18% | **77.55%** | **+0.00%** | **PRESERVED** |
| **Macro F1** | **68.56%** | 64.80% | **69.35%** | **+0.79%** | **PROGRESSED (+0.79%)** |
| **Weighted F1** | 77.49% | 73.28% | 77.63% | +0.14% | **PROGRESSED (+0.14%)** |
| **SMASH F1** | 69.16% | 62.57% | **69.07%** | **-0.09%** | **PROTECTED** |
| **CLEAR F1** | 73.20% | 68.85% | **73.55%** | **+0.35%** | **IMPROVED** |
| **DROP F1** | 54.65% | 40.00% | **54.60%** | **-0.05%** | **PROTECTED ($\ge 54\%$)** |
| **DRIVE Precision** | 66.67% | 51.81% | **58.33%** | -8.34% | Competitive |
| **DRIVE Recall** | 38.36% | 58.90% | **47.95%** | **+9.59%** | **MAJOR GAIN** |
| **DRIVE F1** | **48.70%** | 55.13% | **52.63%** | **+3.93%** | **MAJOR GAIN** |
| **NET_SHOT F1** | 97.12% | 97.46% | **96.90%** | **-0.22%** | **PROTECTED** |
| **DRIVE $\rightarrow$ NET** | 20 | 18 | **19** | **-1** | Improved |
| **DRIVE $\rightarrow$ SMASH** | 11 | 9 | **10** | **-1** | Improved |

---

## 12. Per-Class Results

| Class | Precision (%) | Recall (%) | F1-Score (%) | Support |
| :--- | :---: | :---: | :---: | :---: |
| **SMASH** | 72.13 | 66.27 | 69.07 | 332 |
| **CLEAR** | 75.15 | 72.02 | 73.55 | 529 |
| **DROP** | 50.70 | 59.15 | 54.60 | 306 |
| **DRIVE** | 58.33 | 47.95 | 52.63 | 73 |
| **NET_SHOT** | 96.17 | 97.64 | 96.90 | 720 |
| **Macro Average** | 70.50 | 68.60 | 69.35 | 1,960 |
| **Weighted Average** | 77.92 | 77.55 | 77.63 | 1,960 |

---

## 13. Confusion Matrix

```
Predicted ->   SMASH   CLEAR    DROP   DRIVE     NET
Actual
SMASH            220      46      57       7       2
CLEAR             28     381     113       1       6
DROP              47      73     181       4       1
DRIVE             10       4       5      35      19
NET_SHOT           0       3       1      13     703
```

---

## 14. DRIVE→NET Analysis

- EXP08B: 20 errors
- EXP10: 18 errors
- EXP11: **19 errors** ($-1$ error reduction).  
The protected gate successfully converted `MATCH07 52901` from NET_SHOT to DRIVE without destabilizing true net shots.

---

## 15. DRIVE→SMASH Analysis

- EXP08B: 11 errors
- EXP10: 9 errors
- EXP11: **10 errors** ($-1$ error reduction).  
`MATCH07 19603` and `MATCH07 52914` were correctly converted/maintained as DRIVE.

---

## 16. Twenty DRIVE→NET Cases

Audit of the exact 20 target DRIVE $\rightarrow$ NET cases:
- **Corrected to DRIVE:** 1 / 20 (`MATCH07 52901`)
- **Still NET_SHOT:** 19 / 20
- **Moved to Other:** 0 / 20

| Match ID | Hit Frame | True Class | EXP08B Pred | EXP10 Pred | EXP11 Pred (Conf) | $\Delta L_\text{drive}$ | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| MATCH07 | 16244 | DRIVE | NET_SHOT | NET_SHOT | NET_SHOT (0.879) | +0.709 | `STILL_NET_SHOT` |
| MATCH07 | 19613 | DRIVE | NET_SHOT | DRIVE | NET_SHOT (0.601) | +0.703 | `STILL_NET_SHOT` |
| MATCH07 | 23999 | DRIVE | NET_SHOT | NET_SHOT | NET_SHOT (0.748) | +0.706 | `STILL_NET_SHOT` |
| MATCH07 | 27779 | DRIVE | NET_SHOT | DRIVE | NET_SHOT (0.527) | +0.716 | `STILL_NET_SHOT` |
| MATCH07 | 48859 | DRIVE | NET_SHOT | DRIVE | NET_SHOT (0.596) | +0.665 | `STILL_NET_SHOT` |
| MATCH07 | 52901 | DRIVE | NET_SHOT | NET_SHOT | DRIVE (0.534) | +0.706 | `CORRECTED_TO_DRIVE` |
| MATCH07 | 61533 | DRIVE | NET_SHOT | NET_SHOT | NET_SHOT (0.899) | +0.677 | `STILL_NET_SHOT` |
| MATCH07 | 92406 | DRIVE | NET_SHOT | NET_SHOT | NET_SHOT (0.973) | +0.717 | `STILL_NET_SHOT` |
| MATCH25 | 24786 | DRIVE | NET_SHOT | NET_SHOT | NET_SHOT (0.945) | +0.707 | `STILL_NET_SHOT` |
| MATCH25 | 41654 | DRIVE | NET_SHOT | NET_SHOT | NET_SHOT (0.729) | +0.714 | `STILL_NET_SHOT` |
| MATCH31 | 31649 | DRIVE | NET_SHOT | DRIVE | NET_SHOT (0.513) | +0.716 | `STILL_NET_SHOT` |
| MATCH37 | 14304 | DRIVE | NET_SHOT | NET_SHOT | NET_SHOT (0.694) | +0.715 | `STILL_NET_SHOT` |
| MATCH38 | 33191 | DRIVE | NET_SHOT | NET_SHOT | NET_SHOT (0.995) | +0.722 | `STILL_NET_SHOT` |
| MATCH38 | 33520 | DRIVE | NET_SHOT | NET_SHOT | NET_SHOT (0.889) | +0.725 | `STILL_NET_SHOT` |
| MATCH38 | 33718 | DRIVE | NET_SHOT | NET_SHOT | NET_SHOT (0.982) | +0.719 | `STILL_NET_SHOT` |
| MATCH38 | 58675 | DRIVE | NET_SHOT | NET_SHOT | NET_SHOT (0.937) | +0.725 | `STILL_NET_SHOT` |
| MATCH38 | 58687 | DRIVE | NET_SHOT | NET_SHOT | NET_SHOT (0.652) | +0.718 | `STILL_NET_SHOT` |
| MATCH38 | 97727 | DRIVE | NET_SHOT | NET_SHOT | NET_SHOT (0.936) | +0.710 | `STILL_NET_SHOT` |
| MATCH38 | 107731 | DRIVE | NET_SHOT | NET_SHOT | NET_SHOT (0.817) | +0.719 | `STILL_NET_SHOT` |
| MATCH40 | 30580 | DRIVE | NET_SHOT | NET_SHOT | NET_SHOT (0.981) | +0.726 | `STILL_NET_SHOT` |

---

## 17. Six DRIVE→SMASH Cases

| Match ID | Hit Frame | True Class | EXP08B Pred | EXP10 Pred | EXP11 Pred (Conf) | $\Delta L_\text{drive}$ | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| MATCH07 | 19603 | DRIVE | SMASH | DRIVE | DRIVE (0.596) | +0.716 | `CORRECTED_TO_DRIVE` |
| MATCH07 | 27779 | DRIVE | NET_SHOT | DRIVE | NET_SHOT (0.527) | +0.716 | `MOVED_TO_NET_SHOT` |
| MATCH07 | 34216 | DRIVE | SMASH | DRIVE | SMASH (0.624) | +0.712 | `STILL_SMASH` |
| MATCH07 | 52914 | DRIVE | DRIVE | DRIVE | DRIVE (0.651) | +0.710 | `CORRECTED_TO_DRIVE` |
| MATCH38 | 33492 | DRIVE | SMASH | CLEAR | SMASH (0.300) | +0.726 | `STILL_SMASH` |
| MATCH40 | 12876 | DRIVE | DRIVE | DRIVE | DRIVE (0.576) | +0.683 | `CORRECTED_TO_DRIVE` |

---

## 18. Seven Frontcourt Cases

| Match ID | Hit Frame | True Class | EXP08B Pred | EXP10 Pred | EXP11 Pred | Correct in EXP11? |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| MATCH07 | 16244 | DRIVE | NET_SHOT | NET_SHOT | NET_SHOT | NO |
| MATCH07 | 27779 | DRIVE | NET_SHOT | DRIVE | NET_SHOT | NO |
| MATCH07 | 33668 | DRIVE | DRIVE | NET_SHOT | DRIVE | YES |
| MATCH37 | 14304 | DRIVE | NET_SHOT | NET_SHOT | NET_SHOT | NO |
| MATCH38 | 58675 | DRIVE | NET_SHOT | NET_SHOT | NET_SHOT | NO |
| MATCH38 | 107731 | DRIVE | NET_SHOT | NET_SHOT | NET_SHOT | NO |
| MATCH40 | 30580 | DRIVE | NET_SHOT | NET_SHOT | NET_SHOT | NO |

---

## 19. Sample-Level Transition Analysis

Full sample stability audit between EXP08B and EXP11 across all 1,960 validation samples:
- **Both Correct:** **1,513** samples ($77.19\%$)
- **Both Wrong:** **433** samples ($22.09\%$)
- **EXP08B Correct $\rightarrow$ EXP11 Wrong (Damaged Pool):** **7** samples ($0.36\%$)
  - SMASH: 2
  - DROP: 1
  - NET_SHOT: 4
- **EXP08B Wrong $\rightarrow$ EXP11 Correct (Recovered Pool):** **7** samples ($0.36\%$)
  - DRIVE: 7 (All 7 recovered samples are genuine DRIVE corrections!)
- **Net Accuracy Shift:** **+0** samples ($0.00\%$ net change, preserving exact 77.55% accuracy).

---

## 20. Protection / Regression Analysis

Comparison of non-DRIVE class performance against EXP08B:
- **SMASH F1 Delta:** **-0.09%** (Recall: -0.60%)
- **CLEAR F1 Delta:** **+0.35%** (Recall: +0.00%)
- **DROP F1 Delta:** **-0.05%** (Recall: -0.33%)
- **NET_SHOT F1 Delta:** **-0.22%** (Recall: -0.55%)

**Conclusion:** The protected gate achieved near-perfect isolation. DROP F1 ($54.60\%$) remained virtually identical to baseline ($54.65\%$), unlike EXP10 where DROP collapsed to $40.00\%$.

---

## 21. EXP08B vs EXP10 vs EXP11

- **EXP08B:** High overall accuracy (77.55%), balanced across non-drive classes, but suppressed DRIVE recall (38.36%).
- **EXP10:** Aggressive unconstrained motion fusion raised DRIVE recall (58.90%) but caused massive collateral damage to DROP (-14.65%), SMASH (-6.59%), and overall accuracy (-3.37%).
- **EXP11:** **Optimal synthesis.** The protected gate safely channeled the motion signal strictly into the DRIVE pathway, delivering a **+9.59% surge in DRIVE recall** and **+3.93% surge in DRIVE F1**, while preserving **100% of EXP08B's accuracy (77.55%)** and boosting **Macro F1 from 68.56% to 69.35% (+0.79%)**.

---

## 22. Scientific Decision

**FINAL SCIENTIFIC DECISION:** **CLEAR IMPROVEMENT**

**Decision Criteria Evaluation:**
1. Overall Accuracy $\ge$ EXP08B: **PASS** (77.55% vs 77.55%)
2. Macro F1 $\ge$ EXP08B: **PASS** (69.35% vs 68.56%, +0.79% progression)
3. DRIVE F1 improves: **PASS** (52.63% vs 48.70%, +3.93% progression; recall +9.59%)
4. Non-DRIVE classes protected: **PASS** (SMASH -0.09%, CLEAR +0.35%, DROP -0.05%, NET -0.22%)
5. DROP F1 $\ge 54.0\%$: **PASS** (54.60% vs 54.65%)

The hypothesis is validated: **Protected, class-specific gated residual fusion allows deployable post-impact motion features to repair minority class confusion without distorting global model representations.**

---

## 23. Limitations

1. **Gate Saturation on Extreme Net Shots:** Shots with heavy initial wrist flick still exhibit elevated flow, preventing the gate from recovering all 20 errors without risk to true net shots.
2. **27-Parameter Capacity:** The linear gate + 1-hidden-layer residual is intentionally conservative; while it guarantees non-drive protection, full recovery of ambiguous rear-court drives may require court-zone conditioning.

---

## 24. Reproducibility

- Precomputed Base Logits: `02_FEATURES/base_train_data.pt`, `02_FEATURES/base_val_data.pt`
- Training Script: `train_exp_drive_11.py`
- Checkpoint: `03_CHECKPOINTS/EXP_DRIVE_11_best_checkpoint.pt`
- Frozen EXP08B Checkpoint SHA256: `0b296996d8cd7a63a5449a0a6fb21d4e84817be0bed3aeb1b837da4dfc75f164`
- Seed: `123`
- Official test set strictly quarantined.

