# DRIVE Experiment 01 — Class Weighting
**Experiment ID**: `EXP_DRIVE_01_CLASS_WEIGHT`  
**Project**: SPARK — Badminton Shot Recognition  
**Document**: `D:\PS_DATA\SPARK\docs\DRIVE_EXPERIMENT_01_CLASS_WEIGHT_REPORT.md`  
**Execution Date**: 2026-09-20  
**Status**: Completed — Validation-Only Controlled Research Experiment  

---

## 1. Objective

The primary objective of this experiment was to test whether reducing the **DRIVE $\rightarrow$ NET_SHOT majority-attractor problem** through a controlled, DRIVE-aware training intervention improves DRIVE recognition without causing unacceptable degradation in overall accuracy or other shot classes.

In accordance with strict research protocol:
- No production code in `SPARK` was altered.
- The official frozen test set was **never accessed, evaluated, or unquarantined**.
- Existing checkpoints (`EXP23`, `EXP24`, `EXP25`) and research datasets were maintained in a read-only state.
- Exactly **one variable was changed**: the loss weighting applied to the DRIVE class during training.

---

## 2. Hypothesis

> *"The severe DRIVE $\rightarrow$ NET_SHOT confusion may be partially influenced by class-prior imbalance during training. A controlled DRIVE-aware class-balancing intervention may improve DRIVE recall/F1 while preserving overall validation performance."*

**Important**: This was treated strictly as an experimental hypothesis to test. Class imbalance was not assumed to be the sole or confirmed root cause.

---

## 3. Baseline Configuration

The base model selected was the verified project research champion:
- **Model Checkpoint**: `D:\PS_DATA\EXP24_MULTIMODAL_TRANSFORMER_BILSTM\08_BEST_CHECKPOINT.pt`
- **Architecture**: `MultimodalTransformerLSTMClassifier` (337,157 trainable parameters)
  - Visual Backbone: Penultimate ResNet-18 features ($16 \times 512$) $\rightarrow$ Linear($512 \rightarrow 128$) $\rightarrow$ Sinusoidal Positional Encoding ($16 \times 128$) $\rightarrow$ 1-layer Transformer Encoder ($d_{\text{model}}=128$, 4 heads, $d_{\text{ff}}=256$, dropout=0.1) $\rightarrow$ 1-layer LSTM ($128 \rightarrow 128$) $\rightarrow$ Final Timestep ($128$-D)
  - Spatial Auxiliary Backbone: 27-D court spatial vector $\rightarrow$ Linear($27 \rightarrow 64$) $\rightarrow$ ReLU $\rightarrow$ Dropout(0.3) $\rightarrow$ Linear($64 \rightarrow 64$) ($64$-D)
  - Fusion Head: Concatenation [$128 + 64 = 192$-D] $\rightarrow$ Dropout(0.5) $\rightarrow$ Linear($192 \rightarrow 5$)
- **Optimizer**: Adam ($\text{lr} = 10^{-3}$, $\text{weight\_decay} = 10^{-4}$)
- **Batch Size**: 64
- **Random Seed**: 123
- **Device**: CPU execution
- **Epoch Budget**: 30 max epochs with early stopping patience of 8 epochs

---

## 4. Baseline Validation Results

Before conducting any training, the baseline checkpoint was evaluated on the exact 1,960 validation samples (`aux_val_27d.pkl`) to establish the verified pre-intervention benchmark:

- **Validation Accuracy**: **73.32%** (Reference: 73.32% — exact reproduction)
- **Validation Macro F1**: **61.47%** (Reference: 61.47% — exact reproduction)
- **Validation Weighted F1**: **70.76%**
- **Validation Loss**: **0.6419**

### Baseline Per-Class Metrics
| Class | Precision (%) | Recall (%) | F1-Score (%) | Support |
|---|:---:|:---:|:---:|:---:|
| **SMASH** | 57.25% | 70.18% | 63.06% | 332 |
| **CLEAR** | 62.65% | 77.69% | 69.37% | 529 |
| **DROP** | 48.91% | 14.71% | 22.61% | 306 |
| **DRIVE** | **56.52%** | **53.42%** | **54.93%** | **73** |
| **NET_SHOT** | 96.33% | 98.47% | 97.39% | 720 |

