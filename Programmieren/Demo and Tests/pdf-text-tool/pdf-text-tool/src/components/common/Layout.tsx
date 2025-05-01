import { Box, Container, VStack } from '@chakra-ui/react';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      <Container maxW="container.xl" py={4}>
        <VStack spacing={4} align="stretch">
          {children}
        </VStack>
      </Container>
    </Box>
  );
};