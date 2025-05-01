import { screen } from '@testing-library/react';
import { render } from './test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

// Mock react-dropzone
vi.mock('react-dropzone', () => ({
  useDropzone: () => ({
    getRootProps: () => ({}),
    getInputProps: () => ({}),
    isDragActive: false
  })
}));

// Mock PDF store
vi.mock('./store/pdf.store', () => ({
  usePDFStore: vi.fn((selector) => {
    const state = {
      document: null,
      loading: { isLoading: false, progress: 0, error: null },
      navigation: { currentPage: 1, zoom: 1 },
      loadDocument: vi.fn(),
      setCurrentPage: vi.fn(),
      setZoom: vi.fn(),
      resetStore: vi.fn()
    };
    return selector(state);
  })
}));

// Mock react-icons
vi.mock('react-icons/fi', () => ({
  FiUpload: () => 'FiUpload',
  FiFile: () => 'FiFile',
  FiTrash2: () => 'FiTrash2',
  FiChevronLeft: () => 'FiChevronLeft',
  FiChevronRight: () => 'FiChevronRight',
  FiZoomIn: () => 'FiZoomIn',
  FiZoomOut: () => 'FiZoomOut',
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload section when no document is loaded', () => {
    render(<App />);
    expect(screen.getByText(/drag and drop a pdf file here/i)).toBeInTheDocument();
  });
});