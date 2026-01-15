// Custom React hook for playing notification sounds with debouncing

import { useCallback, useEffect, useRef } from 'react';

const DEBOUNCE_MS = 500; // Minimum time between sound plays

/**
 * Hook for playing notification sounds with built-in debouncing
 * 
 * Preloads audio on mount and provides a debounced play function
 * to prevent sound overlap when multiple rapid notifications occur.
 * 
 * @param soundUrl - URL or data URI of the sound file
 * @param isMuted - Whether sound is muted
 * 
 * @example
 * ```tsx
 * const { play } = useNotificationSound('/sounds/new-order.mp3', isMuted);
 * 
 * // Play sound (will be debounced)
 * play();
 * ```
 */
export function useNotificationSound(soundUrl: string, isMuted: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastPlayedRef = useRef<number>(0);

  // Preload audio on mount
  useEffect(() => {
    // Create simple beep sound using Web Audio API if no sound file provided
    if (!soundUrl || soundUrl === '') {
      // Use a data URI for a simple beep
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const beepDuration = 0.15;
      const beepFrequency = 800;
      
      // Create offline context to generate beep
      const offlineContext = new OfflineAudioContext(1, audioContext.sampleRate * beepDuration, audioContext.sampleRate);
      const oscillator = offlineContext.createOscillator();
      const gainNode = offlineContext.createGain();
      
      oscillator.frequency.value = beepFrequency;
      oscillator.type = 'sine';
      
      // Envelope
      gainNode.gain.setValueAtTime(0, 0);
      gainNode.gain.linearRampToValueAtTime(0.3, 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, beepDuration);
      
      oscillator.connect(gainNode);
      gainNode.connect(offlineContext.destination);
      
      oscillator.start(0);
      oscillator.stop(beepDuration);
      
      offlineContext.startRendering().then((buffer) => {
        // Convert to WAV data URI
        const wav = audioBufferToWav(buffer);
        const blob = new Blob([wav], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        audioRef.current = new Audio(url);
        audioRef.current.preload = 'auto';
      });
    } else {
      audioRef.current = new Audio(soundUrl);
      audioRef.current.preload = 'auto';
    }

    return () => {
      // Cleanup
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [soundUrl]);

  const play = useCallback(() => {
    if (isMuted) return;
    
    const now = Date.now();
    
    // Debounce: prevent sound overlap
    if (now - lastPlayedRef.current < DEBOUNCE_MS) {
      return;
    }
    
    lastPlayedRef.current = now;
    
    if (audioRef.current) {
      // Reset to start if already playing
      audioRef.current.currentTime = 0;
      
      audioRef.current.play().catch(() => {
        // Autoplay blocked - user hasn't interacted with page yet
        // This is expected behavior, fail silently
      });
    }
  }, [isMuted]);

  return { play };
}

// Helper function to convert AudioBuffer to WAV format
function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const length = buffer.length * buffer.numberOfChannels * 2 + 44;
  const arrayBuffer = new ArrayBuffer(length);
  const view = new DataView(arrayBuffer);
  const channels: Float32Array[] = [];
  let offset = 0;
  let pos = 0;

  // Write WAV header
  const setUint16 = (data: number) => {
    view.setUint16(pos, data, true);
    pos += 2;
  };
  const setUint32 = (data: number) => {
    view.setUint32(pos, data, true);
    pos += 4;
  };

  // "RIFF" chunk descriptor
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  // "fmt " sub-chunk
  setUint32(0x20746d66); // "fmt "
  setUint32(16); // chunk length
  setUint16(1); // PCM format
  setUint16(buffer.numberOfChannels);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels); // byte rate
  setUint16(buffer.numberOfChannels * 2); // block align
  setUint16(16); // bits per sample

  // "data" sub-chunk
  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4); // chunk length

  // Write interleaved data
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      const channelData = channels[i];
      if (channelData && offset < channelData.length) {
        const rawSample = channelData[offset];
        if (rawSample !== undefined) {
          let sample = Math.max(-1, Math.min(1, rawSample));
          sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
          view.setInt16(pos, sample, true);
        }
      }
      pos += 2;
    }
    offset++;
  }

  return arrayBuffer;
}
