# DRIVE-03 — Spatial & Kinematic Feasibility Audit

## 1. Objective

The objective of **DRIVE-03** is to conduct a rigorous, strictly read-only diagnostic and feasibility audit to determine whether the **existing real ShuttleSet annotations** contain sufficient spatial, geometric, temporal, and kinematic information to distinguish **DRIVE** from **NET_SHOT**. 

This audit evaluates the physical and statistical separability of the two confused classes under the frozen validation split, assesses whether continuous in-flight shuttle kinematics can be constructed from existing annotations, and identifies the exact data limitations governing the DRIVE recognition bottleneck.

---

## 2. Previous Evidence

This feasibility audit builds upon the cumulative empirical baseline established across the project:

- **DRIVE Confusion Audit (`DRIVE_CONFUSION_AUDIT.md`):**
  - Identified severe, systematic majority-attractor collapse of DRIVE into NET_SHOT in the frozen EXP24 model.
  - EXP24 Baseline: Accuracy = 73.32%, Macro F1 = 61.47%, DRIVE Recall = 53.42% (39/73), DRIVE F1 = 54.93%, DRIVE → NET_SHOT errors = 21.
  - Identified that frontcourt DRIVE samples (7 samples in Zones 1, 2, 7) suffered a 100% failure rate (0/7 correct, 7/7 misclassified as NET_SHOT).
  - High-contact DRIVEs (`is_overhead = 1.0`) exhibited an 88.89% error rate (16/18 misclassified).

- **DRIVE Experiment 01 — Class Weighting (`DRIVE_EXPERIMENT_01_CLASS_WEIGHT_REPORT.md`):**
  - Controlled class-weighting intervention ($W_{\text{DRIVE}} = 2.0$) tested whether loss reweighting could resolve the attractor.
  - **Result: REJECTED (NOT PROMISING).** DRIVE recall rose modestly (53.42% → 58.90%), but precision collapsed (56.52% → 48.86%) due to 15 false alarms, reducing DRIVE F1 (54.93% → 53.42%) and degrading overall Macro F1 (61.47% → 59.60%).

- **DRIVE Experiment 02 — is_overhead Ablation (`DRIVE_EXPERIMENT_02_IS_OVERHEAD_ABLATION_REPORT.md`):**
  - Controlled single-variable ablation neutralizing the binary `is_overhead` auxiliary flag to 0.0 tested whether it acted as an artificial shortcut.
  - **Result: REJECTED (NOT PROMISING).** While high-contact DRIVE recall rose (+16.67 pp, 2 → 5 correct), low-contact DRIVE recall collapsed (-27.27 pp, 37 → 22 correct), DRIVE → NET_SHOT errors worsened from 21 to 27, and DRIVE F1 plummeted from 54.93% to 46.55%. Frontcourt DRIVE remained 0/7.

**Key Starting Fact:** Neither loss reweighting nor discrete overhead flag ablation resolved the confusion. A fundamental data-level spatial and kinematic investigation is required.

---

## 3. Source Annotation

The authoritative source of ground-truth annotations across the project is **ShuttleSet** (CoachAI-Projects):
- **Path:** `C:\Users\user\Desktop\PS\CoachAI-Projects\ShuttleSet\set\<Match_Name>\set*.csv`
- **Catalog & Schema:** Defined in `shuttleset_annotation_data_dictionary.csv` and `PHASE_6B_MATCH_SPLIT_ASSIGNMENT.csv`.
- **Validation Matches (7 Matches):**
  1. `MATCH07`: `Kento_MOMOTA_CHOU_Tien_Chen_Malaysia_Open_2018_QuarterFinals`
  2. `MATCH08`: `CHOU_Tien_Chen_Anders_ANTONSEN_Fuzhou_Open_2019_Semi-finals`
  3. `MATCH25`: `Carolina_Marin_Supanida_Katethong_YONEX_Thailand_Open_2021_QuarterFinals`
  4. `MATCH31`: `Carolina_Marin_Neslihan_Yigit_TOYOTA_THAILAND_OPEN_2021_QuarterFinals`
  5. `MATCH37`: `Viktor_Axelsen_Hans-Kristian_Solberg_VIittinghus_TOYOTA_THAILAND_OPEN_2021_Finals`
  6. `MATCH38`: `Carolina_Marin_An_Se_Young_HSBC_BWF_WORLD_TOUR_FINALS_2020_QuarterFinals`
  7. `MATCH40`: `Evgeniya_Kosetskaya_Michelle_Li_HSBC_BWF_WORLD_TOUR_FINALS_2020_QuarterFinals`

