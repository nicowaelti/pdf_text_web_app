import { VStack } from '@chakra-ui/react';
import { useEffect } from 'react';
import { usePDFStore } from '../../store/pdf.store';
import { PageNavigation } from './PageNavigation';
import { TextContent } from './TextContent';

export const PDFViewer = () => {
  const document = usePDFStore(state => state.document);
  const currentPage = usePDFStore(state => state.navigation.currentPage);
  const setCurrentPage = usePDFStore(state => state.setCurrentPage);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!document) return;

      switch (event.key) {
        case 'ArrowRight':
        case 'PageDown':
          setCurrentPage(Math.min(currentPage + 1, document.totalPages));
          break;
        case 'ArrowLeft':
        case 'PageUp':
          setCurrentPage(Math.max(currentPage - 1, 1));
          break;
        case 'Home':
          setCurrentPage(1);
          break;
        case 'End':
          setCurrentPage(document.totalPages);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [document, currentPage, setCurrentPage]);

  if (!document) {
    return null;
  }

  return (
    <VStack spacing={4} align="stretch" width="100%" overflow="hidden">
      <PageNavigation />
      <TextContent />
    </VStack>
  );
};