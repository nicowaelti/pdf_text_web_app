import '@testing-library/jest-dom'
import { vi } from 'vitest'

interface MediaQueryList {
  matches: boolean;
  media: string;
  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => void) | null;
  addListener: (callback: ((this: MediaQueryList, ev: MediaQueryListEvent) => void)) => void;
  removeListener: (callback: ((this: MediaQueryList, ev: MediaQueryListEvent) => void)) => void;
  addEventListener: (type: string, listener: EventListener) => void;
  removeEventListener: (type: string, listener: EventListener) => void;
  dispatchEvent: (event: Event) => boolean;
}

// Mock window.matchMedia for Chakra UI
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
class ResizeObserverMock implements ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

window.ResizeObserver = ResizeObserverMock