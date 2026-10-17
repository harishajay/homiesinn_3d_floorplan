// Procedural Web Audio API Soundscape Generator (Zero external audio file dependencies)
import { AmbientSoundtrack } from '../types/coliving';

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private currentTrack: AmbientSoundtrack = 'none';
  private masterGain: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private volume: number = 0.5;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public stop() {
    if (!this.ctx) return;
    this.activeNodes.forEach((node) => {
      if (typeof node === 'number') {
        window.clearInterval(node);
      } else if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
        try {
          (node as AudioScheduledSourceNode).stop();
        } catch {}
      } else {
        try {
          node.disconnect();
        } catch {}
      }
    });
    this.activeNodes = [];
    this.currentTrack = 'none';
  }

  public play(track: AmbientSoundtrack) {
    if (track === 'none') {
      this.stop();
      return;
    }

    this.stop();
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.currentTrack = track;

    if (track === 'sunrise-breeze') {
      // Pink Noise Breeze
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.11;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, this.ctx.currentTime);

      // Subtle LFO modulation for wind gusts
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.25, this.ctx.currentTime);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(140, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      const trackGain = this.ctx.createGain();
      trackGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(trackGain);
      trackGain.connect(this.masterGain);

      whiteNoise.start();
      lfo.start();

      this.activeNodes.push(whiteNoise, lfo, filter, trackGain);
    } else if (track === 'balcony-rain') {
      // Soft Rain
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.09;
      }

      const rainSource = this.ctx.createBufferSource();
      rainSource.buffer = noiseBuffer;
      rainSource.loop = true;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(1200, this.ctx.currentTime);
      bandpass.Q.setValueAtTime(0.6, this.ctx.currentTime);

      const rainGain = this.ctx.createGain();
      rainGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

      rainSource.connect(bandpass);
      bandpass.connect(rainGain);
      rainGain.connect(this.masterGain);
      rainSource.start();

      this.activeNodes.push(rainSource, bandpass, rainGain);
    } else if (track === 'binaural-study') {
      // Deep 40Hz Alpha/Gamma Focus Tone
      const oscLeft = this.ctx.createOscillator();
      const oscRight = this.ctx.createOscillator();
      oscLeft.type = 'sine';
      oscRight.type = 'sine';
      oscLeft.frequency.setValueAtTime(200, this.ctx.currentTime);
      oscRight.frequency.setValueAtTime(214, this.ctx.currentTime); // 14Hz Alpha differential

      const studyGain = this.ctx.createGain();
      studyGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

      oscLeft.connect(studyGain);
      oscRight.connect(studyGain);
      studyGain.connect(this.masterGain);

      oscLeft.start();
      oscRight.start();

      this.activeNodes.push(oscLeft, oscRight, studyGain);
    } else if (track === 'white-noise') {
      // Gentle Fan Whir
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.08;
      }
      const fanNoise = this.ctx.createBufferSource();
      fanNoise.buffer = noiseBuffer;
      fanNoise.loop = true;

      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(600, this.ctx.currentTime);

      const fanGain = this.ctx.createGain();
      fanGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

      fanNoise.connect(lowpass);
      lowpass.connect(fanGain);
      fanGain.connect(this.masterGain);
      fanNoise.start();

      this.activeNodes.push(fanNoise, lowpass, fanGain);
    }
  }

  public getCurrentTrack(): AmbientSoundtrack {
    return this.currentTrack;
  }
}

export const soundscapeEngine = new SoundscapeEngine();
