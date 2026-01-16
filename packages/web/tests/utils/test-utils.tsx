import { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';

/**
 * Custom render function with MemoryRouter configured.
 */
export function renderWithRouter(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { routerProps?: MemoryRouterProps }
): RenderResult {
  const { routerProps, ...renderOptions } = options || {};

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter {...routerProps}>
        {children}
      </MemoryRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Re-export everything from testing library for convenience
 */
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
