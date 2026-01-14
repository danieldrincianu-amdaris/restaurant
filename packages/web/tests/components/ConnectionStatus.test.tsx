// Tests for ConnectionStatus component

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConnectionStatus } from '../../src/components/ui/ConnectionStatus';
import type { ConnectionStatus as ConnectionStatusType } from '../../src/hooks/useSocket';

// Mock the useSocket hook
const mockUseSocket = vi.fn();

vi.mock('../../src/hooks/useSocket', () => ({
  useSocket: () => mockUseSocket(),
}));

describe('ConnectionStatus', () => {
  it('should render green indicator when connected', () => {
    mockUseSocket.mockReturnValue({
      connectionStatus: 'connected' as ConnectionStatusType,
      isConnected: true,
      isReconnecting: false,
    });

    const { container } = render(<ConnectionStatus />);

    const indicator = container.querySelector('.bg-green-500');
    expect(indicator).toBeTruthy();
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'WebSocket connected');
  });

  it('should render yellow pulsing indicator when reconnecting', () => {
    mockUseSocket.mockReturnValue({
      connectionStatus: 'reconnecting' as ConnectionStatusType,
      isConnected: false,
      isReconnecting: true,
    });

    const { container } = render(<ConnectionStatus />);

    const indicator = container.querySelector('.bg-yellow-500');
    expect(indicator).toBeTruthy();
    expect(indicator?.className).toContain('animate-pulse');
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'WebSocket reconnecting');
  });

  it('should render red indicator when disconnected', () => {
    mockUseSocket.mockReturnValue({
      connectionStatus: 'disconnected' as ConnectionStatusType,
      isConnected: false,
      isReconnecting: false,
    });

    const { container } = render(<ConnectionStatus />);

    const indicator = container.querySelector('.bg-red-500');
    expect(indicator).toBeTruthy();
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'WebSocket disconnected');
  });

  it('should show label text when showLabel is true', () => {
    mockUseSocket.mockReturnValue({
      connectionStatus: 'connected' as ConnectionStatusType,
      isConnected: true,
      isReconnecting: false,
    });

    render(<ConnectionStatus showLabel />);

    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('should not show label text when showLabel is false', () => {
    mockUseSocket.mockReturnValue({
      connectionStatus: 'connected' as ConnectionStatusType,
      isConnected: true,
      isReconnecting: false,
    });

    render(<ConnectionStatus showLabel={false} />);

    expect(screen.queryByText('Connected')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    mockUseSocket.mockReturnValue({
      connectionStatus: 'connected' as ConnectionStatusType,
      isConnected: true,
      isReconnecting: false,
    });

    const { container } = render(<ConnectionStatus className="custom-class" />);

    const wrapper = container.querySelector('.custom-class');
    expect(wrapper).toBeTruthy();
  });

  it('should have proper ARIA attributes for accessibility', () => {
    mockUseSocket.mockReturnValue({
      connectionStatus: 'connected' as ConnectionStatusType,
      isConnected: true,
      isReconnecting: false,
    });

    render(<ConnectionStatus />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-label', 'WebSocket connected');
  });

  it('should show reconnecting label when reconnecting', () => {
    mockUseSocket.mockReturnValue({
      connectionStatus: 'reconnecting' as ConnectionStatusType,
      isConnected: false,
      isReconnecting: true,
    });

    render(<ConnectionStatus showLabel />);

    expect(screen.getByText('Reconnecting')).toBeInTheDocument();
  });

  it('should show disconnected label when disconnected', () => {
    mockUseSocket.mockReturnValue({
      connectionStatus: 'disconnected' as ConnectionStatusType,
      isConnected: false,
      isReconnecting: false,
    });

    render(<ConnectionStatus showLabel />);

    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('should render ping animation when reconnecting', () => {
    mockUseSocket.mockReturnValue({
      connectionStatus: 'reconnecting' as ConnectionStatusType,
      isConnected: false,
      isReconnecting: true,
    });

    const { container } = render(<ConnectionStatus />);

    const pingAnimation = container.querySelector('.animate-ping');
    expect(pingAnimation).toBeTruthy();
  });

  it('should not render ping animation when connected', () => {
    mockUseSocket.mockReturnValue({
      connectionStatus: 'connected' as ConnectionStatusType,
      isConnected: true,
      isReconnecting: false,
    });

    const { container } = render(<ConnectionStatus />);

    const pingAnimation = container.querySelector('.animate-ping');
    expect(pingAnimation).toBeNull();
  });
});
