import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SpecialInstructionsModal from '../../src/components/staff/SpecialInstructionsModal';

describe('SpecialInstructionsModal', () => {
  const mockOnSave = vi.fn();
  const mockOnClose = vi.fn();

  it('does not render when closed', () => {
    render(
      <SpecialInstructionsModal
        isOpen={false}
        itemName="Caesar Salad"
        currentInstructions={null}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('Special Instructions')).not.toBeInTheDocument();
  });

  it('renders when open', () => {
    render(
      <SpecialInstructionsModal
        isOpen={true}
        itemName="Caesar Salad"
        currentInstructions={null}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Special Instructions')).toBeInTheDocument();
    expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
  });

  it('pre-populates with existing instructions', () => {
    render(
      <SpecialInstructionsModal
        isOpen={true}
        itemName="Caesar Salad"
        currentInstructions="No croutons"
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    const textarea = screen.getByPlaceholderText(/e.g., No onions/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe('No croutons');
  });

  it('calls onSave with trimmed instructions when save clicked', () => {
    const onSave = vi.fn();
    render(
      <SpecialInstructionsModal
        isOpen={true}
        itemName="Caesar Salad"
        currentInstructions={null}
        onSave={onSave}
        onClose={mockOnClose}
      />
    );

    const textarea = screen.getByPlaceholderText(/e.g., No onions/i);
    fireEvent.change(textarea, { target: { value: '  No onions  ' } });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledWith('No onions');
  });

  it('calls onClose when cancel clicked', () => {
    const onClose = vi.fn();
    render(
      <SpecialInstructionsModal
        isOpen={true}
        itemName="Caesar Salad"
        currentInstructions={null}
        onSave={mockOnSave}
        onClose={onClose}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when escape key pressed', () => {
    const onClose = vi.fn();
    render(
      <SpecialInstructionsModal
        isOpen={true}
        itemName="Caesar Salad"
        currentInstructions={null}
        onSave={mockOnSave}
        onClose={onClose}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when clicking overlay', () => {
    const onClose = vi.fn();
    const { container } = render(
      <SpecialInstructionsModal
        isOpen={true}
        itemName="Caesar Salad"
        currentInstructions={null}
        onSave={mockOnSave}
        onClose={onClose}
      />
    );

    const overlay = container.querySelector('.fixed.inset-0');
    if (overlay) {
      fireEvent.click(overlay);
    }

    expect(onClose).toHaveBeenCalled();
  });

  it('allows empty instructions to be saved', () => {
    const onSave = vi.fn();
    render(
      <SpecialInstructionsModal
        isOpen={true}
        itemName="Caesar Salad"
        currentInstructions="Previous instructions"
        onSave={onSave}
        onClose={mockOnClose}
      />
    );

    const textarea = screen.getByPlaceholderText(/e.g., No onions/i);
    fireEvent.change(textarea, { target: { value: '' } });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledWith('');
  });
});
