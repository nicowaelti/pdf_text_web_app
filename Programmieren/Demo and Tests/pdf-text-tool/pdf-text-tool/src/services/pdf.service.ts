import type { PDFDocumentProxy } from 'pdfjs-dist';
import { PDFDocument, PDFError, PDFLoadResult, PDFPageContent, PDFPageMetadata, PDFTextItem, PDFTextLine } from '../types/pdf.types';

// Initialize PDF.js worker
window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

interface PDFTextItemCandidate {
  str: string;
  transform: number[];
  fontName: string;
  width: number;
  height: number;
  dir: string;
}

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

  // Type guard to check if an item is a PDFTextItem
  private static isPDFTextItem(item: unknown): item is PDFTextItem {
    const candidate = item as PDFTextItemCandidate;
    return (
      typeof item === 'object' &&
      item !== null &&
      'str' in candidate &&
      'transform' in candidate &&
      Array.isArray(candidate.transform) &&
      candidate.transform.length === 6 &&
      candidate.transform.every((t: unknown) => typeof t === 'number') &&
      'fontName' in candidate &&
      'width' in candidate &&
      'height' in candidate &&
      'dir' in candidate
    );
  }

  private static async extractPages(pdf: PDFDocumentProxy): Promise<PDFPageContent[]> {
    const pages: PDFPageContent[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.0 });
        const textContent = await page.getTextContent();
        
        const metadata: PDFPageMetadata = {
          pageNumber: i,
          width: viewport.width,
          height: viewport.height,
          rotation: viewport.rotation,
        };

        const filteredItems = textContent.items.filter(this.isPDFTextItem) as PDFTextItem[];
        const textItems = filteredItems.map((item: PDFTextItem) => ({
          ...item,
          // Removed aggressive rounding of transform values
        }));

        // Group text items into lines based on vertical proximity
        const lines: PDFTextLine[] = [];
        const yTolerance = 2; // Tolerance for vertical grouping (adjust as needed)

        // Sort items primarily by vertical position (descending) and secondarily by horizontal position (ascending)
        const sortedItems = [...textItems].sort((a, b) => {
          const yDiff = b.transform[5] - a.transform[5];
          if (Math.abs(yDiff) > yTolerance) {
            return yDiff;
          }
          return a.transform[4] - b.transform[4];
        });

        let currentLine: PDFTextItem[] = [];

        sortedItems.forEach((item, index) => {
          if (currentLine.length === 0) {
            currentLine.push(item);
          } else {
            const lastItem = currentLine[currentLine.length - 1];
            const yDiff = Math.abs(item.transform[5] - lastItem.transform[5]);
            const xDiff = item.transform[4] - lastItem.transform[4];
            const lastItemWidth = Math.abs(lastItem.transform[0] * lastItem.width); // Estimate width

            // Check if the item is on the same line based on vertical proximity and horizontal position
            if (yDiff < yTolerance && xDiff > -lastItemWidth * 0.5) { // Allow for slight horizontal overlap
              currentLine.push(item);
            } else {
              // New line
              lines.push({ items: currentLine });
              currentLine = [item];
            }
          }

          // Add the last line after the loop
          if (index === sortedItems.length - 1 && currentLine.length > 0) {
            lines.push({ items: currentLine });
          }
        });

        // Sort items within each line by horizontal position
        lines.forEach(line => {
          line.items.sort((a, b) => a.transform[4] - b.transform[4]);
        });

        pages.push({ lines, metadata });
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