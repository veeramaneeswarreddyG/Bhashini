import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app.services import TranslateService, PDFService

app = FastAPI(
    title="Bhashini AI Translation Platform API",
    description="Backend translation service supporting automatic language detection, PDF exports, and multi-engine translation (Google / LibreTranslate).",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request / Response Schemas
class TranslationRequest(BaseModel):
    text: str = Field(..., description="The source text to translate", min_length=1)
    source: str = Field("auto", description="The source language code, e.g. 'en', 'es', or 'auto' to auto-detect")
    target: str = Field(..., description="The target language code, e.g. 'es', 'fr'")

class TranslationResponse(BaseModel):
    translatedText: str
    detectedLanguage: str
    provider: str

class PDFExportRequest(BaseModel):
    text: str = Field(..., min_length=1)
    translatedText: str = Field(..., min_length=1)
    source: str = Field(...)
    target: str = Field(...)
    timestamp: str = Field(default="")

@app.get("/health")
def health_check():
    return {"status": "healthy", "google_available": bool(os.getenv("GOOGLE_TRANSLATION_API_KEY"))}

@app.post("/translate", response_model=TranslationResponse)
async def translate_text(request: TranslationRequest):
    try:
        # Call Translation Service
        result = await TranslateService.translate(
            text=request.text,
            source=request.source,
            target=request.target
        )
        return TranslationResponse(
            translatedText=result["translatedText"],
            detectedLanguage=result["detectedLanguage"],
            provider=result.get("provider", "unknown")
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal translation server error: {str(e)}")

@app.post("/export-pdf")
async def export_pdf(request: PDFExportRequest):
    try:
        # Generate PDF document buffer
        pdf_buffer = PDFService.generate_translation_pdf(
            text=request.text,
            translated_text=request.translatedText,
            source=request.source,
            target=request.target,
            timestamp=request.timestamp
        )
        
        headers = {
            "Content-Disposition": "attachment; filename=translation_report.pdf"
        }
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers=headers
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate translation PDF: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
