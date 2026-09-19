"""
SPARK Day 18 Implementation Report PDF Generator.
Builds an executive, publication-grade PDF report documenting the SPARK application foundation.
"""

import sys
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas


class NumberedCanvas(canvas.Canvas):
    """Adds running headers and footers with accurate 'Page X of Y' numbering."""
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "SPARK — AI-Powered Badminton Shot Recognition • Day 18 Foundation")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(54, 742, letter[0] - 54, 742)
            
        # Footer
        footer_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 54, 36, footer_text)
        self.drawString(54, 36, "CONFIDENTIAL & PROPRIETARY — ACADEMIC RESEARCH PROJECT")
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 48, letter[0] - 54, 48)
        
        self.restoreState()


def build_pdf(output_path: str):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Brand Palette
    c_primary = colors.HexColor("#0F172A")    # Deep slate
    c_accent = colors.HexColor("#059669")     # Emerald green
    c_accent_light = colors.HexColor("#ECFDF5")
    c_text_dark = colors.HexColor("#1E293B")
    c_text_muted = colors.HexColor("#64748B")
    c_border = colors.HexColor("#CBD5E1")
    
    # Custom Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=c_primary,
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=c_accent,
        spaceAfter=15
    )
    
    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=c_primary,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )
    
    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=c_accent,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=c_text_dark,
        spaceAfter=6
    )
    
    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=c_text_dark,
        leftIndent=14,
        firstLineIndent=-10,
        spaceAfter=3
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#0F172A")
    )
    
    story = []
    
    # -------------------------------------------------------------
    # Cover / Header Banner
    # -------------------------------------------------------------
    story.append(Paragraph("SPARK — DAY 18 IMPLEMENTATION REPORT", title_style))
    story.append(Paragraph("APPLICATION PROJECT FOUNDATION & VIDEO UPLOAD ARCHITECTURE", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=c_accent, spaceBefore=0, spaceAfter=14))
    
    # Metadata Table
    meta_data = [
        [
            Paragraph("<b>Project:</b> SPARK Badminton Shot Recognition", body_style),
            Paragraph("<b>Date:</b> 18 September 2026", body_style)
        ],
        [
            Paragraph("<b>Repository:</b> spark-badminton-shot-recognition", body_style),
            Paragraph("<b>Phase:</b> Application Development Foundation", body_style)
        ],
        [
            Paragraph("<b>Team:</b> Sirish Chandra, Priyanshu, Ashwidha, Thakur Swetan Singh, Kaustub", body_style),
            Paragraph("<b>Status:</b> Completed & Verified", body_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[310, 194])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ('BOX', (0, 0), (-1, -1), 0.5, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#F1F5F9")),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))
    
    # -------------------------------------------------------------
    # 1. Executive Summary & Day 18 Objective
    # -------------------------------------------------------------
    story.append(Paragraph("1. Executive Summary & Scope Boundary", h1_style))
    story.append(Paragraph(
        "Day 18 marks the official transition from core ML research to full-stack application development. "
        "The objective was to create a clean, modern, production-grade application project structure for SPARK, "
        "establishing the frontend foundation, the backend API foundation, and the end-to-end video ingestion "
        "and preview workflow without touching or altering existing research checkpoints or datasets.",
        body_style
    ))
    story.append(Paragraph(
        "<b>Key Principle:</b> Strictly zero cleanup and zero modification of existing research assets. "
        "The existing research folders (including EXP24 multimodal transformer-BiLSTM checkpoints, ShuttleSet annotations, "
        "and ResNet spatial feature caches in <code>D:\\PS_DATA</code>) remain completely untouched as reference assets.",
        body_style
    ))
    story.append(Spacer(1, 8))
    
    # -------------------------------------------------------------
    # 2. Project Architecture & Directory Layout
    # -------------------------------------------------------------
    story.append(Paragraph("2. Application Directory Layout", h1_style))
    story.append(Paragraph(
        "The application is housed in a clean, self-contained project root (<code>D:\\PS_DATA\\SPARK</code>) "
        "connected directly to the GitHub remote repository:",
        body_style
    ))
    
    dir_tree = (
        "SPARK/\n"
        "├── frontend/             # Next.js 16 + React 19 + TypeScript + Tailwind CSS\n"
        "│   ├── app/              # App Router (page.tsx, layout.tsx, globals.css)\n"
        "│   ├── components/       # UI Components (Header, Uploader, Preview, Results)\n"
        "│   ├── lib/              # API Client (health check, multipart upload)\n"
        "│   ├── types/            # TypeScript interfaces & classification definitions\n"
        "│   └── .env.example      # Configurable backend URL template\n"
        "├── backend/              # FastAPI + Uvicorn + Pydantic\n"
        "│   ├── app/\n"
        "│   │   ├── main.py       # FastAPI application, CORS, root & health routes\n"
        "│   │   ├── api/video.py  # Secure multipart video upload router\n"
        "│   │   ├── core/config.py# Dynamic configuration (MAX_UPLOAD_SIZE_MB)\n"
        "│   │   ├── schemas/      # Pydantic response models\n"
        "│   │   ├── services/     # ML inference boundary (Day 19 placeholder)\n"
        "│   │   └── utils/        # Security, sanitization & traversal defenses\n"
        "│   └── storage/uploads/  # Secure local uploaded video repository\n"
        "├── model/                # Architecture boundary documentation & checkpoints\n"
        "├── data/                 # Small runtime fixtures (large raw videos gitignored)\n"
        "├── docs/                 # Implementation reports & technical specifications\n"
        "├── results/              # Output analytics & evaluation metrics\n"
        "├── tests/                # Automated Pytest suite (8/8 passing)\n"
        "├── .gitignore            # Comprehensive rules (ignoring media, weights, venv)\n"
        "└── README.md             # Complete scientific & deployment documentation"
    )
    
    tree_table = Table([[Paragraph(f"<font face='Courier' size='7.5'>{dir_tree.replace(chr(10), '<br/>')}</font>", body_style)]], colWidths=[504])
    tree_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F1F5F9")),
        ('BOX', (0, 0), (-1, -1), 0.5, c_border),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(tree_table)
    story.append(Spacer(1, 10))
    
    # -------------------------------------------------------------
    # 3. Backend Implementation & API Specifications
    # -------------------------------------------------------------
    story.append(Paragraph("3. Backend Implementation & API Specifications", h1_style))
    story.append(Paragraph(
        "The backend is developed using <b>FastAPI</b>, <b>Uvicorn</b>, and <b>Pydantic</b>. "
        "It exposes modular, production-ready endpoints with automatic OpenAPI documentation at <code>/docs</code>.",
        body_style
    ))
    
    api_headers = [Paragraph("<b>Method</b>", body_style), Paragraph("<b>Endpoint</b>", body_style), Paragraph("<b>Status</b>", body_style), Paragraph("<b>Description & Contract</b>", body_style)]
    api_rows = [
        api_headers,
        [
            Paragraph("GET", code_style),
            Paragraph("/", code_style),
            Paragraph("200 OK", body_style),
            Paragraph("Returns SPARK system identification, status, and interactive docs URL.", body_style)
        ],
        [
            Paragraph("GET", code_style),
            Paragraph("/health", code_style),
            Paragraph("200 OK", body_style),
            Paragraph("Returns <code>{\"status\": \"ok\", \"project\": \"SPARK\", \"service\": \"badminton-shot-recognition-api\"}</code>.", body_style)
        ],
        [
            Paragraph("POST", code_style),
            Paragraph("/api/video/upload", code_style),
            Paragraph("201 Created", body_style),
            Paragraph("Accepts multipart video (.mp4, .mov, .avi, .mkv, .webm), validates size against configurable MAX_UPLOAD_SIZE_MB, generates UUID, saves safely, returns video_id.", body_style)
        ]
    ]
    api_table = Table(api_rows, colWidths=[55, 125, 65, 259])
    api_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_accent_light),
        ('BOX', (0, 0), (-1, -1), 0.5, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(api_table)
    story.append(Spacer(1, 10))

    # -------------------------------------------------------------
    # 4. Upload Security & Hardening
    # -------------------------------------------------------------
    story.append(Paragraph("4. Upload Security Protocols & Hardening", h1_style))
    story.append(Paragraph(
        "Because video uploads can pose security and resource exhaustion risks, the SPARK backend incorporates strict defenses:",
        body_style
    ))
    story.append(Paragraph("• <b>Filename Sanitization:</b> Discards directory paths, null bytes, and shell metacharacters, eliminating path traversal risks (e.g. <code>../../etc/passwd</code>).", bullet_style))
    story.append(Paragraph("• <b>UUID Server-Side Storage:</b> Uploaded files are persisted as <code>{video_id}_{sanitized_name}</code>, preventing file overwriting and name collisions.", bullet_style))
    story.append(Paragraph("• <b>Format Whitelisting:</b> Strictly allows <code>.mp4</code>, <code>.mov</code>, <code>.avi</code>, <code>.mkv</code>, <code>.webm</code>. Executable and script extensions are rejected immediately with HTTP 400.", bullet_style))
    story.append(Paragraph("• <b>Configurable File Size Limit:</b> Configured via <code>MAX_UPLOAD_SIZE_MB</code> (default: 200MB, easily increased for full match files via environment variable). Streaming chunked disk writes abort and delete partial files if size exceeds the threshold, returning HTTP 413.", bullet_style))
    story.append(Paragraph("• <b>Internal Path Obfuscation:</b> Raw disk storage paths are never leaked in client responses; clients only receive the sanitized filename and generated <code>video_id</code>.", bullet_style))
    story.append(Spacer(1, 10))

    # -------------------------------------------------------------
    # 5. Frontend Architecture & User Experience
    # -------------------------------------------------------------
    story.append(Paragraph("5. Frontend Architecture & User Interface", h1_style))
    story.append(Paragraph(
        "The frontend is implemented with <b>Next.js</b> (App Router), <b>React 19</b>, and <b>TypeScript</b>, "
        "adhering to a dark premium sports-technology aesthetic:",
        body_style
    ))
    story.append(Paragraph("• <b>Brand Identity:</b> High-contrast obsidian slate background (<code>#080C14</code>) paired with emerald badminton court accents and subtle court grid lines.", bullet_style))
    story.append(Paragraph("• <b>Real-Time Service Health:</b> Header incorporates an asynchronous heartbeat pill dynamically displaying whether the FastAPI backend is Online or Offline.", bullet_style))
    story.append(Paragraph("• <b>Badminton Taxonomy (5 Classes):</b> Interactive reference cards for <b>SMASH</b>, <b>CLEAR</b>, <b>DROP</b>, <b>DRIVE</b>, and <b>NET SHOT</b> based on the verified EXP24 taxonomy.", bullet_style))
    story.append(Paragraph("• <b>Drag-and-Drop Video Ingestion:</b> Supports both native file browser selection and drag-and-drop with real-time format validation.", bullet_style))
    story.append(Paragraph("• <b>Interactive HTML5 Video Preview:</b> Instant player preview with metadata inspection (file name, formatted byte size, MIME type) before initiating processing.", bullet_style))
    story.append(Paragraph("• <b>Authentic Prediction Placeholders:</b> In strict compliance with research ethics, prediction cards display genuine placeholders (<code>—</code>) without fabricating confidence or class labels.", bullet_style))
    story.append(Spacer(1, 10))

    # -------------------------------------------------------------
    # 6. Automated Testing & Verification
    # -------------------------------------------------------------
    story.append(Paragraph("6. Automated Testing & Verification", h1_style))
    story.append(Paragraph(
        "A comprehensive Pytest automated test suite (<code>tests/test_backend.py</code>) validates all backend endpoints and edge cases:",
        body_style
    ))
    
    test_headers = [Paragraph("<b>Test Case</b>", body_style), Paragraph("<b>Target Functionality</b>", body_style), Paragraph("<b>Result</b>", body_style)]
    test_rows = [
        test_headers,
        [Paragraph("<code>test_root_endpoint</code>", code_style), Paragraph("Validates service branding, title, and OpenAPI docs link", body_style), Paragraph("<font color='#059669'><b>PASSED</b></font>", body_style)],
        [Paragraph("<code>test_health_endpoint</code>", code_style), Paragraph("Validates exact JSON contract: status, project, service", body_style), Paragraph("<font color='#059669'><b>PASSED</b></font>", body_style)],
        [Paragraph("<code>test_video_upload_valid_mp4</code>", code_style), Paragraph("Validates multipart stream, 201 Created, UUID, and disk persistence", body_style), Paragraph("<font color='#059669'><b>PASSED</b></font>", body_style)],
        [Paragraph("<code>test_video_upload_other_supported_extensions</code>", code_style), Paragraph("Validates .mov, .avi, .mkv, and .webm handling", body_style), Paragraph("<font color='#059669'><b>PASSED</b></font>", body_style)],
        [Paragraph("<code>test_video_upload_invalid_extension_rejected</code>", code_style), Paragraph("Ensures .exe, .txt, .pdf are rejected with HTTP 400", body_style), Paragraph("<font color='#059669'><b>PASSED</b></font>", body_style)],
        [Paragraph("<code>test_video_upload_missing_file</code>", code_style), Paragraph("Validates empty payload handling with HTTP 422", body_style), Paragraph("<font color='#059669'><b>PASSED</b></font>", body_style)],
        [Paragraph("<code>test_filename_sanitization_and_traversal_defense</code>", code_style), Paragraph("Neutralizes directory traversal (../../) and special characters", body_style), Paragraph("<font color='#059669'><b>PASSED</b></font>", body_style)],
        [Paragraph("<code>test_unique_video_id_generation</code>", code_style), Paragraph("Confirms uniqueness across concurrent video uploads", body_style), Paragraph("<font color='#059669'><b>PASSED</b></font>", body_style)]
    ]
    test_table = Table(test_rows, colWidths=[180, 244, 80])
    test_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_accent_light),
        ('BOX', (0, 0), (-1, -1), 0.5, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(test_table)
    story.append(Spacer(1, 10))

    # -------------------------------------------------------------
    # 7. Day 19 Integration Roadmap
    # -------------------------------------------------------------
    story.append(Paragraph("7. Next Milestone: Day 19 ML Model Integration", h1_style))
    story.append(Paragraph(
        "With the application and video ingestion foundation established and verified, Day 19 will connect the verified "
        "EXP24 Multimodal Transformer-BiLSTM checkpoint to the application layer:",
        body_style
    ))
    story.append(Paragraph("1. <b>Inference Boundary Implementation:</b> Flesh out <code>backend/app/services/inference_service.py</code> to execute OpenCV video frame extraction and ResNet-18 spatial feature generation.", bullet_style))
    story.append(Paragraph("2. <b>Checkpoint Loading:</b> Safely reference the existing EXP24 model checkpoint without modifying the original training artifacts.", bullet_style))
    story.append(Paragraph("3. <b>Results Pipeline:</b> Wire the frontend results component to receive real softmax probabilities, class predictions, and latency metrics.", bullet_style))
    story.append(Spacer(1, 14))

    # Final Sign-off block
    sign_off = [
        [Paragraph("<b>Prepared by:</b> SPARK Development Team", body_style), Paragraph("<b>Approved for:</b> Day 18 Application Milestone", body_style)]
    ]
    sign_table = Table(sign_off, colWidths=[252, 252])
    sign_table.setStyle(TableStyle([
        ('LINEABOVE', (0, 0), (-1, 0), 1, c_accent),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(sign_table)
    
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Report successfully compiled to {output_path}")


if __name__ == "__main__":
    out_file = "D:\\PS_DATA\\SPARK\\docs\\DAY_18_IMPLEMENTATION_REPORT.pdf"
    if len(sys.argv) > 1:
        out_file = sys.argv[1]
    build_pdf(out_file)
