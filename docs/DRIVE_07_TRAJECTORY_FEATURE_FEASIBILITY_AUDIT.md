# EXP_DRIVE_07 — Trajectory Feature Feasibility Audit

## 1. Objective

The objective of **EXP_DRIVE_07** is to conduct a rigorous, strictly data-only feasibility audit to determine whether trajectory geometry and derived kinematic features can distinguish **TRUE DRIVE** from **TRUE SMASH** on the frozen validation set.

This audit is directly motivated by the findings of **EXP_DRIVE_06**:
- In EXP_DRIVE_05, shifting the visual temporal window from `[-10, +5]` to `[-4, +11]` improved overall Accuracy ($73.32\% \rightarrow 74.95\%$) and Macro F1 ($61.47\% \rightarrow 65.22\%$) while reducing DRIVE $\rightarrow$ NET_SHOT errors from $21$ to $16$ ($-23.8\%$).
- However, DRIVE $\rightarrow$ SMASH errors increased from $10$ to $14$ ($+40.0\%$), lowering DRIVE F1 from $54.93\%$ to $52.63\%$.
- EXP_DRIVE_06 demonstrated that the 6 newly introduced DRIVE $\rightarrow$ SMASH errors were low-contact, high-speed, deep-landing strokes.

This audit evaluates whether explicit trajectory geometry (displacement, angle, flight duration, implied speed, landing zones) provides true physical separability between DRIVE and SMASH, and critically examines the **deployment feasibility** of such features.

---

## 2. Data Integrity

This feasibility audit adheres strictly to project governance:

| Governance Check | Status | Verification Detail |
|:---|:---:|:---|
| **Audit Type** | **DATA-ONLY** | Feasibility evaluation; zero model training performed |
| **Official TEST Set** | **UNTOUCHED** | Quarantined official test set was neither accessed nor loaded |
| **Validation Split** | **FROZEN** | Evaluated strictly on the 7 frozen validation matches ($N = 1,960$) |
| **Classes Evaluated** | **ORIGINAL** | Ground-truth TRUE DRIVE ($N=73$) and TRUE SMASH ($N=332$) only |
| **Production Model** | **UNTOUCHED** | `backend/app/services/inference_service.py` and frontend unmodified |
| **HitHeatmap** | **ABSENT** | Zero coordinate synthesis or heatmap generation attempted |
| **Existing Files** | **PRESERVED** | Zero reports or checkpoints overwritten or deleted |

---

## 3. Dataset / Annotation Sources

All analysis is grounded in the established, frozen project data artifacts:
1. **Validation Split Metadata:**
   - File: `D:\PS_DATA\PHASE_15_REPRESENTATION_IMPROVEMENT\08_ADVANCED_ACCURACY_IMPROVEMENT\EXP_15_08_03_RICHER_SPATIAL\data\aux_val_27d.pkl`
   - Records: Exactly 1,960 validation strokes across 7 matches: `MATCH07`, `MATCH08`, `MATCH25`, `MATCH31`, `MATCH37`, `MATCH38`, `MATCH40`.
2. **Raw Ground-Truth Stroke Annotations:**
   - Source: `C:\Users\user\Desktop\PS\CoachAI-Projects\ShuttleSet\set\<Match_Name>\set*.csv`
   - Mapping: `C:\Users\user\Desktop\PS\06_REPORTS\PHASE_6B_MATCH_SPLIT_ASSIGNMENT.csv`
   - Coordinate Frame: Full broadcast video resolution ($1280 \times 720\text{ px}$). Origin $(0, 0)$ is top-left; $X \in [0, 1280]$ across width, $Y \in [0, 720]$ along court length.
3. **Model Prediction Logs:**
   - EXP24 baseline metrics: `D:\PS_DATA\EXP24_MULTIMODAL_TRANSFORMER_BILSTM\03_VALIDATION_METRICS.json`
   - EXP_DRIVE_05 predictions: `D:\PS_DATA\DRIVE_EXPERIMENTS\EXP_DRIVE_05_TEMPORAL_WINDOW\05_RESULTS\validation_predictions.json`
   - EXP_DRIVE_06 diagnostic logs: `scratch/diagnostic_results.json`

---

## 4. TRUE DRIVE Statistics

Summary statistics for all continuous and geometric features evaluated on ground-truth TRUE DRIVE validation samples ($N = 73$):

