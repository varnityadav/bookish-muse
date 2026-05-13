/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Simple Web Audio API ambient generator
class AmbientGenerator {
  private audioCtx: AudioContext | null = null;
  private noiseNode: AudioNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;

  start() {
    if (this.audioCtx) return;
    
    this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create random noise for "sea/wind" vibe
    const bufferSize = 2 * this.audioCtx.sampleRate;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseSource = this.audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Filter the noise to make it "ambient"
    this.filterNode = this.audioCtx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(400, this.audioCtx.currentTime);
    this.filterNode.Q.setValueAtTime(1, this.audioCtx.currentTime);

    // Fade in/out LFO for "waves"
    const lfo = this.audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.1, this.audioCtx.currentTime); // 10 seconds per wave
    
    const lfoGain = this.audioCtx.createGain();
    lfoGain.gain.setValueAtTime(100, this.audioCtx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(this.filterNode.frequency);
    lfo.start();

    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(0.1, this.audioCtx.currentTime + 2);

    noiseSource.connect(this.filterNode);
    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(this.audioCtx.destination);
    
    noiseSource.start();
    this.noiseNode = noiseSource;
  }

  stop() {
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 1);
      setTimeout(() => {
        this.audioCtx?.close();
        this.audioCtx = null;
      }, 1000);
    }
  }

  setVolume(v: number) {
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setTargetAtTime(v, this.audioCtx.currentTime, 0.1);
    }
  }
}

export const ambient = new AmbientGenerator();
