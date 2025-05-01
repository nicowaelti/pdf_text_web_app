import { Box, Container, Heading } from '@chakra-ui/react';

export const Header = () => {
  return (
    <Box as="header" bg="blue.500" color="white" py={4} shadow="md">
      <Container maxW="container.xl">
        <Heading size="lg">PDF Text Viewer</Heading>
      </Container>
    </Box>
  );
};