### Baseline Confusion Matrix
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
- Baseline `DRIVE -> NET_SHOT`: **21 errors** (61.76% of DRIVE errors).
- Baseline `NET_SHOT -> DRIVE`: **7 false alarms**.

---

## 5. Training Distribution

The training set distribution was calculated directly from the training data loader (`aux_train_27d.pkl`, 10,044 samples across 28 matches):

| Class Index | Class Name | Training Count | Training Percentage | Imbalance Ratio vs DRIVE | Imbalance Ratio vs NET_SHOT |
|:---:|---|:---:|:---:|:---:|:---:|
| 0 | **SMASH** | 1,794 | 17.86% | 3.71x | 2.47 : 1 |
| 1 | **CLEAR** | 1,832 | 18.24% | 3.79x | 2.42 : 1 |
| 2 | **DROP** | 1,505 | 14.98% | 3.11x | 2.94 : 1 |
| 3 | **DRIVE** | **484** | **4.82%** | **1.00x** | **9.15 : 1** |
| 4 | **NET_SHOT** | 4,429 | 44.10% | 9.15x | 1.00 : 1 |
| **Total** | | **10,044** | **100.0%** | — | — |

---

## 6. Experimental Intervention

**Single Variable Changed**: DRIVE-Aware Loss Weighting.

Rather than applying an extreme inverse-frequency weighting (which historically caused catastrophic collapse in Phase 14), a controlled, moderate multiplier strategy was evaluated:
- The DRIVE class received a **2.0x weight multiplier** relative to all other classes.
- All other four classes remained fixed at **1.0x**.
- No oversampling, no undersampling, no feature modifications, no architecture changes, and no learning rate adjustments were introduced.

---

## 7. Exact Class Weights

The loss function was configured in PyTorch as:
$$\mathcal{L} = \text{CrossEntropyLoss}(\mathbf{w})$$
where the weight vector $\mathbf{w}$ was defined as:

| Class Index | Class Name | Loss Weight ($w_c$) | Normalized Weight ($\tilde{w}_c$) |
|:---:|---|:---:|:---:|
| 0 | SMASH | 1.00 | 0.8333 |
| 1 | CLEAR | 1.00 | 0.8333 |
| 2 | DROP | 1.00 | 0.8333 |
| 3 | **DRIVE** | **2.00** | **1.6667** |
| 4 | NET_SHOT | 1.00 | 0.8333 |

---

## 8. Training Configuration

- **Output Directory**: `D:\PS_DATA\DRIVE_EXPERIMENTS\EXP_DRIVE_01_CLASS_WEIGHT`
- **Tensors Preloaded**: 10,044 train tensors (196.4s) + 1,960 val tensors (2.0s) into memory.
- **Hardware & Environment**: Windows 11, Intel x86_64 CPU execution, Python 3.13.0rc3, PyTorch 2.13.0.
- **Duration**: 186.2 seconds (3.10 minutes total training time).
- **Epoch Progression**: 22 epochs executed before early stopping was triggered (patience: 8 epochs).
- **Best Epoch**: **Epoch 14** (Val Accuracy: 71.33%, Val Macro F1: 59.60%, Val Loss: 0.6533).
- **Checkpoint Saved**: `D:\PS_DATA\DRIVE_EXPERIMENTS\EXP_DRIVE_01_CLASS_WEIGHT\02_CHECKPOINTS\08_BEST_CHECKPOINT.pt`.

---

## 9. Validation Results

Evaluation was conducted on the 1,960 validation samples using standard unweighted cross-entropy loss to maintain exact mathematical benchmark comparability:

- **Validation Accuracy**: **71.33%**
- **Validation Macro F1**: **59.60%**
- **Validation Weighted F1**: **69.15%**
- **Validation Loss**: **0.6533**

