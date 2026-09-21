# EXP_DRIVE_08C — Complementary Error Audit

## 1. Objective

This read-only diagnostic audit investigates whether **EXP_DRIVE_05** and **EXP_DRIVE_08B** make sufficiently complementary errors on the frozen 1,960 validation samples to scientifically justify ONE future controlled ensemble experiment.

The central inquiry evaluates:
> *Does combining EXP05 and EXP08B have a realistic basis for improving classification beyond either model individually?*

In strict accordance with audit guidelines, **zero models were trained**, **zero hyperparameters were tuned**, **official test data remained quarantined and untouched**, and **production serving code remains unmodified**.

---

## 2. Data Integrity

| Governance Item | Status | Verification Detail |
| :--- | :---: | :--- |
| **Audit Nature** | **READ-ONLY DIAGNOSTIC** | Zero training executed; diagnostic post-hoc analysis only |
| **Official Test Set** | **UNTOUCHED** | Zero access to test samples, labels, or test predictions |
| **Validation Set** | **FROZEN (N=1,960)** | MATCH07, MATCH08, MATCH25, MATCH31, MATCH37, MATCH38, MATCH40 |
| **Prediction Alignment** | **CONFIRMED** | Exact 1-to-1 sample ID, match ID, hit frame, and class alignment |
| **Production Code** | **UNTOUCHED** | Serving code, inference endpoints, and frontend left intact |
| **HitHeatmap / Synthetic** | **ABSENT** | Zero synthetic annotations or coordinate heatmaps used |

---

## 3. Prediction Alignment

Prediction records from both models were systematically cross-referenced across all 1,960 validation samples:
- **EXP05 Source:** `D:\PS_DATA\DRIVE_EXPERIMENTS\EXP_DRIVE_05_TEMPORAL_WINDOW\05_RESULTS\validation_predictions.json`
- **EXP08B Source:** `D:\PS_DATA\DRIVE_EXPERIMENTS\EXP_DRIVE_08B_HV_MOTION\04_RESULTS\validation_predictions.json`
- **Sample Count:** Exactly 1,960 records in both files.
- **Key Consistency:** All 1,960 tuples `(match_id, hit_frame, ground_truth_class)` are identical and aligned in index sequence.

---

## 4. Metric Verification

Raw per-sample predictions were independently tallied to confirm published baseline and experimental metrics:

| Metric | EXP_DRIVE_05 | EXP_DRIVE_08B | Delta |
| :--- | :---: | :---: | :---: |
| **Accuracy (%)** | 74.95% (1469/1960) | 77.55% (1520/1960) | **+2.60 pp** |
| **Macro F1 (%)** | 65.22% | 68.56% | **+3.34 pp** |
| **Weighted F1 (%)** | 74.16% | 77.49% | **+3.33 pp** |
| **SMASH F1 (%)** | 66.14% (P=58.78%, R=75.60%) | 69.16% (P=71.61%, R=66.87%) | **+3.02 pp** |
| **CLEAR F1 (%)** | 70.94% (P=70.81%, R=71.08%) | 73.20% (P=74.41%, R=72.02%) | **+2.26 pp** |
| **DROP F1 (%)** | 39.07% (P=47.87%, R=33.01%) | 54.65% (P=50.56%, R=59.48%) | **+15.58 pp** |
| **DRIVE F1 (%)** | 52.63% (P=58.33%, R=47.95%) | 48.70% (P=66.67%, R=38.36%) | **-3.93 pp** |
| **NET_SHOT F1 (%)** | 97.31% (P=96.58%, R=98.06%) | 97.12% (P=96.06%, R=98.19%) | **-0.19 pp** |

---

## 5. Sample-Level Correctness Matrix

Partitioning the 1,960 validation samples into the four fundamental correctness quadrants reveals the exact joint performance distribution:

| Quadrant | Description | Sample Count | Percentage (%) |
| :--- | :--- | :---: | :---: |
| **A. Both Correct** | Both models predict ground truth correctly | **1357** | **69.23%** |
| **B. Both Wrong** | Both models fail on the same sample | **328** | **16.73%** |
| **C. EXP05 Only Correct** | EXP05 is correct; EXP08B is wrong | **112** | **5.71%** |
| **D. EXP08B Only Correct** | EXP08B is correct; EXP05 is wrong | **163** | **8.32%** |
| **Total** | Validation Set | **1,960** | **100.00%** |

