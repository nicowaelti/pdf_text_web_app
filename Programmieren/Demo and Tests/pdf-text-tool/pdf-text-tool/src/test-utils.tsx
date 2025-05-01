import { ChakraProvider } from '@chakra-ui/react';
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { vi } from 'vitest';

// Mock react-icons
vi.mock('react-icons/fi', () => ({
  FiUpload: () => 'FiUpload',
  FiFile: () => 'FiFile',
  FiTrash2: () => 'FiTrash2',
  FiChevronLeft: () => 'FiChevronLeft',
  FiChevronRight: () => 'FiChevronRight',
  FiZoomIn: () => 'FiZoomIn',
  FiZoomOut: () => 'FiZoomOut',
}));

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider>{children}</ChakraProvider>
);

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };