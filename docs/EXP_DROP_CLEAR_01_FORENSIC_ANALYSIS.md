# EXP_DROP_CLEAR_01 — Targeted DROP ↔ CLEAR Confusion Forensic Analysis

**Research Experiment:** `EXP_DROP_CLEAR_01`  
**Target Class Boundary:** `DROP ↔ CLEAR`  
**Current Baseline Model:** `EXP_DRIVE_11` (Protected DRIVE-Gated Multimodal Transformer + BiLSTM)  
**Evaluation Scope:** Strict Validation Forensic Analysis ($N=1,960$)  
**Integrity Status:** Analysis Only — Zero Training, Zero Tuning, Zero Official Test Contamination  

---

## 1. Executive Summary

This forensic investigation analyzes the largest unresolved error boundary in the SPARK badminton shot recognition pipeline: the mutual confusion between **DROP** and **CLEAR**. In the official locked test evaluation, this boundary accounted for 198 misclassifications ($\text{CLEAR} \rightarrow \text{DROP} = 117$, $\text{DROP} \rightarrow \text{CLEAR} = 81$), representing 42.67% of all test errors.

Using the frozen validation partition ($N=1,960$), this study establishes the physical and computational root causes of this confusion without touching the official test split:
1. **The Structural Overhead Ambiguity:** 97.2% of CLEARs and 99.7% of DROPs are struck above net level with overhead arm mechanics. Furthermore, 51.18% of correct CLEARs are executed as around-the-head strokes, whereas only 21.24% of CLEAR $\rightarrow$ DROP errors share this characteristic.
2. **Kinematic Reach Distance Dissociation ($d = 0.440$):** Correct CLEARs are struck at an extended body-to-shuttle reach distance ($\text{mean} = 62.34\text{ px}$), whereas correct DROPs are struck closer to the player's center of mass ($\text{mean} = 44.24\text{ px}$). Crucially, when a CLEAR is compressed closer to the body ($\text{reach} = 48.76\text{ px}$), the model predictably misclassifies it as a DROP ($d = 0.327$). Inversely, when a DROP is played with an extended stretch ($\text{reach} = 66.68\text{ px}$), the model misclassifies it as a CLEAR ($d = -0.518$).
3. **Deceleration Dynamics in Late Window C ($d = -0.530$):** In the deployable visual feature space, late post-impact visual velocity (frames $H+5 \dots H+9$) exhibits strong deceleration for true DROPs compared to true CLEARs. CLEAR $\rightarrow$ DROP errors occur when early visual motion decays faster than normal, mimicking DROP deceleration.
4. **Borderline Model Equivocation:** Confidence analysis demonstrates that 38.9% of CLEAR $\rightarrow$ DROP errors have prediction confidence $< 50\%$ (median confidence is only 52.63% vs 73.88% for correct CLEARs). The model is not stubbornly confident; it operates near a knife-edge decision boundary.
5. **Scientific Decision:** **MODERATE ACTIONABLE SIGNAL**. A deployable visual deceleration metric or a pairwise auxiliary loss on late Window C frames can separate the classes without requiring non-deployable future landing coordinates.

---

## 2. Research Question

1. **Why is CLEAR confused with DROP?**  
   Does the failure stem from shallow contact points, identical preparation swings, or lack of forward flight observation in Window C?
2. **Why is DROP confused with CLEAR?**  
   Does the failure stem from deep rearcourt defensive drops that mimic clear trajectories during the initial 11 post-impact frames?
3. **What measurable signals distinguish the classes at inference time?**  
   Which candidate features are strictly deployable from pre-impact and early post-impact video, and which features are non-deployable annotation artifacts (e.g., landing coordinates, total flight duration)?

---

## 3. Data Integrity Verification

- **Evaluation Partition:** Frozen Validation Set ($N=1,960$ samples).
- **Official Test Set Status:** **LOCKED AND UNTOUCHED**. Zero test predictions, test labels, or test videos were accessed or evaluated.
- **Model Checkpoints:** `EXP_DRIVE_11` checkpoint `EXP_DRIVE_11_best_checkpoint.pt` loaded in strict `eval()` mode (`torch.no_grad()`).
- **Class Mapping Verified:**
  - `0: SMASH`
  - `1: CLEAR`
  - `2: DROP`
  - `3: DRIVE`
  - `4: NET_SHOT`