### Raw Schema:
The raw ShuttleSet CSV format consists of exactly **30 columns**:
`rally`, `ball_round`, `time`, `frame_num`, `roundscore_A`, `roundscore_B`, `player`, `server`, `type`, `aroundhead`, `backhand`, `hit_height`, `hit_area`, `hit_x`, `hit_y`, `landing_height`, `landing_area`, `landing_x`, `landing_y`, `lose_reason`, `win_reason`, `getpoint_player`, `flaw`, `player_location_area`, `player_location_x`, `player_location_y`, `opponent_location_area`, `opponent_location_x`, `opponent_location_y`, `db`.

### Granularity Classification:
All spatial coordinates (`hit_x, hit_y`, `player_location_x, player_location_y`, `opponent_location_x, opponent_location_y`) are **discrete stroke-level event annotations** captured at the instantaneous hit frame (`frame_num`). There are **zero in-flight shuttle tracking points** between strokes.

---

## 4. Annotation Availability Matrix

Audit of feature presence across all 1,960 validation samples (including 73 DRIVE and 720 NET_SHOT):

| Feature | Description | Data Type | Granularity | DRIVE Presence (N=73) | NET_SHOT Presence (N=720) | Total Val Presence (N=1960) | Usable Status |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **`hit_x`** | Shuttle contact X coordinate (1280x720) | Float (px) | Hit instant | 73 / 73 (100.0%) | 692 / 720 (96.1%) | 1,902 / 1,960 (97.0%) | **YES** |
| **`hit_y`** | Shuttle contact Y coordinate (1280x720) | Float (px) | Hit instant | 73 / 73 (100.0%) | 692 / 720 (96.1%) | 1,902 / 1,960 (97.0%) | **YES** |
| **`landing_x`** | Shuttle landing/reception X coordinate | Float (px) | Stroke destination | 73 / 73 (100.0%) | 720 / 720 (100.0%) | 1,960 / 1,960 (100.0%) | **YES** |
| **`landing_y`** | Shuttle landing/reception Y coordinate | Float (px) | Stroke destination | 73 / 73 (100.0%) | 720 / 720 (100.0%) | 1,960 / 1,960 (100.0%) | **YES** |
| **`player_location_x`** | Striker ground base X at impact | Float (px) | Hit instant | 73 / 73 (100.0%) | 720 / 720 (100.0%) | 1,960 / 1,960 (100.0%) | **YES** |
| **`player_location_y`** | Striker ground base Y at impact | Float (px) | Hit instant | 73 / 73 (100.0%) | 720 / 720 (100.0%) | 1,960 / 1,960 (100.0%) | **YES** |
| **`opponent_location_x`** | Opponent ground base X at impact | Float (px) | Hit instant | 73 / 73 (100.0%) | 720 / 720 (100.0%) | 1,960 / 1,960 (100.0%) | **YES** |
| **`opponent_location_y`** | Opponent ground base Y at impact | Float (px) | Hit instant | 73 / 73 (100.0%) | 720 / 720 (100.0%) | 1,960 / 1,960 (100.0%) | **YES** |
| **`hit_area`** | Discretized court zone at hit (1-9) | Categorical | Hit instant | 73 / 73 (100.0%) | 701 / 720 (97.4%) | 1,926 / 1,960 (98.3%) | **YES** |
| **`landing_area`** | Discretized court zone at landing (1-9) | Categorical | Stroke destination | 73 / 73 (100.0%) | 720 / 720 (100.0%) | 1,960 / 1,960 (100.0%) | **YES** |
| **`player_location_area`**| Striker court zone at hit | Categorical | Hit instant | 73 / 73 (100.0%) | 720 / 720 (100.0%) | 1,959 / 1,960 (99.9%) | **YES** |
| **`opponent_location_area`**| Opponent court zone at hit | Categorical | Hit instant | 73 / 73 (100.0%) | 720 / 720 (100.0%) | 1,960 / 1,960 (100.0%) | **YES** |
| **`hit_height`** | Contact elevation relative to head/net | Categorical {1, 2} | Hit instant | 73 / 73 (100.0%) | 720 / 720 (100.0%) | 1,960 / 1,960 (100.0%) | **YES** |
| **`landing_height`** | Landing elevation relative to net band | Categorical {1, 2} | Stroke destination | 38 / 73 (52.1%) | 482 / 720 (66.9%) | 1,325 / 1,960 (67.6%) | **PARTIAL** |
| **`aroundhead`** | Around-the-head stroke flag | Binary {0, 1} | Technique | 3 / 73 (4.1%) | 0 / 720 (0.0%) | 494 / 1,960 (25.2%) | **PARTIAL** |
| **`backhand`** | Backhand grip/stance flag | Binary {0, 1} | Technique | 21 / 73 (28.8%) | 365 / 720 (50.7%) | 437 / 1960 (22.3%) | **PARTIAL** |
| **`frame_num`** | Broadcast video frame number at contact | Float / Integer | Hit instant | 73 / 73 (100.0%) | 720 / 720 (100.0%) | 1,960 / 1,960 (100.0%) | **YES** |
| **`rally`** | Sequential rally identifier | Integer | Rally level | 73 / 73 (100.0%) | 720 / 720 (100.0%) | 1,960 / 1,960 (100.0%) | **YES** |
| **`ball_round`** | Stroke count in current rally | Float / Integer | Sequential index | 73 / 73 (100.0%) | 720 / 720 (100.0%) | 1,960 / 1,960 (100.0%) | **YES** |
| **`time`** | Broadcast clock time (HH:MM:SS) | String | Hit instant | 73 / 73 (100.0%) | 720 / 720 (100.0%) | 1,960 / 1,960 (100.0%) | **YES** |

