import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import LastUpdatedIndicator from '../../../src/components/ui/LastUpdatedIndicator';
import { UseSocketReturn } from '../../../src/hooks/useSocket';
import * as socketHook from '../../../src/hooks/useSocket';

// Mock useSocket hook
vi.mock('../../../src/hooks/useSocket');

describe('LastUpdatedIndicator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should display connection status when connected', () => {
    vi.spyOn(socketHook, 'useSocket').mockReturnValue({ isConnected: true } as UseSocketReturn);
    const lastUpdated = new Date();

    render(<LastUpdatedIndicator lastUpdated={lastUpdated} />);

    expect(screen.getByTitle('Connected to server')).toBeInTheDocument();
    expect(screen.getByLabelText('Connected')).toBeInTheDocument();
  });

  it('should display connection status when disconnected', () => {
    vi.spyOn(socketHook, 'useSocket').mockReturnValue({ isConnected: false } as UseSocketReturn);
    const lastUpdated = new Date();

    render(<LastUpdatedIndicator lastUpdated={lastUpdated} />);

    expect(screen.getByTitle('Disconnected from server')).toBeInTheDocument();
    expect(screen.getByLabelText('Disconnected')).toBeInTheDocument();
  });

  it('should display "Updated 0s ago" for immediate updates', () => {
    vi.spyOn(socketHook, 'useSocket').mockReturnValue({ isConnected: true } as UseSocketReturn);
    const lastUpdated = new Date();

    render(<LastUpdatedIndicator lastUpdated={lastUpdated} />);

    expect(screen.getByText(/Updated 0s ago/i)).toBeInTheDocument();
  });

  it('should display seconds for updates less than 1 minute', () => {
    vi.spyOn(socketHook, 'useSocket').mockReturnValue({ isConnected: true } as UseSocketReturn);
    const lastUpdated = new Date(Date.now() - 30000); // 30 seconds ago

    render(<LastUpdatedIndicator lastUpdated={lastUpdated} />);

    expect(screen.getByText(/Updated 30s ago/i)).toBeInTheDocument();
  });

  it('should display minutes for updates between 1 minute and 1 hour', () => {
    vi.spyOn(socketHook, 'useSocket').mockReturnValue({ isConnected: true } as UseSocketReturn);
    const lastUpdated = new Date(Date.now() - 150000); // 2.5 minutes ago

    render(<LastUpdatedIndicator lastUpdated={lastUpdated} />);

    expect(screen.getByText(/Updated 2m ago/i)).toBeInTheDocument();
  });

  it('should display hours for updates more than 1 hour', () => {
    vi.spyOn(socketHook, 'useSocket').mockReturnValue({ isConnected: true } as UseSocketReturn);
    const lastUpdated = new Date(Date.now() - 7200000); // 2 hours ago

    render(<LastUpdatedIndicator lastUpdated={lastUpdated} />);

    expect(screen.getByText(/Updated 2h ago/i)).toBeInTheDocument();
  });

  it('should update relative time every second', async () => {
    vi.spyOn(socketHook, 'useSocket').mockReturnValue({ isConnected: true } as UseSocketReturn);
    const lastUpdated = new Date();

    const { rerender } = render(<LastUpdatedIndicator lastUpdated={lastUpdated} />);

    expect(screen.getByText(/Updated 0s ago/i)).toBeInTheDocument();

    // Advance time by 5 seconds and trigger rerender
    await vi.advanceTimersByTimeAsync(5000);
    rerender(<LastUpdatedIndicator lastUpdated={lastUpdated} />);

    expect(screen.getByText(/Updated 5s ago/i)).toBeInTheDocument();
  });

  it('should cleanup interval on unmount', () => {
    vi.spyOn(socketHook, 'useSocket').mockReturnValue({ isConnected: true } as UseSocketReturn);
    const lastUpdated = new Date();
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    const { unmount } = render(<LastUpdatedIndicator lastUpdated={lastUpdated} />);

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