### Experiment 01 Per-Class Metrics
| Class | Precision (%) | Recall (%) | F1-Score (%) | Support |
|---|:---:|:---:|:---:|:---:|
| **SMASH** | 55.34% | 60.84% | 57.96% | 332 |
| **CLEAR** | 60.18% | 75.99% | 67.17% | 529 |
| **DROP** | 41.44% | 15.03% | 22.06% | 306 |
| **DRIVE** | **48.86%** | **58.90%** | **53.42%** | **73** |
| **NET_SHOT** | 96.84% | 97.92% | 97.38% | 720 |

### Experiment 01 Confusion Matrix
```
                  PREDICTED CLASS
              SMASH   CLEAR    DROP   DRIVE     NET    Total
A   SMASH       202      91      26      11       2      332
C   CLEAR        74     402      38      12       3      529
T   DROP         79     170      46      10       1      306
U   DRIVE         8       4       1      43      17       73
A   NET_SHOT      2       1       0      12     705      720
L   Total       365     668     111      88     728    1,960
```

---

## 10. Baseline vs Experiment

### Head-to-Head Comparison Table

| Metric | EXP24 Baseline | DRIVE-01 (Weight=2.0) | Delta (pp) | Direction |
|---|:---:|:---:|:---:|:---:|
| **Overall Validation Accuracy (%)** | **73.32%** | 71.33% | **-1.99 pp** | Degraded |
| **Validation Macro F1 (%)** | **61.47%** | 59.60% | **-1.87 pp** | Degraded |
| **Validation Weighted F1 (%)** | **70.76%** | 69.15% | **-1.61 pp** | Degraded |
| **Validation Loss** | **0.6419** | 0.6533 | +0.0114 | Worse |
| **DRIVE Recall (%)** | 53.42% | **58.90%** | **+5.48 pp** | **Improved** |
| **DRIVE Precision (%)** | **56.52%** | 48.86% | **-7.66 pp** | **Degraded** |
| **DRIVE F1-Score (%)** | **54.93%** | 53.42% | **-1.51 pp** | **Degraded** |
| **NET_SHOT F1-Score (%)** | **97.39%** | 97.38% | -0.01 pp | Preserved |
| **NET_SHOT Recall (%)** | **98.47%** | 97.92% | -0.55 pp | Preserved |
| **DROP F1-Score (%)** | **22.61%** | 22.06% | -0.55 pp | Preserved |
| **CLEAR F1-Score (%)** | **69.37%** | 67.17% | -2.20 pp | Mildly Degraded |
| **SMASH F1-Score (%)** | **63.06%** | 57.96% | **-5.10 pp** | **Substantially Degraded** |
| **DRIVE $\rightarrow$ NET_SHOT (count)** | 21 | **17** | **-4 errors** | **Attractor Reduced (-19.0%)** |
| **NET_SHOT $\rightarrow$ DRIVE (count)** | **7** | 12 | **+5 false alarms** | Reverse Error Increased (+71.4%) |

---

## 11. DRIVE Error Analysis

1. **True Positives Increased**:
   - Correct DRIVE detections rose from **39 to 43** out of 73 validation samples.
   - DRIVE recall improved by **+5.48 percentage points** (from 53.42% to 58.90%).
2. **NET_SHOT Attractor Was Quantifiably Weakened**:
   - `DRIVE -> NET_SHOT` misclassifications dropped from **21 to 17** (a reduction of 4 errors, or **-19.0%**).
   - This directly confirms that penalizing DRIVE loss forces the model to hesitate before assigning ambiguous midcourt frames to NET_SHOT.
3. **The Precision Penalty (Overcorrection)**:
   - False positives for DRIVE surged from **30 to 45** (+50.0% increase):
     - `CLEAR -> DRIVE`: increased from 7 to **12** (+5)
     - `DROP -> DRIVE`: increased from 5 to **10** (+5)
     - `NET_SHOT -> DRIVE`: increased from 7 to **12** (+5)
     - `SMASH -> DRIVE`: remained at **11**
   - Because 45 samples were falsely flagged as DRIVE while only 43 were true drives, **DRIVE precision collapsed below 50% (from 56.52% down to 48.86%)**.
   - As a mathematical consequence, **DRIVE F1 fell from 54.93% to 53.42% (-1.51 pp)**.

---

## 12. NET_SHOT Collateral Effects

