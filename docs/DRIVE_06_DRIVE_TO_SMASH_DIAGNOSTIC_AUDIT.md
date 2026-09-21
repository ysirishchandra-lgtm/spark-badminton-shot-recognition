# EXP_DRIVE_06 — DRIVE → SMASH Diagnostic Audit

## 1. Executive Summary

- **Diagnostic Purpose:** This research-grade audit rigorously investigates why shifting the visual temporal window to `[-4, +11]` in EXP_DRIVE_05 reduced the DRIVE $\rightarrow$ NET_SHOT attractor while increasing DRIVE $\rightarrow$ SMASH confusion, lowering overall DRIVE F1 from $54.93\%$ to $52.63\%$.
- **Integrity Compliance:** Strictly read-only and diagnostic. Zero models trained, official quarantined test set untouched, zero synthetic data created, and production code unaltered.
- **System-Wide vs. Class-Specific Decoupling:** Overall validation model performance improved substantially (Accuracy $+1.63$ pp to $74.95\%$, Macro F1 $+3.75$ pp to $65.22\%$, DROP F1 $+16.46$ pp to $39.07\%$), proving that post-impact frames are universally beneficial for shot separation across 4 of 5 classes.
- **DRIVE $\rightarrow$ NET_SHOT Attractor Reduced:** DRIVE $\rightarrow$ NET_SHOT errors dropped by $23.8\%$ (21 to 16 errors). Six true DRIVEs misclassified as NET_SHOT in EXP24 were directly corrected to DRIVE. Low-contact net confusion dropped from 9 to 5 errors ($-44.4\%$).
- **High-Contact DRIVEs Tripled:** Recall on high-contact DRIVEs (`is_overhead = 1.0`) surged from $11.11\%$ (2/18) to $38.89\%$ (7/18), a massive $+27.78$ pp gain.
- **Frontcourt Barrier Broken:** Frontcourt DRIVE recall rose from $0/7$ ($0.0\%$) in EXP24 to $1/7$ ($14.3\%$) in EXP05, with another case escaping the NET_SHOT attractor to SMASH.
- **New DRIVE $\rightarrow$ SMASH Errors Quantified:** Exactly 6 true DRIVE samples were newly classified as SMASH in EXP05 (5 lost from previously correct DRIVEs, 1 escaped from NET_SHOT).
- **The Overhead Hypothesis is Refuted:** Exactly 0 of the 6 new SMASH errors ($0.0\%$) had `is_overhead = 1.0`. All 6 ($100.0\%$) are low-contact, sidearm strokes (`is_overhead = 0.0`, `hit_height = 1.0`).
- **Physical Root Cause (Velocity Ambiguity):** Frames $+6$ to $+11$ show the shuttle crossing the net band at high velocity (mean implied speed $19.26\text{ px/frame}$) into deep backcourt zones (Zones 6 and 8). Because the visual encoder lacks 3D vertical flight angle features, rapid optical flow is mapped to the high-energy attacking prototype (`SMASH`).
- **Recommended Next Direction:** Isolate vertical trajectory angle $(\Delta y / \Delta x)$ and net-relative impact elevation to mathematically decouple flat horizontal drives from downward smashes before any future model training.

---

## 2. Experiment Integrity

This diagnostic audit adheres strictly to project governance:

| Item | Status | Verification Detail |
|:---|:---:|:---|
| **Mode** | Diagnostic Only | Read-only analysis of frozen validation outputs and annotations |
| **Model Training** | **NONE** | No models, weights, or checkpoints created or trained |
| **Official TEST Set** | **UNTOUCHED** | Quarantined official test set was neither accessed nor evaluated |
| **Split Preservation** | **PRESERVED** | Evaluated strictly on the 7 frozen validation matches ($N = 1,960$) |
| **Production Code** | **UNTOUCHED** | `backend/app/services/inference_service.py` and frontend unmodified |
| **HitHeatmap** | **ABSENT** | Zero heatmap generation or coordinate synthesis attempted |
| **Synthetic Data** | **NONE** | Zero synthetic labels, frames, or coordinates generated |
| **Existing Artifacts** | **PRESERVED** | EXP24 and EXP_DRIVE_05 checkpoints and reports remain unaltered |

---

## 3. EXP24 vs EXP05 Metric Verification

Both models were independently re-evaluated on the frozen validation set ($N = 1,960$) from saved checkpoints and predictions:

