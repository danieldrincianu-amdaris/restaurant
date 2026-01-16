import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
  category?: string;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

/**
 * Hook for managing keyboard shortcuts with configurable key combinations
 * 
 * @example
 * ```ts
 * useKeyboardShortcuts({
 *   shortcuts: [
 *     {
 *       key: 'n',
 *       ctrl: true,
 *       action: () => navigate('/orders/new'),
 *       description: 'Create new order',
 *       category: 'Navigation'
 *     }
 *   ]
 * });
 * ```
 */
export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) {
  // Store action refs to avoid effect dependencies
  const actionsRef = useRef<Map<string, () => void>>(new Map());

  // Update action refs when shortcuts change
  useEffect(() => {
    const newActions = new Map<string, () => void>();
    shortcuts.forEach(shortcut => {
      const key = getShortcutKey(shortcut);
      newActions.set(key, shortcut.action);
    });
    actionsRef.current = newActions;
  }, [shortcuts]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs, textareas, or contenteditable
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      // Exception: Escape key should work in inputs to blur/cancel
      if (event.key !== 'Escape') {
        return;
      }
    }

    // Build the shortcut key from the current event
    const shortcutKey = getShortcutKeyFromEvent(event);
    const action = actionsRef.current.get(shortcutKey);

    if (action) {
      event.preventDefault();
      event.stopPropagation();
      action();
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);

  return null;
}

/**
 * Generate a unique key string for a shortcut configuration
 */
function getShortcutKey(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  
  if (shortcut.ctrl) parts.push('ctrl');
  if (shortcut.shift) parts.push('shift');
  if (shortcut.alt) parts.push('alt');
  if (shortcut.meta) parts.push('meta');
  
  parts.push(shortcut.key.toLowerCase());
  
  return parts.join('+');
}

/**
 * Generate a shortcut key string from a keyboard event
 */
function getShortcutKeyFromEvent(event: KeyboardEvent): string {
  const parts: string[] = [];
  
  if (event.ctrlKey) parts.push('ctrl');
  if (event.shiftKey) parts.push('shift');
  if (event.altKey) parts.push('alt');
  if (event.metaKey) parts.push('meta');
  
  parts.push(event.key.toLowerCase());
  
  return parts.join('+');
}

/**
 * Hook to get all registered keyboard shortcuts for display in help
 */
export function useGetShortcuts(shortcuts: KeyboardShortcut[]): Array<KeyboardShortcut & { displayKey: string }> {
  return shortcuts.map(shortcut => ({
    ...shortcut,
    displayKey: formatShortcutDisplay(shortcut),
  }));
}

/**
 * Format shortcut for display (e.g., "Ctrl+N", "Escape")
 */
export function formatShortcutDisplay(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.meta) parts.push('⌘');
  
  const keyDisplay = shortcut.key.length === 1 
    ? shortcut.key.toUpperCase() 
    : shortcut.key.charAt(0).toUpperCase() + shortcut.key.slice(1);
    
  parts.push(keyDisplay);
  
  return parts.join('+');
}
