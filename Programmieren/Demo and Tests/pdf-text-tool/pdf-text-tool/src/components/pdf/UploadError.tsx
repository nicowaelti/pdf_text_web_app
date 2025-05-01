import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, CloseButton, HStack, VStack } from '@chakra-ui/react';
import { usePDFStore } from '../../store/pdf.store';
import { PDFError } from '../../types/pdf.types';

interface ErrorMessageMap {
  [key: string]: string;
}

const ERROR_MESSAGES: ErrorMessageMap = {
  LOAD_ERROR: 'Failed to load the PDF file',
  PARSE_ERROR: 'Unable to parse the PDF file',
  INVALID_FILE: 'Invalid PDF file format',
  UNKNOWN_ERROR: 'An unexpected error occurred'
};

export const UploadError = () => {
  const error = usePDFStore(state => state.loading.error);
  const resetStore = usePDFStore(state => state.resetStore);

  if (!error) {
    return null;
  }

  const getErrorMessage = (error: PDFError) => {
    return ERROR_MESSAGES[error.type] || error.message;
  };

  return (
    <Alert
      status="error"
      variant="left-accent"
      borderRadius="md"
      flexDirection="column"
      alignItems="flex-start"
    >
      <VStack spacing={2} align="flex-start" width="100%">
        <HStack width="100%" justify="space-between">
          <AlertIcon />
          <AlertTitle>Error uploading PDF</AlertTitle>
          <CloseButton onClick={resetStore} />
        </HStack>
        <AlertDescription>
          {getErrorMessage(error)}
          {error.details && typeof error.details === 'object' && (
            <Box as="pre" mt={2} fontSize="sm" whiteSpace="pre-wrap">
              {JSON.stringify(error.details, null, 2)}
            </Box>
          )}
        </AlertDescription>
      </VStack>
    </Alert>
  );
};