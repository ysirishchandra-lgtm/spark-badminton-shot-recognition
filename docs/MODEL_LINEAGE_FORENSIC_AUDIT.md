# SPARK Model Lineage Forensic Audit

**Date:** 2026-09-21
**Status:** COMPLETE - ALL 18 PARTS RESOLVED

---

## Executive Summary

The pre-deployment checkpoint SHA256 mismatch has been fully resolved.
The confusion originated from a misidentification of what EXP_DRIVE_11_best_checkpoint.pt
physically stores. Both checksums are verified as authentic, all metrics are reproduced
exactly, and the deployment blocker is lifted.

**FINAL DECISION: DEPLOYMENT UNBLOCKED - CURRENT PRODUCTION MODEL IS CORRECT**

---

## Part 1 - Checkpoint Inventory

Full inventory: D:\PS_DATA\SPARK\docs\MODEL_CHECKPOINT_INVENTORY.csv

| Experiment | Checkpoint | SHA256 (full) | Size |
|---|---|---|---|
| EXP_DRIVE_08B_best | EXP_DRIVE_08B_best_checkpoint.pt | 0b296996d8cd7a63a5449a0a6fb21d4e84817be0bed3aeb1b837da4dfc75f164 | 4,086,490 |
| EXP_DRIVE_11_best | EXP_DRIVE_11_best_checkpoint.pt | 9ef77e6bdba535a20e330b2e41a502d37ea58fa7a75d2ec0f9af69519fe5924a | 8,593 |
| EXP_23_C (PROD) | EXP_23_C_best_model.pt | cd511db28d5df5d0e400ecce957ce0db79ea57c553d862fdf6c2be0360a31e59 | 1,341,480 |

---

## Part 2 - Checksum Forensics

| Query Hash | Belongs To | Verified |
|---|---|---|
| 0b296996d8cd7a63... | EXP_DRIVE_08B_best_checkpoint.pt (4MB full model) | CONFIRMED |
| 9ef77e6bdba535a2... | EXP_DRIVE_11_best_checkpoint.pt (8KB gate head) | CONFIRMED |

Both hashes are authentic. The pre-deployment prompt incorrectly stated 0b296996... as
the expected hash for EXP_DRIVE_11. See Part 11 for root cause.

---

## Part 3 - Architecture Forensics

### EXP_DRIVE_08B - MultimodalTransformerLSTMClassifier

Confirmed via torch.load read-only inspection:
- epoch: 23, seed: 123, aux_dim: 28, parameters: 337,221
- classifier.weight: [5, 192] => 5 output classes, 192-D fused
- aux_mlp.0.weight: [64, 28] => aux input dim = 28
- Architecture: Linear(512->128) + SinPE + TransformerBlock + LSTM -> [128] (visual)
               Linear(28->64) + ReLU + Dropout(0.3) + Linear(64->64) -> [64] (aux)
               cat[128+64=192] + Dropout(0.5) + Linear(192->5) (fusion)

### EXP_DRIVE_11 - ProtectedDriveGate (NOT standalone)

Confirmed via torch.load read-only inspection:
- epoch: 10, trainable_params: 27, file_size: 8,593 bytes
- gate_state_dict keys only: gate_linear(2), res_fc1(9), res_fc2(9), biases
- gate_linear.weight: [-0.4177], gate_linear.bias: [0.5297]
- res_fc1.weight: all zeros (residual branch not activated)
- Takes [B,5] base logits + [B,1] scalar m
- Modifies only DRIVE logit (index 3), all others unchanged
- CANNOT operate standalone

### EXP_23_C - BadmintonTransformerLSTMClassifier (Production)

- epoch: 34, parameters: 330,885, model_class: BadmintonTransformerLSTMClassifier
- fc.weight: [5, 128] => 5 classes, no aux_mlp
- Pure visual input [B, 16, 512] only

---

## Part 4 - What is EXP_DRIVE_08B?

| Attribute | Value |
|---|---|
| Type | Full end-to-end multimodal classifier |
| Visual Input | [B, 16, 512] ResNet-18 features, Window_C [-4, +11] |
| Auxiliary Input | 28-D (27-D spatial + 1-D H/V optical flow ratio) |
| HV Feature | mean(abs_u)/(mean(abs_v)+1e-5) via Farneback 16 frames 320x180 |
| Trainable Params | 337,221 |
| Seed | 123 |
| Best Epoch | 23 |
| Val Accuracy | 77.55% |
| Macro F1 | 68.56% |
| Weighted F1 | 77.49% |
| Raw Video Deployable | NO - requires 27-D spatial annotations (hit/player/opp coords) |

---

## Part 5 - What is EXP_DRIVE_11?