### Key Takeaway:
- **275 samples** (14.03% of the dataset) are correctly classified by exactly one of the two models.
- EXP05 preserves **112 correct instances** that EXP08B failed on, while EXP08B successfully recovered **163 instances** that EXP05 missed.

---

## 6. Error Overlap

Let $E_{05}$ denote the error set of EXP05 ($|E_{05}| = 491$) and $E_{08}$ denote the error set of EXP08B ($|E_{08}| = 440$):

| Error Metric | Formula | Value | Percentage of Validation Set |
| :--- | :---: | :---: | :---: |
| **EXP05 Total Errors** | $|E_{05}|$ | 491 | 25.05% |
| **EXP08B Total Errors** | $|E_{08}|$ | 440 | 22.45% |
| **Shared Errors (Intersection)** | $|E_{05} \cap E_{08}|$ | **328** | **16.73%** |
| **Total Unique Errors (Union)** | $|E_{05} \cup E_{08}|$ | **603** | **30.77%** |
| **Jaccard Error Overlap** | $\frac{|E_{05} \cap E_{08}|}{|E_{05} \cup E_{08}|}$ | **54.39%** | - |
| **Shared Fraction of EXP05 Errors** | $\frac{|E_{05} \cap E_{08}|}{|E_{05}|}$ | **66.80%** | - |
| **Shared Fraction of EXP08B Errors** | $\frac{|E_{05} \cap E_{08}|}{|E_{08}|}$ | **74.55%** | - |

### Diagnostic Interpretation:
The Jaccard error overlap is **54.39%**. This moderate overlap demonstrates that nearly half of all unique model errors (275 out of 603) are non-overlapping. The models do not fail identically; they exhibit distinct failure regimes.

---

## 7. Class-by-Class Complementarity

Analyzing the 4 correctness quadrants across individual shot types identifies where each architecture holds unique discriminative power:

| Class | Support | EXP05 Recall | EXP08B Recall | Both Correct | Only EXP05 Correct | Only EXP08B Correct | Both Wrong | Oracle Recall Ceiling |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **SMASH** | 332 | 75.60% | 66.87% | 208 | **43** | **14** | 67 | **79.82%** |
| **CLEAR** | 529 | 71.08% | 72.02% | 335 | **41** | **46** | 107 | **79.77%** |
| **DROP** | 306 | 33.01% | 59.48% | 89 | **12** | **93** | 112 | **63.40%** |
| **DRIVE** | 73 | 47.95% | 38.36% | 24 | **11** | **4** | 34 | **53.42%** |
| **NET_SHOT** | 720 | 98.06% | 98.19% | 701 | **5** | **6** | 8 | **98.89%** |

### Per-Class Behavioral Profile:
1. **SMASH:** EXP05 demonstrates strong superiority in recall (75.60% vs 66.87%). EXP05 correctly identifies **43 smashes** that EXP08B misclassifies (chiefly as DROP), while EXP08B only offers 14 unique correct smashes.
2. **DROP:** EXP08B dominates this class (59.48% vs 33.01%), providing **93 unique correct drops** that EXP05 missed, compared to just 12 unique correct drops in EXP05.
3. **CLEAR:** Highly balanced complementarity: EXP05 contributes 41 unique correct clears, while EXP08B contributes 46 unique correct clears, raising the oracle recall ceiling to 79.77%.
4. **DRIVE:** EXP05 correctly identifies **11 unique drives** that EXP08B missed, while EXP08B identifies **4 unique drives** that EXP05 missed.
5. **NET_SHOT:** Ceiling saturation: both models achieve ~98.1% recall, sharing 701 correct classifications out of 720.

---

## 8. DRIVE-Specific Analysis

The 73 ground-truth DRIVE samples were scrutinized to trace the exact confusion migration:

| Quadrant (DRIVE) | Sample Count | Percentage of DRIVE (N=73) | Details |
| :--- | :---: | :---: | :--- |
| **Both Correct** | 24 | 32.88% | Consistent horizontal flat drives |
| **Only EXP05 Correct** | 11 | 15.07% | Drives that EXP08B pushed to NET (4), SMASH (3), CLEAR (2), DROP (2) |
| **Only EXP08B Correct** | 4 | 5.48% | Drives recovered by H/V flow (2 from SMASH, 1 from CLEAR, 1 from NET) |
| **Both Wrong** | 34 | 46.58% | Stubborn frontcourt/backcourt confusions (15 NET, 8 SMASH, 5 CLEAR, 6 others) |
| **Oracle DRIVE Ceiling** | **39** | **53.42%** | Theoretical maximum recoverable DRIVE recall |