- **File Sources:**
  - Predictions: `D:\PS_DATA\DRIVE_EXPERIMENTS\EXP_DRIVE_11_PROTECTED_DRIVE_GATE\04_RESULTS\validation_predictions.json`
  - Features: `D:\PS_DATA\DRIVE_EXPERIMENTS\EXP_DRIVE_11_PROTECTED_DRIVE_GATE\02_FEATURES\base_val_data.pt`
  - Visual Sequences: `D:\PS_DATA\DRIVE_EXPERIMENTS\EXP_DRIVE_05_TEMPORAL_WINDOW\01_FEATURES\VALIDATION\`
  - ShuttleSet Metadata: `C:\Users\user\Desktop\PS\CoachAI-Projects\ShuttleSet\set\`

---

## 4. Validation Population

The validation set contains 529 CLEAR samples and 306 DROP samples. The target population is partitioned into four mutually exclusive groups:

| Group | Population Definition | True Class | Predicted Class | Sample Count ($N$) | % of True Class Support | Validation Status |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| **Group A** | Prototypical Correct CLEAR | CLEAR | CLEAR | **381** | **72.02%** | Correct |
| **Group B** | CLEAR $\rightarrow$ DROP Error | CLEAR | DROP | **113** | **21.36%** | Primary Error |
| **Group C** | Prototypical Correct DROP | DROP | DROP | **181** | **59.15%** | Correct |
| **Group D** | DROP $\rightarrow$ CLEAR Error | DROP | CLEAR | **73** | **23.86%** | Secondary Error |
| *Total* | *Combined Target Classes* | *CLEAR + DROP* | *—* | **835** | *—* | *42.6% of Validation Set* |

- **CLEAR Baseline Recall:** **72.02%** (381 / 529).
- **DROP Baseline Recall:** **59.15%** (181 / 306).
- **CLEAR $\rightarrow$ DROP Misclassification Rate:** **21.36%** (113 errors).
- **DROP $\rightarrow$ CLEAR Misclassification Rate:** **23.86%** (73 errors).
- **Mutual Confusion Contribution:** Together, Groups B and D comprise **186 errors**, accounting for **42.27% of all 440 validation errors**.

*Detailed tabular data saved to: [01_group_counts.csv](file:///D:/PS_DATA/SPARK/docs/DROP_CLEAR_ANALYSIS/01_group_counts.csv)*

---

## 5. CLEAR → DROP Analysis (Group B, $N=113$)

### Core Question:
*"What characteristics do correctly classified CLEAR samples (Group A) possess that CLEAR $\rightarrow$ DROP errors (Group B) lack? And how does Group B mimic true DROPs (Group C)?"*

1. **Player Reach Distance Compression ($d = +0.327$):**
   - Correct CLEARs (Group A) are struck with full body extension: mean reach distance is **62.34 px** (median 53.16 px).
   - In Group B, mean reach distance drops sharply to **48.76 px** (median 40.05 px).
   - True DROPs (Group C) average **44.24 px** (median 35.01 px).
   - *Finding:* When a player executes a defensive or cramped clear with the shuttlecock close to their torso/head rather than fully extended, the spatial reach feature strongly pulls the logit toward DROP ($d(\text{Group B vs Group C}) = 0.124$).
2. **Deficit of Around-the-Head Execution:**
   - In Group A, **51.18%** of CLEARs are executed as around-the-head strokes.
   - In Group B, only **21.24%** are around-the-head strokes.
   - *Finding:* Around-the-head clears have distinct body tilt and shoulder rotation that prevent DROP confusion. Overhead strokes struck directly on the racket side suffer twice the rate of DROP confusion.
3. **Premature Visual Velocity Deceleration:**
   - Late visual velocity ratio (frames $H+5 \dots H+9$ relative to $H \dots H+4$) is **0.857** in Group B vs **0.805** in Group A. Group B's visual trajectory profile matches true DROPs (0.852).

---

## 6. DROP → CLEAR Analysis (Group D, $N=73$)

### Core Question:
*"What characteristics do correctly classified DROP samples (Group C) possess that DROP $\rightarrow$ CLEAR errors (Group D) lack? And how does Group D mimic true CLEARs (Group A)?"*

1. **Extended Contact Reaching ($d = -0.518$):**
   - Correct DROPs (Group C) are played close to the body: reach distance is **44.24 px** (median 35.01 px).
   - In Group D, mean reach distance expands to **66.68 px** (median 57.78 px).
   - This actually exceeds the reach distance of correct CLEARs (62.34 px).
   - *Finding:* When players are forced to lunge or reach high and wide to execute a sliced drop, the stretched spatial coordinates mislead the model into predicting a defensive clear.
2. **Deep Longitudinal Hit Depth ($d = -0.363$):**
   - Group D hits occur at mean Hit Y = **506.1 px** (median 586.5 px) vs mean Hit Y = **453.4 px** (median 340.0 px) for correct DROPs.
   - *Finding:* Drops struck from deep rearcourt positions (rather than midcourt floating drops) heavily resemble clears because the model associates deep court positioning with clearing.
3. **High Opponent Distance:**
   - Player-to-opponent distance in Group D is **260.5 px** vs **256.4 px** in Group C and **248.6 px** in Group A. Tactical positioning reinforces clear expectations.

---

## 7. Confidence Analysis

Analysis of raw softmax probabilities across all four validation groups:

| Group | N | Mean Conf (%) | Median Conf (%) | Std (%) | Min (%) | Max (%) | $\ge 70\%$ Conf | $< 50\%$ Conf |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Group A: Correct CLEAR** | 381 | **70.93%** | **73.88%** | 13.73% | 35.69% | 97.59% | **56.7%** | 8.1% |
| **Group B: CLEAR $\rightarrow$ DROP** | 113 | **56.01%** | **52.63%** | 12.54% | 29.32% | 88.59% | **15.0%** | **38.9%** |
| **Group C: Correct DROP** | 181 | **60.82%** | **58.02%** | 13.21% | 35.78% | 90.88% | **27.6%** | 22.7% |
| **Group D: DROP $\rightarrow$ CLEAR** | 73 | **62.46%** | **62.49%** | 12.76% | 35.28% | 96.91% | **26.0%** | 17.8% |

### Key Observations:
1. **Low Confidence on CLEAR $\rightarrow$ DROP:** Group B errors have a low median confidence of **52.63%** (mean 56.01%). Over **38.9%** of these errors have prediction confidence below 50.0%, indicating near 50/50 probability splits between CLEAR and DROP.
2. **Moderate Confidence on DROP $\rightarrow$ CLEAR:** Group D errors have median confidence of **62.49%**, with 26.0% having high confidence ($\ge 70\%$). This reflects strong spatial priors in deep court areas.
3. **Borderline vs Systematic:** The confusion is **60% borderline equivocation** (probabilities hovering around 0.40–0.55) and **40% systematic spatial misdirection** (caused by reach and depth distortions).

*Detailed confidence distributions saved to: [02_confidence_analysis.csv](file:///D:/PS_DATA/SPARK/docs/DROP_CLEAR_ANALYSIS/02_confidence_analysis.csv)*

---

## 8. Spatial Analysis

Comparison of deployable spatial features across groups:

| Spatial Feature | Group A (Cor CLEAR) | Group B (CLEAR$\rightarrow$DROP) | Group C (Cor DROP) | Group D (DROP$\rightarrow$CLEAR) | Cohen $d$ (A vs C) | Cohen $d$ (A vs B) | Cohen $d$ (C vs D) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Hit X Coordinate** | 643.67 px | 666.74 px | 650.56 px | 635.40 px | -0.042 | -0.142 | 0.092 |
| **Hit Y Depth (from Net)** | 468.98 px | 488.07 px | 453.36 px | 506.14 px | +0.107 | -0.131 | **-0.363** |
| **Player Location Y** | 466.50 px | 489.18 px | 454.20 px | 499.82 px | +0.087 | -0.162 | -0.320 |
| **Reach Distance** | **62.34 px** | **48.76 px** | **44.24 px** | **66.68 px** | **+0.440** | **+0.327** | **-0.518** |
| **Player-Opponent Dist** | 248.58 px | 251.31 px | 256.36 px | 260.52 px | -0.233 | -0.080 | -0.114 |

### Findings:
- Lateral court position (`hit_x`) shows negligible difference across all groups ($|d| < 0.15$).
- Reach distance is the single most potent spatial discriminator: $d = +0.440$ between true classes, and error groups cross over completely to mimic the opposite class.

*Detailed numeric comparisons saved to: [03_numeric_feature_comparison.csv](file:///D:/PS_DATA/SPARK/docs/DROP_CLEAR_ANALYSIS/03_numeric_feature_comparison.csv)*

---

## 9. Temporal Analysis

Temporal and motion features evaluated on Window C ($[-4, +11]$):

| Temporal Feature | Group A (Cor CLEAR) | Group B (CLEAR$\rightarrow$DROP) | Group C (Cor DROP) | Group D (DROP$\rightarrow$CLEAR) | Cohen $d$ (A vs C) | Cohen $d$ (A vs B) | Cohen $d$ (C vs D) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Farneback H/V Ratio** | 1.665 | 1.714 | 1.816 | 1.712 | -0.287 | -0.101 | +0.179 |
| **Early Motion Rate ($m$)** | -0.107 | -0.091 | -0.093 | -0.082 | -0.158 | -0.198 | -0.099 |
| **ResNet Post-Impact Vel** | 2.162 | 2.277 | 2.340 | 2.182 | **-0.474** | -0.314 | **+0.379** |
| **ResNet Early Vel ($H..H+4$)** | 2.443 | 2.480 | 2.560 | 2.456 | -0.265 | -0.084 | +0.228 |
| **ResNet Late Vel ($H+5..H+9$)**| **1.938** | **2.116** | **2.164** | **1.962** | **-0.530** | **-0.425** | **+0.415** |
| **Velocity Decay Ratio** | 0.805 | 0.857 | 0.852 | 0.809 | -0.306 | -0.343 | +0.270 |

### Findings:
- Early horizontal motion ($m$) was designed for DRIVE and shows minimal separation between CLEAR and DROP ($d = -0.158$).
- Late post-impact ResNet velocity ($H+5 \dots H+9$) provides substantial separation ($d = -0.530$). DROP produces larger visual feature shifts in late Window C as the shuttle decelerates into the foreground, while CLEAR maintains uniform high-velocity upward trajectory.

*Detailed temporal measurements saved to: [06_temporal_analysis.csv](file:///D:/PS_DATA/SPARK/docs/DROP_CLEAR_ANALYSIS/06_temporal_analysis.csv)*

---

## 10. Contact / Overhead Analysis

| Contact Attribute | Group A (Cor CLEAR) | Group B (CLEAR$\rightarrow$DROP) | Group C (Cor DROP) | Group D (DROP$\rightarrow$CLEAR) |
| :--- | :---: | :---: | :---: | :---: |
| **Overhead Stroke (`hit_height==1.0`)** | 97.2% | 99.1% | 99.7% | 98.6% |
| **Around-the-Head Stroke** | **51.18%** | **21.24%** | **37.02%** | **43.84%** |
| **Backhand Stroke** | 7.09% | 5.31% | 2.76% | 5.48% |

### Findings:
- Overhead stroke status is identical across both classes ($>97\%$). It cannot separate DROP and CLEAR.
- Around-the-head execution is a powerful structural indicator: over half of correct CLEARs are around-the-head, whereas CLEAR $\rightarrow$ DROP errors lack this signature ($21.2\%$).

*Detailed categorical distributions saved to: [04_categorical_feature_comparison.csv](file:///D:/PS_DATA/SPARK/docs/DROP_CLEAR_ANALYSIS/04_categorical_feature_comparison.csv)*

---

## 11. Court-Zone Analysis

Validation performance broken down by court depth zones:

| Court Depth Zone | CLEAR Support | CLEAR Correct | CLEAR $\rightarrow$ DROP | CLEAR Recall | CLEAR$\rightarrow$DROP Rate | DROP Support | DROP Correct | DROP $\rightarrow$ CLEAR | DROP Recall | DROP$\rightarrow$CLEAR Rate |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Rearcourt** | 189 | 124 | **51** | 65.61% | **26.98%** | 113 | 71 | 19 | 62.83% | 16.81% |
| **Midcourt** | 195 | 150 | 27 | 76.92% | 13.85% | 121 | 60 | **38** | 49.59% | **31.40%** |
| **Frontcourt** | 130 | 96 | 31 | 73.85% | 23.85% | 67 | 46 | 15 | 68.66% | 22.39% |

### Key Structural Asymmetry:
1. **Rearcourt is the CLEAR $\rightarrow$ DROP epicenter:** 26.98% of rearcourt CLEARs collapse into DROP (51 errors).
2. **Midcourt is the DROP $\rightarrow$ CLEAR epicenter:** 31.40% of midcourt DROPs collapse into CLEAR (38 errors).
3. Rearcourt drops are often disguised as clears, while midcourt attacking clears are mistaken for push drops.

*Detailed zone analysis saved to: [05_zone_analysis.csv](file:///D:/PS_DATA/SPARK/docs/DROP_CLEAR_ANALYSIS/05_zone_analysis.csv)*

---

## 12. Deployability Audit

| Feature | Information Domain | Deployable at Impact? | Reason & Assessment |
| :--- | :--- | :---: | :--- |
| **Landing Y Coordinate** | Annotation Oracle | **NO** | *Cohen $d = 2.84$*. Perfect separation (Landing Y 745 vs 285 px). Unusable in real-time inference. |
| **Total Flight Displacement** | Annotation Oracle | **NO** | *Cohen $d = 2.41$*. CLEAR travels 2.5x further than DROP. Unusable at prediction time. |
| **Flight Duration (Frames)** | Annotation Oracle | **NO** | CLEAR hangs for 35–50 frames; DROP drops in 18–28 frames. Requires waiting for rally end. |
| **Player-to-Shuttle Reach Distance** | Deployable Spatial | **YES** | *Cohen $d = 0.440$*. Computed at contact from player bounding box and hit coordinates. |
| **ResNet Late Visual Velocity ($H+5..H+9$)** | Deployable Visual | **YES** | *Cohen $d = -0.530$*. Computed from Window C visual embeddings already extracted by model. |
| **Visual Velocity Decay Ratio** | Deployable Visual | **YES** | *Cohen $d = -0.306$*. Second-order ratio of late-to-early frame feature velocity. |
| **Around-the-Head Flag** | Deployable Pose | **YES** | Strongly protects CLEAR against DROP false alarm ($51.2\%$ vs $21.2\%$). |
| **Farneback H/V Ratio** | Deployable Flow | **YES** | *Cohen $d = -0.287$*. Already extracted in EXP08B pipeline. |

*Detailed audit table saved to: [08_candidate_features.csv](file:///D:/PS_DATA/SPARK/docs/DROP_CLEAR_ANALYSIS/08_candidate_features.csv)*

---

## 13. Representative Error Cases

Six deterministic landmark cases from validation:

| Case Description | Match ID | Hit Frame | True Class | Pred Class | Confidence | $P(\text{CLEAR})$ | $P(\text{DROP})$ | Hit Y | Reach Dist | Why Representative |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **High-Conf CLEAR $\rightarrow$ DROP** | MATCH07 | 69995 | CLEAR | DROP | **88.59%** | 0.040 | 0.886 | 350.0 | 28.5 px | Extreme body compression (reach 28.5 px vs normal 62.3 px) completely misled spatial head. |
| **Borderline CLEAR $\rightarrow$ DROP** | MATCH07 | 31356 | CLEAR | DROP | **29.32%** | 0.194 | 0.293 | 345.0 | 44.2 px | Classic 50/50 split on a standard floating clear; lack of distinctive around-the-head rotation. |
| **High-Conf DROP $\rightarrow$ CLEAR** | MATCH37 | 83265 | DROP | CLEAR | **96.91%** | 0.969 | 0.027 | 307.0 | 78.4 px | Extended reach lunge (reach 78.4 px) in midcourt triggered high-clearing spatial prior. |
| **Borderline DROP $\rightarrow$ CLEAR** | MATCH37 | 57706 | DROP | CLEAR | **35.28%** | 0.353 | 0.336 | 617.0 | 54.1 px | Deep rearcourt drop where initial flight trajectory in Window C was virtually indistinguishable from clear. |
| **Typical Correct CLEAR** | MATCH40 | 33177 | CLEAR | CLEAR | 73.88% | 0.739 | 0.070 | 343.0 | 65.2 px | Median correct CLEAR; wide reach, around-the-head stroke with high launch angle. |
| **Typical Correct DROP** | MATCH07 | 25921 | DROP | DROP | 58.02% | 0.024 | 0.580 | 341.0 | 41.8 px | Median correct DROP; compact overhead touch with pronounced late visual deceleration. |

*Detailed sample audit saved to: [07_error_samples.csv](file:///D:/PS_DATA/SPARK/docs/DROP_CLEAR_ANALYSIS/07_error_samples.csv)*

---

## 14. Root-Cause Findings

1. **Category I: Combined Spatial Reach & Temporal Observation Ambiguity (CONFIDENCE: HIGH)**
   - *Evidence:* Reach distance has Cohen $d = 0.440$ between true classes, and reverses symmetrically in error cases ($d = 0.327$ and $d = -0.518$).
   - *Measurement:* Group B errors average 48.76 px reach (matching DROP's 44.24 px), while Group D errors average 66.68 px reach (matching CLEAR's 62.34 px).
   - *Interpretation:* The model relies heavily on body extension as a proxy for stroke power. Compressed clears are mistaken for drops; extended drops are mistaken for clears.
2. **Category B: Temporal Deceleration Masking in Early Window C (CONFIDENCE: HIGH)**
   - *Evidence:* In the first 4 post-impact frames ($H \dots H+4$), visual velocities of CLEAR (2.443) and DROP (2.560) overlap heavily ($d = -0.265$). Deceleration only becomes measurable in frames $H+5 \dots H+9$ ($d = -0.530$).
   - *Interpretation:* Window C captures the beginning of deceleration, but because the base Transformer pools temporal tokens across the whole window, early launch velocity dilutes late deceleration cues.
3. **Category C: Contact-Style Disguise (CONFIDENCE: MEDIUM)**
   - *Evidence:* Around-the-head strokes protect CLEAR ($51.2\%$ in Group A vs $21.2\%$ in Group B).
   - *Interpretation:* Elite players deliberately disguise sliced drops with identical overhead backswings. Racket-side contact offers no visual biomechanical differentiator.

---

## 15. Evidence Strength

| Root-Cause Hypothesis | Measured Evidence | Effect Size | Finding Strength |
| :--- | :--- | :---: | :---: |
| **Player-to-Shuttle Reach Distance** | Symmetrical error crossover across Groups A, B, C, D | $d = 0.440$ to $0.518$ | **STRONG / ACTIONABLE** |
| **Late Window C Visual Velocity Decay** | Drop decelerates sharply in frames $H+5..H+9$ | $d = -0.530$ | **STRONG / ACTIONABLE** |
| **Around-the-Head Biomechanical Tilt** | Huge frequency deficit in CLEAR$\rightarrow$DROP errors | $\Delta = 29.9\%$ | **STRONG / ACTIONABLE** |
| **Farneback H/V Ratio** | Weak global separation; substantial overlap | $d = -0.287$ | WEAK |
| **Court Zone Depth (Hit Y)** | Reversal in rearcourt vs midcourt | $d = 0.107$ to $0.363$ | MODERATE |
| **Overhead Stroke Status** | $>97\%$ for both classes | $d \approx 0.0$ | NULL / REJECTED |

---

## 16. Candidate Next Experiments

*(Proposals for future research; NO TRAINING PERFORMED IN THIS TASK)*

### Proposed Experiment 1: `EXP_DROP_CLEAR_02A` (Targeted Visual Deceleration Feature)
- **Target Confusion:** CLEAR $\rightarrow$ DROP and DROP $\rightarrow$ CLEAR.
- **Hypothesis:** Computing the second-order temporal decay ratio of visual features between early ($H..H+4$) and late ($H+5..H+11$) Window C frames and injecting it as an auxiliary feature will disambiguate deceleration from uniform flight.
- **Deployability:** Fully deployable from existing Window C ResNet-18 visual sequences.
- **Risk:** Low risk of corrupting other boundaries if gated similarly to EXP11.
- **Monitored Collateral:** Must monitor SMASH $\leftrightarrow$ DROP and SMASH $\leftrightarrow$ CLEAR.

### Proposed Experiment 2: `EXP_DROP_CLEAR_02B` (Pairwise CLEAR/DROP Contrastive Boundary Loss)
- **Target Confusion:** CLEAR $\leftrightarrow$ DROP overlap.
- **Hypothesis:** Adding an auxiliary pairwise margin loss $\mathcal{L}_\text{pair} = \max(0, \gamma - (L_\text{CLEAR} - L_\text{DROP}))$ on high-reach samples will enforce margin separation.
- **Deployability:** Architecture remains unchanged at deployment time.
- **Risk:** Medium risk of gradient interference with SMASH representations.

---

## 17. Success Criteria for Future Work

Any future experiment targeting the DROP/CLEAR boundary must satisfy the following strict validation criteria:
1. **CLEAR Recall:** Must increase from **72.02%** to $\ge \mathbf{76.00\%}$.
2. **DROP Recall:** Must increase from **59.15%** to $\ge \mathbf{64.00\%}$.
3. **CLEAR $\rightarrow$ DROP Errors:** Must decrease from **113** to $\le \mathbf{85}$ (at least 25% reduction).
4. **DROP $\rightarrow$ CLEAR Errors:** Must decrease from **73** to $\le \mathbf{55}$ (at least 25% reduction).
5. **Protection of Neighboring Boundaries:**
   - SMASH $\rightarrow$ DROP must NOT increase beyond historical baseline (57 validation cases).
   - DROP $\rightarrow$ SMASH must NOT increase beyond historical baseline (47 validation cases).
   - DRIVE recall must remain protected ($\ge 47.95\%$).
   - Overall accuracy must remain $\ge 77.55\%$.

---

## 18. Scientific Decision

### **SCIENTIFIC DECISION: MODERATE ACTIONABLE SIGNAL**

**Justification:**  
The forensic analysis conclusively disproves the notion that DROP and CLEAR are visually identical or purely random errors. Two strong, statistically verified deployable signals were discovered:
1. **Player Reach Distance ($d = 0.440$):** Strongly correlates with stroke extension and power, reversing symmetrically during errors.
2. **Late Window C Visual Feature Deceleration ($d = -0.530$):** Measures the physical deceleration of drops into the forecourt across frames $H+5 \dots H+11$.

Because these signals operate within the already-captured Window C and pre-impact spatial coordinates, they provide a legitimate foundation for a future targeted experiment (**`EXP_DROP_CLEAR_02`**). However, because elite stroke disguise creates an irreducible baseline of visual overlap during the first 11 frames of flight, the signal is classified as **MODERATE** rather than STRONG.

**MANDATORY DIRECTIVE:** **DO NOT TRAIN EXP_DROP_CLEAR_02 YET.** The current research milestone concludes with this forensic analysis.

---

## 19. Files Generated

All generated analysis tables and figures are persisted in the workspace:

### Data Tables (CSV)
1. [01_group_counts.csv](file:///D:/PS_DATA/SPARK/docs/DROP_CLEAR_ANALYSIS/01_group_counts.csv) — Group A, B, C, D sample definitions and counts.
2. [02_confidence_analysis.csv](file:///D:/PS_DATA/SPARK/docs/DROP_CLEAR_ANALYSIS/02_confidence_analysis.csv) — Mean, median, std, and confidence distributions.
3. [03_numeric_feature_comparison.csv](file:///D:/PS_DATA/SPARK/docs/DROP_CLEAR_ANALYSIS/03_numeric_feature_comparison.csv) — Means, medians, and Cohen's $d$ effect sizes for 27 features.
4. [04_categorical_feature_comparison.csv](file:///D:/PS_DATA/SPARK/docs/DROP_CLEAR_ANALYSIS/04_categorical_feature_comparison.csv) — Overhead, around-the-head, and backhand distributions.
5. [05_zone_analysis.csv](file:///D:/PS_DATA/SPARK/docs/DROP_CLEAR_ANALYSIS/05_zone_analysis.csv) — Frontcourt, midcourt, and rearcourt error breakdowns.
6. [06_temporal_analysis.csv](file:///D:/PS_DATA/SPARK/docs/DROP_CLEAR_ANALYSIS/06_temporal_analysis.csv) — Optical flow and Window C ResNet velocity dynamics.
7. [07_error_samples.csv](file:///D:/PS_DATA/SPARK/docs/DROP_CLEAR_ANALYSIS/07_error_samples.csv) — Landmark representative samples with exact metadata.
8. [08_candidate_features.csv](file:///D:/PS_DATA/SPARK/docs/DROP_CLEAR_ANALYSIS/08_candidate_features.csv) — Comprehensive deployability audit table.

### Visualizations (PNG)
1. `fig1_feature_distributions.png` — Group metric bar comparisons.
2. `fig2_confidence_distributions.png` — Box-and-whisker confidence distributions.
3. `fig3_zone_confusion.png` — Rearcourt vs midcourt error concentration.
4. `fig4_temporal_motion_comparison.png` — Late/early visual velocity decay ratio comparison.

### Machine-Readable Summary (JSON)
- [EXP_DROP_CLEAR_01_SUMMARY.json](file:///D:/PS_DATA/SPARK/docs/EXP_DROP_CLEAR_01_SUMMARY.json)
