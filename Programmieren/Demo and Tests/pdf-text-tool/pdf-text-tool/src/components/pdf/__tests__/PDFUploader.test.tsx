import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { PDFUploader } from '../PDFUploader';
import { usePDFStore } from '../../../store/pdf.store';
import React from 'react';

// Mock store
vi.mock('../../../store/pdf.store', () => ({
  usePDFStore: vi.fn()
}));

// Mock react icons
vi.mock('react-icons/fi', () => ({
  FiUpload: () => React.createElement('svg', { 'data-testid': 'upload-icon' })
}));

// Mock react-dropzone
let dropzoneConfig: { onDrop?: (files: File[]) => void } = {};

vi.mock('react-dropzone', () => ({
  useDropzone: (config: typeof dropzoneConfig) => {
    dropzoneConfig = config;
    return {
      getRootProps: () => ({
        onClick: vi.fn(),
        role: 'presentation',
        'data-testid': 'dropzone'
      }),
      getInputProps: () => ({
        type: 'file',
        accept: 'application/pdf',
        'aria-label': 'Upload PDF'
      }),
      isDragActive: false
    };
  }
}));

describe('PDFUploader', () => {
  const mockLoadDocument = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    dropzoneConfig = {};
    (usePDFStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = {
        loadDocument: mockLoadDocument,
        loading: { isLoading: false, error: null }
      };
      return selector(state);
    });
  });

  it('renders upload area', () => {
    render(
      <ChakraProvider>
        <PDFUploader />
      </ChakraProvider>
    );
    
    expect(screen.getByLabelText('Upload PDF')).toBeInTheDocument();
    expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop a PDF file here, or click to select')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    (usePDFStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = {
        loadDocument: mockLoadDocument,
        loading: { isLoading: true, error: null }
      };
      return selector(state);
    });

    render(
      <ChakraProvider>
        <PDFUploader />
      </ChakraProvider>
    );
    expect(screen.getByText('Uploading...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    const error = { type: 'INVALID_FILE' as const, message: 'Invalid file type' };
    
    (usePDFStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = {
        loadDocument: mockLoadDocument,
        loading: { isLoading: false, error }
      };
      return selector(state);
    });

    render(
      <ChakraProvider>
        <PDFUploader />
      </ChakraProvider>
    );
    expect(screen.getByTestId('error-message')).toHaveTextContent(error.message);
  });

  it('handles file selection', async () => {
    render(
      <ChakraProvider>
        <PDFUploader />
      </ChakraProvider>
    );

    const file = new File(['pdf content'], 'test.pdf', { type: 'application/pdf' });
    
    await act(async () => {
      if (dropzoneConfig.onDrop) {
        await dropzoneConfig.onDrop([file]);
      }
    });
    
    expect(mockLoadDocument).toHaveBeenCalledWith(file);
  });
});