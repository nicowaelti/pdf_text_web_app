import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Box p={8} textAlign="center">
          <VStack spacing={4}>
            <Heading size="lg">Something went wrong</Heading>
            <Text>{this.state.error?.message}</Text>
            <Button
              colorScheme="blue"
              onClick={() => this.setState({ hasError: false })}
            >
              Try again
            </Button>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}