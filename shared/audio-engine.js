/* ============================================================
   RhythmIn — Audio Engine
   Multi-stem playback with mute/solo/volume/pan, level metering,
   and a master bus. Built on Web Audio API.
   ============================================================ */

class StemEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.masterAnalyser = null;
    this.stems = new Map(); // id -> { buffer, gain, panner, analyser, source, ... }
    this.playing = false;
    this.startTime = 0;
    this.startOffset = 0;
    this.duration = 0;
    this.loop = false;
    this._onTick = null;
    this._raf = null;
  }

  async init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.9;
    this.masterAnalyser = this.ctx.createAnalyser();
    this.masterAnalyser.fftSize = 512;
    this.master.connect(this.masterAnalyser);
    this.masterAnalyser.connect(this.ctx.destination);
  }

  async addStem(id, url, meta = {}) {
    await this.init();
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    const ab = await res.arrayBuffer();
    const buffer = await this.ctx.decodeAudioData(ab);
    return this.addBuffer(id, buffer, meta);
  }

  addBuffer(id, buffer, meta = {}) {
    if (!this.ctx) throw new Error('Audio engine is not initialized');
    if (buffer.duration > this.duration) this.duration = buffer.duration;

    const gain = this.ctx.createGain();
    gain.gain.value = meta.volume ?? 0.8;
    const panner = this.ctx.createStereoPanner();
    panner.pan.value = meta.pan ?? 0;
    const analyser = this.ctx.createAnalyser();
    analyser.fftSize = 256;

    gain.connect(panner);
    panner.connect(analyser);
    analyser.connect(this.master);

    this.stems.set(id, {
      buffer, gain, panner, analyser,
      source: null,
      volume: gain.gain.value,
      pan: panner.pan.value,
      muted: false,
      soloed: false,
      meta,
      _levels: new Uint8Array(analyser.frequencyBinCount),
    });
    return this.stems.get(id);
  }

  removeStem(id) {
    const s = this.stems.get(id);
    if (!s) return;
    try { s.source?.stop(); } catch(e){}
    s.gain.disconnect();
    s.panner.disconnect();
    s.analyser.disconnect();
    this.stems.delete(id);
  }

  _applyMuteSolo() {
    const anySolo = [...this.stems.values()].some(s => s.soloed);
    for (const s of this.stems.values()) {
      const audible = !s.muted && (!anySolo || s.soloed);
      s.gain.gain.value = audible ? s.volume : 0.0001;
    }
  }

  setVolume(id, v) {
    const s = this.stems.get(id);
    if (!s) return;
    s.volume = Math.max(0, Math.min(1.5, v));
    this._applyMuteSolo();
  }
  setPan(id, p) {
    const s = this.stems.get(id);
    if (!s) return;
    s.pan = Math.max(-1, Math.min(1, p));
    s.panner.pan.value = s.pan;
  }
  setMute(id, mute) {
    const s = this.stems.get(id);
    if (!s) return;
    s.muted = !!mute;
    this._applyMuteSolo();
  }
  setSolo(id, solo) {
    const s = this.stems.get(id);
    if (!s) return;
    s.soloed = !!solo;
    this._applyMuteSolo();
  }
  setMasterVolume(v) {
    if (this.master) this.master.gain.value = Math.max(0, Math.min(1.5, v));
  }

  async play(fromOffset = null) {
    await this.init();
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    if (this.playing) this.stop(false);
    const offset = fromOffset !== null ? fromOffset : this.startOffset;
    const now = this.ctx.currentTime + 0.05;
    for (const s of this.stems.values()) {
      const src = this.ctx.createBufferSource();
      src.buffer = s.buffer;
      src.loop = this.loop;
      src.connect(s.gain);
      src.start(now, offset);
      s.source = src;
    }
    this.startTime = now;
    this.startOffset = offset;
    this.playing = true;
    this._tick();
    this._onEnded();
    return true;
  }

  pause() {
    if (!this.playing) return;
    const t = this.currentTime();
    this.stop(false);
    this.startOffset = t;
  }

  stop(reset = true) {
    for (const s of this.stems.values()) {
      try { s.source?.stop(); } catch (e) {}
      s.source = null;
    }
    this.playing = false;
    if (reset) this.startOffset = 0;
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
  }

  seek(offset) {
    const wasPlaying = this.playing;
    this.stop(false);
    this.startOffset = Math.max(0, Math.min(this.duration, offset));
    if (wasPlaying) this.play(this.startOffset);
  }

  toggleLoop(on) {
    this.loop = on !== undefined ? on : !this.loop;
    for (const s of this.stems.values()) {
      if (s.source) s.source.loop = this.loop;
    }
  }

  currentTime() {
    if (!this.ctx) return 0;
    if (this.playing) {
      const t = this.startOffset + (this.ctx.currentTime - this.startTime);
      if (this.loop && this.duration > 0) return t % this.duration;
      return Math.min(t, this.duration);
    }
    return this.startOffset;
  }

  onTick(cb) { this._onTick = cb; }
  onEnded(cb) { this._onEndedCb = cb; }

  _tick() {
    if (!this.playing) return;
    if (this._onTick) {
      const t = this.currentTime();
      const stemLevels = new Map();
      for (const [id, s] of this.stems.entries()) {
        s.analyser.getByteFrequencyData(s._levels);
        let sum = 0;
        for (let i = 0; i < s._levels.length; i++) sum += s._levels[i];
        stemLevels.set(id, sum / s._levels.length / 255);
      }
      const mBuf = new Uint8Array(this.masterAnalyser.frequencyBinCount);
      this.masterAnalyser.getByteFrequencyData(mBuf);
      let sum = 0;
      for (let i = 0; i < mBuf.length; i++) sum += mBuf[i];
      const masterLvl = sum / mBuf.length / 255;
      this._onTick({ time: t, stemLevels, masterLevel: masterLvl });
    }
    this._raf = requestAnimationFrame(() => this._tick());
  }

  _onEnded() {
    if (this.loop) return;
    // Detect end using duration
    const checkEnd = () => {
      if (!this.playing) return;
      if (this.currentTime() >= this.duration - 0.02) {
        this.stop(true);
        if (this._onEndedCb) this._onEndedCb();
        return;
      }
      setTimeout(checkEnd, 100);
    };
    setTimeout(checkEnd, 100);
  }

  // Render mix down to WAV blob (offline)
  async exportMix(options = { includeStems: null, format: 'wav', sampleRate: 44100 }) {
    if (this.stems.size === 0) throw new Error('No stems loaded');
    const anySolo = [...this.stems.values()].some(s => s.soloed);
    const includeStems = options.includeStems || [...this.stems.keys()];
    const dur = this.duration;
    const sr = options.sampleRate;
    const offCtx = new OfflineAudioContext(2, Math.floor(sr * dur), sr);
    const master = offCtx.createGain();
    master.gain.value = this.master.gain.value;
    master.connect(offCtx.destination);
    for (const id of includeStems) {
      const s = this.stems.get(id);
      if (!s) continue;
      const audible = !s.muted && (!anySolo || s.soloed);
      const src = offCtx.createBufferSource();
      src.buffer = s.buffer;
      const g = offCtx.createGain();
      g.gain.value = audible ? s.volume : 0;
      const p = offCtx.createStereoPanner();
      p.pan.value = s.pan;
      src.connect(g).connect(p).connect(master);
      src.start(0);
    }
    const rendered = await offCtx.startRendering();
    return audioBufferToWavBlob(rendered);
  }
}