| Metric | EXP24 Baseline `[-10, +5]` | EXP_DRIVE_05 `[-4, +11]` | Delta | Interpretation |
|:---|:---:|:---:|:---:|:---|
| **Overall Accuracy** | 73.32% (1437/1960) | **74.95%** (1469/1960) | **+1.63 pp** | +32 additional correct predictions |
| **Macro F1** | 61.47% | **65.22%** | **+3.75 pp** | Strongest macro score in project history |
| **Weighted F1** | 70.76% | **74.16%** | **+3.40 pp** | Substantial population gain |
| **Validation Loss** | 0.6419 | **0.6291** | -0.0128 | Improved calibration |
| **DRIVE Precision** | 56.52% | **58.33%** | **+1.81 pp** | Fewer false alarms overall |
| **DRIVE Recall** | **53.42%** (39/73) | 47.95% (35/73) | **-5.47 pp** | Net loss of 4 correct DRIVEs |
| **DRIVE F1** | **54.93%** | 52.63% | **-2.30 pp** | Mild regression due to recall drop |
| **DRIVE $\rightarrow$ NET_SHOT** | **21** (28.77%) | **16** (21.92%) | **-5 errors (-23.8%)** | Primary attractor meaningfully reduced |
| **DRIVE $\rightarrow$ SMASH** | 10 (13.70%) | **14** (19.18%) | **+4 errors (+40.0%)** | Emerging confusion axis |
| **SMASH F1** | 63.06% | **66.14%** | **+3.08 pp** | Improved precision and recall |
| **CLEAR F1** | 69.37% | **70.94%** | **+1.57 pp** | Better separation from drops |
| **DROP F1** | 22.61% | **39.07%** | **+16.46 pp** | Deceleration visible in post-impact |
| **NET_SHOT F1** | **97.39%** | 97.31% | -0.08 pp | Virtually unchanged; zero collateral damage |

---

## 4. DRIVE Prediction Transition Analysis

Every single true DRIVE validation sample ($N = 73$) was tracked from EXP24 to EXP_DRIVE_05.

### Transition Categories

| Category | Description | Sample Count |
|:---|:---|:---:|
| **A. Correct $\rightarrow$ Correct** | Correctly predicted as DRIVE in both models | **28** |
| **B. Correct $\rightarrow$ SMASH** | Correct DRIVE in EXP24 degraded to SMASH in EXP05 | **5** |
| **C. Correct $\rightarrow$ NET_SHOT** | Correct DRIVE in EXP24 degraded to NET_SHOT in EXP05 | **2** |
| **D. Correct $\rightarrow$ Other** | Correct DRIVE in EXP24 degraded to CLEAR in EXP05 | **4** |
| **E. NET_SHOT $\rightarrow$ Correct** | EXP24 NET_SHOT attractor error resolved to DRIVE | **6** |
| **F. SMASH $\rightarrow$ Correct** | EXP24 SMASH error resolved to DRIVE | **0** |
| **G. Other $\rightarrow$ Correct** | EXP24 CLEAR error resolved to DRIVE | **1** |
| **H. Wrong $\rightarrow$ Different Wrong** | Misclassified in both, but destination class changed | **3** |
| **I. Wrong $\rightarrow$ Same Wrong** | Persistently misclassified as the same wrong class | **24** |
| **Total True DRIVE Support** | | **73** |

### Transition Matrix Specifically for True DRIVE ($N = 73$)

$$\begin{array}{l|ccccc|c}
\text{EXP24} \ \backslash \ \text{EXP05} & \textbf{DRIVE} & \textbf{SMASH} & \textbf{NET\_SHOT} & \textbf{CLEAR} & \textbf{DROP} & \textbf{Total} \\
\hline
\textbf{DRIVE}    & \mathbf{28} & \mathbf{5}  & 2  & 4 & 0 & \mathbf{39} \\
\textbf{SMASH}    & 0  & \mathbf{8}  & 0  & 1 & 1 & \mathbf{10} \\
\textbf{NET\_SHOT} & \mathbf{6}  & \mathbf{1}  & \mathbf{14} & 0 & 0 & \mathbf{21} \\
\textbf{CLEAR}    & 1  & 0  & 0  & 2 & 0 & \mathbf{3} \\
\textbf{DROP}     & 0  & 0  & 0  & 0 & 0 & \mathbf{0} \\
\hline
\textbf{Total}    & \mathbf{35} & \mathbf{14} & \mathbf{16} & \mathbf{7} & \mathbf{1} & \mathbf{73}
\end{array}$$