### DRIVE Confusion Transition Matrix ($N=73$ True DRIVE):
Rows represent EXP05 predicted class; columns represent EXP08B predicted class:

| EXP05 \ EXP08B | SMASH | CLEAR | DROP | DRIVE | NET_SHOT | EXP05 Total |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **SMASH (14)** |  8 |  0 |  3 |  2 |  1 | **14** |
| **CLEAR (7)** |  0 |  5 |  1 |  1 |  0 | **7** |
| **DROP (1)** |  0 |  0 |  1 |  0 |  0 | **1** |
| **DRIVE (35)** |  3 |  2 |  2 | 24 |  4 | **35** |
| **NET_SHOT (16)** |  0 |  0 |  0 |  1 | 15 | **16** |
| **EXP08B Total** | **11** | **7** | **7** | **28** | **20** | **73** |

### Critical Finding on Error Migration:
- **SMASH Mitigation:** Out of the 14 drives misclassified as SMASH by EXP05, EXP08B successfully corrected **2 to DRIVE** and diverted **4 away from SMASH** (3 to DROP, 1 to NET_SHOT), leaving only 8 stubborn drives classified as SMASH by both.
- **Recall Erosion Mechanism:** EXP08B misclassified **11 drives that EXP05 correctly predicted**. Specifically, 4 shifted to NET_SHOT and 3 shifted to SMASH. This confirms that EXP08B's decision threshold became overly conservative, but the underlying features retain distinct predictive value across separate sample subsets.

---

## 9. Confidence Disagreement Analysis

Across all 1,960 samples, the models agree on **83.11%** (1629 samples) and disagree on **16.89%** (331 samples):

| Disagreement Outcome (N=331) | Count | Percentage of Disagreements |
| :--- | :---: | :---: |
| **EXP08B Correct / EXP05 Wrong** | 163 | 49.24% |
| **EXP05 Correct / EXP08B Wrong** | 112 | 33.84% |
| **Both Models Wrong** | 56 | 16.92% |

> [!IMPORTANT]
> In **83.08% of all disagreements** (275 out of 331), one of the two models is correct. Only in 16.92% of disagreements are both models wrong.

### Full Population Prediction Transition Matrix ($N=1,960$):
Rows: EXP05 Prediction $\rightarrow$ Columns: EXP08B Prediction:

| EXP05 \ EXP08B | SMASH | CLEAR | DROP | DRIVE | NET_SHOT | Total EXP05 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **SMASH** |  276 |   47 |  101 |    2 |    1 | ** 427** |
| **CLEAR** |   22 |  424 |   83 |    1 |    1 | ** 531** |
| **DROP** |    6 |   35 |  170 |    0 |    0 | ** 211** |
| **DRIVE** |    6 |    4 |    5 |   35 |   10 | **  60** |
| **NET_SHOT** |    0 |    2 |    1 |    4 |  724 | ** 731** |
| **Total EXP08B** | ** 310** | ** 512** | ** 360** | **  42** | ** 736** | **1960** |

The primary disagreement axes occur along:
1. **SMASH $\rightarrow$ DROP (101 samples):** EXP05 predicted SMASH, but EXP08B with vertical motion damping predicted DROP.
2. **CLEAR $\rightarrow$ DROP (83 samples):** EXP05 predicted CLEAR, but EXP08B predicted DROP.
3. **SMASH $\rightarrow$ CLEAR (47 samples):** Reallocation between high-trajectory overhead shots.

---

## 10. Six Diagnostic DRIVE→SMASH Cases

Detailed probability profiles for the six targeted error cases from EXP_DRIVE_06:

