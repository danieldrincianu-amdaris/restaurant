import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmationModal } from '../../src/components/ui/ConfirmationModal';

vi.mock('../../src/components/ui/LoadingSpinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

describe('ConfirmationModal', () => {
  const defaultProps = {
    isOpen: true,
    title: 'Confirm Action',
    message: 'Are you sure?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    isLoading: false,
  };

  it('renders when isOpen is true', () => {
    render(<ConfirmationModal {...defaultProps} />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('hidden when isOpen is false', () => {
    render(<ConfirmationModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('displays title and message correctly', () => {
    const title = 'Delete Item';
    const message = 'This action cannot be undone';
    
    render(<ConfirmationModal {...defaultProps} title={title} message={message} />);
    
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('confirm button calls onConfirm', () => {
    const onConfirm = vi.fn();
    
    render(<ConfirmationModal {...defaultProps} onConfirm={onConfirm} />);
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);
    
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('cancel button calls onCancel', () => {
    const onCancel = vi.fn();
    
    render(<ConfirmationModal {...defaultProps} onCancel={onCancel} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('Escape key calls onCancel', () => {
    const onCancel = vi.fn();
    
    render(<ConfirmationModal {...defaultProps} onCancel={onCancel} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('backdrop click calls onCancel', () => {
    const onCancel = vi.fn();
    
    render(<ConfirmationModal {...defaultProps} onCancel={onCancel} />);
    
    const backdrop = screen.getByTestId('modal-backdrop');
    fireEvent.click(backdrop);
    
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('buttons disabled during loading state', () => {
    render(<ConfirmationModal {...defaultProps} isLoading={true} />);
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    
    expect(confirmButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('does not close on Escape key when loading', () => {
    const onCancel = vi.fn();
    
    render(<ConfirmationModal {...defaultProps} isLoading={true} onCancel={onCancel} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('does not close on backdrop click when loading', () => {
    const onCancel = vi.fn();
    
    render(<ConfirmationModal {...defaultProps} isLoading={true} onCancel={onCancel} />);
    
    const backdrop = screen.getByTestId('modal-backdrop');
    fireEvent.click(backdrop);
    
    expect(onCancel).not.toHaveBeenCalled();
  });
});