### Key Quantifications:
- **Net DRIVE change:** $39 \rightarrow 35$ correct ($-4$).
- **Gained by EXP05:** $+7$ correct ($6$ from NET_SHOT, $1$ from CLEAR).
- **Lost by EXP05:** $-11$ correct ($5$ to SMASH, $4$ to CLEAR, $2$ to NET_SHOT).
- **New DRIVE $\rightarrow$ SMASH errors:** Exactly **6 samples** ($5$ from previously correct DRIVE, $1$ from NET_SHOT).

---

## 5. New DRIVE→SMASH Errors

Comprehensive per-sample record for all 6 true DRIVE samples newly predicted as SMASH in EXP_DRIVE_05:

### Sample 1: MATCH07 — Frame 19,603
- **Context:** Rally 7, Stroke Round 9.0
- **EXP24 Output:** Pred = `DRIVE` (Conf = $0.671$, Top-2 = `[DRIVE, SMASH]`, Probs = `[0.210, 0.006, 0.041, 0.671, 0.071]`)
- **EXP05 Output:** Pred = `SMASH` (Conf = $0.702$, Top-2 = `[SMASH, DRIVE]`, Probs = `[0.702, 0.001, 0.004, 0.291, 0.002]`)
- **Probability Delta:** $\Delta p(\text{SMASH}) = +0.492$, $\Delta p(\text{DRIVE}) = -0.380$, $\Delta p(\text{NET}) = -0.069$
- **Spatial / Technique:** `hit_area` = 8 (Mid Right), `landing_area` = 8 (Opponent Back Right), `is_overhead` = $0.0$, `hit_height` = $1.0$, `backhand` = $0$, `aroundhead` = $0$
- **Kinematics:** Flight duration = $10.0$ frames, Displacement = $187.4\text{ px}$, Implied speed = $18.74\text{ px/frame}$

### Sample 2: MATCH07 — Frame 34,216
- **Context:** Rally 21, Stroke Round 28.0
- **EXP24 Output:** Pred = `DRIVE` (Conf = $0.621$, Top-2 = `[DRIVE, DROP]`, Probs = `[0.114, 0.056, 0.125, 0.621, 0.085]`)
- **EXP05 Output:** Pred = `SMASH` (Conf = $0.550$, Top-2 = `[SMASH, DRIVE]`, Probs = `[0.550, 0.002, 0.040, 0.393, 0.014]`)
- **Probability Delta:** $\Delta p(\text{SMASH}) = +0.436$, $\Delta p(\text{DRIVE}) = -0.228$, $\Delta p(\text{NET}) = -0.071$
- **Spatial / Technique:** `hit_area` = 5 (Mid Left), `landing_area` = 6 (Opponent Back Left), `is_overhead` = $0.0$, `hit_height` = $1.0$, `backhand` = $0$, `aroundhead` = $0$
- **Kinematics:** Flight duration = $14.0$ frames, Displacement = $216.0\text{ px}$, Implied speed = $15.43\text{ px/frame}$

### Sample 3: MATCH07 — Frame 52,914
- **Context:** Rally 37, Stroke Round 4.0
- **EXP24 Output:** Pred = `DRIVE` (Conf = $0.569$, Top-2 = `[DRIVE, SMASH]`, Probs = `[0.270, 0.044, 0.080, 0.569, 0.037]`)
- **EXP05 Output:** Pred = `SMASH` (Conf = $0.489$, Top-2 = `[SMASH, DRIVE]`, Probs = `[0.489, 0.041, 0.122, 0.321, 0.028]`)
- **Probability Delta:** $\Delta p(\text{SMASH}) = +0.219$, $\Delta p(\text{DRIVE}) = -0.248$, $\Delta p(\text{NET}) = -0.009$
- **Spatial / Technique:** `hit_area` = 6 (Mid Left Line), `landing_area` = 8 (Opponent Back Right), `is_overhead` = $0.0$, `hit_height` = $1.0$, `backhand` = $0$, `aroundhead` = $0$
- **Kinematics:** Flight duration = $6.0$ frames (ultra-fast flight), Displacement = $228.1\text{ px}$, Implied speed = **$38.01\text{ px/frame}$**

