import { Box, HStack, Icon, IconButton, Text, VStack } from '@chakra-ui/react';
import { FiFile, FiTrash2 } from 'react-icons/fi';
import { usePDFStore } from '../../store/pdf.store';

export const FileList = () => {
  const document = usePDFStore(state => state.document);
  const resetStore = usePDFStore(state => state.resetStore);

  if (!document) {
    return null;
  }

  return (
    <Box
      borderWidth={1}
      borderRadius="md"
      p={4}
      bg="white"
      shadow="sm"
    >
      <HStack justify="space-between" spacing={4}>
        <HStack spacing={3}>
          <Icon as={FiFile} color="blue.500" boxSize={5} />
          <VStack align="flex-start" spacing={0}>
            <Text fontWeight="medium">{document.name}</Text>
            <Text fontSize="sm" color="gray.500">
              {document.totalPages} {document.totalPages === 1 ? 'page' : 'pages'}
            </Text>
          </VStack>
        </HStack>
        <IconButton 
          aria-label="Remove file"
          icon={<FiTrash2 />}
          size="sm"
          variant="ghost"
          colorScheme="red"
          onClick={resetStore}
        />
      </HStack>
    </Box>
  );
};