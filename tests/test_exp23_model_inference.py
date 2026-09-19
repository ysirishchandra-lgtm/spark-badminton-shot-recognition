"""
SPARK Day 19 — Step 3A: EXP23_C Model Inference Validation Test

Validates that the verified EXP23_C visual-only temporal model:
1. Loads successfully from checkpoint with exact architecture and weights.
2. Performs forward inference on a real validation 16-frame feature sequence.
3. Produces mathematically valid logits and probability distributions.
4. Requires zero auxiliary coordinates or metadata.
"""

import os
import sys
import time
import torch

# Ensure model definition from research directory can be imported
RESEARCH_MODEL_DIR = r"D:\PS_DATA\PHASE_23_COMBINED_AUGMENTATION\02_TRAINING"
CHECKPOINT_PATH = r"D:\PS_DATA\PHASE_23_COMBINED_AUGMENTATION\03_CHECKPOINTS\EXP_23_C_best_model.pt"
VALIDATION_FEATURE_PATH = r"D:\PS_DATA\09_CNN_SPATIAL_FEATURES\VALIDATION\SMASH\SMASH_MATCH07_MATCH07_SHOT0001_HITFRAME00014554.pt"

CLASS_NAMES = ["SMASH", "CLEAR", "DROP", "DRIVE", "NET_SHOT"]
EXPECTED_PARAM_COUNT = 330885


def run_validation():
    print("=" * 60)
    print("SPARK DAY 19 — STEP 3A: EXP23_C MODEL INFERENCE VALIDATION")
    print("=" * 60)

    # -------------------------------------------------------------
    # 1. Check Paths
    # -------------------------------------------------------------
    if not os.path.exists(RESEARCH_MODEL_DIR):
        print(f"ERROR: Model directory not found: {RESEARCH_MODEL_DIR}")
        return False

    if not os.path.exists(CHECKPOINT_PATH):
        print(f"ERROR: Checkpoint not found: {CHECKPOINT_PATH}")
        return False

    if not os.path.exists(VALIDATION_FEATURE_PATH):
        print(f"ERROR: Validation sample not found: {VALIDATION_FEATURE_PATH}")
        return False

    # -------------------------------------------------------------
    # 2. Import and Instantiate Model
    # -------------------------------------------------------------
    if RESEARCH_MODEL_DIR not in sys.path:
        sys.path.insert(0, RESEARCH_MODEL_DIR)

    try:
        from models import BadmintonTransformerLSTMClassifier
    except ImportError as e:
        print(f"ERROR: Failed to import BadmintonTransformerLSTMClassifier: {e}")
        return False

    model = BadmintonTransformerLSTMClassifier()

    # -------------------------------------------------------------
    # 3. Load Checkpoint
    # -------------------------------------------------------------
    checkpoint = torch.load(CHECKPOINT_PATH, map_location="cpu", weights_only=False)
    if "model_state_dict" not in checkpoint:
        print("ERROR: Checkpoint does not contain 'model_state_dict'")
        return False

    missing, unexpected = model.load_state_dict(checkpoint["model_state_dict"])
    if missing or unexpected:
        print(f"ERROR: State dict mismatch: missing={missing}, unexpected={unexpected}")
        return False

    model.eval()

    # Freeze all parameters
    for param in model.parameters():
        param.requires_grad = False

    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)

    print(f"[OK] Model loaded: BadmintonTransformerLSTMClassifier")
    print(f"[OK] Checkpoint: {os.path.basename(CHECKPOINT_PATH)} (Epoch {checkpoint.get('epoch')})")
    print(f"[OK] Missing keys: {len(missing)} | Unexpected keys: {len(unexpected)}")
    print(f"[OK] Total parameters: {total_params} | Trainable: {trainable_params}")
    assert total_params == EXPECTED_PARAM_COUNT, f"Param count mismatch: {total_params} != {EXPECTED_PARAM_COUNT}"

    # -------------------------------------------------------------
    # 4. Load Real Existing Validation Feature Tensor
    # -------------------------------------------------------------
    feat = torch.load(VALIDATION_FEATURE_PATH, map_location="cpu", weights_only=False).float()
    if feat.dim() == 2:
        features = feat.unsqueeze(0)  # Shape: [1, 16, 512]
    elif feat.dim() == 3:
        features = feat
    else:
        print(f"ERROR: Invalid feature dimensions: {feat.shape}")
        return False

    print(f"[OK] Validation feature loaded: {os.path.basename(VALIDATION_FEATURE_PATH)}")
    print(f"[OK] Input shape: {list(features.shape)} (dtype: {features.dtype}, device: {features.device})")
    assert features.shape == (1, 16, 512), f"Expected shape (1, 16, 512), got {features.shape}"

    # -------------------------------------------------------------
    # 5. Model Forward Pass
    # -------------------------------------------------------------
    t0 = time.perf_counter()
    with torch.no_grad():
        logits = model(features)
        probabilities = torch.softmax(logits, dim=1)
    latency_ms = (time.perf_counter() - t0) * 1000

    logits_list = logits.numpy().tolist()[0]
    probs_list = probabilities.numpy().tolist()[0]
    prob_sum = float(probabilities.sum().item())
    pred_idx = int(torch.argmax(probabilities, dim=1).item())
    pred_class = CLASS_NAMES[pred_idx]

    # Ground truth from validation directory path
    ground_truth = "SMASH"
    is_correct = (pred_class == ground_truth)

    # -------------------------------------------------------------
    # 6. Validations
    # -------------------------------------------------------------
    assert logits.shape == (1, 5), f"Logits shape mismatch: {logits.shape}"
    assert probabilities.shape == (1, 5), f"Probabilities shape mismatch: {probabilities.shape}"
    assert torch.isfinite(logits).all().item(), "Logits contain non-finite values"
    assert torch.isfinite(probabilities).all().item(), "Probabilities contain non-finite values"
    assert all(0.0 <= p <= 1.0 for p in probs_list), "Probabilities outside [0, 1]"
    assert abs(prob_sum - 1.0) < 1e-4, f"Probabilities do not sum to 1.0: {prob_sum}"
    assert pred_idx in range(5), f"Predicted class index out of range: {pred_idx}"

    print("-" * 60)
    print("FORWARD INFERENCE METRICS:")
    print(f"  Input shape:         {list(features.shape)}")
    print(f"  Logits shape:        {list(logits.shape)}")
    print(f"  Logits values:       {[round(v, 4) for v in logits_list]}")
    print(f"  Probability shape:   {list(probabilities.shape)}")
    print(f"  Class probabilities: {dict(zip(CLASS_NAMES, [round(p, 4) for p in probs_list]))}")
    print(f"  Probability sum:     {prob_sum:.6f}")
    print(f"  Predicted class:     {pred_class} (Index: {pred_idx})")
    print(f"  Ground truth:        {ground_truth}")
    print(f"  Correct:             {is_correct}")
    print(f"  Inference latency:   {latency_ms:.2f} ms")
    print("-" * 60)
    print("INSPECTION CHECKS:")
    print("  [PASS] 0 auxiliary features passed or required")
    print("  [PASS] 0 court coordinates required")
    print("  [PASS] 0 hit-frame annotations required")
    print("  [PASS] 100% CPU compatible forward pass")
    print("=" * 60)
    print("RESULT: MODEL-ONLY INFERENCE VALIDATION PASSED")
    print("=" * 60)
    return True


if __name__ == "__main__":
    success = run_validation()
    sys.exit(0 if success else 1)