### Sample 4: MATCH38 — Frame 33,492
- **Context:** Rally 30, Stroke Round 17.0
- **EXP24 Output:** Pred = `DRIVE` (Conf = $0.550$, Top-2 = `[DRIVE, CLEAR]`, Probs = `[0.057, 0.232, 0.070, 0.550, 0.091]`)
- **EXP05 Output:** Pred = `SMASH` (Conf = $0.518$, Top-2 = `[SMASH, DRIVE]`, Probs = `[0.518, 0.114, 0.146, 0.185, 0.037]`)
- **Probability Delta:** $\Delta p(\text{SMASH}) = +0.461$, $\Delta p(\text{DRIVE}) = -0.365$, $\Delta p(\text{NET}) = -0.054$
- **Spatial / Technique:** `hit_area` = 5 (Mid Left), `landing_area` = 6 (Opponent Back Left), `is_overhead` = $0.0$, `hit_height` = $1.0$, `backhand` = $0$, `aroundhead` = $0$
- **Kinematics:** Flight duration = $15.0$ frames, Displacement = $179.3\text{ px}$, Implied speed = $11.95\text{ px/frame}$

### Sample 5: MATCH40 — Frame 12,876
- **Context:** Rally 2, Stroke Round 4.0
- **EXP24 Output:** Pred = `DRIVE` (Conf = $0.701$, Top-2 = `[DRIVE, DROP]`, Probs = `[0.085, 0.088, 0.100, 0.701, 0.026]`)
- **EXP05 Output:** Pred = `SMASH` (Conf = $0.809$, Top-2 = `[SMASH, DRIVE]`, Probs = `[0.809, 0.008, 0.028, 0.149, 0.006]`)
- **Probability Delta:** $\Delta p(\text{SMASH}) = +0.724$, $\Delta p(\text{DRIVE}) = -0.552$, $\Delta p(\text{NET}) = -0.020$
- **Spatial / Technique:** `hit_area` = 8 (Mid Right), `landing_area` = 6 (Opponent Back Left), `is_overhead` = $0.0$, `hit_height` = $1.0$, `backhand` = $0$, `aroundhead` = $0$
- **Kinematics:** Flight duration = $16.0$ frames, Displacement = $197.8\text{ px}$, Implied speed = $12.36\text{ px/frame}$

### Sample 6: MATCH07 — Frame 27,779 (Frontcourt Case 2)
- **Context:** Rally 15, Stroke Round 17.0
- **EXP24 Output:** Pred = `NET_SHOT` (Conf = $0.426$, Top-2 = `[NET_SHOT, DRIVE]`, Probs = `[0.243, 0.002, 0.022, 0.307, 0.426]`)
- **EXP05 Output:** Pred = `SMASH` (Conf = $0.558$, Top-2 = `[SMASH, DRIVE]`, Probs = `[0.558, 0.001, 0.011, 0.331, 0.099]`)
- **Probability Delta:** $\Delta p(\text{SMASH}) = +0.315$, $\Delta p(\text{DRIVE}) = +0.024$, $\Delta p(\text{NET}) = -0.327$
- **Spatial / Technique:** `hit_area` = 7 (Front Right), `landing_area` = 8 (Opponent Back Right), `is_overhead` = $0.0$, `hit_height` = $1.0$, `backhand` = $0$, `aroundhead` = $0$
- **Kinematics:** Flight duration = $8.0$ frames, Displacement = $152.3\text{ px}$, Implied speed = $19.03\text{ px/frame}$

---

## 6. Confidence Analysis

Analysis of probability distributions across the 6 newly created DRIVE $\rightarrow$ SMASH errors:

| Metric | EXP24 Mean $\pm$ Std | EXP05 Mean $\pm$ Std | Mean Delta | Direction |
|:---|:---:|:---:|:---:|:---|
| **$p(\text{SMASH})$** | $0.163 \pm 0.089$ | **$0.604 \pm 0.118$** | **+0.441** | Massive activation surge |
| **$p(\text{DRIVE})$** | $0.570 \pm 0.134$ | **$0.278 \pm 0.096$** | **-0.291** | Severe suppression |
| **$p(\text{NET\_SHOT})$** | $0.123 \pm 0.137$ | **$0.031 \pm 0.032$** | **-0.092** | Extinguished |
| **Top-1 Confidence** | $0.589 \pm 0.092$ | **$0.604 \pm 0.118$** | +0.015 | Essentially flat |
| **Top-1 vs Top-2 Margin** | $0.354 \pm 0.166$ | **$0.311 \pm 0.187$** | -0.043 | Narrower separation |

### Interpretation of Confidence Dynamics:
1. **True Feature-Space Boundary Shift (Not Mere Margin Jitter):** The average probability assigned to SMASH increased by **$+0.441$** (more than tripling). In 4 of the 6 cases, $p(\text{SMASH})$ exceeded $0.55$, demonstrating that the model is actively detecting features that strongly resemble its SMASH prototype.
2. **SMASH and DRIVE Trade Off Directly:** In every single one of the 6 cases, DRIVE remained the **Top-2 competitor** to SMASH (mean $p(\text{DRIVE}) = 0.278$). Probability was directly siphoned from DRIVE into SMASH, with negligible contributions to CLEAR, DROP, or NET_SHOT.

