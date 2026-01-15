import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotificationSound } from '../../src/hooks/useNotificationSound';

// Mock Audio API
const mockPlay = vi.fn().mockResolvedValue(undefined);
const mockPause = vi.fn();
let mockCurrentTime = 0;

class MockAudio {
  src: string = '';
  preload: string = '';
  play = mockPlay;
  pause = mockPause;

  get currentTime() {
    return mockCurrentTime;
  }
  set currentTime(value: number) {
    mockCurrentTime = value;
  }

  constructor(src?: string) {
    if (src) this.src = src;
  }
}

// Mock AudioContext and related APIs
const mockOscillator = {
  frequency: { value: 0 },
  type: 'sine',
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
};

const mockGainNode = {
  gain: {
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  },
  connect: vi.fn(),
};

class MockAudioContext {
  sampleRate = 44100;
  createOscillator = vi.fn(() => mockOscillator);
  createGain = vi.fn(() => mockGainNode);
}

const mockStartRendering = vi.fn().mockResolvedValue({
  length: 6615,
  numberOfChannels: 1,
  sampleRate: 44100,
  getChannelData: vi.fn().mockReturnValue(new Float32Array(6615)),
});

class MockOfflineAudioContext {
  sampleRate = 44100;
  destination = {};
  createOscillator = vi.fn(() => mockOscillator);
  createGain = vi.fn(() => mockGainNode);
  startRendering = mockStartRendering;
}

describe('useNotificationSound', () => {
  let originalAudio: typeof Audio;
  let originalAudioContext: typeof AudioContext;
  let originalOfflineAudioContext: typeof OfflineAudioContext;
  let originalURL: typeof URL;

  beforeEach(() => {
    // Reset mocks
    mockPlay.mockClear();
    mockPause.mockClear();
    mockStartRendering.mockClear();
    mockCurrentTime = 0;

    // Save originals
    originalAudio = global.Audio;
    originalAudioContext = global.AudioContext;
    originalOfflineAudioContext = global.OfflineAudioContext;
    originalURL = global.URL;

    // Mock globals
    global.Audio = MockAudio as unknown as typeof Audio;
    global.AudioContext = MockAudioContext as unknown as typeof AudioContext;
    global.OfflineAudioContext = MockOfflineAudioContext as unknown as typeof OfflineAudioContext;
    global.URL = {
      createObjectURL: vi.fn().mockReturnValue('blob:mock-url'),
      revokeObjectURL: vi.fn(),
    } as unknown as typeof URL;
  });

  afterEach(() => {
    // Restore originals
    global.Audio = originalAudio;
    global.AudioContext = originalAudioContext;
    global.OfflineAudioContext = originalOfflineAudioContext;
    global.URL = originalURL;
    vi.clearAllMocks();
  });

  it('should preload audio on mount with sound URL', () => {
    const { result } = renderHook(() => useNotificationSound('/sounds/test.mp3', false));

    expect(result.current.play).toBeDefined();
  });

  it('should generate beep sound when no URL provided', async () => {
    renderHook(() => useNotificationSound('', false));

    // Wait for async sound generation
    await vi.waitFor(() => {
      expect(mockStartRendering).toHaveBeenCalled();
    });
  });

  it('should play sound when not muted', async () => {
    const { result } = renderHook(() => useNotificationSound('/sounds/test.mp3', false));

    await act(async () => {
      result.current.play();
    });

    // Audio play should be called
    expect(mockPlay).toHaveBeenCalled();
  });

  it('should not play sound when muted', async () => {
    const { result } = renderHook(() => useNotificationSound('/sounds/test.mp3', true));

    await act(async () => {
      result.current.play();
    });

    expect(mockPlay).not.toHaveBeenCalled();
  });

  it('should debounce rapid play calls', async () => {
    const { result } = renderHook(() => useNotificationSound('/sounds/test.mp3', false));

    await act(async () => {
      result.current.play();
      result.current.play(); // Should be blocked
      result.current.play(); // Should be blocked
    });

    // Only first play should execute due to debounce
    expect(mockPlay).toHaveBeenCalledTimes(1);
  });

  it('should allow play after debounce period', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useNotificationSound('/sounds/test.mp3', false));

    await act(async () => {
      result.current.play();
    });

    expect(mockPlay).toHaveBeenCalledTimes(1);

    // Wait for debounce period (500ms)
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    await act(async () => {
      result.current.play();
    });

    expect(mockPlay).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  it('should handle audio play errors gracefully', async () => {
    const playError = new Error('Autoplay blocked');
    mockPlay.mockRejectedValueOnce(playError);

    const { result } = renderHook(() => useNotificationSound('/sounds/test.mp3', false));

    // Should not throw
    await act(async () => {
      expect(() => result.current.play()).not.toThrow();
    });
  });

  it('should reset currentTime before playing', async () => {
    mockCurrentTime = 10; // Set initial time
    const { result } = renderHook(() => useNotificationSound('/sounds/test.mp3', false));

    await act(async () => {
      result.current.play();
    });

    // currentTime should be reset to 0
    expect(mockCurrentTime).toBe(0);
  });

  it('should cleanup audio on unmount', () => {
    const { unmount } = renderHook(() => useNotificationSound('/sounds/test.mp3', false));

    unmount();

    expect(mockPause).toHaveBeenCalled();
  });
});
