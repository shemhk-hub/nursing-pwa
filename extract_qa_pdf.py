#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
PDF Text Extraction Script
Extracts text from QA.pdf and saves it as readable format
"""

import sys
import os

# Try different PDF libraries
try:
    import PyPDF2
    HAS_PYPDF2 = True
except ImportError:
    HAS_PYPDF2 = False

try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except ImportError:
    HAS_PDFPLUMBER = False

try:
    from pypdf import PdfReader
    HAS_PYPDF = True
except ImportError:
    HAS_PYPDF = False

def extract_with_pdfplumber(pdf_path):
    """Extract text using pdfplumber"""
    print("[*] Using pdfplumber to extract text...")
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text = ""
            for i, page in enumerate(pdf.pages, 1):
                text += f"\n{'='*80}\nPAGE {i}\n{'='*80}\n"
                text += page.extract_text() or ""
            return text
    except Exception as e:
        print(f"[ERROR] pdfplumber failed: {e}")
        return None

def extract_with_pypdf2(pdf_path):
    """Extract text using PyPDF2"""
    print("[*] Using PyPDF2 to extract text...")
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for i, page in enumerate(reader.pages, 1):
                text += f"\n{'='*80}\nPAGE {i}\n{'='*80}\n"
                text += page.extract_text() or ""
            return text
    except Exception as e:
        print(f"[ERROR] PyPDF2 failed: {e}")
        return None

def extract_with_pypdf(pdf_path):
    """Extract text using pypdf"""
    print("[*] Using pypdf to extract text...")
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for i, page in enumerate(reader.pages, 1):
            text += f"\n{'='*80}\nPAGE {i}\n{'='*80}\n"
            text += page.extract_text() or ""
        return text
    except Exception as e:
        print(f"[ERROR] pypdf failed: {e}")
        return None

def main():
    pdf_path = r"C:\Users\shemh\Downloads\QA.pdf"

    print("[INFO] PDF Extraction Script")
    print(f"[INFO] Target PDF: {pdf_path}")
    print("[INFO] Available libraries:")
    print(f"[INFO]   - pdfplumber: {'YES' if HAS_PDFPLUMBER else 'NO'}")
    print(f"[INFO]   - PyPDF2: {'YES' if HAS_PYPDF2 else 'NO'}")
    print(f"[INFO]   - pypdf: {'YES' if HAS_PYPDF else 'NO'}")
    print()

    if not os.path.exists(pdf_path):
        print(f"[ERROR] PDF not found at: {pdf_path}")
        return False

    text = None

    # Try each library in order of preference
    if HAS_PDFPLUMBER:
        text = extract_with_pdfplumber(pdf_path)
    elif HAS_PYPDF2:
        text = extract_with_pypdf2(pdf_path)
    elif HAS_PYPDF:
        text = extract_with_pypdf(pdf_path)

    if text is None:
        print("\n[ERROR] All extraction methods failed!")
        print("\n[INFO] To fix this, install required packages:")
        print("[INFO]    pip install pdfplumber")
        print("[INFO]    OR")
        print("[INFO]    pip install PyPDF2")
        print("[INFO]    OR")
        print("[INFO]    pip install pypdf")
        return False

    # Save extracted text
    output_path = r"C:\Users\shemh\OneDrive\Desktop\nursing-pwa\QA_EXTRACTED.txt"
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(text)

    print(f"\n[SUCCESS] Text extracted successfully!")
    print(f"[INFO] Saved to: {output_path}")
    print(f"[INFO] Total characters: {len(text)}")
    print(f"[INFO] Approximate pages: {len(text.split('PAGE')) - 1}")

    # Print first 2000 characters as preview
    print("\n" + "="*80)
    print("PREVIEW (First 2000 characters):")
    print("="*80)
    preview = text[:2000]
    print(preview)
    print("\n... [content continues] ...")

    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