| Attribute | Value |
|---|---|
| Type | Residual gate head (NOT standalone model) |
| Gate Input | [B, 5] frozen EXP08B logits + [B, 1] scalar m |
| Gate Formula | g=sigmoid(a*m+b), r=3.0*tanh(MLP(m)), delta_drive=g*r |
| Protected Classes | SMASH/CLEAR/DROP/NET_SHOT logits 100% unchanged |
| Trainable Params | 27 |
| Scalar m | Normalized early horizontal optical flow rate (from EXP10) |
| Base Model | Frozen EXP_DRIVE_08B (SHA256 verified before+after training) |
| Best Epoch | 10 (early stopped) |
| Raw Video Deployable | NO - requires full EXP08B forward pass (needs 28D aux) |

---

## Part 6 - EXP_DRIVE_11 Lineage Trace

EXP_15_08_03_RICHER_SPATIAL [27-D aux vector established]
  |
  v
EXP_DRIVE_05_TEMPORAL_WINDOW [Window_C [-4,+11], 27D aux, ResNet-18]
  |
  v
EXP_DRIVE_08B_HV_MOTION [+1D HV flow = 28D total, seed=123]
  SHA256: 0b296996... (CRYPTOGRAPHICALLY LOCKED, verified in train_exp_drive_11.py)
  |
  +--> frozen --> EXP_DRIVE_10_EARLY_MOTION [+1D early horiz = 29D]
  |                      | (provides scalar m)
  |                      v
  +--> frozen --> EXP_DRIVE_11_PROTECTED_GATE [27-param gate]
                    SHA256: 9ef77e6b...
                    Combined: 77.55% acc / 69.35% F1 / 77.63% wF1

Training script: D:\PS_DATA\DRIVE_EXPERIMENTS\EXP_DRIVE_11_PROTECTED_DRIVE_GATE\train_exp_drive_11.py
- Verifies EXP08B SHA256 before training
- Loads precomputed base_val_data.pt (EXP08B logits + scalar m)
- Trains ProtectedDriveGate (27 params) only
- Re-verifies EXP08B SHA256 after training
- Saves gate_state_dict only => 8,593 bytes

---

## Part 7 - Tracing 77.55% / 69.35% / 77.63%

SOURCE: EXP_DRIVE_11/04_RESULTS/validation_results.json
  accuracy: 77.55, macro_f1: 69.35, weighted_f1: 77.63

REPRODUCED (task-2303, read-only inference):
  Reproduced Accuracy:    77.55% [EXACT MATCH]
  Reproduced Macro F1:    69.35% [EXACT MATCH]
  Reproduced Weighted F1: 77.63% [EXACT MATCH]

Checkpoint combination required:
  EXP_DRIVE_11_best_checkpoint.pt (SHA256: 9ef77e6b...) - gate weights
  Applied ON frozen EXP_DRIVE_08B_best_checkpoint.pt (SHA256: 0b296996...) - base model
  Feature input: precomputed base_val_data.pt (EXP08B logits + scalar m)

---

## Part 8 - Input Feature Compatibility

EXP_DRIVE_11 Full Feature Requirements vs Raw Video Availability:

| Feature | Available from Raw Video? |
|---|---|
| [B, 16, 512] ResNet-18 visual | YES |
| hit_x, hit_y (normalized) | NO - requires shuttlecock tracker |
| player_x, player_y | NO - requires pose/detection model |
| is_overhead, is_aroundhead, is_backhand | NO - annotation |
| hit_area_zone (10D one-hot) | NO - annotation |
| opp_x, opp_y | NO - opponent tracking |
| d_reach_xy, dist_reach | NO - annotation+geometry |
| d_opp_xy, dist_opp | NO - opponent tracking |
| HV flow ratio | YES - optical flow |
| scalar m (early horiz flow) | YES - optical flow |

Training Input vs Production Input:
| | EXP_DRIVE_11 Training | SPARK Production |
|---|---|---|
| Aux | 28-D spatial + HV + scalar m | NONE |
| Checkpoint | EXP08B (frozen) + EXP11 gate | EXP_23_C only |
| Compatible | NO | YES (correct) |

---

## Part 9 - Raw Video Deployability

EXP_DRIVE_11: OPTION C - NO

Requires 27-D spatial coordinate annotations unavailable at inference without
shuttlecock detection and player tracking pipelines.
Per FINAL_SYSTEM_ARCHITECTURE_RESEARCH/01_MODEL_AUDIT.md: substituting
missing coordinate tokens biases predictions to NET_SHOT (~74-77%).
Features must NOT be invented, zero-filled, or synthesized.

CONCLUSION: EXP_DRIVE_11 is NOT raw-video deployable.

---

## Part 10 - Current Backend Audit

File: backend/app/services/inference_service.py

