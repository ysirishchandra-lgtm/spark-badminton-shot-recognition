# SPARK — AI-Powered Badminton Shot Recognition

[![Status](https://img.shields.io/badge/Status-Day%2018%20Foundation%20Ready-emerald)]()
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Uvicorn-blue)]()
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016%20%7C%20React%2019-black)]()
[![License](https://img.shields.io/badge/License-Academic%20Research-lightgrey)]()

> **Milestone Statement**: Day 18 implements the application foundation and video-upload workflow. Full ML inference integration is part of the next development stage.

---

## 1. Project Overview
**SPARK** is an AI-powered sports technology application designed to analyze broadcast and court-level badminton match videos and automatically classify executed shots. By leveraging modern deep learning and temporal sequence modeling, SPARK bridges the gap between raw sports broadcast footage and tactical performance analytics for players, coaches, and sports analysts.

## 2. Problem Statement
Badminton is one of the fastest racket sports in the world, with shuttle speeds exceeding 400 km/h and rapid rallies featuring complex stroke mechanics. Manual match tagging and stroke notation are labor-intensive, time-consuming, and prone to subjective error. Automating shot recognition requires capturing both fine-grained spatial racket/player mechanics and long-range temporal stroke dynamics across sequential video frames.

## 3. Five Target Shot Classes
SPARK targets five core stroke types defined in the taxonomy:
1. **SMASH**: High-velocity downward offensive stroke executed with power from the mid or rear court.
2. **CLEAR**: High, deep defensive or offensive trajectory sending the shuttle to the opponent's baseline.
3. **DROP**: Deceptive downward trajectory softly landing tightly over the net into the front court.
4. **DRIVE**: Fast, flat, horizontal exchange traveling parallel to the floor at net tape height.
5. **NET SHOT**: Delicate finesse shot played closely from the net tape tumbling across into the opponent's forecourt.

## 4. Project Objective
To build an end-to-end, robust sports analytics platform that:
- Ingests match video clips and full rally recordings securely.
- Extracts spatial frame visual representations using convolutional feature extractors.
- Models stroke temporal dynamics using deep sequential architectures.
- Delivers predictions through an intuitive, dark-themed, high-contrast user interface.

## 5. Proposed Architecture (ML Pipeline)
The underlying research architecture comprises:
- **Spatial Feature Backbone**: Pre-trained ResNet-18 spatial feature representation extracting frame-level visual embeddings.
- **Multimodal Temporal Sequence Modeling**: EXP24 Multimodal Transformer + Bidirectional LSTM (BiLSTM) with self-attention mechanism capturing temporal transitions and stroke culmination.
- **Classification Head**: Dense projection with Softmax output over the 5 shot classes.

## 6. Application Architecture
The production application is decoupled into clean, modular tiers:
```
                                ┌──────────────────────────────────────┐
                                │          Next.js Frontend            │
                                │   (React 19 / TypeScript / Dark UI)   │
                                └──────────────────┬───────────────────┘
                                                   │
                                     HTTP / Multipart Upload
                                     (POST /api/video/upload)
                                                   │
                                                   ▼
                                ┌──────────────────────────────────────┐
                                │           FastAPI Backend            │
                                │    (Validation / Sanitization /      │
                                │     CORS / Safe Disk Streaming)      │
                                └──────────────────┬───────────────────┘
                                                   │
                                         Service Boundary
                                                   │
                                                   ▼
                                ┌──────────────────────────────────────┐
                                │       Inference Service (Day 19)     │
                                │   (EXP24 Multimodal Model Checkpoint)│
                                └──────────────────────────────────────┘
```

## 7. Technology Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Heroicons / Inline SVG.
- **Backend**: Python 3.13, FastAPI, Uvicorn, Pydantic V2, Pydantic Settings.
- **File Ingestion**: Python Multipart with chunked streaming and configurable size limit (`MAX_UPLOAD_SIZE_MB`).
- **Testing**: Pytest, FastAPI TestClient (`httpx`).
- **Documentation**: ReportLab PDF generator, Markdown.

## 8. Project Structure
```
SPARK/
├── frontend/                     # Next.js App Router frontend application
│   ├── app/                      # Layout, global styles, and main page
│   ├── components/               # Header, VideoUploader, VideoPreview, ResultsDisplay, ShotClassBadges
│   ├── lib/                      # API client utilities (health check, upload)
│   ├── types/                    # TypeScript interfaces
│   ├── .env.example              # Frontend environment configuration template
│   ├── package.json              # NPM dependencies and scripts
│   └── tsconfig.json             # TypeScript configuration
├── backend/                      # FastAPI backend application
│   ├── app/
│   │   ├── main.py               # FastAPI entrypoint, routes, CORS setup
│   │   ├── api/video.py          # Video upload router
│   │   ├── core/config.py        # Configurable settings (MAX_UPLOAD_SIZE_MB)
│   │   ├── schemas/video.py      # Pydantic validation models
│   │   ├── services/             # Inference service boundary
│   │   └── utils/security.py     # Security, path traversal protection, sanitization
│   ├── storage/uploads/          # Local video upload storage (.gitkeep)
│   ├── requirements.txt          # Python backend dependencies
│   └── README.md
├── model/                        # ML model boundary & checkpoint documentation
├── data/                         # Small runtime data (.gitkeep)
├── docs/                         # Technical documentation & PDF reports
│   ├── generate_report_pdf.py    # ReportLab automated PDF builder
│   └── DAY_18_IMPLEMENTATION_REPORT.pdf # Executive Day 18 report
├── results/                      # Evaluation outputs and prediction logs
├── tests/                        # Automated Pytest suite (8/8 tests passing)
│   └── test_backend.py
├── .gitignore                    # Production gitignore (videos, models, env, caches)
└── README.md                     # Comprehensive project documentation
```

## 9. Local Setup
Clone or enter the project repository:
```bash
cd D:\PS_DATA\SPARK
```

## 10. Backend Setup
1. Create and activate a Python virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Configuration:
   Upload limit and server origins can be customized via `.env` or environment variables:
   ```bash
   MAX_UPLOAD_SIZE_MB=200
   ```

## 11. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install node dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Set `NEXT_PUBLIC_API_URL=http://localhost:8000` in `.env.local`.

## 12. Running the Application

### Start Backend Service
From `D:\PS_DATA\SPARK`:
```bash
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Base URL: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### Start Frontend Service
From `D:\PS_DATA\SPARK\frontend`:
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser.

### Running Backend Automated Tests
From `D:\PS_DATA\SPARK`:
```bash
python -m pytest tests/test_backend.py -v
```

## 13. Current Development Status
- **Day 18 Scope Achieved**:
  - Full application project layout created with strict isolation from existing research data.
  - FastAPI backend operational with `/`, `/health`, and `/api/video/upload`.
  - Security hardening implemented: filename sanitization, traversal protection, unique UUID generation, and configurable size threshold.
  - Next.js frontend operational with sports-tech dark aesthetic, drag-and-drop, HTML5 video preview, and real-time backend heartbeat.
  - Results UI skeleton operational with authentic non-fabricated placeholders (`—`).
  - Pytest test suite fully passing (8/8 tests).
  - Executive implementation report PDF generated at `docs/DAY_18_IMPLEMENTATION_REPORT.pdf`.

## 14. Future Model Integration
During Day 19, the existing and verified **EXP24 Multimodal Transformer-BiLSTM** model checkpoint will be integrated through the established service boundary in `backend/app/services/inference_service.py`. This will activate real-time frame feature extraction, sequence inference, and real-time recognition output without modifying the underlying research checkpoints.

---

### Team Members
1. Sirish Chandra
2. Priyanshu
3. Ashwidha
4. Thakur Swetan Singh
5. Kaustub
