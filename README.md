# Health Docs AI 🏥📄

Health Docs AI is an advanced, AI-powered document processing system designed to streamline medical record management. It leverages state-of-the-art LLMs (Large Language Models) like Gemini and Groq to extract, analyze, and summarize information from complex medical documents.

## 🚀 Features

- **AI Document Analysis**: Automatically extract key data points from medical reports.
- **OCR Integration**: Process scanned documents and images using Tesseract OCR.
- **Smart Summarization**: Get concise summaries of lengthy medical records.
- **Modern Dashboard**: High-performance UI built with React and Tailwind CSS.
- **Async Processing**: Reliable background task management using Celery and Redis.
- **Secure Storage**: Structured data management with SQLAlchemy and PostgreSQL/SQLite.

## 🛠️ Tech Stack

### Backend

- **Framework**: FastAPI (Python)
- **Database**: SQLAlchemy & PostgreSQL / SQLite
- **AI Models**: Google Gemini & Groq
- **OCR**: Pytesseract
- **Async Tasks**: Celery & Redis
- **PDF Generation**: ReportLab

### Frontend

- **Framework**: React (Vite)
- **Styling**: Tailwind CSS & Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **Routing**: React Router

## 📂 Project Structure

```text
.
├── backend/            # Python API (FastAPI)
│   ├── routes/        # API Endpoints
│   ├── services/      # AI and OCR Logic
│   ├── models.py      # Database Schema
│   └── requirements.txt
├── frontend/           # React Application (Vite/TS)
│   ├── src/           # Components and Pages
│   └── tailwind.config.js
└── uploads/            # Document Storage
```

## ⚙️ Setup Instructions

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure `.env` with your API keys (GROQ_API_KEY, GEMINI_API_KEY).
5. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📜 License

This project is for internal use. All rights reserved.
