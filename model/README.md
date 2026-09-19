# SPARK Model Directory

This directory serves as the architecture and checkpoint integration boundary for the SPARK badminton shot recognition models.

## Integration Notice
- **Current Phase (Day 18)**: Model boundary defined. Service interface prepared in `backend/app/services/inference_service.py`.
- **Model Checkpoints**: Large `.pt` and `.onnx` weights (including EXP24 multimodal transformer-BiLSTM checkpoints) are kept in the verified research storage and will be linked via the inference service boundary during Day 19. They are deliberately not checked into Git to keep the repository lightweight.