- **NET_SHOT Performance Remained Stable**:
  - NET_SHOT recall remained high at **97.92%** (vs 98.47% baseline, only 4 fewer detections).
  - NET_SHOT F1 remained virtually unchanged at **97.38%** (vs 97.39% baseline, $\Delta = -0.01\text{ pp}$).
  - NET_SHOT was **not the victim of collateral damage**.
- **The True Collateral Victim Was SMASH**:
  - SMASH recall dropped sharply from **70.18% down to 60.84% (-9.34 pp)**.
  - Correct SMASH detections dropped from 233 to 202 (-31 samples).
  - Most misclassified smashes were absorbed into CLEAR (91 vs 67 baseline) and DROP (26 vs 19 baseline).
  - SMASH F1 suffered the largest decline across the entire benchmark: **-5.10 pp (from 63.06% down to 57.96%)**.

---

## 13. Confidence Analysis

Analysis of softmax confidence on all 73 ground-truth DRIVE samples:

| Confidence Metric | EXP24 Baseline | DRIVE-01 | Direction |
|---|:---:|:---:|:---:|
| **Mean Confidence on Correct DRIVE** | 0.6712 | **0.7057** | **More Confident (+0.0345)** |
| **Mean Confidence on Incorrect DRIVE** | 0.6553 | **0.6137** | **Less Confident (-0.0416)** |
| **High-Confidence DRIVE Errors ($\ge 0.70$)** | 12 | **8** | **Reduced (-33.3%)** |
| **High-Confidence DRIVE $\rightarrow$ NET_SHOT** | 11 | **7** | **Reduced (-36.4%)** |

### Finding
The class weight successfully achieved the intended behavioral effect:
- On correct drives, the model was **more confident** (mean confidence 70.57% vs 67.12%).
- On incorrect drives, the model was **less overconfident** (mean error confidence dropped from 65.53% to 61.37%).
- Pathological high-confidence errors into NET_SHOT dropped by **36.4%** (from 11 down to 7).

---

## 14. Predicted Class Distribution

To check for systematic overcorrection:

| Class | Ground Truth (Val) | Baseline Predicted Count | DRIVE-01 Predicted Count | Deviation vs Truth |
|---|:---:|:---:|:---:|:---:|
| **SMASH** | 332 | 407 (+75) | 365 (+33) | Reduced over-allocation |
| **CLEAR** | 529 | 656 (+127) | 668 (+139) | Severe over-allocation persists |
| **DROP** | 306 | 92 (-214) | 111 (-195) | Severe under-allocation persists |
| **DRIVE** | **73** | **69 (-4)** | **88 (+15)** | **Overcorrection (+20.5% excess)** |
| **NET_SHOT** | 720 | 736 (+16) | 728 (+8) | Close to true distribution |

### Overcorrection Diagnosis
In baseline EXP24, the model predicted 69 drives (close to the true 73). Under DRIVE weight = 2.0, the model predicted **88 drives** (+20.5% more than exist in the dataset). The model began treating DRIVE as an escape route for ambiguous clears, drops, and net plays, inducing 15 extra false positives.

---

## 15. Interpretation

To maintain strict scientific integrity:

### OBSERVED RESULTS (Hard Empirical Facts)
1. DRIVE recall improved by **+5.48 pp** (from 53.42% to 58.90%).
2. Misclassifications from DRIVE into NET_SHOT decreased from **21 to 17 (-19.0%)**.
3. High-confidence DRIVE errors dropped from **12 to 8 (-33.3%)**.
4. DRIVE precision declined by **-7.66 pp** (from 56.52% to 48.86%), pulling DRIVE F1 down by **-1.51 pp**.
5. False positives for DRIVE increased by **+50.0%** (from 30 to 45).
6. Overall validation accuracy dropped from **73.32% to 71.33% (-1.99 pp)**.
7. Validation Macro F1 dropped from **61.47% to 59.60% (-1.87 pp)**.
8. SMASH F1 degraded by **-5.10 pp** (from 63.06% to 57.96%).