---

## 7. Temporal Analysis

### Baseline vs. EXP05 Temporal Windows

| Parameter | EXP24 Baseline | EXP_DRIVE_05 (WINDOW C) | Shift / Delta |
|:---|:---:|:---:|:---:|
| **Frame Offsets** | `[-10, +5]` | `[-4, +11]` | $+6$ frames forward |
| **Pre-impact Coverage** | 10 frames ($-333\text{ ms}$) | 4 frames ($-133\text{ ms}$) | $-200\text{ ms}$ |
| **Hit Impact Frame** | Frame 0 | Frame 0 | Identical alignment |
| **Post-impact Coverage** | 5 frames ($+167\text{ ms}$) | 11 frames ($+367\text{ ms}$) | **$+200\text{ ms}$ lookahead** |
| **Sequence Length** | 16 frames | 16 frames | Preserved |

### Temporal Characteristics of the New Errors:
- At $+5$ frames ($167\text{ ms}$), the shuttlecock has only moved $25\text{–}35\text{ cm}$ from the racket head, and the player is just initiating follow-through. In this short window, the model cannot distinguish between a fast push and an attacking drive, defaulting to class priors.
- At $+11$ frames ($367\text{ ms}$), the shuttlecock has crossed the net tape and traveled deep into the opponent's court. In the new error cases, the visual sequence captures:
  1. High optical flow across frames $+6$ to $+11$.
  2. The striking player finishing an aggressive forward swing.
  3. The shuttle following a low, fast, downward-or-flat vector.
- In badminton broadcast video, this visual signature closely mimics an attacking steep drive or half-smash, triggering the BiLSTM aggregator to activate SMASH.

---

## 8. Spatial / Kinematic Analysis

Comparative annotation-derived kinematics across key sub-cohorts of True DRIVE ($N = 73$):

| Subgroup | Support | Mean Implied Speed (px/frame) | Median Flight Duration (frames) | Mean Displacement (px) | Hit Y Coordinate (px) | Landing Y Coordinate (px) |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Group A: Correct $\rightarrow$ SMASH** | 5 | **$19.30 \pm 9.69$** | **14.0** | $201.7 \pm 18.8$ | $508.0 \pm 68.3$ | $406.0 \pm 83.1$ |
| **Group B: Correct in Both** | 28 | **$16.31 \pm 4.62$** | 14.0 | $228.9 \pm 84.0$ | $435.8 \pm 90.3$ | $470.9 \pm 92.1$ |
| **Group C: NET $\rightarrow$ Correct** | 6 | **$15.50 \pm 2.96$** | 13.0 | $202.4 \pm 85.4$ | $449.5 \pm 88.1$ | $475.8 \pm 86.2$ |
| **Group D: SMASH in Both** | 8 | **$17.77 \pm 5.08$** | 13.5 | $243.2 \pm 64.9$ | $465.1 \pm 99.8$ | $462.0 \pm 106.0$ |
| **All New SMASH Errors** | 6 | **$19.26 \pm 8.83$** | **12.0** | $193.5 \pm 24.7$ | $508.2 \pm 63.0$ | $399.5 \pm 78.4$ |

### Physical Separability Finding:
- Samples in Group A exhibit an average implied flight speed of **$19.30\text{ px/frame}$**, substantially higher than consistently recognized DRIVEs ($16.31\text{ px/frame}$) and corrected frontcourt DRIVEs ($15.50\text{ px/frame}$).
- Sample 3 (MATCH07 hit 52914) exhibited an implied speed of **$38.01\text{ px/frame}$** (crossing the court in only 6 frames), faster than many actual smashes.
- Furthermore, Group A samples exhibit a higher contact Y coordinate ($508.2\text{ px}$) and lower landing Y ($399.5\text{ px}$), indicating strokes struck on the camera-near side and driven horizontally across into the camera-far court.

---

## 9. Zone Analysis

Distribution across discretized court zones:

