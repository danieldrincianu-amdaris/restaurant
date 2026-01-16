import '@testing-library/jest-dom';
import { beforeAll, afterAll } from 'vitest';

// Suppress React Router v7 future flag warnings globally in tests
// by patching console.warn
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('React Router Future Flag Warning')
    ) {
      return;
    }
    originalWarn(...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});