---

## 5. DRIVE vs NET_SHOT Distribution

Summary statistics for all continuous variables evaluated on validation samples:

### Continuous Features Table

| Feature | DRIVE Mean $\pm$ Std | DRIVE Median [IQR] | DRIVE Min–Max | NET_SHOT Mean $\pm$ Std | NET_SHOT Median [IQR] | NET_SHOT Min–Max | Cohen's d | KS Stat | KS p-value | Wasserstein Dist |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **`hit_x`** | 629.40 $\pm$ 132.91 | 619.0 [509, 756] | 428 – 879 | 637.31 $\pm$ 151.49 | 625.5 [489, 793] | 354 – 970 | -0.053 | 0.139 | 0.140 | 22.68 px |
| **`hit_y`** | 442.74 $\pm$ 89.52 | 380.0 [362, 537] | 347 – 577 | 447.10 $\pm$ 50.48 | 458.0 [402, 493] | 295 – 647 | -0.079 | 0.457 | $4.48 \times 10^{-13}$ | 44.29 px |
| **`landing_x`** | 642.26 $\pm$ 143.22 | 664.0 [521, 767] | 297 – 905 | 635.61 $\pm$ 162.99 | 636.5 [467, 806] | 308 – 970 | +0.041 | 0.158 | 0.064 | 33.62 px |
| **`landing_y`** | 462.10 $\pm$ 93.00 | 460.0 [363, 551] | 334 – 639 | 443.10 $\pm$ 31.24 | 447.0 [416, 468] | 367 – 516 | **+0.464** | **0.477** | $2.66 \times 10^{-14}$ | 60.91 px |
| **`player_x`** | 616.22 $\pm$ 78.68 | 616.0 [554, 660] | 481 – 808 | 635.53 $\pm$ 104.78 | 626.5 [539, 731] | 443 – 840 | -0.188 | 0.246 | $5.13 \times 10^{-4}$ | 34.30 px |
| **`player_y`** | 449.26 $\pm$ 95.09 | 379.0 [364, 551] | 339 – 587 | 453.25 $\pm$ 63.95 | 477.5 [392, 514] | 344 – 562 | -0.059 | 0.383 | $3.13 \times 10^{-9}$ | 35.61 px |
| **`opp_x`** | 627.89 $\pm$ 85.75 | 618.0 [559, 708] | 438 – 779 | 637.66 $\pm$ 60.74 | 640.0 [598, 673] | 451 – 838 | -0.154 | 0.217 | 0.003 | 29.31 px |
| **`opp_y`** | 471.25 $\pm$ 105.88 | 524.0 [362, 567] | 322 – 616 | 452.36 $\pm$ 97.28 | 393.5 [363, 544] | 308 – 640 | +0.193 | 0.174 | 0.031 | 19.87 px |
| **`delta_reach_x`** | 13.18 $\pm$ 81.38 | 11.0 [-50, 64] | -201 – 208 | 2.00 $\pm$ 68.69 | -8.0 [-44, 46] | -318 – 431 | +0.160 | 0.142 | 0.127 | 21.01 px |
| **`delta_reach_y`** | -6.52 $\pm$ 14.53 | -4.0 [-12, 1] | -52 – 28 | -7.17 $\pm$ 31.94 | -5.0 [-22, 10] | -224 – 254 | +0.021 | 0.206 | 0.006 | 10.49 px |
| **`dist_reach`** | 69.03 $\pm$ 47.13 | 57.08 [35.5, 93.3] | 1.4 – 208.0 | 59.69 $\pm$ 47.18 | 49.58 [36.6, 69.0] | 4.1 – 500.3 | +0.198 | 0.170 | 0.038 | 16.57 px |
| **`dist_opp`** | 206.74 $\pm$ 28.69 | 205.94 [186, 229] | 135.2 – 277.8 | 178.09 $\pm$ 46.18 | 174.56 [148, 202] | 40.4 – 438.5 | **+0.638** | **0.392** | $1.17 \times 10^{-9}$ | 32.49 px |
| **`disp_dist`** | **213.74 $\pm$ 71.50** | **201.02 [176, 235]** | **76.2 – 531.8** | **103.08 $\pm$ 61.85** | **93.70 [61.9, 125]** | **9.5 – 544.4** | **+1.761** | **0.770** | $\mathbf{9.60 \times 10^{-41}}$ | **110.69 px** |
| **`flight_frames`** | **14.98 $\pm$ 5.69** | **14.0 [12.0, 16.8]** | **6.0 – 41.0** | **25.53 $\pm$ 3.92** | **26.0 [23.0, 28.0]** | **11.0 – 40.0** | **-2.566** | **0.866** | $\mathbf{1.87 \times 10^{-50}}$ | **10.70 frames** |
| **`implied_speed`**| **15.72 $\pm$ 5.58** | **14.67 [12.1, 18.6]** | **2.6 – 38.0** | **4.23 $\pm$ 2.56** | **3.59 [2.6, 5.1]** | **0.5 – 23.0** | **+3.860** | **0.912** | $\mathbf{9.92 \times 10^{-59}}$ | **11.49 px/f** |
| **`ball_round`** | 8.89 $\pm$ 6.13 | 7.0 [4.0, 12.0] | 2.0 – 28.0 | 7.88 $\pm$ 6.39 | 6.0 [3.0, 11.0] | 2.0 – 44.0 | +0.159 | 0.193 | 0.012 | 1.20 rounds |

