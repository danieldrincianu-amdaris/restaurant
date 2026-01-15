import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import KitchenPage from '../../../src/pages/kitchen/KitchenPage';

// Mock KitchenBoard component
vi.mock('../../../src/components/kitchen/KitchenBoard', () => ({
  default: () => <div data-testid="kitchen-board">KitchenBoard</div>,
}));

// Mock ConnectionStatus component
vi.mock('../../../src/components/ui/ConnectionStatus', () => ({
  ConnectionStatus: () => <div data-testid="connection-status">Connected</div>,
}));

// Mock sound preference hook
vi.mock('../../../src/hooks/useSoundPreference', () => ({
  useSoundPreference: vi.fn(() => ({
    isMuted: false,
    toggleMute: vi.fn(),
  })),
}));

describe('KitchenPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the kitchen page header', () => {
    render(
      <MemoryRouter>
        <KitchenPage />
      </MemoryRouter>
    );

    expect(screen.getByText('RestaurantFlow Kitchen')).toBeInTheDocument();
    expect(screen.getByText('🍽️')).toBeInTheDocument();
  });

  it('renders the KitchenBoard component', () => {
    render(
      <MemoryRouter>
        <KitchenPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('kitchen-board')).toBeInTheDocument();
  });

  it('renders the connection status indicator', () => {
    render(
      <MemoryRouter>
        <KitchenPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('connection-status')).toBeInTheDocument();
  });

  it('renders the mute notification button', () => {
    render(
      <MemoryRouter>
        <KitchenPage />
      </MemoryRouter>
    );

    const muteButton = screen.getByLabelText('Sound on - Click to mute');
    expect(muteButton).toBeInTheDocument();
    expect(muteButton).toHaveTextContent('🔔');
  });

  it('displays current time', () => {
    render(
      <MemoryRouter>
        <KitchenPage />
      </MemoryRouter>
    );

    const timeElement = screen.getByText(/\d{1,2}:\d{2}\s?(AM|PM)/);
    expect(timeElement).toBeInTheDocument();
    expect(timeElement.tagName).toBe('TIME');
  });

  it('applies full-screen layout classes', () => {
    const { container } = render(
      <MemoryRouter>
        <KitchenPage />
      </MemoryRouter>
    );

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('h-screen');
    expect(mainDiv).toHaveClass('flex');
    expect(mainDiv).toHaveClass('flex-col');
  });
});
