import io
from typing import Tuple

import chardet


def extract_from_txt(content: bytes) -> str:
    detected = chardet.detect(content)
    encoding = detected.get("encoding", "utf-8")
    if encoding.lower() == "windows-1252":
        encoding = "windows-1251"
    try:
        return content.decode(encoding)
    except UnicodeDecodeError:
        return content.decode("utf-8", errors="ignore")


def extract_from_pdf(content: bytes) -> Tuple[str, int]:
    import PyPDF2

    pdf_file = io.BytesIO(content)
    reader = PyPDF2.PdfReader(pdf_file)
    text_parts = []
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text_parts.append(page_text)
    return "\n".join(text_parts), len(reader.pages)


def extract_from_pdf_plumber(content: bytes) -> Tuple[str, int]:
    import pdfplumber

    pdf_file = io.BytesIO(content)
    with pdfplumber.open(pdf_file) as pdf:
        text_parts = []
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
        return "\n".join(text_parts), len(pdf.pages)


def extract_from_docx(content: bytes) -> str:
    import docx

    doc_file = io.BytesIO(content)
    doc = docx.Document(doc_file)
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())


def extract_text_from_file(content: bytes, filename: str) -> Tuple[str, int]:
    filename_lower = filename.lower()
    pages = 1

    if filename_lower.endswith(".txt"):
        text = extract_from_txt(content)
    elif filename_lower.endswith(".pdf"):
        try:
            text, pages = extract_from_pdf(content)
            if not text.strip():
                text, pages = extract_from_pdf_plumber(content)
        except Exception:
            text, pages = extract_from_pdf_plumber(content)
    elif filename_lower.endswith(".docx"):
        text = extract_from_docx(content)
    else:
        raise ValueError(f"Unsupported file format: {filename}")

    if not text.strip():
        raise ValueError("No text could be extracted from file")

    return text, pages
