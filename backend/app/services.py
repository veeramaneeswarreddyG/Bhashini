import os
import io
import httpx
from datetime import datetime
from langdetect import detect
from fastapi import HTTPException

# ReportLab imports
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Map of common ISO codes to language names
LANGUAGES_MAP = {
    "en": "English", "es": "Spanish", "fr": "French", "de": "German",
    "it": "Italian", "pt": "Portuguese", "ru": "Russian", "zh": "Chinese",
    "ja": "Japanese", "ko": "Korean", "hi": "Hindi", "ar": "Arabic",
    "nl": "Dutch", "tr": "Turkish", "sv": "Swedish", "pl": "Polish",
    "vi": "Vietnamese", "id": "Indonesian", "ta": "Tamil", "te": "Telugu",
    "kn": "Kannada", "ml": "Malayalam", "mr": "Marathi", "gu": "Gujarati",
    "bn": "Bengali", "pa": "Punjabi"
}

# Unicode font registration database
registered_fonts = {}

# Try to register Windows TrueType Fonts for full language support
fonts_to_register = [
    ("Arial", "C:/Windows/Fonts/arial.ttf"),           # Latin, Arabic, Russian, Greek, Hebrew
    ("Malgun", "C:/Windows/Fonts/malgun.ttf"),         # Korean
]

for name, path in fonts_to_register:
    if os.path.exists(path):
        try:
            pdfmetrics.registerFont(TTFont(name, path))
            registered_fonts[name] = True
            print(f"Registered Windows font: {name}")
        except Exception as e:
            print(f"Failed to register font {name} from {path}: {e}")

# Try to register Chinese, Japanese, and Indic fonts which are usually .ttc files on Windows
ttc_fonts = [
    ("Nirmala", "C:/Windows/Fonts/Nirmala.ttc"),       # Indic (Hindi, Telugu, Tamil, Kannada, Malayalam, Bengali, Gujarati, etc.)
    ("Microsoft YaHei", "C:/Windows/Fonts/msyh.ttc"),  # Chinese
    ("Meiryo", "C:/Windows/Fonts/meiryo.ttc"),          # Japanese
]

for name, path in ttc_fonts:
    if os.path.exists(path):
        try:
            pdfmetrics.registerFont(TTFont(name, path, index=0))
            registered_fonts[name] = True
            print(f"Registered Windows collection font: {name}")
        except Exception as e:
            try:
                pdfmetrics.registerFont(TTFont(name, path))
                registered_fonts[name] = True
                print(f"Registered Windows collection font (fallback): {name}")
            except Exception as e2:
                print(f"Failed to register TTC font {name} from {path}: {e2}")

def get_font_for_lang(lang_code: str) -> str:
    """Helper to return the best registered font for a specific language code."""
    if not lang_code:
        return "Helvetica"
        
    lang = lang_code.split("-")[0].lower()
    
    # South Asian / Indic languages (Hindi, Telugu, Tamil, Kannada, Malayalam, mr, gu, bn, pa)
    if lang in ["hi", "te", "ta", "kn", "ml", "mr", "gu", "bn", "pa"]:
        if "Nirmala" in registered_fonts:
            return "Nirmala"
            
    # Chinese
    elif lang == "zh":
        if "Microsoft YaHei" in registered_fonts:
            return "Microsoft YaHei"
            
    # Japanese
    elif lang == "ja":
        if "Meiryo" in registered_fonts:
            return "Meiryo"
            
    # Korean
    elif lang == "ko":
        if "Malgun" in registered_fonts:
            return "Malgun"
            
    # General fallback for Cyrillic, Arabic, Western languages
    if "Arial" in registered_fonts:
        return "Arial"
        
    return "Helvetica"

def get_language_name(code: str) -> str:
    if not code:
        return "Unknown"
    code_lower = code.lower().split("-")[0]
    return LANGUAGES_MAP.get(code_lower, code.upper())

