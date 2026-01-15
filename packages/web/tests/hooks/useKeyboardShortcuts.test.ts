import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboardShortcuts, formatShortcutDisplay } from '../../src/hooks/useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  let mockAction: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockAction = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should call action when shortcut is triggered', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [
          {
            key: 'n',
            ctrl: true,
            action: mockAction,
            description: 'Test shortcut',
          },
        ],
      })
    );

    const event = new KeyboardEvent('keydown', { key: 'n', ctrlKey: true });
    act(() => {
      window.dispatchEvent(event);
    });

    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('should not call action without modifier key', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [
          {
            key: 'n',
            ctrl: true,
            action: mockAction,
            description: 'Test shortcut',
          },
        ],
      })
    );

    const event = new KeyboardEvent('keydown', { key: 'n' });
    act(() => {
      window.dispatchEvent(event);
    });

    expect(mockAction).not.toHaveBeenCalled();
  });

  it('should handle shift modifier', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [
          {
            key: 's',
            ctrl: true,
            shift: true,
            action: mockAction,
            description: 'Save as',
          },
        ],
      })
    );

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      shiftKey: true,
    });
    act(() => {
      window.dispatchEvent(event);
    });

    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('should not trigger when typing in input', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [
          {
            key: 'n',
            ctrl: true,
            action: mockAction,
            description: 'New item',
          },
        ],
      })
    );

    // Create an input element and dispatch event from it
    const input = document.createElement('input');
    document.body.appendChild(input);

    const event = new KeyboardEvent('keydown', {
      key: 'n',
      ctrlKey: true,
      bubbles: true,
    });
    Object.defineProperty(event, 'target', {
      value: input,
      configurable: true,
    });

    act(() => {
      input.dispatchEvent(event);
    });

    expect(mockAction).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it('should allow Escape key in inputs', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [
          {
            key: 'Escape',
            action: mockAction,
            description: 'Cancel',
          },
        ],
      })
    );

    const input = document.createElement('input');
    document.body.appendChild(input);

    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    });
    Object.defineProperty(event, 'target', {
      value: input,
      configurable: true,
    });

    act(() => {
      input.dispatchEvent(event);
    });

    expect(mockAction).toHaveBeenCalledTimes(1);
    document.body.removeChild(input);
  });

  it('should handle multiple shortcuts', () => {
    const action1 = vi.fn();
    const action2 = vi.fn();

    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [
          {
            key: 'n',
            ctrl: true,
            action: action1,
            description: 'New',
          },
          {
            key: 'r',
            ctrl: true,
            action: action2,
            description: 'Refresh',
          },
        ],
      })
    );

    const event1 = new KeyboardEvent('keydown', { key: 'n', ctrlKey: true });
    act(() => {
      window.dispatchEvent(event1);
    });

    const event2 = new KeyboardEvent('keydown', { key: 'r', ctrlKey: true });
    act(() => {
      window.dispatchEvent(event2);
    });

    expect(action1).toHaveBeenCalledTimes(1);
    expect(action2).toHaveBeenCalledTimes(1);
  });

  it('should be case-insensitive for keys', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [
          {
            key: 'n',
            ctrl: true,
            action: mockAction,
            description: 'Test',
          },
        ],
      })
    );

    // Try uppercase N
    const event = new KeyboardEvent('keydown', { key: 'N', ctrlKey: true });
    act(() => {
      window.dispatchEvent(event);
    });

    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('should disable shortcuts when enabled is false', () => {
    const { rerender } = renderHook(
      ({ enabled }) =>
        useKeyboardShortcuts({
          shortcuts: [
            {
              key: 'n',
              ctrl: true,
              action: mockAction,
              description: 'Test',
            },
          ],
          enabled,
        }),
      { initialProps: { enabled: false } }
    );

    const event = new KeyboardEvent('keydown', { key: 'n', ctrlKey: true });
    act(() => {
      window.dispatchEvent(event);
    });

    expect(mockAction).not.toHaveBeenCalled();

    // Enable shortcuts
    rerender({ enabled: true });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('should clean up event listeners on unmount', () => {
    const { unmount } = renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [
          {
            key: 'n',
            ctrl: true,
            action: mockAction,
            description: 'Test',
          },
        ],
      })
    );

    unmount();

    const event = new KeyboardEvent('keydown', { key: 'n', ctrlKey: true });
    act(() => {
      window.dispatchEvent(event);
    });

    expect(mockAction).not.toHaveBeenCalled();
  });
});

describe('formatShortcutDisplay', () => {
  it('should format single key', () => {
    expect(
      formatShortcutDisplay({
        key: 'a',
        action: () => {},
        description: 'Test',
      })
    ).toBe('A');
  });

  it('should format Ctrl+Key', () => {
    expect(
      formatShortcutDisplay({
        key: 'n',
        ctrl: true,
        action: () => {},
        description: 'New',
      })
    ).toBe('Ctrl+N');
  });

  it('should format Ctrl+Shift+Key', () => {
    expect(
      formatShortcutDisplay({
        key: 's',
        ctrl: true,
        shift: true,
        action: () => {},
        description: 'Save As',
      })
    ).toBe('Ctrl+Shift+S');
  });

  it('should format special keys', () => {
    expect(
      formatShortcutDisplay({
        key: 'Escape',
        action: () => {},
        description: 'Cancel',
      })
    ).toBe('Escape');
  });

  it('should format meta key (Mac)', () => {
    expect(
      formatShortcutDisplay({
        key: 'n',
        meta: true,
        action: () => {},
        description: 'New',
      })
    ).toBe('⌘+N');
  });
});
