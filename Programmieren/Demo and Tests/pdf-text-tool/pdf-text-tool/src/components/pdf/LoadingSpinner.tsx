import { Center, Spinner, Text, VStack } from '@chakra-ui/react';
import { usePDFStore } from '../../store/pdf.store';

export const LoadingSpinner = () => {
  const { isLoading, progress } = usePDFStore(state => state.loading);

  if (!isLoading) {
    return null;
  }

  return (
    <Center p={8}>
      <VStack spacing={4}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
        <Text color="gray.600">
          {progress === 0 ? 'Processing PDF...' : `Processing... ${progress}%`}
        </Text>
      </VStack>
    </Center>
  );
};