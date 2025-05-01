import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import { usePDFStore } from '../../store/pdf.store';

export const TextContent = () => {
  const document = usePDFStore(state => state.document);
  const { currentPage, zoom } = usePDFStore(state => state.navigation);

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  if (!document || !document.pages[currentPage - 1]) {
    return null;
  }

  const currentPageContent = document.pages[currentPage - 1];
  const { width, height } = currentPageContent.metadata;

  return (
    <Box
      bg={bgColor}
      p={6}
      borderRadius="md"
      shadow="sm"
      width={`${width * zoom}px`}
      height={`${height * zoom}px`}
      overflow="auto"
      position="relative"
      mx="auto"
      transition="all 0.2s"
    >
      <Box
        position="absolute"
        inset={0}
        p={6}
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top left'
        }}
      >
        <Text
          color={textColor}
          whiteSpace="pre-wrap"
          fontFamily="monospace"
          fontSize="sm"
          sx={{
            WebkitUserSelect: 'text',
            userSelect: 'text',
            cursor: 'text'
          }}
        >
          {currentPageContent.text}
        </Text>
      </Box>
    </Box>
  );
};