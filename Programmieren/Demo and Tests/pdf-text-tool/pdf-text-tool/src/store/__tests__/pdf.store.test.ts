import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePDFStore } from '../pdf.store';
import { PDFService } from '../../services/pdf.service';

vi.mock('../../services/pdf.service', () => ({
  PDFService: {
    validatePDFFile: vi.fn(),
    loadDocument: vi.fn(),
  },
}));

describe('PDFStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePDFStore.getState().resetStore();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = usePDFStore.getState();
      expect(state.document).toBeNull();
      expect(state.loading).toEqual({
        isLoading: false,
        progress: 0,
        error: null,
      });
      expect(state.navigation).toEqual({
        currentPage: 1,
        zoom: 1.0,
      });
    });
  });

  describe('loadDocument', () => {
    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const mockDocument = {
      id: '123',
      name: 'test.pdf',
      totalPages: 2,
      pages: [
        { text: 'page 1', metadata: { pageNumber: 1, width: 100, height: 100, rotation: 0 } },
        { text: 'page 2', metadata: { pageNumber: 2, width: 100, height: 100, rotation: 0 } },
      ],
    };

    it('should handle successful document load', async () => {
      vi.mocked(PDFService.validatePDFFile).mockReturnValue(null);
      vi.mocked(PDFService.loadDocument).mockResolvedValue({
        success: true,
        document: mockDocument,
      });

      await usePDFStore.getState().loadDocument(mockFile);
      const state = usePDFStore.getState();

      expect(state.document).toEqual(mockDocument);
      expect(state.loading.isLoading).toBe(false);
      expect(state.loading.progress).toBe(100);
      expect(state.loading.error).toBeNull();
      expect(state.navigation.currentPage).toBe(1);
    });

    it('should handle validation error', async () => {
      const validationError = { type: 'INVALID_FILE', message: 'Invalid file' };
      vi.mocked(PDFService.validatePDFFile).mockReturnValue(validationError);

      await usePDFStore.getState().loadDocument(mockFile);
      const state = usePDFStore.getState();

      expect(state.document).toBeNull();
      expect(state.loading.isLoading).toBe(false);
      expect(state.loading.error).toEqual(validationError);
    });

    it('should handle load error', async () => {
      vi.mocked(PDFService.validatePDFFile).mockReturnValue(null);
      vi.mocked(PDFService.loadDocument).mockResolvedValue({
        success: false,
        error: { type: 'LOAD_ERROR', message: 'Failed to load' },
      });

      await usePDFStore.getState().loadDocument(mockFile);
      const state = usePDFStore.getState();

      expect(state.document).toBeNull();
      expect(state.loading.isLoading).toBe(false);
      expect(state.loading.error).toEqual({ type: 'LOAD_ERROR', message: 'Failed to load' });
    });
  });

  describe('navigation actions', () => {
    beforeEach(() => {
      usePDFStore.setState({
        document: {
          id: '123',
          name: 'test.pdf',
          totalPages: 3,
          pages: [
            { text: 'page 1', metadata: { pageNumber: 1, width: 100, height: 100, rotation: 0 } },
            { text: 'page 2', metadata: { pageNumber: 2, width: 100, height: 100, rotation: 0 } },
            { text: 'page 3', metadata: { pageNumber: 3, width: 100, height: 100, rotation: 0 } },
          ],
        },
      });
    });

    describe('setCurrentPage', () => {
      it('should set page within valid range', () => {
        const { setCurrentPage } = usePDFStore.getState();
        
        setCurrentPage(2);
        expect(usePDFStore.getState().navigation.currentPage).toBe(2);
      });

      it('should clamp page number to valid range', () => {
        const { setCurrentPage } = usePDFStore.getState();
        
        setCurrentPage(0);
        expect(usePDFStore.getState().navigation.currentPage).toBe(1);

        setCurrentPage(5);
        expect(usePDFStore.getState().navigation.currentPage).toBe(3);
      });

      it('should do nothing if no document is loaded', () => {
        usePDFStore.setState({ document: null });
        const { setCurrentPage } = usePDFStore.getState();
        
        setCurrentPage(2);
        expect(usePDFStore.getState().navigation.currentPage).toBe(1);
      });
    });

    describe('setZoom', () => {
      it('should set zoom within valid range', () => {
        const { setZoom } = usePDFStore.getState();
        
        setZoom(2);
        expect(usePDFStore.getState().navigation.zoom).toBe(2);
      });

      it('should clamp zoom level to valid range', () => {
        const { setZoom } = usePDFStore.getState();
        
        setZoom(0.1);
        expect(usePDFStore.getState().navigation.zoom).toBe(0.25);

        setZoom(6);
        expect(usePDFStore.getState().navigation.zoom).toBe(5);
      });
    });
  });

  describe('resetStore', () => {
    it('should reset store to initial state', () => {
      // Set some non-initial state
      usePDFStore.setState({
        document: {
          id: '123',
          name: 'test.pdf',
          totalPages: 1,
          pages: [{ text: 'test', metadata: { pageNumber: 1, width: 100, height: 100, rotation: 0 } }],
        },
        loading: { isLoading: true, progress: 50, error: null },
        navigation: { currentPage: 2, zoom: 2.0 },
      });

      // Reset store
      usePDFStore.getState().resetStore();

      // Verify initial state
      const state = usePDFStore.getState();
      expect(state.document).toBeNull();
      expect(state.loading).toEqual({
        isLoading: false,
        progress: 0,
        error: null,
      });
      expect(state.navigation).toEqual({
        currentPage: 1,
        zoom: 1.0,
      });
    });
  });
});