// ---- WAV encoder ----
function audioBufferToWavBlob(buffer) {
  const numCh = buffer.numberOfChannels;
  const sr = buffer.sampleRate;
  const len = buffer.length * numCh * 2;
  const buf = new ArrayBuffer(44 + len);
  const view = new DataView(buf);
  const w = (o, s) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF');
  view.setUint32(4, 36 + len, true);
  w(8, 'WAVE'); w(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numCh, true);
  view.setUint32(24, sr, true);
  view.setUint32(28, sr * numCh * 2, true);
  view.setUint16(32, numCh * 2, true);
  view.setUint16(34, 16, true);
  w(36, 'data');
  view.setUint32(40, len, true);
  let off = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numCh; c++) {
      let s = Math.max(-1, Math.min(1, buffer.getChannelData(c)[i]));
      view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      off += 2;
    }
  }
  return new Blob([buf], { type: 'audio/wav' });
}

// ---- Waveform peaks extractor ----
async function extractPeaks(buffer, targetBins = 400) {
  const data = buffer.getChannelData(0);
  const step = Math.max(1, Math.floor(data.length / targetBins));
  const peaks = new Float32Array(targetBins);
  for (let i = 0; i < targetBins; i++) {
    let max = 0;
    const start = i * step;
    const end = Math.min(start + step, data.length);
    for (let j = start; j < end; j++) {
      const v = Math.abs(data[j]);
      if (v > max) max = v;
    }
    peaks[i] = max;
  }
  return peaks;
}

// ---- Download helper ----
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

window.RhythmInAudio = { StemEngine, audioBufferToWavBlob, extractPeaks, downloadBlob };