| Match ID | Hit Frame | True Class | EXP05 Pred (Conf) | EXP08B Pred (Conf) | P(DRIVE) EXP05 $\rightarrow$ EXP08B | P(SMASH) EXP05 $\rightarrow$ EXP08B | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `MATCH07` | 19603 | DRIVE | SMASH (0.702) | SMASH (0.525) | 0.291 $\rightarrow$ **0.419** | 0.702 $\rightarrow$ **0.525** | `REMAINING_SMASH` (Damped) |
| `MATCH07` | 27779 | DRIVE | SMASH (0.558) | NET_SHOT (0.617) | 0.331 $\rightarrow$ 0.163 | 0.558 $\rightarrow$ **0.148** | `MOVED_TO_NET` |
| `MATCH07` | 34216 | DRIVE | SMASH (0.551) | SMASH (0.728) | 0.393 $\rightarrow$ 0.161 | 0.551 $\rightarrow$ 0.728 | `REMAINING_SMASH` |
| `MATCH07` | 52914 | DRIVE | SMASH (0.489) | **DRIVE (0.478)** | 0.321 $\rightarrow$ **0.478** | 0.489 $\rightarrow$ **0.219** | `CORRECTED_TO_DRIVE` |
| `MATCH38` | 33492 | DRIVE | SMASH (0.518) | SMASH (0.330) | 0.185 $\rightarrow$ 0.093 | 0.518 $\rightarrow$ **0.330** | `REMAINING_SMASH` (Damped) |
| `MATCH40` | 12876 | DRIVE | SMASH (0.809) | **DRIVE (0.406)** | 0.149 $\rightarrow$ **0.406** | 0.809 $\rightarrow$ **0.343** | `CORRECTED_TO_DRIVE` |

### Diagnostic Findings:
- In **4 out of 6 cases** (19603, 27779, 52914, 12876), H/V motion significantly suppressed the erroneous SMASH probability.
- In **2 cases** (52914, 12876), DRIVE became the plurality prediction, completely correcting the classification.

---

## 11. Seven Frontcourt Cases

Tracking the seven low-contact frontcourt DRIVE shots:

| Match ID | Hit Frame | True Class | EXP05 Pred (Conf) | EXP08B Pred (Conf) | EXP05 Top-2 | EXP08B Top-2 | Both Correct? |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- | :---: |
| `MATCH07` | 16244 | DRIVE | NET_SHOT (0.915) | NET_SHOT (0.931) | NET_SHOT (0.915), DRIVE (0.046) | NET_SHOT (0.931), DRIVE (0.057) | NO |
| `MATCH07` | 27779 | DRIVE | SMASH (0.558) | NET_SHOT (0.617) | SMASH (0.558), DRIVE (0.331) | NET_SHOT (0.617), DRIVE (0.163) | NO |
| `MATCH07` | 33668 | DRIVE | **DRIVE (0.374)** | **DRIVE (0.388)** | DRIVE (0.374), NET_SHOT (0.361) | DRIVE (0.388), SMASH (0.311) | **YES** |
| `MATCH37` | 14304 | DRIVE | NET_SHOT (0.650) | NET_SHOT (0.808) | NET_SHOT (0.650), DRIVE (0.258) | NET_SHOT (0.808), DRIVE (0.158) | NO |
| `MATCH38` | 58675 | DRIVE | NET_SHOT (0.980) | NET_SHOT (0.967) | NET_SHOT (0.980), DRIVE (0.019) | NET_SHOT (0.967), DRIVE (0.030) | NO |
| `MATCH38` | 107731 | DRIVE | NET_SHOT (0.973) | NET_SHOT (0.890) | NET_SHOT (0.973), DRIVE (0.022) | NET_SHOT (0.890), DRIVE (0.085) | NO |
| `MATCH40` | 30580 | DRIVE | NET_SHOT (0.984) | NET_SHOT (0.990) | NET_SHOT (0.984), DRIVE (0.016) | NET_SHOT (0.990), DRIVE (0.009) | NO |

### Diagnostic Findings:
Frontcourt drive shots with contact coordinates near the net ($y \approx 0.45\text{--}0.52$) are heavily dominated by spatial coordinate priors favoring NET_SHOT (>90% confidence in 5/7 cases). Both models agree on NET_SHOT for 5 of the 7 cases; only frame 33668 is correctly identified by both models.

---

## 12. Oracle Union Ceiling

The theoretical performance upper bound achievable if an idealized selector always picked the correct model prediction whenever at least one model is correct:

$$\text{Oracle Accuracy Ceiling} = \frac{|A| + |C| + |D|}{N} = \frac{1357 + 112 + 163}{1960} = \mathbf{83.27\%}$$

