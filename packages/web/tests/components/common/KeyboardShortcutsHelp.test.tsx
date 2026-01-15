import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import KeyboardShortcutsHelp from '../../../src/components/common/KeyboardShortcutsHelp';

describe('KeyboardShortcutsHelp', () => {
  const mockShortcuts = [
    {
      key: 'n',
      ctrl: true,
      action: vi.fn(),
      description: 'Create new order',
      category: 'Navigation',
    },
    {
      key: 'r',
      ctrl: true,
      action: vi.fn(),
      description: 'Refresh orders',
      category: 'Actions',
    },
    {
      key: '?',
      action: vi.fn(),
      description: 'Show help',
      category: 'Help',
    },
  ];

  it('should not render when isOpen is false', () => {
    render(
      <KeyboardShortcutsHelp
        isOpen={false}
        onClose={vi.fn()}
        shortcuts={mockShortcuts}
      />
    );

    expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <KeyboardShortcutsHelp
        isOpen={true}
        onClose={vi.fn()}
        shortcuts={mockShortcuts}
      />
    );

    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
  });

  it('should display all shortcuts', () => {
    render(
      <KeyboardShortcutsHelp
        isOpen={true}
        onClose={vi.fn()}
        shortcuts={mockShortcuts}
      />
    );

    expect(screen.getByText('Create new order')).toBeInTheDocument();
    expect(screen.getByText('Refresh orders')).toBeInTheDocument();
    expect(screen.getByText('Show help')).toBeInTheDocument();
  });

  it('should group shortcuts by category', () => {
    render(
      <KeyboardShortcutsHelp
        isOpen={true}
        onClose={vi.fn()}
        shortcuts={mockShortcuts}
      />
    );

    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
  });

  it('should display formatted key combinations', () => {
    render(
      <KeyboardShortcutsHelp
        isOpen={true}
        onClose={vi.fn()}
        shortcuts={mockShortcuts}
      />
    );

    expect(screen.getByText('Ctrl+N')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+R')).toBeInTheDocument();
    // Use getAllByText since '?' appears twice (in shortcut list and footer)
    const questionMarks = screen.getAllByText('?');
    expect(questionMarks.length).toBeGreaterThan(0);
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <KeyboardShortcutsHelp
        isOpen={true}
        onClose={onClose}
        shortcuts={mockShortcuts}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    render(
      <KeyboardShortcutsHelp
        isOpen={true}
        onClose={onClose}
        shortcuts={mockShortcuts}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should have proper ARIA attributes', () => {
    render(
      <KeyboardShortcutsHelp
        isOpen={true}
        onClose={vi.fn()}
        shortcuts={mockShortcuts}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'shortcuts-title');
  });

  it('should handle shortcuts without categories', () => {
    const shortcutsWithoutCategory = [
      {
        key: 'a',
        action: vi.fn(),
        description: 'Action A',
      },
    ];

    render(
      <KeyboardShortcutsHelp
        isOpen={true}
        onClose={vi.fn()}
        shortcuts={shortcutsWithoutCategory}
      />
    );

    expect(screen.getByText('Action A')).toBeInTheDocument();
  });
});
