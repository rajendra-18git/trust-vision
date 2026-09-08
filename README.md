# TrustVision — AI-Powered Media Integrity & Tampering Detection Platform

TrustVision is an enterprise-grade web application for media integrity verification, cryptographic hashing (SHA-256), metadata auditing, and visual tampering detection.

---

## 🚀 Quick Start (Running on your Laptop)

### Prerequisites
- **Node.js**: v18 or higher ([Download Node.js](https://nodejs.org/))
- **Python**: v3.10 or higher (Optional for running the FastAPI backend service; the frontend works seamlessly in **Standalone Mode** out of the box!)

---

## 💻 Running the Frontend Application

1. Open a terminal / command prompt in the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```text
   http://localhost:5173/
   ```

---

## 🐍 Running the FastAPI Backend Service (Optional)

1. Open a separate terminal in the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

5. When the backend is running on port 8000, the TrustVision top header will automatically update to show **● Backend Connected**!

---

## 📂 Project Structure

```text
TrustVision/
├── frontend/                     # React + Vite Enterprise SaaS UI
│   ├── src/                      # UI Components, Pages, Design System, Utilities
│   ├── dist/                     # Production build artifacts
│   ├── package.json              # NPM dependencies & scripts
│   ├── tailwind.config.js        # TailwindCSS configuration
│   └── vite.config.js            # Vite build configuration
└── backend/                      # FastAPI Python Detection Backend
    ├── app/                      # Main application logic & detectors
    │   ├── api/                  # API endpoints (dataset, model)
    │   ├── detectors/            # Forensic & Anomaly detectors
    │   └── services/             # Cryptographic hashing & inference integrity
    ├── label-test/               # Model evaluation datasets
    ├── tests/                    # PyTest suite
    ├── Dockerfile
    └── requirements.txt          # Python dependencies
```

---

## 🛡️ Key Features

- **Media Integrity Overview**: Real-time KPI metrics, total forensic runs, trusted vs. suspicious counts.
- **Analyze Media**: Drag-and-drop file upload, Web Crypto SHA-256 calculation, step-by-step stage progress.
- **Forensic Details**: Comprehensive accordions for File Info, Cryptographic Verification, Metadata Analysis, and Model Inference Specs.
- **Analysis History**: Local audit log search and filterable history table.
- **Settings**: Read-only backend service endpoints and Vision Transformer model thresholds.