class DetectionService:
    @staticmethod
    def detect_language(text: str) -> str:
        if not text or not text.strip():
            return "en"
        try:
            detected_code = detect(text)
            return detected_code
        except Exception:
            return "en"

class TranslateService:
    @staticmethod
    async def translate(text: str, source: str, target: str) -> dict:
        if not text or not text.strip():
            return {"translatedText": "", "detectedLanguage": source}

        google_key = os.getenv("GOOGLE_TRANSLATION_API_KEY")
        libre_url = os.getenv("LIBRETRANSLATE_URL", "https://translate.argosopentech.com")

        # Handle auto-detection
        detected_lang = None
        if source == "auto" or not source:
            detected_lang = DetectionService.detect_language(text)
            source_lang = detected_lang
        else:
            source_lang = source

        # Use Google Translate if API Key is available
        if google_key and google_key.strip():
            try:
                async with httpx.AsyncClient() as client:
                    url = f"https://translation.googleapis.com/language/translate/v2?key={google_key}"
                    payload = {
                        "q": [text],
                        "target": target,
                        "format": "text"
                    }
                    if source and source != "auto":
                        payload["source"] = source
                    
                    response = await client.post(url, json=payload, timeout=10.0)
                    if response.status_code == 200:
                        data = response.json()
                        translated_text = data["data"]["translations"][0]["translatedText"]
                        
                        if source == "auto" or not source:
                            google_detected = data["data"]["translations"][0].get("detectedSourceLanguage")
                            if google_detected:
                                detected_lang = google_detected

                        return {
                            "translatedText": translated_text,
                            "detectedLanguage": detected_lang or source_lang,
                            "provider": "google"
                        }
                    else:
                        print(f"Google Translation API error: {response.text}")
            except Exception as e:
                print(f"Failed to connect to Google Translation API: {e}")

        # Fallback to LibreTranslate API
        try:
            async with httpx.AsyncClient() as client:
                url = f"{libre_url.rstrip('/')}/translate"
                payload = {
                    "q": text,
                    "source": source_lang,
                    "target": target,
                    "format": "text"
                }
                response = await client.post(url, json=payload, timeout=10.0)
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "translatedText": data["translatedText"],
                        "detectedLanguage": detected_lang or source_lang,
                        "provider": "libretranslate"
                    }
                else:
                    raise HTTPException(
                        status_code=response.status_code, 
                        detail=f"LibreTranslate API returned error: {response.text}"
                    )
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503, 
                detail=f"Translation API connection failed: {str(e)}"
            )

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#1E293B")) # slate-800
        self.drawString(54, 750, "BHASHINI TRANSLATION PLATFORM")
        
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B")) # slate-500
        self.drawRightString(612 - 54, 750, "Every Language, One Voice")
        
        # Draw header line
        self.setStrokeColor(colors.HexColor("#CBD5E1")) # slate-300
        self.setLineWidth(0.5)
        self.line(54, 742, 612 - 54, 742)

        # Draw footer
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748B"))
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(612 - 54, 36, page_text)
        self.drawString(54, 36, "Generated automatically via Bhashini Platform")
        
        # Draw footer line
        self.setStrokeColor(colors.HexColor("#E2E8F0")) # slate-200
        self.setLineWidth(0.5)
        self.line(54, 50, 612 - 54, 50)
        
        self.restoreState()


