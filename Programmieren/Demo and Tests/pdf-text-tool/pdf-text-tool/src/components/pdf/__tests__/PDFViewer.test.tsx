import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PDFViewer } from '../PDFViewer';
import { usePDFStore } from '../../../store/pdf.store';

// Mock react-icons
vi.mock('react-icons/fi', () => ({
  FiChevronLeft: () => 'ChevronLeft',
  FiChevronRight: () => 'ChevronRight',
  FiZoomIn: () => 'ZoomIn',
  FiZoomOut: () => 'ZoomOut',
}));

// Mock the store
vi.mock('../../../store/pdf.store', () => ({
  usePDFStore: vi.fn(),
}));

// Test wrapper with ChakraProvider
const renderWithChakra = (component: React.ReactNode) => {
  return render(
    <ChakraProvider>{component}</ChakraProvider>
  );
};

describe('PDFViewer', () => {
  const mockDocument = {
    id: 'test-doc',
    name: 'test.pdf',
    totalPages: 3,
    pages: [
      { text: 'Page 1', metadata: { pageNumber: 1, width: 100, height: 100, rotation: 0 } },
      { text: 'Page 2', metadata: { pageNumber: 2, width: 100, height: 100, rotation: 0 } },
      { text: 'Page 3', metadata: { pageNumber: 3, width: 100, height: 100, rotation: 0 } },
    ],
  };

  const mockSetCurrentPage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (usePDFStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const store = {
        document: mockDocument,
        navigation: { currentPage: 1, zoom: 1 },
        setCurrentPage: mockSetCurrentPage,
      };
      return selector(store);
    });
  });

  it('should render nothing when no document is loaded', () => {
    (usePDFStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const store = {
        document: null,
        navigation: { currentPage: 1, zoom: 1 },
        setCurrentPage: mockSetCurrentPage,
      };
      return selector(store);
    });

    renderWithChakra(<PDFViewer />);
    expect(screen.queryByRole('main')).toBeNull();
  });

  it('should render the document content', () => {
    renderWithChakra(<PDFViewer />);
    expect(screen.getByText('Page 1')).toBeInTheDocument();
  });

  describe('keyboard navigation', () => {
    it('should handle ArrowRight key', () => {
      renderWithChakra(<PDFViewer />);
      fireEvent.keyDown(window, { key: 'ArrowRight' });
      expect(mockSetCurrentPage).toHaveBeenCalledWith(2);
    });

    it('should handle ArrowLeft key', () => {
      (usePDFStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const store = {
          document: mockDocument,
          navigation: { currentPage: 2, zoom: 1 },
          setCurrentPage: mockSetCurrentPage,
        };
        return selector(store);
      });

      renderWithChakra(<PDFViewer />);
      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      expect(mockSetCurrentPage).toHaveBeenCalledWith(1);
    });

    it('should handle Home key', () => {
      (usePDFStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const store = {
          document: mockDocument,
          navigation: { currentPage: 2, zoom: 1 },
          setCurrentPage: mockSetCurrentPage,
        };
        return selector(store);
      });

      renderWithChakra(<PDFViewer />);
      fireEvent.keyDown(window, { key: 'Home' });
      expect(mockSetCurrentPage).toHaveBeenCalledWith(1);
    });

    it('should handle End key', () => {
      renderWithChakra(<PDFViewer />);
      fireEvent.keyDown(window, { key: 'End' });
      expect(mockSetCurrentPage).toHaveBeenCalledWith(3);
    });

    it('should handle PageUp/PageDown keys', () => {
      renderWithChakra(<PDFViewer />);
      
      fireEvent.keyDown(window, { key: 'PageDown' });
      expect(mockSetCurrentPage).toHaveBeenCalledWith(2);

      fireEvent.keyDown(window, { key: 'PageUp' });
      expect(mockSetCurrentPage).toHaveBeenCalledWith(1);
    });

    describe('navigation bounds', () => {
      it('should not navigate beyond last page', () => {
        (usePDFStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
          const store = {
            document: mockDocument,
            navigation: { currentPage: mockDocument.totalPages, zoom: 1 },
            setCurrentPage: mockSetCurrentPage,
          };
          return selector(store);
        });

        renderWithChakra(<PDFViewer />);
        fireEvent.keyDown(window, { key: 'ArrowRight' });
        expect(mockSetCurrentPage).toHaveBeenCalledWith(mockDocument.totalPages);
      });

      it('should not navigate before first page', () => {
        (usePDFStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
          const store = {
            document: mockDocument,
            navigation: { currentPage: 1, zoom: 1 },
            setCurrentPage: mockSetCurrentPage,
          };
          return selector(store);
        });

        renderWithChakra(<PDFViewer />);
        fireEvent.keyDown(window, { key: 'ArrowLeft' });
        expect(mockSetCurrentPage).toHaveBeenCalledWith(1);
      });
    });
  });
});