| Attribute | Value |
|---|---|
| Model class | BadmintonTransformerLSTMClassifier |
| Checkpoint path | D:\PS_DATA\PHASE_23_COMBINED_AUGMENTATION\03_CHECKPOINTS\EXP_23_C_best_model.pt |
| SHA256 | cd511db28d5df5d0e400ecce957ce0db79ea57c553d862fdf6c2be0360a31e59 |
| Backbone | ResNet-18 (resnet18-f37072fd.pth), frozen |
| Frame sampling | 16 frames uniform temporal sampling |
| Input tensor | [1, 16, 512] (no auxiliary) |
| Preprocessing | BGR->RGB, resize 224x224, ImageNet normalization |
| Output | 5-class softmax: SMASH/CLEAR/DROP/DRIVE/NET_SHOT |
| Raw video capable | YES |

The current production backend is correctly configured.

---

## Part 11 - SHA256 Confusion Root Cause

The pre-deployment prompt stated expected SHA256 for EXP_DRIVE_11 as 0b296996...
This is actually the SHA256 of EXP_DRIVE_08B_best_checkpoint.pt (the 4MB base model).

Root cause: The prompt assumed EXP_DRIVE_11_best_checkpoint.pt would embed the EXP08B
weights. It does NOT. train_exp_drive_11.py saves ONLY the gate_state_dict (27 params):

    torch.save({'gate_state_dict': gate_model.state_dict(), ...},
               "EXP_DRIVE_11_best_checkpoint.pt")

EXP08B is kept entirely separate with its SHA256 verified before and after training.
0b296996... belongs to EXP_DRIVE_08B exclusively.
9ef77e6b... is EXP_DRIVE_11's own valid hash.
NO mismatch exists. The pre-deployment report had a documentation error.

---

## Part 12 - Smoke Test Identity

Previous: NET_SHOT, 92.26%, prob_sum=0.9999
Model: EXP_23_C_best_model.pt (SHA256: cd511db2...)
Class: BadmintonTransformerLSTMClassifier (330,885 params)
Input: 16 uniform frames -> [1, 16, 512] ResNet-18 visual only
This is the correct production model. Smoke test is valid.

---

## Part 13 - Model Identity Tables

### Checkpoint Identity
| Experiment | SHA256 | Size | Architecture |
|---|---|---|---|
| EXP_DRIVE_08B | 0b296996... | 4,086,490 | MultimodalTransformerLSTMClassifier |
| EXP_DRIVE_11 | 9ef77e6b... | 8,593 | ProtectedDriveGate (27 params only) |
| EXP_23_C | cd511db2... | 1,341,480 | BadmintonTransformerLSTMClassifier |

### Validation Metrics
| Experiment | Val Accuracy | Macro F1 | Weighted F1 | Reproducible |
|---|---|---|---|---|
| EXP_DRIVE_08B | 77.55% | 68.56% | 77.49% | YES |
| EXP_DRIVE_11 (08B+gate) | 77.55% | 69.35% | 77.63% | YES - task-2303 exact match |
| EXP_23_C | 66.73% | 52.82% | 64.47% | YES |

---

## Part 14 - Model Lineage

Research lineage (multimodal - NOT production):
  EXP_15_08_03 -> EXP_DRIVE_05 -> EXP_DRIVE_08B -> EXP_DRIVE_10 -> EXP_DRIVE_11

Production lineage (visual-only):
  EXP_22_B -> EXP_23_A -> EXP_23_B -> EXP_23_C [CURRENTLY DEPLOYED]

Full lineage: D:\PS_DATA\SPARK\docs\MODEL_LINEAGE.txt

---

## Part 15 - Deployment Decision

OPTION D: EXP_23_C is the actual validated raw-video production model.
- EXP_DRIVE_08B: NOT raw-video deployable
- EXP_DRIVE_11: NOT raw-video deployable standalone
- EXP_23_C: FULLY raw-video deployable - CORRECTLY DEPLOYED
No model replacement needed.

---

## Parts 16-17 - No Changes Made / Documents Created

No changes made to: inference_service.py, any checkpoint, frontend, or backend.
Documents created:
  - MODEL_CHECKPOINT_INVENTORY.csv
  - MODEL_VALIDATION_LINEAGE.csv
  - MODEL_INPUT_COMPATIBILITY.csv
  - MODEL_DEPLOYABILITY_DECISION.json
  - MODEL_LINEAGE.txt
  - MODEL_LINEAGE_FORENSIC_AUDIT.md (this file)

---

## Part 18 - Final Answers