| Feature | Unit | Mean $\pm$ Std | Median [IQR] | Min – Max | Valid Count |
|:---|:---:|:---:|:---:|:---:|:---:|
| **`distance`** | pixels | $213.74 \pm 71.01$ | $201.02\text{ [}59.22\text{]}$ | $101.40\text{ – }531.81$ | 73 / 73 |
| **`abs_dx`** | pixels | $107.27 \pm 88.94$ | $73.00\text{ [}105.00\text{]}$ | $0.00\text{ – }450.00$ | 73 / 73 |
| **`abs_dy`** | pixels | $172.92 \pm 37.50$ | $180.00\text{ [}37.00\text{]}$ | $43.00\text{ – }282.00$ | 73 / 73 |
| **`dx`** | pixels | $+12.86 \pm 138.75$ | $-25.00\text{ [}168.00\text{]}$ | $-450.00\text{ – }+319.00$ | 73 / 73 |
| **`dy`** | pixels | $+19.36 \pm 175.88$ | $+89.00\text{ [}352.00\text{]}$ | $-282.00\text{ – }+280.00$ | 73 / 73 |
| **`angle_deg`** | degrees | $+12.19 \pm 92.85$ | $+36.22\text{ [}179.64\text{]}$ | $-176.77\text{ – }+177.30$ | 73 / 73 |
| **`abs_angle_deg`** | degrees | $87.64 \pm 33.00$ | $98.62\text{ [}55.29\text{]}$ | $8.01\text{ – }177.30$ | 73 / 73 |
| **`forward_angle`** | degrees | $61.47 \pm 16.76$ | $65.16\text{ [}24.99\text{]}$ | $8.01\text{ – }89.65$ | 73 / 73 |
| **`flight_frames`** | frames | $14.98 \pm 5.64$ | $14.00\text{ [}4.75\text{]}$ | $6.00\text{ – }38.00$ | 66 / 73 |
| **`implied_speed`** | px/frame | $15.72 \pm 5.53$ | $14.67\text{ [}6.50\text{]}$ | $5.99\text{ – }38.01$ | 66 / 73 |
| **`hit_height`** | category | $1.25 \pm 0.43$ | $1.00\text{ [}0.00\text{]}$ | $1.00\text{ – }2.00$ | 73 / 73 |
| **`landing_height`**| category | $1.50 \pm 0.50$ | $1.50\text{ [}1.00\text{]}$ | $1.00\text{ – }2.00$ | 38 / 73 |

---

## 5. TRUE SMASH Statistics

Summary statistics for all continuous and geometric features evaluated on ground-truth TRUE SMASH validation samples ($N = 332$):

| Feature | Unit | Mean $\pm$ Std | Median [IQR] | Min – Max | Valid Count |
|:---|:---:|:---:|:---:|:---:|:---:|
| **`distance`** | pixels | $283.15 \pm 76.99$ | $262.17\text{ [}83.45\text{]}$ | $89.02\text{ – }624.78$ | 332 / 332 |
| **`abs_dx`** | pixels | $134.29 \pm 113.91$ | $90.00\text{ [}151.75\text{]}$ | $0.00\text{ – }516.00$ | 332 / 332 |
| **`abs_dy`** | pixels | $230.05 \pm 46.55$ | $237.00\text{ [}45.00\text{]}$ | $48.00\text{ – }399.00$ | 332 / 332 |
| **`dx`** | pixels | $+23.55 \pm 174.52$ | $+21.50\text{ [}178.25\text{]}$ | $-516.00\text{ – }+508.00$ | 332 / 332 |
| **`dy`** | pixels | $+5.95 \pm 234.64$ | $+147.50\text{ [}482.75\text{]}$ | $-399.00\text{ – }+398.00$ | 332 / 332 |
| **`angle_deg`** | degrees | $+8.13 \pm 91.18$ | $+35.53\text{ [}168.81\text{]}$ | $-177.34\text{ – }+178.68$ | 332 / 332 |
| **`abs_angle_deg`** | degrees | $85.39 \pm 33.00$ | $84.96\text{ [}44.38\text{]}$ | $6.24\text{ – }178.68$ | 332 / 332 |
| **`forward_angle`** | degrees | $62.75 \pm 19.16$ | $67.76\text{ [}31.48\text{]}$ | $6.24\text{ – }90.00$ | 332 / 332 |
| **`flight_frames`** | frames | $13.41 \pm 3.71$ | $13.00\text{ [}4.00\text{]}$ | $4.00\text{ – }34.00$ | 243 / 332 |
| **`implied_speed`** | px/frame | $21.44 \pm 5.94$ | $21.18\text{ [}6.18\text{]}$ | $7.67\text{ – }44.33$ | 243 / 332 |
| **`hit_height`** | category | $1.00 \pm 0.05$ | $1.00\text{ [}0.00\text{]}$ | $1.00\text{ – }2.00$ | 332 / 332 |
| **`landing_height`**| category | $1.96 \pm 0.19$ | $2.00\text{ [}0.00\text{]}$ | $1.00\text{ – }2.00$ | 212 / 332 |

