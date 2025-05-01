import { create } from 'zustand';
import { PDFService } from '../services/pdf.service';
import { PDFDocument, PDFLoadingState, PDFNavigationState } from '../types/pdf.types';

interface PDFStore {
  // State
  document: PDFDocument | null;
  loading: PDFLoadingState;
  navigation: PDFNavigationState;

  // Actions
  loadDocument: (file: File) => Promise<void>;
  setCurrentPage: (pageNumber: number) => void;
  setZoom: (zoom: number) => void;
  resetStore: () => void;
}

const initialLoadingState: PDFLoadingState = {
  isLoading: false,
  progress: 0,
  error: null,
};

const initialNavigationState: PDFNavigationState = {
  currentPage: 1,
  zoom: 1.0,
};

export const usePDFStore = create<PDFStore>((set, get) => ({
  // Initial state
  document: null,
  loading: initialLoadingState,
  navigation: initialNavigationState,

  // Actions
  loadDocument: async (file: File) => {
    set({ loading: { ...initialLoadingState, isLoading: true } });

    const validationError = PDFService.validatePDFFile(file);
    if (validationError) {
      set({ 
        loading: { 
          isLoading: false, 
          progress: 0, 
          error: validationError 
        } 
      });
      return;
    }

    try {
      const result = await PDFService.loadDocument(file);

      if (result.success) {
        set({
          document: result.document,
          loading: { isLoading: false, progress: 100, error: null },
          navigation: {
            ...initialNavigationState,
            currentPage: 1
          }
        });
      } else {
        set({
          loading: {
            isLoading: false,
            progress: 0,
            error: result.error
          }
        });
      }
    } catch (error) {
      set({
        loading: {
          isLoading: false,
          progress: 0,
          error: {
            type: 'UNKNOWN_ERROR',
            message: 'An unexpected error occurred',
            details: error
          }
        }
      });
    }
  },

  setCurrentPage: (pageNumber: number) => {
    const { document, navigation } = get();
    if (!document) return;

    const newPage = Math.max(1, Math.min(pageNumber, document.totalPages));
    set({
      navigation: {
        ...navigation,
        currentPage: newPage
      }
    });
  },

  setZoom: (zoom: number) => {
    const { navigation } = get();
    set({
      navigation: {
        ...navigation,
        zoom: Math.max(0.25, Math.min(zoom, 5.0))
      }
    });
  },

  resetStore: () => {
    set({
      document: null,
      loading: initialLoadingState,
      navigation: initialNavigationState
    });
  }
}));