| Question | Answer |
|---|---|
| 1. What is EXP_DRIVE_08B? | Full multimodal 337k-param classifier. [16x512]+28D aux. 77.55%/68.56%. NOT deployable. |
| 2. What is EXP_DRIVE_11? | 27-param gate head on frozen EXP08B. DRIVE logit only. 77.55%/69.35%. NOT standalone. |
| 3. Which hash to which? | 0b296996=EXP08B (4MB). 9ef77e6b=EXP11 gate (8KB). Both authentic. |
| 4. Which produced 77.55%? | EXP11 gate + frozen EXP08B base combined. |
| 5. Exact features? | EXP08B logits (from [16x512]+28D) + scalar m (early horiz flow). |
| 6. EXP11 needs aux? | YES - indirectly via EXP08B 27D spatial annotations. |
| 7. From raw video? | PARTIAL - HV/m: YES; 27D spatial: NO. |
| 8. SPARK compatible with EXP11? | NO - and correctly so. EXP_23_C is correct. |
| 9. Which to deploy? | EXP_23_C - already deployed correctly. |
| 10. What to fix? | Nothing. Documentation error. DEPLOYMENT UNBLOCKED. |

---

## Safety Confirmation

Official test accessed: NO
Training performed: NO
Checkpoint modified: NO
Frontend modified: NO
Backend modified: NO
Deployment performed: NO

---

## Final Console Output

============================================================
SPARK MODEL LINEAGE FORENSIC AUDIT
============================================================

EXP_DRIVE_08B checkpoint:
D:\PS_DATA\DRIVE_EXPERIMENTS\EXP_DRIVE_08B_HV_MOTION\03_CHECKPOINTS\EXP_DRIVE_08B_best_checkpoint.pt

EXP_DRIVE_08B SHA256:
0b296996d8cd7a63a5449a0a6fb21d4e84817be0bed3aeb1b837da4dfc75f164

EXP_DRIVE_11 checkpoint:
D:\PS_DATA\DRIVE_EXPERIMENTS\EXP_DRIVE_11_PROTECTED_DRIVE_GATE\03_CHECKPOINTS\EXP_DRIVE_11_best_checkpoint.pt

EXP_DRIVE_11 SHA256:
9ef77e6bdba535a20e330b2e41a502d37ea58fa7a75d2ec0f9af69519fe5924a

------------------------------------------------------------

Expected historical SHA256:
0b296996d8cd7a63a5449a0a6fb21d4e84817be0bed3aeb1b837da4dfc75f164

Actually belongs to:
EXP_DRIVE_08B_best_checkpoint.pt (4MB full multimodal base model)
NOT to EXP_DRIVE_11 (8KB gate head, 27 params)

------------------------------------------------------------

77.55% validation result belongs to:
EXP_DRIVE_11 gate applied on frozen EXP_DRIVE_08B base

Validation Accuracy: 77.55%
Macro F1:            69.35%
Weighted F1:         77.63%
Reproduced:          YES (exact match, task-2303)

------------------------------------------------------------

EXP_DRIVE_11 input:
[B,5] frozen EXP08B logits + [B,1] early horizontal motion scalar m

EXP_DRIVE_11 auxiliary features: YES (via EXP08B - 28D required)
Auxiliary dimension: 28D for EXP08B base + 1D scalar m = 29D total

------------------------------------------------------------

Current SPARK production input:
[1, 16, 512] ResNet-18 visual features (zero auxiliary)

Compatible with EXP_DRIVE_11: NO (correctly so)

------------------------------------------------------------

EXP_DRIVE_11 raw-video deployable: NO

------------------------------------------------------------

Current production model identity:
EXP_23_C (BadmintonTransformerLSTMClassifier, 330,885 params)
SHA256: cd511db28d5df5d0e400ecce957ce0db79ea57c553d862fdf6c2be0360a31e59
Val Acc: 66.73% | Macro F1: 52.82% | Ext Acc: 72.00%

Correct production model candidate:
EXP_23_C - ALREADY DEPLOYED - NO CHANGE NEEDED

------------------------------------------------------------

Official test accessed:   NO
Training performed:       NO
Checkpoint modified:      NO
Frontend modified:        NO
Backend modified:         NO
Deployment performed:     NO

------------------------------------------------------------

FINAL DECISION:

READY FOR PRODUCTION MODEL INTEGRATION

The SHA256 mismatch was a documentation error. Both checksums are authentic.
EXP_DRIVE_11 is an 8KB gate head (27 params), not a 4MB full model.
EXP_23_C is correctly installed and raw-video deployable.

------------------------------------------------------------

EXACT NEXT ACTION:

Proceed with deployment of the existing SPARK application.
No model changes or checkpoint changes required.
EXP_23_C is the designated production model per
FINAL_SYSTEM_ARCHITECTURE_RESEARCH/01_MODEL_AUDIT.md.

============================================================