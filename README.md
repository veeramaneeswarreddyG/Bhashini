# Bhasini — "Every Language, One Voice"

Bhasini is a modern, full-stack AI Translation Platform designed with a glassmorphism SaaS UI. It supports instant translations powered by Google Cloud Translation and LibreTranslate APIs, featuring auto-language detection, browser voice recognition, speech synthesis, local history logs, detailed metrics analytics, a shortcut-driven command palette, and PDF exports.

---

## 🚀 Key Features

*   **SaaS-Style Glassmorphic UI**: Vibrant gradient mesh backgrounds, responsive cards, dark/light theme options, and smooth micro-animations.
*   **Dual Translation Engines**: Uses the high-speed Google Cloud Translation API (or falls back to LibreTranslate/Argos Open Tech for self-hosted versatility).
*   **Automatic Language Detection**: Detects input languages dynamically in the backend using the `langdetect` library and displays confirmation badges.
*   **Web Speech Recognition**: Direct voice input in selected languages powered by the HTML5 Web Speech API.
*   **Text-to-Speech Output**: Integrated browser voice synthesizer with play, pause, and stop controls.
*   **ReportLab PDF Export**: Downloads clean, structured PDF translation summaries complete with timestamps, metadata, and side-by-side or block formatting.
*   **Local History & Analytics**: Locally stores translation records in browser storage. Analytics dashboard tracks translation volume, favorites, words, and character metrics.
*   **Shortcut Command Palette**: Accessible via `Ctrl+K` or `Cmd+K` for mouse-free control (switching languages, toggling dark mode, clearing screens, copying).

---

## 🛠️ Tech Stack

### Frontend
*   **React + Vite** (Fast Single Page Application structure)
*   **Tailwind CSS** (Utility CSS framework with glassmorphic cards and dark mode variables)
*   **Axios** (Service layer for REST API communication)
*   **Lucide React** (Clean, modern iconography)

### Backend
*   **FastAPI** (High-performance Python web framework)
*   **Uvicorn** (ASGI server integration)
*   **Langdetect** (Language identification library)
*   **ReportLab** (Dynamic PDF layout generator)
*   **HTTPX** (Async HTTP networking)

---

## 📂 Project Structure

```text
bhasini/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Theme toggle & sidebar hooks
│   │   │   ├── Hero.jsx             # SaaS marketing landing
│   │   │   ├── Workspace.jsx        # Audio controls, textareas, translate triggers
│   │   │   ├── HistorySidebar.jsx   # Local storage translation history
│   │   │   ├── AnalyticsPanel.jsx   # Metrics graphs & numbers
│   │   │   ├── CommandPalette.jsx   # Keyboard-navigable quick actions
│   │   │   └── ErrorBoundary.jsx    # Graceful runtime recovery
│   │   ├── context/
│   │   │   └── ThemeContext.jsx     # Dark mode coordinator
│   │   ├── services/
│   │   │   └── api.js               # Axios translation & PDF streaming calls
│   │   ├── App.jsx                  # Main coordinator and toast triggers
│   │   ├── index.css                # Custom glassmorphism classes & mesh background
│   │   └── main.jsx                 # Mount entrypoint
│   ├── index.html                   # HTML metadata & SEO configurations
│   ├── tailwind.config.js           # Theme extensions & class config
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI server, schemas, endpoints, CORS
│   │   └── services.py              # Translation routing, langdetect, ReportLab PDF
│   ├── requirements.txt             # Python packages
│   └── .env                         # Server & API key variables
└── README.md                        # Documentation
```

---

## ⚙️ Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   Python (3.10+)

### 1. Backend Setup
1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```
2.  Create a virtual environment:
    ```bash
    python -m venv venv
    ```
3.  Activate the virtual environment:
    *   **Windows (PowerShell)**: `.\venv\Scripts\activate`
    *   **Mac/Linux**: `source venv/bin/activate`
4.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
5.  Create a `.env` file in the `backend` folder (or edit the scaffolded one):
    ```env
    GOOGLE_TRANSLATION_API_KEY=your-api-key-here
    LIBRETRANSLATE_URL=https://translate.argosopentech.com
    PORT=8000
    HOST=127.0.0.1
    ```
6.  Launch the FastAPI server:
    ```bash
    python app/main.py
    ```
    The API will be available at `http://127.0.0.1:8000`. API docs can be viewed at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup
1.  Navigate to the frontend folder:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the Vite development server:
    ```bash
    npm run dev
    ```
    The application will run at `http://localhost:5173`.

---

## 📡 API Reference

### 1. Translate Text
*   **Endpoint**: `POST /translate`
*   **Request Schema**:
    ```json
    {
      "text": "Hello world!",
      "source": "auto",
      "target": "es"
    }
    ```
*   **Response Schema**:
    ```json
    {
      "translatedText": "¡Hola Mundo!",
      "detectedLanguage": "en",
      "provider": "google"
    }
    ```

### 2. Export to PDF
*   **Endpoint**: `POST /export-pdf`
*   **Request Schema**:
    ```json
    {
      "text": "Hello world!",
      "translatedText": "¡Hola Mundo!",
      "source": "en",
      "target": "es",
      "timestamp": "2026-06-12 16:31:07"
    }
    ```
*   **Response**: Binary stream of content-type `application/pdf`. File is downloaded as an attachment.

### 3. Service Health Check
*   **Endpoint**: `GET /health`
*   **Response**:
    ```json
    {
      "status": "healthy",
      "google_available": true
    }
    ```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Description |
|---|---|
| `Ctrl + K` / `Cmd + K` | Toggle search command palette |
| `Ctrl + Enter` | Run translation on current input |
| `Ctrl + Shift + S` | Toggle speech voice recognition |
| `ESC` | Close active dialogs, palettes, or sidebars |

---

## 🔮 Future Enhancements

*   **User Profiles & Cloud Sync**: Save translation logs across devices using standard PostgreSQL & OAuth (Google/GitHub).
*   **Batch File Translation**: Upload `.docx`, `.txt`, or `.pdf` files and translate layout structures in place.
*   **Real-time Audio Conversation**: Live speech-to-speech dialogue interface with concurrent dual-track synthesis.