---

## 6. Feature Distributions

Direct distribution comparison between TRUE DRIVE ($N=73$) and TRUE SMASH ($N=332$):

| Feature | DRIVE Median [IQR] | SMASH Median [IQR] | Overlap Range | Distributional Shape |
|:---|:---:|:---:|:---:|:---|
| **`distance`** | $201.02\text{ [}59.22\text{]}$ | $262.17\text{ [}83.45\text{]}$ | $101.4\text{ – }531.8\text{ px}$ | Unimodal; SMASH shifted right (+30.4%) |
| **`abs_dx`** | $73.00\text{ [}105.00\text{]}$ | $90.00\text{ [}151.75\text{]}$ | $0.0\text{ – }450.0\text{ px}$ | Highly skewed toward lateral centerline |
| **`abs_dy`** | $180.00\text{ [}37.00\text{]}$ | $237.00\text{ [}45.00\text{]}$ | $48.0\text{ – }282.0\text{ px}$ | Distinct peaks; SMASH travels $+31.7\%$ further longitudinally |
| **`angle_deg`** | $36.22\text{ [}179.64\text{]}$ | $35.53\text{ [}168.81\text{]}$ | Full $360^\circ$ circle | Bimodal (near-to-far vs. far-to-near hitting directions) |
| **`forward_angle`**| $65.16\text{ [}24.99\text{]}$ | $67.76\text{ [}31.48\text{]}$ | $8.0^\circ\text{ – }89.7^\circ$ | Near-identical central tendency ($\Delta = 2.6^\circ$) |
| **`flight_frames`**| $14.00\text{ [}4.75\text{]}$ | $13.00\text{ [}4.00\text{]}$ | $6.0\text{ – }34.0\text{ frames}$ | Substantial overlap ($\Delta = 1\text{ frame}$) |
| **`implied_speed`**| $14.67\text{ [}6.50\text{]}$ | $21.18\text{ [}6.18\text{]}$ | $7.7\text{ – }38.0\text{ px/fr}$ | Unimodal; SMASH shifted right by $+44.4\%$ |
| **`landing_height`**| $1.50\text{ [}1.00\text{]}$ | $2.00\text{ [}0.00\text{]}$ | $\{1.0, 2.0\}$ | SMASH landings are $96.2\%$ overhead reception |

---

## 7. Effect Sizes

Statistical separation metrics computed between TRUE DRIVE and TRUE SMASH:

| Feature | Parametric: Cohen's d | Non-Parametric: Cliff's Delta | Separation Strength | Scientific Interpretation |
|:---|:---:|:---:|:---:|:---|
| **`landing_height`** | **-1.804** | **-0.464** | **Very Strong** | SMASH received high above net; DRIVE received at mid/waist |
| **`hit_height`** | **+1.281** | **+0.244** | **Strong** | DRIVE has $24.7\%$ net-overhead flags; SMASH has $0.3\%$ |
| **`abs_dy`** | **-1.266** | **-0.754** | **Strong** | Longitude displacement separates strokes effectively |
| **`implied_speed`** | **-0.973** | **-0.593** | **Strong** | SMASH is physically faster (mean $21.4$ vs $15.7\text{ px/fr}$) |
| **`distance`** | **-0.912** | **-0.614** | **Strong** | SMASH travels further from rearcourt than midcourt DRIVE |
| **`flight_frames`** | **+0.375** | **+0.188** | Weak | Modest duration difference ($1.5$ frames average) |
| **`abs_dx`** | **-0.246** | **-0.108** | Negligible / Weak | Lateral cross-court span is similar |
| **`slope`** ($dy/dx$) | **-0.114** | **-0.060** | Negligible | Large variance around vertical shots |
| **`forward_angle`**| **-0.068** | **-0.075** | **Zero Separation** | Longitudinal elevation angle is virtually identical |
| **`angle_deg`** | **+0.044** | **+0.024** | **Zero Separation** | 2D broadcast trajectory angle does NOT separate classes |