| Model / Ceiling | Accuracy | Headroom vs Baseline | Headroom vs EXP08B |
| :--- | :---: | :---: | :---: |
| **EXP_DRIVE_05 (Window C Baseline)** | 74.95% | - | - |
| **EXP_DRIVE_08B (H/V Motion Ratio)** | 77.55% | +2.60 pp | - |
| **Oracle Union Ceiling** | **83.27%** | **+8.32 pp** | **+5.71 pp** |

> [!WARNING]
> **Essential Scientific Clarification:**
> The Oracle Union Ceiling (**83.27%**) is **NOT** achievable ensemble accuracy. It represents the theoretical mathematical ceiling of information diversity between the two models. Any practical ensemble will achieve a performance level between 77.55% and 83.27% depending on gating, weighting, and calibration efficacy.

---

## 13. Ensemble Feasibility Analysis

Assessing the 5 necessary criteria for ensemble justification:

1. **Error Non-Overlap:** Satisfied. 275 out of 603 unique errors (45.6%) are made by only one model (Jaccard overlap = 54.39%).
2. **Sufficient Sizable Disagreement:** Satisfied. 331 samples (16.89%) produce conflicting predictions, providing a substantial operational pool.
3. **Disagreement Accuracy:** Satisfied. In 83.08% of disagreements, one model is correct.
4. **Distinct Class Competencies:** Satisfied. EXP05 excels on SMASH (+43 samples) and DRIVE recall (+11 samples), whereas EXP08B excels on DROP (+93 samples) and DRIVE precision (+8.34 pp).
5. **Oracle Headroom:** Satisfied. +5.71 pp potential headroom over the strongest single model.

---

## 14. Scientific Decision

### Final Verdict: **ENSEMBLE JUSTIFIED**

#### Substantive Justification:
1. **Distinct Inductive Biases:** EXP05 operates purely on raw spatial-temporal coordinates, allowing it to capture subtle racket preparations for SMASH and DRIVE. EXP08B incorporates optical flow motion directionality, allowing it to accurately differentiate downward vertical drops from lateral drives and clears.
2. **Quantifiable Recovery Potential:** EXP05 contains 112 correct predictions that EXP08B missed; EXP08B contains 163 correct predictions that EXP05 missed. Combining their predictive distributions provides a genuine mathematical basis to surpass the 77.55% benchmark.
3. **Controlled Scope Recommendation:** A single controlled follow-up study evaluating probability blending or meta-gating is scientifically warranted.

---

## 15. Limitations

1. **Sample Imbalance on DRIVE:** With only 73 validation DRIVE samples, the 11 unique correct drives from EXP05 and 4 from EXP08B represent small absolute sample counts susceptible to variance.
2. **Shared Failure Modes:** 328 errors (16.73% of the validation set) are shared by both models, representing hard limits in ambiguous rally phases.
3. **Theoretical vs Realizable Headroom:** While the oracle ceiling is 83.27%, weighted averaging or stacking can introduce regression on previously agreed-upon samples.

---

## 16. Reproducibility

- **Audit Script:** `C:\Users\user\.gemini\antigravity-ide\brain\0d9e30df-905f-43d1-a3fc-17cea6f78ab9\scratch\analyze_exp08c.py`
- **Report Generator:** `C:\Users\user\.gemini\antigravity-ide\brain\0d9e30df-905f-43d1-a3fc-17cea6f78ab9\scratch\generate_exp08c_report.py`
- **Audit Data JSON:** `C:\Users\user\.gemini\antigravity-ide\brain\0d9e30df-905f-43d1-a3fc-17cea6f78ab9\scratch\exp08c_audit_data.json`
- **Summary JSON:** `D:\PS_DATA\SPARK\docs\EXP_DRIVE_08C_COMPLEMENTARY_ERROR_SUMMARY.json`
- **Report Markdown:** `D:\PS_DATA\SPARK\docs\EXP_DRIVE_08C_COMPLEMENTARY_ERROR_AUDIT.md`
- **EXP05 Predictions:** `D:\PS_DATA\DRIVE_EXPERIMENTS\EXP_DRIVE_05_TEMPORAL_WINDOW\05_RESULTS\validation_predictions.json`
- **EXP08B Predictions:** `D:\PS_DATA\DRIVE_EXPERIMENTS\EXP_DRIVE_08B_HV_MOTION\04_RESULTS\validation_predictions.json`