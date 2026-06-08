import React, { useState, useEffect, useRef } from 'react';
import './Synth.css';

// --- INITIAL PRESETS WITH EXTENDED FX MATRIX ---
const PRESETS = {
  // --- PIANOS & KEYS ---
  lofiRhodes: {
    name: '👑 Lofi Rhodes', mainWave: 'triangle', subWave: 'sine', subVolume: 0.35, detune: 8, noiseHammer: 0.15,
    ampAdsr: { attack: 0.01, decay: 0.6, sustain: 0.4, release: 0.5 },
    filterAdsr: { attack: 0.01, decay: 0.35, sustain: 0.2, amount: 2500 },
    filterCutoff: 1100, filterQ: 0.8, saturation: 8, chorusMix: 0.30, phaserMix: 0.20, delayMix: 0.25, reverbMix: 0.25
  },
  brightPiano: {
    name: '🎹 Bright Grand', mainWave: 'triangle', subWave: 'triangle', subVolume: 0.15, detune: 3, noiseHammer: 0.35,
    ampAdsr: { attack: 0.002, decay: 0.5, sustain: 0.1, release: 0.3 },
    filterAdsr: { attack: 0.002, decay: 0.2, sustain: 0.05, amount: 6000 },
    filterCutoff: 1500, filterQ: 0.5, saturation: 2, chorusMix: 0.05, phaserMix: 0.0, delayMix: 0.1, reverbMix: 0.3
  },
  
  // --- BASSES ---
  subBoom: {
    name: '🔊 Sub Boom', mainWave: 'sine', subWave: 'sine', subVolume: 0.6, detune: 0, noiseHammer: 0.0,
    ampAdsr: { attack: 0.01, decay: 0.4, sustain: 0.8, release: 0.2 },
    filterAdsr: { attack: 0.01, decay: 0.2, sustain: 0.2, amount: 1000 },
    filterCutoff: 300, filterQ: 0.5, saturation: 15, chorusMix: 0, phaserMix: 0, delayMix: 0, reverbMix: 0.05
  },
  acidBass: {
    name: '☣️ Acid Bass', mainWave: 'sawtooth', subWave: 'square', subVolume: 0.4, detune: 12, noiseHammer: 0.0,
    ampAdsr: { attack: 0.005, decay: 0.2, sustain: 0.3, release: 0.15 },
    filterAdsr: { attack: 0.005, decay: 0.25, sustain: 0.1, amount: 5000 },
    filterCutoff: 450, filterQ: 3.5, saturation: 20, chorusMix: 0.1, phaserMix: 0.1, delayMix: 0.1, reverbMix: 0.1
  },

  // --- PADS & ATMOSPHERES ---
  dreamPad: {
    name: '🌌 Dream Pad', mainWave: 'triangle', subWave: 'sine', subVolume: 0.4, detune: 18, noiseHammer: 0.0,
    ampAdsr: { attack: 0.8, decay: 0.8, sustain: 0.9, release: 1.5 },
    filterAdsr: { attack: 0.5, decay: 0.5, sustain: 0.5, amount: 2000 },
    filterCutoff: 900, filterQ: 0.9, saturation: 3, chorusMix: 0.5, phaserMix: 0.4, delayMix: 0.4, reverbMix: 0.6
  },
  analogStrings: {
    name: '🎻 Analog Strings', mainWave: 'sawtooth', subWave: 'triangle', subVolume: 0.3, detune: 20, noiseHammer: 0.05,
    ampAdsr: { attack: 0.3, decay: 0.5, sustain: 0.6, release: 0.8 },
    filterAdsr: { attack: 0.3, decay: 0.4, sustain: 0.4, amount: 2500 },
    filterCutoff: 1200, filterQ: 1.2, saturation: 6, chorusMix: 0.4, phaserMix: 0.2, delayMix: 0.2, reverbMix: 0.4
  },

  // --- LEADS & PLUCKS ---
  glassyPluck: {
    name: '✨ Glassy Pluck', mainWave: 'square', subWave: 'sine', subVolume: 0.3, detune: 5, noiseHammer: 0.1,
    ampAdsr: { attack: 0.001, decay: 0.3, sustain: 0.0, release: 0.2 },
    filterAdsr: { attack: 0.001, decay: 0.15, sustain: 0.0, amount: 6500 },
    filterCutoff: 800, filterQ: 2.5, saturation: 10, chorusMix: 0.2, phaserMix: 0.0, delayMix: 0.3, reverbMix: 0.3
  }
};