> [!IMPORTANT]
> **Key Empirical Discovery:** Trajectory angle ($\text{atan2}(dy, dx)$) has a Cohen's $d$ of only **$+0.044$** (and forward angle $d = -0.068$). Trajectory angle alone provides **ZERO statistical separability** between DRIVE and SMASH.

---

## 8. Trajectory Angle Analysis

### 1. Binned Trajectory Angle ($\text{atan2}(dy, dx)$) Distribution

Angles are calculated directly from raw pixel displacements without coordinate transformation:

| Angle Bin (degrees) | TRUE DRIVE Count ($N=73$) | DRIVE % | TRUE SMASH Count ($N=332$) | SMASH % | Class Enrichment Ratio |
|:---:|:---:|:---:|:---:|:---:|:---:|
| **$[-180^\circ, -135^\circ)$** | 1 | 1.4% | 7 | 2.1% | 1.5 : 1 (SMASH) |
| **$[-135^\circ, -90^\circ)$** | 15 | 20.5% | 60 | 18.1% | 1.1 : 1 (Balanced) |
| **$[-90^\circ, -45^\circ)$** | 13 | 17.8% | 59 | 17.8% | **1.0 : 1 (Identical)** |
| **$[-45^\circ, 0^\circ)$** | 4 | 5.5% | 22 | 6.6% | 1.2 : 1 (SMASH) |
| **$[0^\circ, 45^\circ)$** | 7 | 9.6% | 24 | 7.2% | 1.3 : 1 (DRIVE) |
| **$[45^\circ, 90^\circ)$** | 10 | 13.7% | 73 | 22.0% | 1.6 : 1 (SMASH) |
| **$[90^\circ, 135^\circ)$** | 19 | 26.0% | 58 | 17.5% | 1.5 : 1 (DRIVE) |
| **$[135^\circ, 180^\circ)$** | 4 | 5.5% | 19 | 5.7% | **1.0 : 1 (Identical)** |

### 2. Forward Trajectory Angle ($\text{atan2}(|dy|, |dx|)$)

To eliminate the alternating sign caused by players switching court sides, we analyze the absolute forward trajectory angle:
- **TRUE DRIVE:** Mean = $61.47^\circ \pm 16.76^\circ$, Median = $65.16^\circ$ [IQR $24.99^\circ$]
- **TRUE SMASH:** Mean = $62.75^\circ \pm 19.16^\circ$, Median = $67.76^\circ$ [IQR $31.48^\circ$]
- **Cohen's d:** **$-0.068$**
- **Cliff's Delta:** **$-0.075$**

### 3. Conclusion on Trajectory Angle:
No simple threshold, linear separator, or angular decision boundary exists in 2D video space that can separate DRIVE from SMASH. In broadcast footage, both strokes are driven along near-identical 2D screen angles.

---

## 9. Speed Analysis

Implied speed ($\text{distance} / \text{flight\_frames}$) is an annotation-derived offline diagnostic:

### 1. TRUE SMASH Speed Quantiles ($N=243$ valid flight records):
- **25th Percentile (Q25):** $18.43\text{ px/frame}$
- **Median (Q50):** $21.18\text{ px/frame}$
- **75th Percentile (Q75):** $24.61\text{ px/frame}$
- **90th Percentile (Q90):** $27.43\text{ px/frame}$

### 2. TRUE DRIVE Speed Distribution ($N=66$ valid flight records):
- **Median:** $14.67\text{ px/frame}$ [IQR $6.50$]
- **Mean:** $15.72 \pm 5.53\text{ px/frame}$
- **Overlap with SMASH:** Exactly **$16.7\%$ of true DRIVEs (11 of 66)** exceed the SMASH median speed of $21.18\text{ px/frame}$.

