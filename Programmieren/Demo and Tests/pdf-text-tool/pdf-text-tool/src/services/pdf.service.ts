import type { PDFDocumentProxy } from 'pdfjs-dist';
import { PDFDocument, PDFError, PDFLoadResult, PDFPageContent, PDFPageMetadata } from '../types/pdf.types';

// Initialize PDF.js worker
window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

export class PDFService {
  private static createError(type: PDFError['type'], message: string, details?: unknown): PDFError {
    return { type, message, details };
  }

  static async loadDocument(file: File): Promise<PDFLoadResult> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      try {
        const pages = await this.extractPages(pdf);
        const document: PDFDocument = {
          id: crypto.randomUUID(),
          name: file.name,
          totalPages: pdf.numPages,
          pages,
        };
        return { success: true, document };
      } catch (error: unknown) {
        // Pass the error directly if it's already a PDFError, otherwise create new error
        if (error && typeof error === 'object' && 'type' in error && error.type === 'PARSE_ERROR') {
          return { success: false, error: error as PDFError };
        }
        return {
          success: false,
          error: this.createError('PARSE_ERROR', 'Failed to parse page 1', error instanceof Error ? error : new Error('Unknown error')),
        };
      }
    } catch (error: unknown) {
      return {
        success: false,
        error: this.createError('LOAD_ERROR', 'Failed to load PDF file', error),
      };
    }
  }

  private static async extractPages(pdf: PDFDocumentProxy): Promise<PDFPageContent[]> {
    const pages: PDFPageContent[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.0 });
        
        const metadata: PDFPageMetadata = {
          pageNumber: i,
          width: viewport.width,
          height: viewport.height,
          rotation: viewport.rotation,
        };

        const textContent = await page.getTextContent();
        const text = textContent.items
          .map(item => 'str' in item ? item.str : '')
          .join(' ')
          .trim();

        pages.push({
          text,
          metadata,
        });
      } catch (error: unknown) {
        throw this.createError('PARSE_ERROR', `Failed to parse page ${i}`, error);
      }
    }

    return pages;
  }

  static validatePDFFile(file: File): PDFError | null {
    if (!file) {
      return this.createError('INVALID_FILE', 'No file provided');
    }

    if (!file.type.includes('pdf')) {
      return this.createError('INVALID_FILE', 'File is not a PDF');
    }

    if (file.size === 0) {
      return this.createError('INVALID_FILE', 'File is empty');
    }

    return null;
  }
}