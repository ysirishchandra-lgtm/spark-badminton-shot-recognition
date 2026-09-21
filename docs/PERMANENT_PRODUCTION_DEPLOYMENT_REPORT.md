# SPARK PERMANENT PRODUCTION DEPLOYMENT REPORT

**Date:** September 21, 2026  
**Role:** Senior DevOps Engineer & Full-Stack Deployment Engineer  
**Project:** SPARK — AI-Powered Badminton Shot Recognition  
**Repository:** `https://github.com/ysirishchandra-lgtm/spark-badminton-shot-recognition`  

---

## 1. ARCHITECTURE

- **Target Frontend:** Vercel (Next.js 16 / React 19)
- **Target Backend:** Render (FastAPI / Uvicorn Web Service)
- **Production Model:** EXP_23_C (`cd511db28d5df5d0e400ecce957ce0db79ea57c553d862fdf6c2be0360a31e59`)

---

## 2. PRE-DEPLOYMENT AUDIT & BLOCKER IDENTIFICATION

Pursuant to the mission protocol (*"STOP and report instead of improvising if: EXP_23_C cannot load on Render, platform constraints prevent deployment, or secrets/tokens are missing"*), the permanent deployment to Vercel and Render has been forensically audited:

### Blocker 1: External Local Workstation Dependencies in `inference_service.py`
The current production backend relies on hardcoded Windows filesystem paths outside the Git repository:
- `CHECKPOINT_PATH = r"D:\PS_DATA\PHASE_23_COMBINED_AUGMENTATION\03_CHECKPOINTS\EXP_23_C_best_model.pt"`
- `RESEARCH_MODEL_DIR = r"D:\PS_DATA\PHASE_23_COMBINED_AUGMENTATION\02_TRAINING"` (loads `BadmintonTransformerLSTMClassifier` via `sys.path.insert`)
- `RESNET_WEIGHTS_PATH = r"C:\Users\user\.cache\torch\hub\checkpoints\resnet18-f37072fd.pth"`

**Impact:** Render runs in an isolated Linux container without access to `D:\PS_DATA\...` or `C:\Users\user\...`. If deployed as-is to Render, the backend will fail with `FileNotFoundError` during model initialization.

### Blocker 2: Absence of Cloud Provider API Tokens in Local Agent Environment
- Deployment to **Vercel** requires a `VERCEL_TOKEN` or active CLI session (`~/.vercel`).
- Deployment to **Render** requires a `RENDER_API_KEY` or manual repository connection via the Render Dashboard.
- Neither token is provisioned in the current environment.

### Blocker 3: Missing PyTorch / OpenCV Dependencies in `backend/requirements.txt`
- Current `backend/requirements.txt` only specifies web dependencies (`fastapi`, `uvicorn`, `pydantic`, `httpx`).
- Machine learning dependencies (`torch`, `torchvision`, `opencv-python-headless`, `numpy`) must be formally declared for Render Linux build environments.

### Blocker 4: Render Free Tier Memory (512 MB RAM) vs PyTorch Footprint
- Render Free Web Services allocate 512 MB of memory.
- Initializing PyTorch, loading the ResNet-18 feature extractor (512-D), and decoding 16 video frames with OpenCV requires ~800 MB – 1.2 GB of RAM. Running on Render Free Tier risks immediate termination by the Linux Out-Of-Memory (OOM) killer. A Render **Starter Plan** (minimum 1 GB RAM) is recommended.

---

## 3. MODEL INTEGRITY & CHECKPOINT PROTECTION

- **Model Checkpoint:** `EXP_23_C_best_model.pt`
- **Expected SHA256:** `cd511db28d5df5d0e400ecce957ce0db79ea57c553d862fdf6c2be0360a31e59`
- **Verified SHA256:** `cd511db28d5df5d0e400ecce957ce0db79ea57c553d862fdf6c2be0360a31e59` (MATCH)
- **Model Weights Modified:** **NO**
- **Retrained / Fine-tuned:** **NO**
- **Official Test Set Accessed:** **NO** (`MATCH09, MATCH13, MATCH20, MATCH34, MATCH39, MATCH41, MATCH43` remain locked)

---

## 4. TEMPORARY CLOUDFLARE TUNNEL STATUS

Because permanent Vercel + Render deployment requires user dashboard linking and model bundling:
- **Temporary Frontend Tunnel:** `https://plots-only-antivirus-wilderness.trycloudflare.com` → **STILL REQUIRED / ACTIVE**
- **Temporary Backend Tunnel:** `https://brochures-parameters-traveling-dried.trycloudflare.com` → **STILL REQUIRED / ACTIVE**
- Both tunnels remain fully operational, serving live video uploads and returning `NET_SHOT (92.26%)` inference predictions across the internet.

---

## 5. PERMANENT DEPLOYMENT MIGRATION ROADMAP

To transition from the Cloudflare tunnels to Vercel + Render without compromising model behavior:

1. **Model Bundling:**
   - Commit `EXP_23_C_best_model.pt` (1.34 MB) to `backend/app/models/checkpoints/` or host on an S3/Cloudflare R2 bucket with automated download during Render build.
   - Bundle the `BadmintonTransformerLSTMClassifier` class definition inside `backend/app/models/` so `D:\PS_DATA` is not imported.
2. **Render Web Service Setup:**
   - Connect GitHub repo `ysirishchandra-lgtm/spark-badminton-shot-recognition` on [render.com](https://render.com).
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt` (with PyTorch CPU wheel `torch --index-url https://download.pytorch.org/whl/cpu` to minimize image size)
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Plan: Starter ($7/mo, 1GB RAM) to avoid OOM.
3. **Vercel Frontend Setup:**
   - Connect GitHub repo on [vercel.com](https://vercel.com).
   - Root Directory: `frontend`
   - Framework: Next.js
   - Environment Variable: `NEXT_PUBLIC_API_URL=https://<your-render-service>.onrender.com`
4. **Production CORS Alignment:**
   - Update backend `CORS_ORIGINS` to allow `https://<your-vercel-project>.vercel.app`.

---

## 6. FINAL STATUS

**DEPLOYMENT BLOCKED — REPORT REASON**  
Direct automated deployment to Vercel and Render is blocked pending:
1. Provisioning of Vercel/Render accounts or dashboard linking for repository `ysirishchandra-lgtm/spark-badminton-shot-recognition`.
2. Decoupling hardcoded local Windows paths (`D:\PS_DATA\...`, `C:\Users\user\...`) in `inference_service.py` to container-compatible relative paths.
3. Allocation of sufficient RAM (>= 1 GB) on Render to support PyTorch CPU inference without OOM termination.

The verified public Cloudflare tunnels remain active to provide uninterrupted public evaluation.
