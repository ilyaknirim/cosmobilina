 // Audio context for sound synthesis
let audioContext;

// Initialize audio context on user interaction
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Sound synthesis functions
function playSquareWave(frequency, duration, volume = 0.1, dutyCycle = 0.5) {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function playNoise(duration, volume = 0.05) {
    if (!audioContext) return;
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = buffer;

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

    whiteNoise.connect(gainNode);
    gainNode.connect(audioContext.destination);

    whiteNoise.start(audioContext.currentTime);
    whiteNoise.stop(audioContext.currentTime + duration);
}

function playTriangleWave(frequency, duration, volume = 0.1) {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function playPulseWave(frequency, duration, volume = 0.1, pulseWidth = 0.25) {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const pulseShaper = audioContext.createWaveShaper();

    // Create pulse wave
    const pulseCurve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
        pulseCurve[i] = i < 256 * pulseWidth ? -1 : 1;
    }
    pulseShaper.curve = pulseCurve;

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

    oscillator.connect(pulseShaper);
    pulseShaper.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// Episode 1 specific functions
function playAlarmSound() {
    // Tревожный гудок - longer repeating beeps
    for (let i = 0; i < 5; i++) {
        setTimeout(() => playSquareWave(220, 2.0, 0.3), i * 1500);
    }
}

function playStatic() {
    // Треск статики - longer crackling like gunfire
    for (let i = 0; i < 8; i++) {
        setTimeout(() => playNoise(1.0, 0.15), i * 300);
    }
}

function playExplosion() {
    // Взрыв - louder
    playNoise(1.2, 0.6);
    playSquareWave(100, 0.8, 0.3);
    setTimeout(() => playTriangleWave(150, 0.5, 0.2), 150);
}

function playBackgroundMelody() {
    // Cyberpunk fairy-tale melody using triangle waves
    const notes = [
        { freq: 440, dur: 0.5 }, // A4
        { freq: 523, dur: 0.5 }, // C5
        { freq: 659, dur: 0.5 }, // E5
        { freq: 784, dur: 0.5 }, // G5
        { freq: 659, dur: 0.5 }, // E5
        { freq: 523, dur: 0.5 }, // C5
        { freq: 440, dur: 1.0 }, // A4
        { freq: 392, dur: 0.5 }, // G4
        { freq: 330, dur: 0.5 }, // E4
        { freq: 294, dur: 0.5 }, // D4
        { freq: 262, dur: 0.5 }, // C4
        { freq: 294, dur: 0.5 }, // D4
        { freq: 330, dur: 1.0 }, // E4
    ];
    let time = 0;
    notes.forEach(note => {
        setTimeout(() => playTriangleWave(note.freq, note.dur, 0.1), time * 1000);
        time += note.dur;
    });
    // Repeat the melody
    setTimeout(() => playBackgroundMelody(), time * 1000);
}
