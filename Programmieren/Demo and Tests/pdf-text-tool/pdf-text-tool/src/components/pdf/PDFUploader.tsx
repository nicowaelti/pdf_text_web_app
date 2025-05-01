import { Box, Center, Icon, Text, useColorModeValue, VStack, Alert, AlertIcon } from '@chakra-ui/react';
import { useCallback } from 'react';
import type { DropzoneOptions } from 'react-dropzone';
import { useDropzone } from 'react-dropzone';
import { FiUpload } from 'react-icons/fi';
import { usePDFStore } from '../../store/pdf.store';
import { Button } from '../ui/Button';

export const PDFUploader = () => {
  const loadDocument = usePDFStore(state => state.loadDocument);
  const { isLoading, error } = usePDFStore(state => state.loading);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      await loadDocument(acceptedFiles[0]);
    }
  }, [loadDocument]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    multiple: false,
    disabled: isLoading,
    onDragEnter: () => {},
    onDragOver: () => {},
    onDragLeave: () => {}
  } as DropzoneOptions);

  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const bgColor = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <>
      {error && (
        <Alert status="error" mb={4} data-testid="error-message">
          <AlertIcon />
          {error.message}
        </Alert>
      )}
      <Box
        {...getRootProps()}
        borderWidth={2}
        borderStyle="dashed"
        borderColor={isDragActive ? 'blue.500' : borderColor}
        borderRadius="lg"
        bg={bgColor}
        p={8}
        cursor="pointer"
        transition="all 0.2s"
        _hover={{ bg: hoverBg }}
        data-testid="dropzone"
      >
        <input {...getInputProps()} data-testid="file-input" aria-label="Upload PDF" />
        <Center>
          <VStack spacing={4}>
            <Icon as={FiUpload} boxSize={8} color="gray.400" />
            <Text align="center" color="gray.500">
              {isDragActive
                ? 'Drop the PDF file here'
                : 'Drag and drop a PDF file here, or click to select'}
            </Text>
            <Button
              size="sm"
              variant="outline"
              isLoading={isLoading}
              loadingText="Uploading..."
            >
              Select File
            </Button>
          </VStack>
        </Center>
      </Box>
    </>
  );
};