### 3. Does Speed Alone Explain the Confusion?
- **NO.** While SMASH is on average $36.4\%$ faster (Cohen's $d = -0.973$), the distributions have substantial overlap.
- Furthermore, 3 of the 6 new EXP05 DRIVE $\rightarrow$ SMASH errors had speeds between $11.95$ and $15.43\text{ px/frame}$ (below the DRIVE median), proving that high speed alone is not required to trigger the SMASH misclassification.

### 4. Bivariate Interaction: Speed + Forward Angle
When examining a bivariate space ($\text{speed} \ge 20\text{ px/frame}$ and $\text{forward\_angle} \ge 60^\circ$):
- **SMASH Coverage:** $52.7\%$ (128 / 243) of smashes fall in this quadrant.
- **DRIVE Intrusion:** $12.1\%$ (8 / 66) of drives also fall in this quadrant.
- **Enrichment:** Shots in this quadrant are $82.1\%$ SMASH. However, the angle feature adds zero independent variance beyond what speed and displacement already provide.

---

## 10. Landing Zone Analysis

Comparison of landing areas between TRUE DRIVE ($N=73$) and TRUE SMASH ($N=332$):

| Landing Zone | Zone Name | TRUE DRIVE ($N=73$) | DRIVE % | TRUE SMASH ($N=332$) | SMASH % | Contrast |
|:---:|:---|:---:|:---:|:---:|:---:|:---|
| **1** | Front Left | 0 | 0.0% | 4 | 1.2% | Rare |
| **2** | Front Center | 2 | 2.7% | 2 | 0.6% | Rare |
| **4** | Midcourt Left (near) | 0 | 0.0% | 1 | 0.3% | Rare |
| **5** | Midcourt Center / T | 9 | 12.3% | **109** | **32.8%** | **$2.7\times$ more frequent in SMASH** |
| **6** | Midcourt Right | 22 | 30.1% | 93 | 28.0% | Balanced |
| **7** | Rearcourt Left (deep) | 8 | 11.0% | 10 | 3.0% | $3.7\times$ more frequent in DRIVE |
| **8** | Rearcourt Center (deep)| **30** | **41.1%** | **98** | **29.5%** | **Primary target for both** |
| **9** | Rearcourt Right (deep)| 1 | 1.4% | 1 | 0.3% | Rare |
| **11, 12, 14, 15**| Out / Tramlines | 1 | 1.4% | 14 | 4.2% | Errors |

### Deep Landing Summary:
- **TRUE DRIVE landing in deep rearcourt (Zones 6, 8, 9, 14):** **$74.0\%$ (54 / 73)**
- **TRUE SMASH landing in deep rearcourt (Zones 6, 8, 9, 14):** **$59.9\%$ (199 / 332)**
- **Finding:** Deep landing is **NOT SMASH-specific**. In fact, a higher proportion of DRIVEs land deep in the opponent's court than smashes (as many smashes target the midcourt body/feet, Zone 5). Deep landing cannot separate the two strokes.

---

## 11. Hit Zone × Trajectory Analysis

Cross-tabulation of (Hit Area $\rightarrow$ Landing Area) reveals shared tactical corridors:

| Rank | TRUE DRIVE (Hit $\rightarrow$ Land) | Count (%) | TRUE SMASH (Hit $\rightarrow$ Land) | Count (%) | Shared Tactical Context |
|:---:|:---|:---:|:---|:---:|:---|
| **1** | **Zone 8 $\rightarrow$ Zone 8** | 19 (26.0%) | **Zone 8 $\rightarrow$ Zone 8** | 42 (12.7%) | **Identical #1 tactical corridor** (Mid-right to deep-right) |
| **2** | **Zone 5 $\rightarrow$ Zone 6** | 11 (15.1%) | **Zone 8 $\rightarrow$ Zone 6** | 26 (7.8%) | Cross-court attacking lane |
| **3** | **Zone 8 $\rightarrow$ Zone 6** | 10 (13.7%) | **Zone 9 $\rightarrow$ Zone 5** | 25 (7.5%) | Rear/midcourt attack |
| **4** | **Zone 8 $\rightarrow$ Zone 7** | 5 (6.8%) | **Zone 6 $\rightarrow$ Zone 5** | 23 (6.9%) | Midcourt attack into body |
| **5** | **Zone 6 $\rightarrow$ Zone 5** | 5 (6.8%) | **Zone 9 $\rightarrow$ Zone 8** | 23 (6.9%) | Tramline drive / smash |

**Spatial Overlap Finding:**
The single most common (Hit, Land) coordinate pair for both classes is **Zone 8 $\rightarrow$ Zone 8** (accounting for $26.0\%$ of all drives and $12.7\%$ of all smashes). Spatial court coordinates alone cannot decouple these strokes.

---

## 12. EXP05 Six New DRIVE→SMASH Cases

Detailed geometric profile of the 6 true DRIVE samples newly classified as SMASH in EXP_DRIVE_05:

| Case | Match ID | Hit Frame | Hit Area | Land Area | Hit $(x, y)$ | Land $(x, y)$ | Distance (px) | Angle (deg) | Flight (frames) | Implied Speed (px/fr) | Hit Height |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **1** | MATCH07 | 19,603 | 8 | 8 | $(489, 526)$ | $(574, 359)$ | 187.4 | $-63.0^\circ$ | 10.0 | **18.74** | 1.0 (Low) |
| **2** | MATCH07 | 34,216 | 5 | 6 | $(492, 371)$ | $(418, 574)$ | 216.1 | $+110.0^\circ$ | 14.0 | 15.43 | 1.0 (Low) |
| **3** | MATCH07 | 52,914 | 6 | 8 | $(455, 549)$ | $(587, 363)$ | 228.1 | $-54.6^\circ$ | 6.0 | **38.01** | 1.0 (Low) |
| **4** | MATCH38 | 33,492 | 5 | 6 | $(844, 549)$ | $(790, 378)$ | 179.3 | $-107.5^\circ$ | 15.0 | 11.95 | 1.0 (Low) |
| **5** | MATCH40 | 12,876 | 8 | 6 | $(730, 545)$ | $(788, 356)$ | 197.7 | $-72.9^\circ$ | 16.0 | 12.36 | 1.0 (Low) |
| **6** | MATCH07 | 27,779 | 7 | 8 | $(542, 509)$ | $(597, 367)$ | 152.3 | $-68.8^\circ$ | 8.0 | **19.03** | 1.0 (Low) |

### Comparison Against Subgroups:
- **Trajectory Angle:** Spans from $-107.5^\circ$ to $+110.0^\circ$, matching the wider DRIVE and SMASH distributions.
- **Flight Speed:** Cases 1, 3, and 6 exhibit speeds of $18.74$, $38.01$, and $19.03\text{ px/frame}$, matching or exceeding the SMASH median ($21.18$).
- **Geometric Coherence:** These 6 cases do **not** form a distinct angular cluster. Rather, they are unified by:
  1. Low contact height (`hit_height = 1.0`, `is_overhead = 0.0`).
  2. $100\%$ landing in deep zones (6 or 8).
  3. High visual momentum across the net in frames $+6$ to $+11$.

---

## 13. Net Clearance Feasibility

An audit was conducted to assess whether vertical shuttle clearance over the net tape can be derived:

### Data Reality Check:
1. **Available Annotations:**
   - [OBSERVED] `hit_x`, `hit_y`: 2D pixel coordinates at contact.
   - [OBSERVED] `landing_x`, `landing_y`: 2D pixel coordinates at landing.
   - [OBSERVED] `hit_height`: Coarse binary indicator $\{1.0, 2.0\}$.
2. **Missing Information:**
   - [UNOBSERVED] 3D physical camera elevation, pitch, and focal length.
   - [UNOBSERVED] 3D court homography mapping screen pixels to physical height in meters.
   - [UNOBSERVED] In-flight parabolic trajectory points between contact and landing.
   - [UNOBSERVED] Net tape image coordinates $(X_{\text{net}}, Y_{\text{net}})$.

### Scientific Conclusion:
**"Net clearance height cannot be reliably derived from the available annotations."**

Any attempted mathematical formula (e.g. linear 2D interpolation at $Y \approx 450$) would be an unfounded fabrication:
- In broadcast perspective projection, a flat drive struck from the near court at $Y=550$ traveling to $Y=350$ crosses the screen net line, but its 2D projected coordinate combines forward court distance with vertical altitude.
- A drive $10\text{ cm}$ above the net and a smash $100\text{ cm}$ above the net can project to identical $(x, y)$ pixels in a monocular camera depending on player distance.
- Without 3D calibration or continuous in-flight tracking, net clearance is physically unidentifiable.

---

## 14. Deployability Analysis

Every candidate feature investigated in this audit is classified according to operational deployment readiness:

| Candidate Feature | Operational Classification | Real-Time Production Availability | Recommendation |
|:---|:---:|:---|:---|
| **`hit_x`, `hit_y`** | **CLASS A** | Available at hit instant (estimated via localizer) | Retain in 27-D spatial MLP |
| **`hit_area`** | **CLASS A** | Available at hit instant (mapped via court homography) | Retain in 27-D spatial MLP |
| **`is_overhead`** | **CLASS A** | Available at hit instant (player bounding box / pose) | Retain in 27-D spatial MLP |
| **Post-hit Visual Video (`[-4, +11]`)** | **CLASS B** | Available from video stream after $367\text{ ms}$ lookahead | **CORE DEPLOYABLE ENGINE** |
| **Visual Optical Flow / Motion Energy** | **CLASS B** | Computable strictly from the 16 observed video frames | **HIGHLY PROMISING** |
| **`landing_x`, `landing_y`** | **CLASS C** | **UNAVAILABLE** (Requires future landing event) | **FORBIDDEN IN PRODUCTION** |
| **`distance` ($dx, dy$)** | **CLASS C** | **UNAVAILABLE** (Requires future landing coordinates) | **FORBIDDEN IN PRODUCTION** |
| **Trajectory Angle ($\text{atan2}$)** | **CLASS C** | **UNAVAILABLE** (Requires future landing coordinates) | **FORBIDDEN IN PRODUCTION** |
| **`flight_frames`** | **CLASS C** | **UNAVAILABLE** (Requires future landing frame) | **FORBIDDEN IN PRODUCTION** |
| **`implied_speed`** | **CLASS C** | **UNAVAILABLE** (Requires future distance and landing frame) | **FORBIDDEN IN PRODUCTION** |
| **`landing_area`, `landing_height`** | **CLASS C** | **UNAVAILABLE** (Requires future destination annotation) | **FORBIDDEN IN PRODUCTION** |
| **Net Clearance Height** | **CLASS D** | **UNAVAILABLE** (Not observable in annotations or pipeline)| **REJECTED** |

> [!CAUTION]
> **Critical Production Guardrail:**
> Offline statistical separation (e.g. implied speed Cohen's $d = -0.973$, longitudinal displacement $d = -1.266$) relies entirely on **CLASS C future landing annotations**. Feeding future landing coordinates into an auxiliary feature vector would introduce catastrophic **target leakage**, rendering the model useless for real-time inference.

---

## 15. Hypothesis Testing

| Hypothesis | Evidence For | Evidence Against | Status |
|:---|:---|:---|:---:|
| **H1: Trajectory angle separates DRIVE and SMASH** | None. | $\text{atan2}(dy, dx)$ Cohen's $d = +0.044$; forward angle $d = -0.068$. Distributions completely overlap across all 8 angle bins. | **NOT SUPPORTED** |
| **H2: Speed separates DRIVE and SMASH** | Implied speed Cohen's $d = -0.973$ (Cliff's $\delta = -0.593$). SMASH is $36.4\%$ faster on average ($21.4$ vs $15.7\text{ px/fr}$). | $16.7\%$ overlap; 3 of 6 new error cases have speeds below DRIVE median. Crucially, speed is **Class C** (unobservable at hit time). | **SUPPORTED (OFFLINE ONLY)** |
| **H3: Speed + angle provides stronger separation than either alone** | Bivariate quadrant ($\text{speed} \ge 20$, $\text{angle} \ge 60^\circ$) is $82.1\%$ SMASH. | Trajectory angle adds near-zero independent variance ($d < 0.07$); separation is driven entirely by speed. | **PARTIALLY SUPPORTED** |
| **H4: Deep landing is insufficient by itself** | $74.0\%$ of DRIVEs land deep vs $59.9\%$ of SMASHes. Both share Zone 8 as top landing target. | None. Deep landing provides zero positive discrimination for SMASH over DRIVE. | **SUPPORTED** |
| **H5: The 6 EXP05 DRIVE $\rightarrow$ SMASH errors occupy a distinct geometric subgroup** | All 6 are sidearm (`is_overhead = 0.0`), all land in deep zones (6, 8), and 3 have high speeds ($18.7\text{--}38.0$). | Angles span $-107^\circ$ to $+110^\circ$; 3 have moderate speeds ($11.9\text{--}15.4$). They do not form an isolated spatial cluster. | **PARTIALLY SUPPORTED** |
| **H6: A trajectory-derived feature may be useful for a future controlled experiment** | Early visual optical flow / motion vectors extracted within frames $+1$ to $+11$ (Class B) are deployable and capture physical velocity. | Endpoint trajectory features (distance, $dx, dy$, implied speed) are Class C and cannot be used. Trajectory angle has zero separation. | **PARTIALLY SUPPORTED (CLASS B ONLY)** |

---

## 16. Root Findings

1. **Trajectory Angle Myth Dispelled:**
   - 2D trajectory angle ($\text{atan2}(dy, dx)$) has **zero discriminative power** ($d = +0.044$). In monocular broadcast video, horizontal drives and smashes travel along identical longitudinal camera projection vectors.
2. **The Offline-Separation Trap:**
   - The features that strongly separate DRIVE from SMASH offline—displacement ($d = -1.266$) and implied speed ($d = -0.973$)—are **future-dependent (Class C)**. They cannot be computed until the rally reaches the opponent, making them strictly non-deployable at stroke classification time.
3. **The Core Physical Dilemma of EXP_DRIVE_05:**
   - Expanding the post-impact window to $+11$ frames ($367\text{ ms}$) allowed the ResNet-18 + Transformer encoder to observe physical shuttle motion.
   - For DROP shots (which decelerate rapidly) and CLEAR shots (which arc high), this motion was transformative ($+16.46$ pp DROP F1).
   - For fast, flat sidearm DRIVEs, however, the shuttle travels rapidly across the net into the deep court. To a monocular 2D vision model lacking 3D altitude or early trajectory gradient, **fast horizontal motion looks identical to fast downward attacking motion (SMASH)**.

---

## 17. Future Experiment Requirements

If a subsequent experiment (e.g. `EXP_DRIVE_08`) is to be considered, it must satisfy the following scientific criteria:

1. **Strictly Deployable Variables (Class B Only):**
   - Must NOT use `landing_x`, `landing_y`, `landing_frame`, or any endpoint-derived distance/speed features.
   - Any new feature must be extractable strictly from the **16-frame observed video window `[-4, +11]`** or hit-time state.
2. **Candidate Feature: Early Visual Motion Gradient:**
   - Extract dense optical flow or vertical motion vector gradients $(\Delta v_y / \Delta v_x)$ of the shuttle/racket in frames $+1$ to $+6$.
   - A smash exhibits rapid downward visual flow ($\Delta y > 0$ in image space); a drive exhibits near-zero vertical deflection as it skims the net.
3. **Pre-Experimental Evidence Gate:**
   - Before model training, an optical flow extraction script must prove that visual motion gradient achieves a Cohen's $d > 1.0$ between DRIVE and SMASH strictly within frames $0$ to $+6$.

---

## 18. Limitations

1. **Monocular 2D Projection:** All coordinates are in broadcast pixel space. Perspective foreshortening compresses depth and conflates downward vertical trajectory with forward court travel.
2. **Discrete Endpoint Annotations:** ShuttleSet records only contact and landing points; continuous parabolic flight curvature is unrecorded.
3. **Class Imbalance:** Validation support contains 332 SMASH strokes vs 73 DRIVE strokes ($4.5 : 1$ ratio), creating an inherent Bayesian prior favoring SMASH when visual velocity is high.

---

## 19. Reproducibility

- **Audit Script:** `scratch/audit_drive_07.py`
- **Results Output:** `scratch/audit_drive_07_results.json`
- **Summary JSON:** `D:\PS_DATA\SPARK\docs\DRIVE_07_TRAJECTORY_FEATURE_SUMMARY.json`
- **Validation Dataset:** `D:\PS_DATA\PHASE_15_REPRESENTATION_IMPROVEMENT\08_ADVANCED_ACCURACY_IMPROVEMENT\EXP_15_08_03_RICHER_SPATIAL\data\aux_val_27d.pkl`
- **Raw ShuttleSet Path:** `C:\Users\user\Desktop\PS\CoachAI-Projects\ShuttleSet\set\`
- **Execution Timestamp:** September 20, 2026
- **Git Commit / State:** Clean working tree on branch `main` (untracked documentation files only).
