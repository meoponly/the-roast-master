import { useRef, useCallback } from "react";

export function useAmbientSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playGlitchSound = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;

    // Dark bass drone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(55, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);

    // Static noise burst
    const bufferSize = ctx.sampleRate * 0.15;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }
    const noise = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    noise.buffer = noiseBuffer;
    noiseGain.gain.setValueAtTime(0.08, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    noise.connect(noiseGain).connect(ctx.destination);
    noise.start(now);

    // High-pitched glitch blip
    const blip = ctx.createOscillator();
    const blipGain = ctx.createGain();
    blip.type = "square";
    blip.frequency.setValueAtTime(800, now);
    blip.frequency.exponentialRampToValueAtTime(200, now + 0.1);
    blipGain.gain.setValueAtTime(0.06, now);
    blipGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    blip.connect(blipGain).connect(ctx.destination);
    blip.start(now);
    blip.stop(now + 0.12);
  }, []);

  return { playGlitchSound };
}