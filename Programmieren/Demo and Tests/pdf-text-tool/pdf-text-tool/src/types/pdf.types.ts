import type { PDFDocumentProxy } from 'pdfjs-dist';

// Add global type declaration for UMD build
declare global {
  interface Window {
    pdfjsLib: {
      getDocument: (data: { data: ArrayBuffer }) => { promise: Promise<PDFDocumentProxy> };
      GlobalWorkerOptions: { workerSrc: string };
    };
  }
  // eslint-disable-next-line no-var
  var pdfjsLib: Window['pdfjsLib'];
}

export interface PDFPageMetadata {
  pageNumber: number;
  width: number;
  height: number;
  rotation: number;
}

export interface PDFTextItem {
  str: string;
  transform: any[]; // [scaleX, skewX, skewY, scaleY, offsetX, offsetY] - Using any[] to match pdfjs-dist type
  fontName: string;
  width: number;
  height: number;
  dir: string; // 'ltr' or 'rtl'
}

export interface PDFTextLine {
  items: PDFTextItem[];
  // Add properties for line bounding box or position if needed later
}

export interface PDFPageContent {
  lines: PDFTextLine[];
  metadata: PDFPageMetadata;
}

export interface PDFDocument {
  id: string;
  name: string;
  totalPages: number;
  pages: PDFPageContent[];
}

export interface PDFLoadingState {
  isLoading: boolean;
  progress: number;
  error: PDFError | null;
}

export interface PDFNavigationState {
  currentPage: number;
  zoom: number;
}

export type PDFErrorType = 
  | 'LOAD_ERROR'
  | 'PARSE_ERROR'
  | 'INVALID_FILE'
  | 'UNKNOWN_ERROR';

export interface PDFError {
  type: PDFErrorType;
  message: string;
  details?: unknown;
}

export type PDFLoadResult = {
  success: true;
  document: PDFDocument;
} | {
  success: false;
  error: PDFError;
};