class PDFService:
    @staticmethod
    def generate_translation_pdf(text: str, translated_text: str, source: str, target: str, timestamp: str) -> io.BytesIO:
        buffer = io.BytesIO()
        
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            leftMargin=54,
            rightMargin=54,
            topMargin=72,
            bottomMargin=72
        )
        
        styles = getSampleStyleSheet()
        
        # Select target font dynamically to support Unicode scripts
        src_font = get_font_for_lang(source)
        tgt_font = get_font_for_lang(target)
        
        # Determine larger fonts & line height for South Asian scripts to display complex vowel signs neatly
        is_src_indic = source.split("-")[0].lower() in ["hi", "te", "ta", "kn", "ml", "mr", "gu", "bn", "pa"]
        src_font_size = 14 if is_src_indic else 11
        src_leading = 21 if is_src_indic else 16
        
        is_tgt_indic = target.split("-")[0].lower() in ["hi", "te", "ta", "kn", "ml", "mr", "gu", "bn", "pa"]
        tgt_font_size = 14 if is_tgt_indic else 11
        tgt_leading = 21 if is_tgt_indic else 16
        
        # Standard Title & Metadata Styles using built-in Helvetica/Helvetica-Bold
        title_style = ParagraphStyle(
            name="PDFTitle",
            fontName="Helvetica-Bold",
            fontSize=24,
            leading=28,
            textColor=colors.HexColor("#0F172A"), # slate-900
            spaceAfter=15
        )
        
        section_title_style = ParagraphStyle(
            name="PDFSectionTitle",
            fontName="Helvetica-Bold",
            fontSize=14,
            leading=18,
            textColor=colors.HexColor("#1E3A8A"), # blue-900
            spaceBefore=12,
            spaceAfter=8
        )
        
        # Custom content styles mapping dynamically selected fonts & spacing parameters
        content_style_src = ParagraphStyle(
            name="PDFContentSrc",
            fontName=src_font,
            fontSize=src_font_size,
            leading=src_leading,
            textColor=colors.HexColor("#334155"), # slate-700
            spaceAfter=12
        )

        content_style_tgt = ParagraphStyle(
            name="PDFContentTgt",
            fontName=tgt_font,
            fontSize=tgt_font_size,
            leading=tgt_leading,
            textColor=colors.HexColor("#1E293B"), # slate-800
            spaceAfter=12
        )
        
        meta_label_style = ParagraphStyle(
            name="PDFMetaLabel",
            fontName="Helvetica-Bold",
            fontSize=9,
            leading=11,
            textColor=colors.HexColor("#475569"), # slate-600
        )
        
        meta_value_style = ParagraphStyle(
            name="PDFMetaValue",
            fontName="Helvetica",
            fontSize=9,
            leading=11,
            textColor=colors.HexColor("#1E293B"), # slate-800
        )

        story = []
        
        story.append(Spacer(1, 10))
        story.append(Paragraph("Translation Report", title_style))
        story.append(Spacer(1, 5))
        
        # Metadata Card
        src_lang_name = get_language_name(source)
        tgt_lang_name = get_language_name(target)
        
        if not timestamp:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        meta_data = [
            [
                Paragraph("Source Language:", meta_label_style),
                Paragraph(src_lang_name, meta_value_style),
                Paragraph("Target Language:", meta_label_style),
                Paragraph(tgt_lang_name, meta_value_style),
            ],
            [
                Paragraph("Generated On:", meta_label_style),
                Paragraph(timestamp, meta_value_style),
                Paragraph("Platform:", meta_label_style),
                Paragraph("Bhashini", meta_value_style),
            ]
        ]
        
        meta_table = Table(meta_data, colWidths=[100, 152, 100, 152])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")), # slate-50 background
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#E2E8F0")), # slate-200 border
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#F1F5F9")), # slate-100 grid
            ('PADDING', (0, 0), (-1, -1), 8),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        
        story.append(meta_table)
        story.append(Spacer(1, 20))
        
        # Section: Original Text
        story.append(Paragraph("Original Text", section_title_style))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#E2E8F0"), spaceAfter=10, spaceBefore=2))
        
        formatted_orig = text.replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br/>")
        story.append(Paragraph(formatted_orig, content_style_src))
        story.append(Spacer(1, 15))
        
        # Section: Translation
        story.append(Paragraph("Translated Text", section_title_style))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#3B82F6"), spaceAfter=10, spaceBefore=2)) # blue-500 colored bar
        
        formatted_trans = translated_text.replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br/>")
        story.append(Paragraph(formatted_trans, content_style_tgt))
        
        # Build Document
        doc.build(story, canvasmaker=NumberedCanvas)
        
        buffer.seek(0)
        return buffer
