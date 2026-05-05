import { useRef, useState, useCallback, useEffect } from 'react';
import workletSource from '../worklets/brownNoise.worklet.ts?raw';

interface AmbientSoundState {
  isOn: boolean;
  volume: number;
  toggle: () => void;
  setVolume: (v: number) => void;
}

export function useAmbientSound(): AmbientSoundState {
  const [isOn, setIsOn] = useState(false);
  const [volume, setVolumeState] = useState(0.4);

  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const noiseRef = useRef<AudioWorkletNode | ScriptProcessorNode | null>(null);
  const initialized = useRef(false);

  const buildGraph = useCallback(async (ctx: AudioContext, vol: number) => {
    const master = ctx.createGain();
    master.gain.setValueAtTime(vol, ctx.currentTime);
    master.connect(ctx.destination);
    masterGainRef.current = master;

    const compressor = ctx.createDynamicsCompressor();
    compressor.connect(master);

    // Low-pass to shape noise into rumble
    const lpFilter = ctx.createBiquadFilter();
    lpFilter.type = 'lowpass';
    lpFilter.frequency.setValueAtTime(900, ctx.currentTime);
    lpFilter.Q.setValueAtTime(0.5, ctx.currentTime);
    lpFilter.connect(compressor);

    // High-pass to cut mud
    const hpFilter = ctx.createBiquadFilter();
    hpFilter.type = 'highpass';
    hpFilter.frequency.setValueAtTime(80, ctx.currentTime);
    hpFilter.connect(lpFilter);

    // Brown noise source
    let noiseNode: AudioWorkletNode | ScriptProcessorNode;
    try {
      const blob = new Blob([workletSource], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      await ctx.audioWorklet.addModule(url);
      URL.revokeObjectURL(url);
      noiseNode = new AudioWorkletNode(ctx, 'brown-noise-processor');
    } catch {
      // Safari / old browser fallback: ScriptProcessorNode
      noiseNode = ctx.createScriptProcessor(4096, 1, 1);
      let lastOut = 0;
      (noiseNode as ScriptProcessorNode).onaudioprocess = (e) => {
        const out = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < out.length; i++) {
          const white = Math.random() * 2 - 1;
          lastOut = (lastOut + 0.02 * white) / 1.02;
          out[i] = lastOut * 3.5;
        }
      };
    }

    noiseNode.connect(hpFilter);
    noiseRef.current = noiseNode;

    // Gurgle layer: a few oscillators with random LFO modulation
    const gurgleCount = 6;
    for (let i = 0; i < gurgleCount; i++) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200 + Math.random() * 600, ctx.currentTime);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.003, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.1 + Math.random() * 0.4, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.003, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(oscGain.gain);

      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(400, ctx.currentTime);
      bp.Q.setValueAtTime(0.8, ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(bp);
      bp.connect(compressor);

      osc.start();
      lfo.start();

      // Randomize frequencies every few seconds
      const randomize = () => {
        if (ctx.state !== 'closed') {
          osc.frequency.setTargetAtTime(200 + Math.random() * 600, ctx.currentTime, 0.5);
          setTimeout(randomize, 3000 + Math.random() * 5000);
        }
      };
      setTimeout(randomize, 3000 + Math.random() * 5000);
    }
  }, []);

  const toggle = useCallback(async () => {
    if (!isOn) {
      // Turn on
      if (!initialized.current) {
        const ctx = new AudioContext();
        ctxRef.current = ctx;
        await buildGraph(ctx, volume);
        initialized.current = true;
      } else if (ctxRef.current && masterGainRef.current) {
        if (ctxRef.current.state === 'suspended') {
          await ctxRef.current.resume();
        }
        masterGainRef.current.gain.setTargetAtTime(volume, ctxRef.current.currentTime, 0.1);
      }
      setIsOn(true);
    } else {
      // Turn off — fade out, don't close context
      if (ctxRef.current && masterGainRef.current) {
        masterGainRef.current.gain.setTargetAtTime(0, ctxRef.current.currentTime, 0.15);
      }
      setIsOn(false);
    }
  }, [isOn, volume, buildGraph]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (isOn && ctxRef.current && masterGainRef.current) {
      masterGainRef.current.gain.setTargetAtTime(v, ctxRef.current.currentTime, 0.05);
    }
  }, [isOn]);

  useEffect(() => {
    return () => {
      ctxRef.current?.close();
    };
  }, []);

  return { isOn, volume, toggle, setVolume };
}
