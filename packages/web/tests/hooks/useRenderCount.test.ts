import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  useRenderCount,
  getRenderStats,
  clearRenderStats,
  getRenderStatsArray,
} from '../../src/hooks/useRenderCount';

describe('useRenderCount', () => {
  beforeEach(() => {
    clearRenderStats();
  });

  afterEach(() => {
    clearRenderStats();
  });

  it('should track render count for a component', () => {
    const { rerender } = renderHook(() => useRenderCount('TestComponent'));

    // First render
    expect(getRenderStats().get('TestComponent')?.renderCount).toBe(1);

    // Second render
    rerender();
    expect(getRenderStats().get('TestComponent')?.renderCount).toBe(2);

    // Third render
    rerender();
    expect(getRenderStats().get('TestComponent')?.renderCount).toBe(3);
  });

  it('should store props when provided', () => {
    const props = { id: '123', name: 'test' };
    renderHook(() => useRenderCount('TestComponent', props));

    const stats = getRenderStats().get('TestComponent');
    expect(stats?.props).toEqual(props);
  });

  it('should update lastRenderTime on each render', async () => {
    const { rerender } = renderHook(() => useRenderCount('TestComponent'));

    const firstTime = getRenderStats().get('TestComponent')?.lastRenderTime;
    expect(firstTime).toBeDefined();

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 10));

    rerender();
    const secondTime = getRenderStats().get('TestComponent')?.lastRenderTime;
    expect(secondTime).toBeGreaterThanOrEqual(firstTime!);
  });

  it('should track multiple components independently', () => {
    renderHook(() => useRenderCount('ComponentA'));
    renderHook(() => useRenderCount('ComponentB'));
    renderHook(() => useRenderCount('ComponentC'));

    const stats = getRenderStats();
    expect(stats.size).toBe(3);
    expect(stats.get('ComponentA')?.renderCount).toBe(1);
    expect(stats.get('ComponentB')?.renderCount).toBe(1);
    expect(stats.get('ComponentC')?.renderCount).toBe(1);
  });

  it('should clear all stats when clearRenderStats is called', () => {
    renderHook(() => useRenderCount('ComponentA'));
    renderHook(() => useRenderCount('ComponentB'));

    expect(getRenderStats().size).toBe(2);

    clearRenderStats();

    expect(getRenderStats().size).toBe(0);
  });

  it('should return sorted array with getRenderStatsArray', () => {
    const { rerender: rerenderA } = renderHook(() => useRenderCount('ComponentA'));
    const { rerender: rerenderB } = renderHook(() => useRenderCount('ComponentB'));

    // ComponentA: 3 renders
    rerenderA();
    rerenderA();

    // ComponentB: 5 renders
    rerenderB();
    rerenderB();
    rerenderB();
    rerenderB();

    const stats = getRenderStatsArray('renderCount');

    expect(stats.length).toBe(2);
    // Should be sorted by renderCount descending
    expect(stats[0]?.component).toBe('ComponentB');
    expect(stats[0]?.renderCount).toBe(5);
    expect(stats[1]?.component).toBe('ComponentA');
    expect(stats[1]?.renderCount).toBe(3);
  });

  it('should sort by lastRenderTime when specified', async () => {
    renderHook(() => useRenderCount('ComponentA'));
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 10));
    
    renderHook(() => useRenderCount('ComponentB'));

    const stats = getRenderStatsArray('lastRenderTime');

    expect(stats.length).toBe(2);
    // ComponentB should be first (more recent)
    expect(stats[0]?.component).toBe('ComponentB');
    expect(stats[1]?.component).toBe('ComponentA');
  });
});