### INTERPRETATION (Analytical Conclusions)
1. **The NET_SHOT attractor was successfully weakened**: Shifting the loss penalty caused the decision boundary to move away from NET_SHOT, proving that training loss weighting directly modulates the attractor effect.
2. **The trade-off was unfavorable**: Because DRIVE shares visual and spatial features with multiple classes (defensive clears, drops, and smashes), simply boosting DRIVE's loss weight without improving feature discriminability caused the decision boundary to bleed into adjacent classes, drastically eroding precision.
3. **Class imbalance is NOT the root cause**: If class imbalance were the sole cause, rebalancing loss would improve F1. The fact that recall gains were completely overwhelmed by precision losses proves that **feature overlap and representational ambiguity are the primary constraints**.

### HYPOTHESIS FOR FUTURE PHASES
- Global loss reweighting is too blunt an instrument. Fine-grained feature enrichment (such as localized racket crops or continuous reach geometry) is required before loss penalties can improve DRIVE without triggering false alarms.

---

## 16. Decision

### **NOT PROMISING**

### Evaluation Against Pre-Established Screening Criteria:
1. *DRIVE F1 improves by $\ge 3$ percentage points*: **FAILED** (DRIVE F1 changed by **-1.51 pp**).
2. *Macro F1 does not decrease by $> 1$ percentage point*: **FAILED** (Macro F1 changed by **-1.87 pp**).
3. *NET_SHOT F1 does not decrease by $> 3$ percentage points*: **PASSED** (NET_SHOT F1 changed by **-0.01 pp**).
4. *Overall accuracy preserved*: **FAILED** (Accuracy dropped by **-1.99 pp**, from 73.32% to 71.33%).

**Reasoning**: While the intervention proved that the DRIVE $\rightarrow$ NET_SHOT attractor can be nudged by loss weighting (reducing attractor errors by 19%), the accompanying surge in false alarms (+15 samples) degraded DRIVE precision, lowered DRIVE F1, and caused collateral harm to overall accuracy and SMASH recognition.

---

## 17. Next Experiment Candidate

Because Experiment 01 proved that scalar class weighting induces false-positive overcorrection without resolving feature ambiguity, **Experiment 02 should NOT simply test different scalar weights (e.g. 1.5x or 3.0x)**.

Instead, the next controlled experiment should investigate:
### **Candidate Experiment 02: Continuous Reach Geometry Decoupling (Mitigating the `is_overhead` Shortcut)**
- **Hypothesis**: The DRIVE audit established that when a DRIVE has `is_overhead = 1`, recall collapses to 11.1% because 96% of NET_SHOT samples carry this flag. Replacing the discrete `is_overhead` binary flag with continuous relative height $(Y_{\text{hit}} - Y_{\text{player}})$ will remove the discrete shortcut that drives use to collapse into NET_SHOT, without globally inflating false positives.
- **Single Variable to Change**: Auxiliary feature dimension 5 (continuous normalized height offset instead of binary flag).
- **Control Group**: Baseline EXP24 architecture.
- **Success Metric**: DRIVE recall on high contacts ($\ge 50\%$) with zero increase in false positives on clears and drops.

---

## 18. Test Integrity

**Official frozen TEST data was not accessed.**  
The 2,001 test samples across 7 test matches remained completely quarantined and unread.

---

## 19. Research Integrity

**No existing checkpoint, annotation, split, Base Paper file, or production application file was overwritten.**  
All experiments were conducted in isolation under `D:\PS_DATA\DRIVE_EXPERIMENTS\EXP_DRIVE_01_CLASS_WEIGHT`.

---

## 20. Conclusion

DRIVE Experiment 01 successfully executed a single-variable controlled test of DRIVE-aware loss weighting. The intervention successfully reduced DRIVE $\rightarrow$ NET_SHOT errors from 21 to 17 and improved DRIVE recall from 53.42% to 58.90%. However, due to severe overcorrection and representational overlap with midcourt strokes, precision dropped by -7.66 pp, lowering DRIVE F1 (-1.51 pp) and reducing overall Macro F1 (-1.87 pp). Scalar class reweighting alone is insufficient to resolve the DRIVE recognition challenge.

**DRIVE EXPERIMENT 01 COMPLETE — VALIDATION-ONLY CONTROLLED EXPERIMENT.**