// --- CUSTOM VST KNOB COMPONENT (Dra vertikalt för att vrida) ---
function VstKnob({ label, min, max, step, value, onChange, unit = "" }) {
  const knobRef = useRef(null);
  const startYRef = useRef(0);
  const startValueRef = useRef(0);

  const handleMouseDown = (e) => {
    startYRef.current = e.clientY;
    startValueRef.current = value;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    const deltaY = startYRef.current - e.clientY; // Dra uppåt ökar värdet
    const range = max - min;
    const speedMultiplier = range / 200; // Justera känslighet
    let newValue = startValueRef.current + deltaY * speedMultiplier;
    
    newValue = Math.max(min, Math.min(max, newValue));
    // Avrunda till step
    const steps = Math.round((newValue - min) / step);
    newValue = min + steps * step;
    
    onChange(parseFloat(newValue.toFixed(3)));
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Beräkna rotation i grader (-135deg till +135deg)
  const fraction = (value - min) / (max - min || 1);
  const rotation = -135 + fraction * 270;

  return (
    <div className="vst-knob-zone">
      <div className="knob-label">{label}</div>
      <div className="knob-housing" onMouseDown={handleMouseDown} ref={knobRef}>
        <div className="knob-pointer" style={{ transform: `rotate(${rotation}deg)` }} />
      </div>
      <div className="knob-value">{value}{unit}</div>
    </div>
  );
}

export function Synth() {
  const [activePreset, setActivePreset] = useState('lofiRhodes');

  // Architecture States
  const [mainWave, setMainWaveState] = useState(PRESETS.lofiRhodes.mainWave);
  const [subWave, setSubWaveState] = useState(PRESETS.lofiRhodes.subWave);
  const [subVolume, setSubVolumeState] = useState(PRESETS.lofiRhodes.subVolume);
  const [detune, setDetuneState] = useState(PRESETS.lofiRhodes.detune);
  const [noiseHammer, setNoiseHammerState] = useState(PRESETS.lofiRhodes.noiseHammer);
  const [ampAdsr, setAmpAdsrState] = useState(PRESETS.lofiRhodes.ampAdsr);
  const [filterAdsr, setFilterAdsrState] = useState(PRESETS.lofiRhodes.filterAdsr);
  const [filterCutoff, setFilterCutoff] = useState(PRESETS.lofiRhodes.filterCutoff);
  const [filterQ, setFilterQ] = useState(PRESETS.lofiRhodes.filterQ);
  const [saturation, setSaturation] = useState(PRESETS.lofiRhodes.saturation);
  const [chorusMix, setChorusMix] = useState(PRESETS.lofiRhodes.chorusMix);
  const [phaserMix, setPhaserMix] = useState(PRESETS.lofiRhodes.phaserMix);
  const [delayMix, setDelayMix] = useState(PRESETS.lofiRhodes.delayMix);
  const [reverbMix, setReverbMix] = useState(PRESETS.lofiRhodes.reverbMix);
  const [masterVolume, setMasterVolume] = useState(0.75);

  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [activeNotesCount, setActiveNotesCount] = useState(0);

  // Audio Graph Engine Refs
  const audioCtxRef = useRef(null);
  const mainGainRef = useRef(null);
  const distNodeRef = useRef(null);
  const filterNodeRef = useRef(null);
  const chorusMixRef = useRef(null);
  const phaserMixRef = useRef(null);
  const delayLeftRef = useRef(null);
  const delayRightRef = useRef(null);
  const delayMixRef = useRef(null);
  const reverbMixRef = useRef(null);
  const destRef = useRef(null);
  const activeVoicesRef = useRef(new Map());
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const settingsRef = useRef({ ...PRESETS.lofiRhodes });
  const updateSetting = (key, value) => { settingsRef.current[key] = value; };

  const loadPreset = (pKey) => {
    const p = PRESETS[pKey];
    if (!p) return;
    setActivePreset(pKey);
    setMainWaveState(p.mainWave); setSubWaveState(p.subWave); setSubVolumeState(p.subVolume); setDetuneState(p.detune); setNoiseHammerState(p.noiseHammer);
    setAmpAdsrState(p.ampAdsr); setFilterAdsrState(p.filterAdsr); setFilterCutoff(p.filterCutoff); setFilterQ(p.filterQ);
    setSaturation(p.saturation); setChorusMix(p.chorusMix); setPhaserMix(p.phaserMix); setDelayMix(p.delayMix); setReverbMix(p.reverbMix);
    settingsRef.current = { ...p };
  };

  useEffect(() => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext({ latencyHint: 'interactive' });

    // 1. Distortion Node
    const dist = ctx.createWaveShaper();
    dist.curve = makeDistortionCurve(PRESETS.lofiRhodes.saturation);
    dist.oversample = '4x';

    // 2. Ladder Lowpass Filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(PRESETS.lofiRhodes.filterCutoff, ctx.currentTime);
    filter.Q.setValueAtTime(PRESETS.lofiRhodes.filterQ, ctx.currentTime);

    // 3. Chorus Modulator
    const chorusDelay = ctx.createDelay();
    chorusDelay.delayTime.value = 0.025;
    const chorusLFO = ctx.createOscillator();
    chorusLFO.frequency.value = 1.2;
    const chorusLFOGain = ctx.createGain();
    chorusLFOGain.gain.value = 0.002;
    chorusLFO.connect(chorusLFOGain); chorusLFOGain.connect(chorusDelay.delayTime); chorusLFO.start();
    const chorusGainNode = ctx.createGain();
    chorusGainNode.gain.setValueAtTime(PRESETS.lofiRhodes.chorusMix, ctx.currentTime);
    chorusDelay.connect(chorusGainNode);

    // 4. Space Phaser Engine (4 Allpass cascade filter blocks)
    const allpass1 = ctx.createBiquadFilter(); allpass1.type = 'allpass';
    const allpass2 = ctx.createBiquadFilter(); allpass2.type = 'allpass';
    const phaserLFO = ctx.createOscillator(); phaserLFO.frequency.value = 0.4;
    const phaserLFOGain = ctx.createGain(); phaserLFOGain.gain.value = 800;
    phaserLFO.connect(phaserLFOGain); phaserLFOGain.connect(allpass1.frequency); phaserLFOGain.connect(allpass2.frequency);
    phaserLFO.start();
    const phaserGainNode = ctx.createGain();
    phaserGainNode.gain.setValueAtTime(PRESETS.lofiRhodes.phaserMix, ctx.currentTime);
    allpass1.connect(allpass2); allpass2.connect(phaserGainNode);

    // 5. Crossfeed Ping-Pong Delay Engine
    const dLeft = ctx.createDelay(1.5); dLeft.delayTime.setValueAtTime(0.33, ctx.currentTime); // 1/4 note sweet spot
    const dRight = ctx.createDelay(1.5); dRight.delayTime.setValueAtTime(0.44, ctx.currentTime); // Alternating sync
    const dFeedbackLeft = ctx.createGain(); dFeedbackLeft.gain.value = 0.35;
    const dFeedbackRight = ctx.createGain(); dFeedbackRight.gain.value = 0.35;
    const dMixNode = ctx.createGain(); dMixNode.gain.setValueAtTime(PRESETS.lofiRhodes.delayMix, ctx.currentTime);
    const dMerger = ctx.createChannelMerger(2);
    
    dLeft.connect(dFeedbackLeft); dFeedbackLeft.connect(dRight); // Cross routing
    dRight.connect(dFeedbackRight); dFeedbackRight.connect(dLeft);
    dLeft.connect(dMerger, 0, 0); dRight.connect(dMerger, 0, 1);
    dMerger.connect(dMixNode);

    // 6. Pro Ambient Convolver Space
    const reverb = ctx.createConvolver(); reverb.buffer = createStereoImpulseResponse(ctx, 3.0, 1.6);
    const rMixNode = ctx.createGain(); rMixNode.gain.setValueAtTime(PRESETS.lofiRhodes.reverbMix, ctx.currentTime);

    // 7. Master Chain & Headroom Limiter
    const mainGain = ctx.createGain(); mainGain.gain.setValueAtTime(0.75, ctx.currentTime);
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.setValueAtTime(-0.2, ctx.currentTime); limiter.knee.setValueAtTime(0, ctx.currentTime);
    limiter.ratio.setValueAtTime(20, ctx.currentTime); limiter.attack.setValueAtTime(0.001, ctx.currentTime); limiter.release.setValueAtTime(0.08, ctx.currentTime);

    // Signal Routing Assembly
    dist.connect(filter);
    filter.connect(mainGain); // Dry
    filter.connect(chorusDelay); chorusGainNode.connect(mainGain);
    filter.connect(allpass1); phaserGainNode.connect(mainGain);
    filter.connect(dLeft); dMixNode.connect(mainGain);
    filter.connect(reverb); rMixNode.connect(mainGain); reverb.connect(rMixNode);

    mainGain.connect(limiter); limiter.connect(ctx.destination);
    const dest = ctx.createMediaStreamDestination(); limiter.connect(dest);

    audioCtxRef.current = ctx; distNodeRef.current = dist; filterNodeRef.current = filter;
    chorusMixRef.current = chorusGainNode; phaserMixRef.current = phaserGainNode;
    delayLeftRef.current = dLeft; delayRightRef.current = dRight; delayMixRef.current = dMixNode;
    reverbMixRef.current = rMixNode; mainGainRef.current = mainGain; destRef.current = dest;

    return () => { ctx.close(); };
  }, []);

  // Sync Hardware Control Node Changes
  useEffect(() => {
    if (!audioCtxRef.current || !filterNodeRef.current) return;
    const now = audioCtxRef.current.currentTime;
    distNodeRef.current.curve = makeDistortionCurve(saturation);
    filterNodeRef.current.frequency.setTargetAtTime(filterCutoff, now, 0.02);
    filterNodeRef.current.Q.setTargetAtTime(filterQ, now, 0.01);
    chorusMixRef.current.gain.setTargetAtTime(chorusMix, now, 0.01);
    phaserMixRef.current.gain.setTargetAtTime(phaserMix, now, 0.01);
    delayMixRef.current.gain.setTargetAtTime(delayMix, now, 0.01);
    reverbMixRef.current.gain.setTargetAtTime(reverbMix, now, 0.01);
    mainGainRef.current.gain.setTargetAtTime(masterVolume, now, 0.01);
  }, [filterCutoff, filterQ, saturation, chorusMix, phaserMix, delayMix, reverbMix, masterVolume]);

  // MIDI Controller Core Sync
  useEffect(() => {
    let midiAccessObj = null;
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(midi => {
        midiAccessObj = midi;
        for (let input of midi.inputs.values()) input.onmidimessage = handleMidiMessage;
      });
    }
    function handleMidiMessage(msg) {
      const [command, noteNum, velocity] = msg.data;
      const status = command & 0xf0;
      if (status === 144 && velocity > 0) midiNoteOn(noteNum, velocity);
      else if (status === 128 || (status === 144 && velocity === 0)) midiNoteOff(noteNum);
    }
    return () => { if (midiAccessObj) { for (let input of midiAccessObj.inputs.values()) input.onmidimessage = null; } };
  }, []);

  const midiNoteToFreq = (note) => Math.pow(2, (note - 69) / 12) * 440;

  const midiNoteOn = (noteNum, velocity) => {
    if (!audioCtxRef.current) return;
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();

    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const current = settingsRef.current;

    if (activeVoicesRef.current.has(noteNum)) forcedVoiceSilence(noteNum);

    const activeCount = activeVoicesRef.current.size + 1;
    const voiceScale = Math.max(0.35, 1.0 / Math.sqrt(activeCount));
    const velocityGain = (velocity / 127) * 0.38 * voiceScale;

    const voiceGain = ctx.createGain();
    const oscL = ctx.createOscillator(); const oscR = ctx.createOscillator();
    const subOsc = ctx.createOscillator(); const subGain = ctx.createGain();
    const panner = ctx.createStereoPanner();
    const freq = midiNoteToFreq(noteNum);

    oscL.type = current.mainWave; oscL.frequency.setValueAtTime(freq, now); oscL.detune.setValueAtTime(-current.detune, now);
    oscR.type = current.mainWave; oscR.frequency.setValueAtTime(freq, now); oscR.detune.setValueAtTime(current.detune, now);
    subOsc.type = current.subWave; subOsc.frequency.setValueAtTime(freq / 2, now); subGain.gain.setValueAtTime(current.subVolume, now);

    let noiseNode = null;
    if (current.noiseHammer > 0) {
      const bufferSize = ctx.sampleRate * 0.04;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      noiseNode = ctx.createBufferSource(); noiseNode.buffer = buffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(current.noiseHammer * (velocity / 127), now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      noiseNode.connect(noiseGain); noiseGain.connect(voiceGain);
    }

    const panPosition = Math.min(0.5, Math.max(-0.5, ((noteNum - 60) / 36)));
    panner.pan.setValueAtTime(panPosition, now);

    oscL.connect(voiceGain); oscR.connect(voiceGain); subOsc.connect(subGain); subGain.connect(voiceGain);
    voiceGain.connect(panner); panner.connect(distNodeRef.current);

    voiceGain.gain.setValueAtTime(0, now);
    voiceGain.gain.linearRampToValueAtTime(velocityGain, now + current.ampAdsr.attack);
    voiceGain.gain.setTargetAtTime(current.ampAdsr.sustain * velocityGain, now + current.ampAdsr.attack, current.ampAdsr.decay);

    filterNodeRef.current.frequency.cancelScheduledValues(now);
    filterNodeRef.current.frequency.setValueAtTime(current.filterCutoff, now);
    filterNodeRef.current.frequency.linearRampToValueAtTime(current.filterCutoff + current.filterAdsr.amount, now + current.filterAdsr.attack);
    filterNodeRef.current.frequency.setTargetAtTime(current.filterCutoff + (current.filterAdsr.amount * current.filterAdsr.sustain), now + current.filterAdsr.attack, current.filterAdsr.decay);

    oscL.start(now); oscR.start(now); subOsc.start(now); if (noiseNode) noiseNode.start(now);
    activeVoicesRef.current.set(noteNum, { oscL, oscR, subOsc, voiceGain });
    setActiveNotesCount(activeVoicesRef.current.size);
  };

  const midiNoteOff = (noteNum) => {
    const voice = activeVoicesRef.current.get(noteNum);
    if (!voice) return;
    const now = audioCtxRef.current.currentTime;
    voice.voiceGain.gain.cancelScheduledValues(now);
    voice.voiceGain.gain.setValueAtTime(voice.voiceGain.gain.value, now);
    voice.voiceGain.gain.setTargetAtTime(0, now, settingsRef.current.ampAdsr.release);
    
    const stopTime = now + (settingsRef.current.ampAdsr.release * 4);
    voice.oscL.stop(stopTime); voice.oscR.stop(stopTime); voice.subOsc.stop(stopTime);
    activeVoicesRef.current.delete(noteNum); setActiveNotesCount(activeVoicesRef.current.size);
  };

  const forcedVoiceSilence = (noteNum) => {
    const voice = activeVoicesRef.current.get(noteNum);
    if (voice) {
      try { voice.oscL.stop(); voice.oscR.stop(); voice.subOsc.stop(); voice.voiceGain.disconnect(); } catch(e) {}
      activeVoicesRef.current.delete(noteNum);
    }
  };

  function makeDistortionCurve(amount) {
    const k = typeof amount === 'number' ? amount : 0;
    const n_samples = 44100; const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 15 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  function createStereoImpulseResponse(ctx, duration, decay) {
    const sampleRate = ctx.sampleRate; const length = sampleRate * duration;
    const impulse = ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0); const right = impulse.getChannelData(1);
    for (let i = 0; i < length; i++) {
      const percent = i / length;
      left[i] = (Math.random() * 2 - 1) * Math.pow(1 - percent, decay);
      right[i] = (Math.random() * 2 - 1) * Math.pow(1 - percent, decay);
    }
    return impulse;
  }

  const toggleRecording = () => {
    if (!isRecording) {
      recordedChunksRef.current = []; setAudioUrl(null);
      const recorder = new MediaRecorder(destRef.current.stream, { mimeType: 'audio/webm;codecs=pcm' });
      recorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        const audioBuffer = await activeCtxDecode(new Blob(recordedChunksRef.current));
        setAudioUrl(URL.createObjectURL(audioBuffer));
      };
      mediaRecorderRef.current = recorder; recorder.start(); setIsRecording(true);
    } else {
      if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const activeCtxDecode = async (blob) => {
    const arrayBuffer = await blob.arrayBuffer();
    const activeCtx = audioCtxRef.current;
    const audioBuffer = await activeCtx.decodeAudioData(arrayBuffer);
    const lco = audioBuffer.getChannelData(0);
    const buffer = new ArrayBuffer(44 + lco.length * 2); const view = new DataView(buffer);
    writeString(view, 0, 'RIFF'); view.setUint32(4, 36 + lco.length * 2, true); writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
    view.setUint32(24, activeCtx.sampleRate, true); view.setUint32(28, activeCtx.sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    writeString(view, 36, 'data'); view.setUint32(40, lco.length * 2, true);
    let offset = 44;
    for (let i = 0; i < lco.length; i++) {
      let s = Math.max(-1, Math.min(1, lco[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true); offset += 2;
    }
    return new Blob([view], { type: 'audio/wav' });
  };

  const writeString = (v, o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };

  return (
    <div className="vst-container core-pro">
      {/* PRESETS HARDWARE SELECTOR */}
      <div className="vst-preset-strip">
        <span className="vst-label-led">BANK SELECT</span>
        <div className="vst-preset-buttons">
          {Object.keys(PRESETS).map((key) => (
            <button key={key} className={`vst-btn ${activePreset === key ? 'led-on' : ''}`} onClick={() => loadPreset(key)}>
              {PRESETS[key].name}
            </button>
          ))}
        </div>
      </div>

      {/* RACK INTERFACE */}
      <div className="vst-rack-header">
        <div>
          <h2>samp1e v1 </h2>
          <div className="vst-status-display">VOICES: {activeNotesCount} // ENGINE: NOMINAL</div>
        </div>
        <div className="vst-master-section">
          <VstKnob label="MASTER" min={0} max={1} step={0.01} value={masterVolume} onChange={setMasterVolume} unit="" />
          <button className={`vst-rec-btn ${isRecording ? 'vst-rec-on' : ''}`} onClick={toggleRecording}>
            {isRecording ? '🛑 STOP' : '🔴 REC WAVE'}
          </button>
          {audioUrl && <a href={audioUrl} download="studio_track.wav" className="vst-dl-link">GET .WAV</a>}
        </div>
      </div>

      <div className="vst-dashboard">
        {/* PANEL 1: CORE OSCILLATORS */}
        <div className="vst-panel">
          <h3>1. GENERATOR</h3>
          <div className="vst-dropdown-wrapper">
            <label>CORE TYPE</label>
            <select value={mainWave} onChange={(e) => { setMainWaveState(e.target.value); updateSetting('mainWave', e.target.value); }} className="vst-select">
              <option value="triangle">TRIANGLE</option>
              <option value="sawtooth">SAWTOOTH</option>
              <option value="square">SQUARE</option>
              <option value="sine">SINE</option>
            </select>
          </div>
          <div className="vst-knob-grid">
            <VstKnob label="UNISON" min={0} max={25} step={1} value={detune} onChange={(v) => { setDetuneState(v); updateSetting('detune', v); }} unit="c" />
            <VstKnob label="HAMMER" min={0} max={0.5} step={0.01} value={noiseHammer} onChange={(v) => { setNoiseHammerState(v); updateSetting('noiseHammer', v); }} unit="" />
            <VstKnob label="SUB VOL" min={0} max={0.6} step={0.05} value={subVolume} onChange={(v) => { setSubVolumeState(v); updateSetting('subVolume', v); }} unit="" />
          </div>
        </div>

        {/* PANEL 2: AMP ENVELOPE */}
        <div className="vst-panel">
          <h3>2. AMP ENV</h3>
          <div className="vst-knob-grid">
            <VstKnob label="ATTACK" min={0.001} max={0.5} step={0.005} value={ampAdsr.attack} onChange={(v) => { setAmpAdsrState(p=>({...p, attack: v})); updateSetting('ampAdsr', {...settingsRef.current.ampAdsr, attack: v}); }} unit="s" />
            <VstKnob label="DECAY" min={0.05} max={2} step={0.05} value={ampAdsr.decay} onChange={(v) => { setAmpAdsrState(p=>({...p, decay: v})); updateSetting('ampAdsr', {...settingsRef.current.ampAdsr, decay: v}); }} unit="s" />
            <VstKnob label="SUSTAIN" min={0} max={1} step={0.05} value={ampAdsr.sustain} onChange={(v) => { setAmpAdsrState(p=>({...p, sustain: v})); updateSetting('ampAdsr', {...settingsRef.current.ampAdsr, sustain: v}); }} unit="" />
            <VstKnob label="RELEASE" min={0.05} max={3} step={0.05} value={ampAdsr.release} onChange={(v) => { setAmpAdsrState(p=>({...p, release: v})); updateSetting('ampAdsr', {...settingsRef.current.ampAdsr, release: v}); }} unit="s" />
          </div>
        </div>

        {/* PANEL 3: LADDER FILTER */}
        <div className="vst-panel">
          <h3>3. FILTER MATRIX</h3>
          <div className="vst-knob-grid">
            <VstKnob label="CUTOFF" min={60} max={4000} step={50} value={filterCutoff} onChange={(v) => { setFilterCutoff(v); updateSetting('filterCutoff', v); }} unit="Hz" />
            <VstKnob label="RES (Q)" min={0.1} max={5} step={0.05} value={filterQ} onChange={setFilterQ} unit="" />
            <VstKnob label="MOD AMT" min={0} max={7000} step={100} value={filterAdsr.amount} onChange={(v) => { setFilterAdsrState(p=>({...p, amount: v})); updateSetting('filterAdsr', {...settingsRef.current.filterAdsr, amount: v}); }} unit="Hz" />
            <VstKnob label="MOD DEC" min={0.01} max={1.5} step={0.05} value={filterAdsr.decay} onChange={(v) => { setFilterAdsrState(p=>({...p, decay: v})); updateSetting('filterAdsr', {...settingsRef.current.filterAdsr, decay: v}); }} unit="s" />
          </div>
        </div>

        {/* PANEL 4: MASTER EFFECTS EXTRAVAGANZA */}
        <div className="vst-panel span-fx">
          <h3>4. DIGITAL FX PROCESSING STUDIO</h3>
          <div className="vst-knob-grid fx-wide">
            <VstKnob label="SATURATION" min={0} max={25} step={1} value={saturation} onChange={setSaturation} unit="" />
            <VstKnob label="CHORUS" min={0} max={0.6} step={0.05} value={chorusMix} onChange={setChorusMix} unit="" />
            <VstKnob label="PHASER" min={0} max={0.6} step={0.05} value={phaserMix} onChange={setPhaserMix} unit="" />
            <VstKnob label="P-P DELAY" min={0} max={0.6} step={0.05} value={delayMix} onChange={setDelayMix} unit="" />
            <VstKnob label="REVERB" min={0} max={0.6} step={0.05} value={reverbMix} onChange={setReverbMix} unit="" />
          </div>
        </div>
      </div>
    </div>
  );
}