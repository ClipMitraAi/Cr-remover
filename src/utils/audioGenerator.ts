/**
 * Procedural Web Audio API sound generator for royalty-free background tracks
 * Completely safe, zero-copyright strikes, generated in real-time.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private activeTrackId: string | null = null;
  private masterGain: GainNode | null = null;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;
  private timerId: number | null = null;

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Create stream destination for MediaRecorder / video export
      this.destinationNode = this.ctx.createMediaStreamDestination();
      this.masterGain.connect(this.destinationNode);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getAudioStream(): MediaStream | null {
    this.init();
    return this.destinationNode ? this.destinationNode.stream : null;
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  public playTrack(trackId: string) {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    if (this.isPlaying && this.activeTrackId === trackId) {
      return;
    }
    this.stop();

    this.isPlaying = true;
    this.activeTrackId = trackId;

    const ctx = this.ctx;
    const master = this.masterGain;

    let step = 0;
    const tempoMap: Record<string, number> = {
      lofi: 75,
      synthwave: 115,
      ambient: 60,
    };
    const bpm = tempoMap[trackId] || 80;
    const intervalMs = (60 / bpm / 2) * 1000; // 8th notes

    // Musical scales for procedural chords
    const lofiChords = [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 392.0],  // Am7
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [196.0, 246.94, 293.66, 349.23], // G7
    ];

    const synthChords = [
      [130.81, 164.81, 196.0, 246.94], // C
      [110.0, 130.81, 164.81, 196.0],  // A
      [87.31, 110.0, 130.81, 164.81],  // F
      [98.0, 123.47, 146.83, 174.61],  // G
    ];

    const ambientPads = [
      [174.61, 261.63, 329.63], // F
      [196.0, 293.66, 392.0],   // G
      [220.0, 261.63, 329.63],  // Am
      [146.83, 220.0, 293.66],  // Dm
    ];

    const tick = () => {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;

      if (trackId === 'lofi') {
        const chordIndex = Math.floor(step / 8) % lofiChords.length;
        const chord = lofiChords[chordIndex];

        // Play gentle chord pad on step 0 and 8
        if (step % 8 === 0) {
          chord.forEach((freq) => {
            this.playSoftNote(freq, now, 1.8, 'sine', 0.08);
          });
        }

        // Gentle kick on 0, 4, snare tap on 2, 6
        if (step % 4 === 0) {
          this.playKick(now, 0.15);
        } else if (step % 4 === 2) {
          this.playSnare(now, 0.08);
        }
        // Subtle hi-hat every 8th note
        this.playHiHat(now, 0.03);

      } else if (trackId === 'synthwave') {
        const chordIndex = Math.floor(step / 8) % synthChords.length;
        const chord = synthChords[chordIndex];
        const bassFreq = chord[0];

        // Arpeggiated synth bassline
        const note = chord[step % chord.length];
        this.playSynthPluck(note * 1.5, now, 0.25, 'sawtooth', 0.12);
        this.playSynthPluck(bassFreq, now, 0.35, 'triangle', 0.18);

        // Driving electro drum beat
        if (step % 4 === 0) {
          this.playKick(now, 0.25);
        }
        if (step % 4 === 2) {
          this.playSnare(now, 0.15);
        }
        this.playHiHat(now, 0.06);

      } else { // Ambient Pulse
        const chordIndex = Math.floor(step / 16) % ambientPads.length;
        const pad = ambientPads[chordIndex];

        if (step % 8 === 0) {
          pad.forEach((freq) => {
            this.playSoftNote(freq * 0.75, now, 2.5, 'sine', 0.1);
          });
        }
        if (step % 8 === 0 || step % 8 === 4) {
          this.playSubPulse(now, 0.12);
        }
      }

      step = (step + 1) % 64;
      this.timerId = window.setTimeout(tick, intervalMs);
    };

    tick();
  }

  private playSoftNote(freq: number, time: number, dur: number, type: OscillatorType, gainVal: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(gainVal, time + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + dur);
  }

  private playSynthPluck(freq: number, time: number, dur: number, type: OscillatorType, gainVal: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, time);
    filter.frequency.exponentialRampToValueAtTime(300, time + dur);

    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + dur);
  }

  private playKick(time: number, gainVal: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(120, time);
    osc.frequency.exponentialRampToValueAtTime(35, time + 0.1);

    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.2);
  }

  private playSnare(time: number, gainVal: number) {
    if (!this.ctx || !this.masterGain) return;
    // Tone component
    const osc = this.ctx.createOscillator();
    const gainOsc = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(70, time + 0.08);

    gainOsc.gain.setValueAtTime(gainVal * 0.7, time);
    gainOsc.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    osc.connect(gainOsc);
    gainOsc.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.12);

    // Noise component (buffer)
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, time);

    const gainNoise = this.ctx.createGain();
    gainNoise.gain.setValueAtTime(gainVal * 0.6, time);
    gainNoise.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    noise.connect(filter);
    filter.connect(gainNoise);
    gainNoise.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.15);
  }

  private playHiHat(time: number, gainVal: number) {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 0.04;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.8;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.05);
  }

  private playSubPulse(time: number, gainVal: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(70, time);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(gainVal, time + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.9);
  }

  public stop() {
    this.isPlaying = false;
    this.activeTrackId = null;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      activeTrackId: this.activeTrackId,
    };
  }
}

export const audioEngine = new AudioEngine();