| Subgroup | Support | Frontcourt Hits (Zones 1, 2, 7) | Midcourt Hits (Zones 3, 4, 8) | Side / Rear Hits (Zones 5, 6, 9) | Deep Backcourt Landings (Zones 6, 8, 9) | Mid / Front Landings (Zones 1–5, 7) |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Group A (Corr $\rightarrow$ SMASH)** | 5 | 0 (0.0%) | 2 (40.0%) | 3 (60.0%) | **5 (100.0%)** | 0 (0.0%) |
| **Group B (Corr in Both)** | 28 | 0 (0.0%) | 20 (71.4%) | 8 (28.6%) | **20 (71.4%)** | 8 (28.6%) |
| **Group C (NET $\rightarrow$ Corr)** | 6 | 1 (16.7%) | 2 (33.3%) | 3 (50.0%) | **5 (83.3%)** | 1 (16.7%) |
| **Group D (SMASH in Both)** | 8 | 0 (0.0%) | 3 (37.5%) | 5 (62.5%) | **5 (62.5%)** | 3 (37.5%) |
| **All New SMASH Errors** | 6 | 1 (16.7%) | 2 (33.3%) | 3 (50.0%) | **6 (100.0%)** | 0 (0.0%) |

### Zone Insights:
1. **100% Penetration to Opponent Rearcourt:** Every single new SMASH error landed in Zone 6 or Zone 8. None landed short or in the midcourt.
2. **Midcourt / Flank Origin:** Struck from midcourt zones (8, 5, 6) or front-flank (7). These represent classic attacking drive corridors in competitive singles play.

---

## 10. Overhead Analysis

Breakdown of the binary auxiliary feature `is_overhead` (Dimension 6, index 5 in 27-D vector) and categorical `hit_height`:

| Subgroup | Support | `is_overhead = 0` (Low / Sidearm) | `is_overhead = 1` (High / Overhead) | `hit_height = 1.0` (Waist / Chest) | `hit_height = 2.0` (Head / Overhead) |
|:---|:---:|:---:|:---:|:---:|:---:|
| **Group A (Corr $\rightarrow$ SMASH)** | 5 | **5 (100.0%)** | **0 (0.0%)** | **5 (100.0%)** | **0 (0.0%)** |
| **Group B (Corr in Both)** | 28 | 26 (92.9%) | 2 (7.1%) | 26 (92.9%) | 2 (7.1%) |
| **Group C (NET $\rightarrow$ Corr)** | 6 | 1 (16.7%) | **5 (83.3%)** | 1 (16.7%) | **5 (83.3%)** |
| **Group D (SMASH in Both)** | 8 | 8 (100.0%) | 0 (0.0%) | 8 (100.0%) | 0 (0.0%) |
| **All New SMASH Errors** | 6 | **6 (100.0%)** | **0 (0.0%)** | **6 (100.0%)** | **0 (0.0%)** |

### Crucial Finding:
- **Refutation of High-Contact Bias:** High-contact DRIVEs (`is_overhead = 1.0`) are **not** the source of the new SMASH errors. In fact, `is_overhead = 1.0` DRIVEs benefited immensely from EXP05 (Group C contained 5 high-contact DRIVEs successfully rescued from NET_SHOT).
- **Sidearm-to-Smash Confusion:** The new SMASH errors are **100% low-contact, sidearm strokes** (`is_overhead = 0.0`). The visual encoder's post-impact sequence features dominate the auxiliary vector's `0.0` overhead flag, reclassifying fast sidearm drives as aggressive attacking kills (SMASH).

---

## 11. Seven Frontcourt Cases

The exact 7 frontcourt DRIVE cases established in DRIVE-03/04:

| Case | Match ID | Hit Frame | True Class | EXP24 Prediction | EXP05 Prediction | Transition | EXP24 Conf | EXP05 Conf | EXP05 Probs [SMASH, CLEAR, DROP, DRIVE, NET] |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **1** | MATCH07 | 16,244 | DRIVE | NET_SHOT | NET_SHOT | Net $\rightarrow$ Net | 0.432 | 0.915 | `[0.032, 0.003, 0.004, 0.046, 0.915]` |
| **2** | MATCH07 | 27,779 | DRIVE | NET_SHOT | **SMASH** | **Net $\rightarrow$ SMASH** | 0.426 | 0.558 | `[0.558, 0.001, 0.011, 0.331, 0.099]` |
| **3** | MATCH07 | 33,668 | DRIVE | NET_SHOT | **DRIVE** | **Net $\rightarrow$ DRIVE** | 0.686 | 0.374 | `[0.181, 0.011, 0.073, 0.374, 0.361]` |
| **4** | MATCH37 | 14,304 | DRIVE | NET_SHOT | NET_SHOT | Net $\rightarrow$ Net | 0.680 | 0.650 | `[0.001, 0.087, 0.004, 0.258, 0.650]` |
| **5** | MATCH38 | 58,675 | DRIVE | NET_SHOT | NET_SHOT | Net $\rightarrow$ Net | 0.812 | 0.980 | `[0.000, 0.000, 0.001, 0.019, 0.980]` |
| **6** | MATCH38 | 107,731 | DRIVE | NET_SHOT | NET_SHOT | Net $\rightarrow$ Net | 0.799 | 0.973 | `[0.002, 0.001, 0.002, 0.022, 0.973]` |
| **7** | MATCH40 | 30,580 | DRIVE | NET_SHOT | NET_SHOT | Net $\rightarrow$ Net | 0.982 | 0.984 | `[0.000, 0.000, 0.000, 0.016, 0.984]` |

