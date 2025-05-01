import { describe, expect, it, vi } from 'vitest';
import { PDFService } from '../pdf.service';

// Mock PDF.js global
const mockGetDocument = vi.fn();
vi.stubGlobal('pdfjsLib', {
  getDocument: mockGetDocument,
  GlobalWorkerOptions: { workerSrc: '' },
});

describe('PDFService', () => {
  describe('validatePDFFile', () => {
    it('should return error when no file is provided', () => {
      const result = PDFService.validatePDFFile(null as unknown as File);
      expect(result).toEqual({
        type: 'INVALID_FILE',
        message: 'No file provided',
      });
    });

    it('should return error for non-PDF file', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const result = PDFService.validatePDFFile(file);
      expect(result).toEqual({
        type: 'INVALID_FILE',
        message: 'File is not a PDF',
      });
    });

    it('should return error for empty file', () => {
      const file = new File([], 'test.pdf', { type: 'application/pdf' });
      const result = PDFService.validatePDFFile(file);
      expect(result).toEqual({
        type: 'INVALID_FILE',
        message: 'File is empty',
      });
    });

    it('should return null for valid PDF file', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const result = PDFService.validatePDFFile(file);
      expect(result).toBeNull();
    });
  });

  describe('loadDocument', () => {
    it('should successfully load a PDF document', async () => {
      const mockPdf = {
        numPages: 2,
        getPage: vi.fn().mockImplementation((pageNum) => ({
          getViewport: () => ({
            width: 100,
            height: 200,
            rotation: 0,
          }),
          getTextContent: () => Promise.resolve({
            items: [{ str: `Page ${pageNum} content` }],
          }),
        })),
      };

      mockGetDocument.mockReturnValue({
        promise: Promise.resolve(mockPdf),
      });

      const file = new File(['pdf content'], 'test.pdf', { type: 'application/pdf' });
      file.arrayBuffer = () => Promise.resolve(new ArrayBuffer(8));
      const result = await PDFService.loadDocument(file);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.document).toEqual({
          id: expect.any(String),
          name: 'test.pdf',
          totalPages: 2,
          pages: [
            {
              text: 'Page 1 content',
              metadata: {
                pageNumber: 1,
                width: 100,
                height: 200,
                rotation: 0,
              },
            },
            {
              text: 'Page 2 content',
              metadata: {
                pageNumber: 2,
                width: 100,
                height: 200,
                rotation: 0,
              },
            },
          ],
        });
      }
    });

    it('should handle loading errors', async () => {
      mockGetDocument.mockReturnValue({
        promise: Promise.reject(new Error('Failed to load')),
      });

      const file = new File(['invalid pdf'], 'test.pdf', { type: 'application/pdf' });
      file.arrayBuffer = () => Promise.resolve(new ArrayBuffer(8));
      const result = await PDFService.loadDocument(file);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toEqual({
          type: 'LOAD_ERROR',
          message: 'Failed to load PDF file',
          details: expect.any(Error),
        });
      }
    });

    it('should handle page parsing errors', async () => {
      const mockPdf = {
        numPages: 1,
        getPage: vi.fn().mockImplementation(() => {
          throw new Error('Failed to parse page');
        }),
      };

      mockGetDocument.mockReturnValue({
        promise: Promise.resolve(mockPdf),
      });

      const file = new File(['pdf content'], 'test.pdf', { type: 'application/pdf' });
      file.arrayBuffer = () => Promise.resolve(new ArrayBuffer(8));
      const result = await PDFService.loadDocument(file);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toEqual({
          type: 'PARSE_ERROR',
          message: 'Failed to parse page 1',
          details: expect.any(Error),
        });
      }
    });
  });
});