---

## 6. Spatial Feature Analysis

1. **Contact Position Inseparability (`hit_x, hit_y`):**
   - The horizontal contact point `hit_x` shows almost zero separability (DRIVE mean 629.40 px vs NET_SHOT mean 637.31 px, Cohen's d = -0.053, KS = 0.139). Both shot types occur symmetrically across the court width.
   - The vertical contact point `hit_y` exhibits significant bimodal overlap: both shots occur on both court sides (near and far court), resulting in near-identical means (442.74 px vs 447.10 px, Cohen's d = -0.079).
2. **Player and Opponent Positions:**
   - Striking player foot coordinates (`player_location_x, player_location_y`) provide weak separation ($|d| < 0.2$).
   - Opponent separation distance `dist_opp` shows moderate separation ($d = +0.638$, KS = 0.392): during a DRIVE, the opponent is typically held deeper in midcourt/rearcourt (mean 206.74 px separation), whereas during a NET_SHOT, both players are frequently compressed closer toward the net (mean 178.09 px separation).

---

## 7. Contact Mechanics Analysis

Contingency and association metrics for categorical mechanics:

| Categorical Feature | DRIVE Distribution (N=73) | NET_SHOT Distribution (N=720) | Chi-Square ($\chi^2$) | p-value | Cramér's V |
|:---|:---|:---|:---:|:---:|:---:|
| **`hit_height`** | Low (1.0): 75.34% (55)<br>Overhead (2.0): 24.66% (18) | Low (1.0): 3.75% (27)<br>Overhead (2.0): 96.25% (693) | 358.74 | $5.30 \times 10^{-80}$ | **0.673** |
| **`landing_area`** | Mid/Rear (5,6,8): **83.56%** (61)<br>Front (1,2,7): 16.44% (12) | Mid/Rear (5,6,8): 3.33% (24)<br>Front (1,2,7): **95.28%** (686) | **501.07** | $\mathbf{3.39 \times 10^{-102}}$ | **0.795** |
| **`hit_area`** | Mid/Rear (5,6,8): 90.41% (66)<br>Front (1,2,7): 9.59% (7) | Mid/Rear (5,6,8): 22.50% (162)<br>Front (1,2,7): 72.36% (521) | 162.34 | $1.06 \times 10^{-29}$ | 0.458 |
| **`backhand`** | Backhand: 28.77% (21)<br>Unflagged: 71.23% (52) | Backhand: 50.69% (365)<br>Unflagged: 49.31% (355) | 12.38 | 0.0004 | 0.125 |
| **`aroundhead`** | Aroundhead: 4.11% (3)<br>Unflagged: 95.89% (70) | Aroundhead: 0.00% (0)<br>Unflagged: 100.0% (720) | 29.84 | $4.68 \times 10^{-8}$ | 0.194 |

**Critical Observation:**
- `hit_height` has strong statistical correlation ($\text{Cramér's V} = 0.673$), but as proven in DRIVE-02, relying on it creates a fatal trap: the 18 overhead-height DRIVEs are sucked into NET_SHOT, while neutralizing it causes low-contact DRIVEs to lose their protective filter.
- In stark contrast, **`landing_area` achieves the highest association of any categorical feature ($\text{Cramér's V} = 0.795$)**: 95.28% of NET_SHOTs land in Frontcourt Zones (1, 2, 7), whereas 83.56% of DRIVEs land in Mid/Rear Zones (5, 6, 8).

---

## 8. Frontcourt DRIVE Analysis

Detailed case-by-case audit of the exact 7 validation frontcourt DRIVE samples that suffered 100% misclassification in both EXP24 and EXP_DRIVE_02:

| # | Match | Rally | Round | Hit Frame | Hit Area | Hit Coords $(x,y)$ | Striker Area | Opponent Area | Landing Area | Landing Coords $(x,y)$ | Disp. Dist | Flight Frames | Implied Speed | Time |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **1** | MATCH07 | 3 | 22 | 16244.0 | **Zone 2** (Front-Mid) | (474, 459) | Zone 7 | Zone 8 | **Zone 8** (Rear-Mid) | (686, 349) | **238.8 px** | **10.0** | **23.88 px/f** | 0:10:49 |
| **2** | MATCH07 | 15 | 17 | 27779.0 | **Zone 7** (Front-Right)| (542, 509) | Zone 8 | Zone 8 | **Zone 8** (Rear-Mid) | (597, 367) | **152.3 px** | **8.0** | **19.03 px/f** | 0:18:31 |
| **3** | MATCH07 | 21 | 5 | 33668.0 | **Zone 1** (Front-Left) | (872, 512) | Zone 8 | Zone 8 | **Zone 6** (Mid-Right) | (828, 358) | **160.2 px** | **11.0** | **14.56 px/f** | 0:22:26 |
| **4** | MATCH37 | 3 | 5 | 14304.0 | **Zone 2** (Front-Mid) | (428, 509) | Zone 8 | Zone 8 | **Zone 8** (Rear-Mid) | (536, 359) | **184.8 px** | **18.0** | **10.27 px/f** | 0:07:56 |
| **5** | MATCH38 | 18 | 8 | 58675.0 | **Zone 2** (Front-Mid) | (457, 499) | Zone 8 | Zone 8 | **Zone 8** (Rear-Mid) | (619, 353) | **218.1 px** | **12.0** | **18.17 px/f** | 0:32:35 |
| **6** | MATCH38 | 38 | 16 | 107731.0| **Zone 7** (Front-Right)| (765, 477) | Zone 8 | Zone 9 | **Zone 8** (Rear-Mid) | (704, 349) | **141.8 px** | **13.0** | **10.91 px/f** | 0:59:51 |
| **7** | MATCH40 | 26 | 7 | 30580.0 | **Zone 1** (Front-Left) | (798, 499) | Zone 8 | Zone 8 | **Zone 8** (Rear-Mid) | (747, 347) | **160.3 px** | **14.0** | **11.45 px/f** | 0:16:59 |

### Definitive Diagnostic Finding:
- **Common Spatial Pattern:** Every single one of the 7 frontcourt DRIVEs was struck near the net (Zones 1, 2, 7) **but penetrated deep into the opponent's rear court** (6 landed in Zone 8, 1 landed in Zone 6).
- **Physical Kinematics:** 
  - Mean displacement distance: **179.47 px** (range: 141.8 to 238.8 px).
  - Mean flight duration: **12.29 frames** (range: 8 to 18 frames).
  - Mean implied speed: **15.47 px/frame** (range: 10.27 to 23.88 px/frame).
- **The Source of Model Failure:** The current EXP24 architecture only provides the network with the **contact frame location** (`hit_area` = Zone 1, 2, or 7). In Zones 1, 2, and 7, over 95% of strokes in the training set are NET_SHOTs. Because EXP24 has **zero information about where the shuttle flies after contact**, the spatial MLP is forced by conditional probability to predict `NET_SHOT`.

---

## 9. Landing Analysis

### Coordinate Compatibility:
Both `hit_x, hit_y` and `landing_x, landing_y` are recorded in the exact same 1280x720 video camera broadcast space:
- Range: `hit_x` $\in [354, 970]$, `hit_y` $\in [295, 647]$
- Range: `landing_x` $\in [297, 970]$, `landing_y` $\in [334, 639]$
- Displacement vector $(\Delta x, \Delta y) = (\text{landing\_x} - \text{hit\_x}, \text{landing\_y} - \text{hit\_y})$ is mathematically valid.

### Displacement Comparison:
- **DRIVE:** Mean Euclidean displacement = **213.74 px** (Median: **201.02 px**; IQR: [175.56, 234.78]).
- **NET_SHOT:** Mean Euclidean displacement = **103.08 px** (Median: **93.70 px**; IQR: [61.92, 124.87]).
- **Effect Size:** **Cohen's d = +1.761**, **KS statistic = 0.770** ($p = 9.60 \times 10^{-41}$).
- **Separation:** Over 75% of DRIVEs travel farther than 175 px, whereas over 75% of NET_SHOTs travel less than 125 px. This provides extraordinary discriminative separation.

---

## 10. Sequential Shuttle Data Availability

A critical investigation was conducted into whether frame-by-frame sequential shuttle coordinates exist in the project repository:
1. In `ShuttleSet`, the continuous in-flight trajectory field is **completely absent** (documented as `continuous_trajectory: 0%` in Phase 11 audit).
2. Human annotators recorded only the discrete **contact moment** (`frame_num`, `hit_x`, `hit_y`) and **reception/landing moment** (`landing_x`, `landing_y`).
3. No computer vision shuttle tracker (such as TrackNet) has been executed or integrated into the ground truth.
4. **Conclusion:** "Continuous frame-to-frame shuttle velocity cannot be reliably constructed from the currently available annotation granularity."

---

## 11. Kinematic Feasibility

Evaluating the feasibility of kinematic feature construction from real annotations:

| Kinematic Dimension | Feasibility | Data Source / Availability | Mathematical Basis |
|:---|:---:|:---|:---|
| **Instantaneous Velocity Vector ($v_x, v_y$)** | **NO** | Absent (0% in-flight frames) | Cannot compute $\lim_{\Delta t \to 0} \frac{\Delta x}{\Delta t}$ |
| **Instantaneous Acceleration / Deceleration ($a$)** | **NO** | Absent (0% in-flight frames) | Requires second-order temporal differences ($d^2x/dt^2$) across intermediate points |
| **3D Parabolic Arc Curvature** | **NO** | 2D video pixel space only; no in-flight z-elevation | Missing elevation trajectory |
| **Stroke-Level Flight Duration ($\Delta \text{frames}$)** | **YES** | Available via consecutive rally hits (90.4% coverage) | $\Delta f = \text{frame\_num}_{t+1} - \text{frame\_num}_t$ |
| **Gross Stroke Displacement ($\Delta x, \Delta y, \text{dist}$)** | **YES** | Available via hit-to-landing vectors (96.1% coverage) | $\sqrt{(\text{land}_x - \text{hit}_x)^2 + (\text{land}_y - \text{hit}_y)^2}$ |
| **Average Implied Stroke Velocity ($\bar{v}$)** | **YES** | Derived from stroke displacement / flight duration | $\bar{v} = \frac{\text{dist\_flight}}{\Delta \text{frames}}$ |

---

## 12. Temporal Context

1. **Rally Sequence (`ball_round`):**
   - DRIVE mean: 8.89 rounds (median: 7.0).
   - NET_SHOT mean: 7.88 rounds (median: 6.0).
   - Cohen's d = 0.159 (weak separation). Both strokes occur throughout all phases of rally exchanges.
2. **Flight Duration to Receiver Contact (`flight_frames`):**
   - **DRIVE:** Mean = **14.98 frames** (Median: **14.0 frames**; IQR: [12.0, 16.75]).
   - **NET_SHOT:** Mean = **25.53 frames** (Median: **26.0 frames**; IQR: [23.0, 28.0]).
   - **Effect Size:** **Cohen's d = -2.566**, **KS statistic = 0.866** ($p = 1.87 \times 10^{-50}$).
   - **Physical Interpretation:** A DRIVE flies horizontally with high momentum, reaching the opponent in ~14 frames (~0.47s at 30 fps). A NET_SHOT floats softly over the tape and drops, taking ~26 frames (~0.87s at 30 fps) before being struck.
3. **Average Implied Speed (`implied_speed` in px/frame):**
   - **DRIVE:** Mean = **15.72 px/frame** (Median: **14.67 px/frame**; IQR: [12.12, 18.61]).
   - **NET_SHOT:** Mean = **4.23 px/frame** (Median: **3.59 px/frame**; IQR: [2.59, 5.05]).
   - **Effect Size:** **Cohen's d = +3.860**, **KS statistic = 0.912** ($p = 9.92 \times 10^{-59}$).
   - This is the **single most separable feature identified in the entire project**.
4. **Tactical Neighboring Shot Sequences:**
   - **DRIVE Preceding Shots:** High-speed attacking exchanges: DRIVE (19), WRIST_SMASH (11), BACKCOURT_DRIVE (9), PUSH (9), DEFENSIVE_DRIVE (9).
   - **NET_SHOT Preceding Shots:** Soft frontcourt play: NET_SHOT (195), RETURN_NET (141), DROP (125), SHORT_SERVICE (97).
   - **DRIVE Subsequent Shots:** RETURN_NET (24), DRIVE (19), PUSH (8).
   - **NET_SHOT Subsequent Shots:** LOB (300, 41.7%), NET_SHOT (195, 27.1%), PUSH (98, 13.6%).

---

## 13. Annotation Quality

- **Missing Coordinates:** 
  - `hit_x, hit_y`: 0 / 73 (0.0% missing) for DRIVE; 28 / 720 (3.89% missing) for NET_SHOT.
  - `landing_x, landing_y`: 0 / 73 (0.0% missing) for DRIVE; 0 / 720 (0.0% missing) for NET_SHOT.
- **Out-of-Bounds Coordinates:** Exactly **0** coordinates fall outside the 1280x720 video boundaries.
- **Zero Coordinates:** Zero anomalous (0.0, 0.0) coordinates detected.
- **Rally Continuity:** 100% of validation shots have valid, monotonically increasing `frame_num` values within their respective rallies.

---

## 14. Evidence Matrix

Comprehensive assessment of feature separability, availability, and potential utility:

| Feature / Quantity | Granularity | Available in Source | Missingness (Val) | Effect Size vs NET_SHOT | Potential Usefulness | Primary Value / Role |
|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **`implied_speed`** | Stroke exchange | YES (derived) | 9.6% (DRIVE) / 12.8% (NET) | **Cohen's d = +3.860, KS = 0.912** | **HIGH** | Absolute velocity discriminator |
| **`flight_frames`** | Stroke exchange | YES (derived) | 9.6% (DRIVE) / 9.0% (NET) | **Cohen's d = -2.566, KS = 0.866** | **HIGH** | Flight duration discriminator |
| **`disp_dist`** | Stroke level | YES | 0.0% (DRIVE) / 3.9% (NET) | **Cohen's d = +1.761, KS = 0.770** | **HIGH** | Physical travel distance |
| **`landing_area`** | Stroke level | YES | 0.0% (DRIVE) / 0.0% (NET) | **Cramér's V = 0.795, $\chi^2 = 501.1$** | **HIGH** | Depth destination (Front vs Rear) |
| **`dist_opp`** | Hit instant | YES | 0.0% (DRIVE) / 0.0% (NET) | Cohen's d = +0.638, KS = 0.392 | **MEDIUM** | Tactical player spacing prior |
| **`hit_height`** | Hit instant | YES | 0.0% (DRIVE) / 0.0% (NET) | Cramér's V = 0.673, $\chi^2 = 358.7$ | **MEDIUM** | Distinguishes low DRIVE; traps high DRIVE |
| **`hit_area`** | Hit instant | YES | 0.0% (DRIVE) / 2.6% (NET) | Cramér's V = 0.458, $\chi^2 = 162.3$ | **LOW** | Severe frontcourt overlap |
| **`hit_x, hit_y`** | Hit instant | YES | 0.0% (DRIVE) / 3.9% (NET) | Cohen's d = -0.053 / -0.079 | **LOW** | Static contact location identical |
| **`delta_reach`** | Hit instant | YES | 0.0% (DRIVE) / 3.9% (NET) | Cohen's d = +0.160 / +0.021 | **LOW** | Body reach offset indistinguishable |
| **`backhand`** | Hit instant | PARTIAL | 71.2% (DRIVE) / 49.3% (NET) | Cramér's V = 0.125 | **LOW** | High missingness |
| **`aroundhead`** | Hit instant | PARTIAL | 95.9% (DRIVE) / 100% (NET) | Cramér's V = 0.194 | **LOW** | Extreme sparsity |
| **`continuous_shuttle`**| Frame level | **NO** | **100.0% Missing** | N/A | **BLOCKED** | In-flight trajectory points absent |

---

## 15. Candidate Feature Set

Based exclusively on verified empirical evidence from real annotations, the following small candidate feature set is physically and statistically supported:

1. **`stroke_displacement_distance` (`disp_dist`):**
   - Euclidean pixel distance $\sqrt{(\text{landing}_x - \text{hit}_x)^2 + (\text{landing}_y - \text{hit}_y)^2}$.
2. **`stroke_depth_displacement` (`disp_dy`):**
   - Directional vertical travel $(\text{landing}_y - \text{hit}_y)$ indicating whether shuttle penetrates deep downcourt.
3. **`destination_zone_category` (`landing_zone_macro`):**
   - 3-way categorical indicator: Frontcourt (Zones 1, 2, 7), Midcourt (Zones 4, 5, 6), Rearcourt (Zones 3, 8, 9).
4. **`inter_stroke_flight_frames` (`flight_duration`):**
   - Frame count between current stroke hit and receiver's stroke hit within the same rally.
5. **`implied_stroke_velocity` (`speed_px_per_frame`):**
   - Quotient of displacement distance divided by flight frame duration ($\text{disp\_dist} / \Delta \text{frames}$).

*(Note: Candidate formulation only; zero features created or trained).*

---

## 16. Limitations

1. **Post-Contact Temporal Timing (Future Outcome vs Real-Time Classification):**
   - In live broadcast inference, `landing_x, landing_y` occurs **after** stroke execution. While human annotators recorded this outcome in ShuttleSet, a real-time model evaluating an isolated 16-frame window centered on impact does not possess downstream landing coordinates.
   - For an automated pipeline to utilize landing kinematics, the visual/temporal sampling window must extend **after** the hit moment (e.g. evaluating 24–32 frames post-hit to observe initial shuttle trajectory departure), or the model must ingest multi-stroke rally sequences.
2. **Absence of In-Flight Coordinate Supervisions:**
   - Because ShuttleSet contains 0 in-flight frame coordinates, training a frame-by-frame shuttle tracker (e.g., TrackNet) cannot be supervised directly on ShuttleSet without external tracking annotations.
3. **Terminal Rally Strokes:**
   - 9.59% of DRIVEs and 9.03% of NET_SHOTs are point-ending winners or errors where no subsequent stroke occurs. Inter-stroke duration $\Delta \text{frames}$ is unavailable for these terminal strokes.

---

## 17. Recommended Next Experimental Direction

### Proposed Direction: EXP_DRIVE_03 — Post-Hit Temporal Window & Kinematic Trajectory Expansion
- **Concept:** Expand the temporal sequence window of the visual backbone to capture post-hit shuttle flight.
- **Mechanism:** Rather than a symmetric 16-frame window (8 pre-hit, 8 post-hit), evaluate an **asymmetric 24-to-32 frame window** (e.g., 6 pre-hit, 18–26 post-hit).
- **Physical Rationale:** Over the first 8 frames post-contact, DRIVE and NET_SHOT visual sequences look nearly identical (compact racket follow-through). Over frames 10–24 post-contact, the physical difference becomes visually overwhelming: a DRIVE violently departs the player's court into the opponent's space, whereas a NET_SHOT decelerates and drops over the net tape.
- *(Description only per protocol; will NOT be executed without explicit user authorization).*

---

## 18. Integrity Checks

- **Official TEST accessed:** **NO** (Strictly quarantined; 0 test samples accessed)
- **EXP24 modified:** **NO** (Checkpoint remains frozen and pristine)
- **EXP23 modified:** **NO** (Unmodified)
- **EXP25 modified:** **NO** (Unmodified)
- **Annotations modified:** **NO** (Source files untouched)
- **SPARK production code modified:** **NO** (Frontend, backend, inference service untouched)
- **HitHeatmap used:** **NO** (No synthetic coordinates, no HitHeatmap training or inference)
- **Training performed:** **NO** (Zero models trained, zero classifiers run)
- **Synthetic coordinates created:** **NO** (Only real annotations analyzed)

---

## 19. Conclusion

DRIVE-03 FEASIBILITY AUDIT COMPLETE — NO TRAINING PERFORMED.
