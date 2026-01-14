import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDialog from '../../src/components/ui/ConfirmDialog';

describe('ConfirmDialog', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  it('does not render when closed', () => {
    render(
      <ConfirmDialog
        isOpen={false}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
  });

  it('renders when open', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button clicked', () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={onConfirm}
        onCancel={mockOnCancel}
      />
    );

    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);

    expect(onConfirm).toHaveBeenCalled();
  });

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={mockOnConfirm}
        onCancel={onCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  it('uses custom button labels when provided', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Item"
        message="This cannot be undone"
        confirmLabel="Delete"
        cancelLabel="Keep"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Keep')).toBeInTheDocument();
  });

  it('applies destructive styling when variant is destructive', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Item"
        message="This cannot be undone"
        variant="destructive"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton.className).toContain('bg-red-600');
  });

  it('applies default styling when variant is default', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm Action"
        message="Are you sure?"
        variant="default"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton.className).toContain('bg-blue-600');
  });

  it('calls onCancel when escape key pressed', () => {
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={mockOnConfirm}
        onCancel={onCancel}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onCancel).toHaveBeenCalled();
  });

  it('calls onCancel when clicking overlay', () => {
    const onCancel = vi.fn();
    const { container } = render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={mockOnConfirm}
        onCancel={onCancel}
      />
    );

    const overlay = container.querySelector('.fixed.inset-0');
    if (overlay) {
      fireEvent.click(overlay);
    }

    expect(onCancel).toHaveBeenCalled();
  });
});