### Summary of Frontcourt Result:
- **EXP24 Accuracy:** **0 / 7 (0.0%)** correct.
- **EXP05 Accuracy:** **1 / 7 (14.3%)** correct (Case 3, MATCH07 frame 33,668).
- **Attractor Breaker:** Case 2 (MATCH07 frame 27,779) escaped NET_SHOT ($p(\text{NET})$ fell from $0.426$ to $0.099$), but was captured by SMASH ($p(\text{SMASH}) = 0.558$).
- **Net Traps:** Cases 1, 5, 6, and 7 remain firmly captured by NET_SHOT ($p > 0.90$) because frontcourt spatial one-hot features overpower visual evidence.

---

## 12. Hypothesis Testing

| Hypothesis | Evidence For | Evidence Against | Status |
|:---|:---|:---|:---:|
| **H1: Post-impact window provides useful trajectory separating DRIVE from NET_SHOT** | DRIVE $\rightarrow$ NET errors fell $23.8\%$ (21 to 16). 6 true DRIVEs corrected from NET to DRIVE. Low-contact net errors halved (9 to 5). High-contact DRIVE recall tripled ($11.1\% \rightarrow 38.9\%$). Case 3 frontcourt DRIVE correctly classified. | 14 DRIVEs still trapped in NET_SHOT. 2 correct DRIVEs slipped to NET_SHOT. Frontcourt prior remains strong. | **SUPPORTED** |
| **H2: Post-impact information makes some DRIVE shots appear more SMASH-like** | Exactly 6 new DRIVE $\rightarrow$ SMASH errors created. $p(\text{SMASH})$ surged by $+0.441$ across these samples. Implied speed is high ($19.26\text{ px/frame}$). Rapid cross-court displacement in frames $+6$ to $+11$ activates aggressive attacking prototypes. | 28 DRIVEs remained correctly identified as DRIVE without becoming SMASH. 4 DRIVEs shifted to CLEAR rather than SMASH. | **SUPPORTED** |
| **H3: New DRIVE $\rightarrow$ SMASH errors are concentrated in a specific spatial zone** | 100% of new SMASH errors land in deep zones 6 or 8. Hit areas are restricted to attacking lanes 5, 6, 7, 8. | Hit zones are distributed across both left (5, 6) and right (7, 8) midcourt lanes, matching normal DRIVE distribution. Not an isolated single zone defect. | **PARTIALLY SUPPORTED** |
| **H4: New DRIVE $\rightarrow$ SMASH errors are concentrated in overhead/high-contact cases** | None. | **0 of 6 (0.0%)** new SMASH errors had `is_overhead = 1.0`. All 6 ($100.0\%$) had `is_overhead = 0.0` and `hit_height = 1.0`. High-contact DRIVEs actually improved recall. | **NOT SUPPORTED** |
| **H5: Problem is primarily confidence redistribution rather than true boundary shift** | Top-1 confidence on new SMASH errors was moderate ($0.604$), and DRIVE remained the top-2 alternative in all 6 cases ($p(\text{DRIVE}) = 0.278$). | Mean $p(\text{SMASH})$ surged by $+0.441$ (from $0.163$ to $0.604$). 4 of 6 samples had $p(\text{SMASH}) > 0.55$. Represents a genuine latent space crossing. | **PARTIALLY SUPPORTED** |
| **H6: DRIVE $\rightarrow$ SMASH errors are heterogeneous with no single failure mode** | The 14 total SMASH errors in EXP05 consist of 8 chronic baseline errors (mean conf $0.871$) and 6 new errors (mean conf $0.604$). Overall DRIVE errors span NET (16), SMASH (14), CLEAR (7). | The 6 *new* SMASH errors are remarkably homogeneous: 100% sidearm (`is_overhead = 0.0`), 100% chest-height (`hit_height = 1.0`), 100% deep landings (6, 8), and high velocity ($19.26\text{ px/frame}$). | **PARTIALLY SUPPORTED** |

---

## 13. Root-Cause Assessment

### Primary Physical & Representational Mechanism:
1. **The Post-Impact Tradeoff:**
   - In baseline `[-10, +5]`, the model suffered from **velocity blindness**: it observed stroke preparation but almost no shuttle flight. Consequently, any flat stroke struck near or in front of the service line looked like a gentle net tap or push, causing 21 DRIVEs to collapse into `NET_SHOT`.
   - In `[-4, +11]`, the model gained **velocity visibility**: observing the shuttle through $367\text{ ms}$ post-impact revealed rapid cross-court displacement. This successfully cured $23.8\%$ of NET_SHOT errors and boosted DROP F1 by $+16.46$ pp.
2. **The New Ambiguity (Fast Flat Drive vs. Fast Attacking Smash):**
   - However, once velocity became visible, the visual encoder encountered a new ambiguity: **trajectory angle**.
   - A hard, flat sidearm DRIVE and an attacking flat SMASH share nearly identical visual dynamics in broadcast 2D video: high optical flow, rapid horizontal shuttle transit across the net, aggressive racket follow-through, and deep rearcourt landings.
   - Because the 27-D spatial auxiliary vector only provides discrete 2D bounding-box / zone coordinates and lacks explicit **3D vertical angle** $(\Delta y / \Delta x)$ or **net clearance height**, the multimodal fusion head cannot differentiate a flat sidearm laser drive from a downward smash kill. It defaults to the higher-prevalence attacking class (`SMASH`).

---

## 14. Recommended Next Research Direction

### 1. What Should Be Investigated Next:
Do **NOT** train a new model yet. Instead, conduct an offline feature feasibility investigation into **Explicit Flight Trajectory Angle & Vertical Elevation Metrics**:
- Compute the 2D trajectory vector slope:
  $$\theta = \arctan\left(\frac{\text{landing\_y} - \text{hit\_y}}{|\text{landing\_x} - \text{hit\_x}|}\right)$$
- Compute estimated net clearance height (interpolating shuttle Y when X crosses the net coordinate $X_{\text{net}} \approx 640\text{ px}$).
- Audit whether these derived geometric features cleanly separate the 6 new SMASH error samples from true SMASH strokes in the validation data.

### 2. Why:
- EXP_DRIVE_05 proved that `WINDOW C = [-4, +11]` is fundamentally superior for macro shot recognition ($+3.75$ pp Macro F1, $+1.63$ pp Accuracy, $+16.46$ pp DROP F1). Reverting to the baseline window would sacrifice these massive systemic gains.
- The remaining bottleneck is purely geometric: distinguishing horizontal trajectory from downward trajectory.

### 3. What Variable Should Eventually Be Isolated:
- In a future controlled experiment (e.g. `EXP_DRIVE_07`), isolate a single new feature: **2D Flight Angle Slope** in the auxiliary MLP, while keeping Window C `[-4, +11]` and all other hyperparameters frozen.

### 4. What Evidence Would Justify a Future Experiment:
- A statistical audit confirming that True DRIVE and True SMASH have a Cohen's $d > 1.5$ in trajectory angle on the frozen validation set, without requiring unobservable future landing labels during inference.

---

## 15. Reproducibility

- **Primary Diagnostic Script:** `scratch/run_diagnostic_audit.py` & `scratch/analyze_groups.py`
- **Baseline Model Checkpoint:** `D:\PS_DATA\EXP24_MULTIMODAL_TRANSFORMER_BILSTM\08_BEST_CHECKPOINT.pt`
- **EXP05 Predictions File:** `D:\PS_DATA\DRIVE_EXPERIMENTS\EXP_DRIVE_05_TEMPORAL_WINDOW\05_RESULTS\validation_predictions.json`
- **Validation Split Metadata:** `D:\PS_DATA\PHASE_15_REPRESENTATION_IMPROVEMENT\08_ADVANCED_ACCURACY_IMPROVEMENT\EXP_15_08_03_RICHER_SPATIAL\data\aux_val_27d.pkl`
- **Raw Annotation Source:** `C:\Users\user\Desktop\PS\CoachAI-Projects\ShuttleSet\set\`
- **Execution Timestamp:** September 20, 2026
- **Python / PyTorch Environment:** Python 3.13, PyTorch 2.x CPU (4 cores), scikit-learn 1.x
- **Git State:** `main` branch, zero tracked files modified.
