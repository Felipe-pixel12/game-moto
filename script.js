/**
 * ===================================================================
 * MOTO TRILHA 3D — Jogo de Motocross Arcade em Three.js
 * Arquitetura Modular em JavaScript Puro
 * ===================================================================
 */

'use strict';

/* ===================================================================
   1. CONFIGURAÇÕES GERAIS E DADOS DAS 5 FASES
   =================================================================== */
const STAGES_DATA = [
  {
    id: 1,
    name: "Trilha Verde",
    theme: "Colinas ensolaradas e vegetação",
    distance: 450,
    coinsCount: 20,
    checkpoints: [120, 240, 360],
    skyColor: 0x87ceeb,
    fogColor: 0xc8e6c9,
    fogDensity: 0.005,
    ambientColor: 0x90caf9,
    sunColor: 0xfff9c4,
    groundColor: 0x4caf50,
    trackColor: 0x8d6e63,
    rockColor: 0x78909c,
    difficulty: "Iniciante",
    ambientMusicTempo: 115,
    terrainNoise: { amp: 6, freq: 0.015, rampFreq: 75, rampAmp: 7 },
    scenery: { trees: true, rocks: true, cacti: false, lava: false, bridges: false }
  },
  {
    id: 2,
    name: "Montanha Rochosa",
    theme: "Subidas íngremes, pedras e grandes saltos",
    distance: 600,
    coinsCount: 25,
    checkpoints: [160, 320, 480],
    skyColor: 0xffb74d,
    fogColor: 0xffcc80,
    fogDensity: 0.004,
    ambientColor: 0xffe082,
    sunColor: 0xffa726,
    groundColor: 0x6d4c41,
    trackColor: 0x5d4037,
    rockColor: 0x546e7a,
    difficulty: "Intermediário",
    ambientMusicTempo: 125,
    terrainNoise: { amp: 11, freq: 0.018, rampFreq: 85, rampAmp: 11 },
    scenery: { trees: true, rocks: true, cacti: false, lava: false, bridges: true }
  },
  {
    id: 3,
    name: "Dunas do Deserto",
    theme: "Areias douradas, cactos e alta velocidade",
    distance: 750,
    coinsCount: 30,
    checkpoints: [200, 400, 600],
    skyColor: 0xff7043,
    fogColor: 0xffab91,
    fogDensity: 0.0035,
    ambientColor: 0xffcc80,
    sunColor: 0xff5722,
    groundColor: 0xdeb887,
    trackColor: 0xd2b48c,
    rockColor: 0xa1887f,
    difficulty: "Avançado",
    ambientMusicTempo: 130,
    terrainNoise: { amp: 8, freq: 0.012, rampFreq: 90, rampAmp: 12 },
    scenery: { trees: false, rocks: true, cacti: true, lava: false, bridges: false }
  },
  {
    id: 4,
    name: "Floresta Sombria",
    theme: "Terreno irregular, neblina e pontes de madeira",
    distance: 900,
    coinsCount: 35,
    checkpoints: [240, 480, 720],
    skyColor: 0x37474f,
    fogColor: 0x263238,
    fogDensity: 0.007,
    ambientColor: 0x546e7a,
    sunColor: 0x80cbc4,
    groundColor: 0x2e7d32,
    trackColor: 0x3e2723,
    rockColor: 0x37474f,
    difficulty: "Difícil",
    ambientMusicTempo: 135,
    terrainNoise: { amp: 10, freq: 0.02, rampFreq: 80, rampAmp: 10 },
    scenery: { trees: true, rocks: true, cacti: false, lava: false, bridges: true }
  },
  {
    id: 5,
    name: "Vulcão em Chamas",
    theme: "Rochas escuras, fendas de magma e saltos colossais",
    distance: 1050,
    coinsCount: 40,
    checkpoints: [280, 560, 840],
    skyColor: 0x210404,
    fogColor: 0x3e100c,
    fogDensity: 0.0065,
    ambientColor: 0xff3d00,
    sunColor: 0xff6d00,
    groundColor: 0x212121,
    trackColor: 0x1a1a1a,
    rockColor: 0x263238,
    difficulty: "Extremo",
    ambientMusicTempo: 142,
    terrainNoise: { amp: 14, freq: 0.022, rampFreq: 95, rampAmp: 14 },
    scenery: { trees: false, rocks: true, cacti: false, lava: true, bridges: true }
  }
];

/* ===================================================================
   2. SISTEMA DE ARMAZENAMENTO LOCAL (localStorage)
   =================================================================== */
class StorageManager {
  static KEY_PROGRESS = "moto_trilha_3d_progress";
  static KEY_SETTINGS = "moto_trilha_3d_settings";

  static getProgress() {
    try {
      const data = localStorage.getItem(this.KEY_PROGRESS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn("Falha ao ler localStorage", e);
    }
    // Padrão: Fase 1 liberada
    return {
      unlockedStage: 1,
      bestTimes: {},
      collectedCoins: {},
      totalCoinsEver: 0
    };
  }

  static saveProgress(progress) {
    try {
      localStorage.setItem(this.KEY_PROGRESS, JSON.stringify(progress));
    } catch (e) {
      console.warn("Falha ao salvar progresso", e);
    }
  }

  static getSettings() {
    try {
      const data = localStorage.getItem(this.KEY_SETTINGS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn("Falha ao ler settings", e);
    }
    return {
      sfxVolume: 0.8,
      musicVolume: 0.5,
      sfxEnabled: true,
      musicEnabled: true,
      graphicsQuality: "medium", // low, medium, high
      particlesEnabled: true,
      controlSens: 1.0
    };
  }

  static saveSettings(settings) {
    try {
      localStorage.setItem(this.KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn("Falha ao salvar settings", e);
    }
  }

  static resetAll() {
    try {
      localStorage.removeItem(this.KEY_PROGRESS);
    } catch (e) {}
  }
}

/* ===================================================================
   3. SISTEMA DE ÁUDIO PROCEDURAL (Web Audio API 100% Autônomo)
   =================================================================== */
class SoundManager {
  constructor() {
    this.ctx = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.masterGain = null;
    this.engineOsc = null;
    this.engineGain = null;
    this.engineFilter = null;
    this.isEngineRunning = false;
    this.settings = StorageManager.getSettings();
    this.isMusicPlaying = false;
    this.musicInterval = null;
    this.currentStep = 0;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.settings.sfxEnabled ? this.settings.sfxVolume : 0, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.settings.musicEnabled ? this.settings.musicVolume * 0.35 : 0, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.setupEngineSound();
    } catch (e) {
      console.warn("Web Audio API indisponível no navegador", e);
    }
  }

  resumeContext() {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  setupEngineSound() {
    if (!this.ctx) return;
    // Oscilador de onda dente de serra para ronco de motor 2 tempos / 4 tempos
    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = "sawtooth";
    this.engineOsc.frequency.setValueAtTime(45, this.ctx.currentTime);

    // Filtro passa-baixa para suavizar o timbre metálico do motor
    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = "lowpass";
    this.engineFilter.frequency.setValueAtTime(280, this.ctx.currentTime);
    this.engineFilter.Q.setValueAtTime(3, this.ctx.currentTime);

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.engineOsc.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.sfxGain);

    this.engineOsc.start();
    this.isEngineRunning = true;
  }

  updateEngine(speed, isAccelerating, inAir) {
    if (!this.ctx || !this.engineGain) return;
    const now = this.ctx.currentTime;
    const baseFreq = 45;
    const speedFactor = Math.abs(speed);

    // Frequência varia de 45Hz na marcha lenta até 240Hz na velocidade máxima
    let targetFreq = baseFreq + speedFactor * 3.8;
    if (isAccelerating) targetFreq += 28;
    if (inAir && isAccelerating) targetFreq += 45; // Giro livre no ar

    this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.08);
    this.engineFilter.frequency.setTargetAtTime(260 + speedFactor * 14, now, 0.08);

    // Volume do motor
    const targetVol = Math.min(0.22, 0.05 + speedFactor * 0.003 + (isAccelerating ? 0.06 : 0));
    this.engineGain.gain.setTargetAtTime(targetVol, now, 0.06);
  }

  stopEngine() {
    if (this.engineGain && this.ctx) {
      this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    }
  }

  // Som de coleta de moeda (duas notas cristalinas agudas)
  playCoin() {
    if (!this.ctx || !this.settings.sfxEnabled) return;
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = "sine";
    osc2.type = "triangle";

    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    osc2.frequency.setValueAtTime(1975.53, now);
    osc2.frequency.setValueAtTime(2637.02, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.36);
    osc2.stop(now + 0.36);
  }

  // Som de Checkpoint (acorde triunfal ascendente)
  playCheckpoint() {
    if (!this.ctx || !this.settings.sfxEnabled) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0, now + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.55);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.6);
    });
  }

  // Som de Impacto no Solo / Pouso
  playLanding(intensity = 1.0) {
    if (!this.ctx || !this.settings.sfxEnabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.18);

    const vol = Math.min(0.35, 0.15 * intensity);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Som de Freio / Derrapagem
  playBrakeSkid() {
    if (!this.ctx || !this.settings.sfxEnabled) return;
    // Ruído branco rápido com filtro passa-banda
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.12;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1100, now);
    filter.Q.setValueAtTime(4, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
  }

  // Som de Colisão / Capotamento
  playCrash() {
    if (!this.ctx || !this.settings.sfxEnabled) return;
    const now = this.ctx.currentTime;

    // Onda grave de explosão
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + 0.45);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.52);
  }

  // Som de Vitória / Linha de Chegada
  playVictory() {
    if (!this.ctx || !this.settings.sfxEnabled) return;
    const now = this.ctx.currentTime;
    // Fanfarra triunfal: G4, C5, E5, G5
    const melody = [
      { f: 392.00, d: 0.15 },
      { f: 523.25, d: 0.15 },
      { f: 659.25, d: 0.15 },
      { f: 783.99, d: 0.45 }
    ];
    let offset = 0;
    melody.forEach((note) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(note.f, now + offset);

      gain.gain.setValueAtTime(0.3, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + note.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + offset);
      osc.stop(now + offset + note.d + 0.05);
      offset += note.d + 0.04;
    });
  }

  // Som de clique nos botões
  playClick() {
    if (!this.ctx || !this.settings.sfxEnabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(250, now + 0.06);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Música procedural retro arcade sintetizada
  startMusic(tempo = 120) {
    if (!this.ctx || this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    const stepDuration = 60 / tempo / 2; // Semicolcheias
    const bassline = [110, 110, 130.81, 110, 146.83, 110, 164.81, 130.81];

    this.musicInterval = setInterval(() => {
      if (!this.isMusicPlaying || !this.ctx || !this.settings.musicEnabled) return;
      const now = this.ctx.currentTime;

      // Baixo sintético
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(bassline[this.currentStep % bassline.length], now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 0.9);

      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(now);
      osc.stop(now + stepDuration);

      // Hi-hat rítmico a cada 2 passos
      if (this.currentStep % 2 === 0) {
        const noiseBuf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.03, this.ctx.sampleRate);
        const data = noiseBuf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.08;

        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuf;

        const hpf = this.ctx.createBiquadFilter();
        hpf.type = "highpass";
        hpf.frequency.setValueAtTime(6000, now);

        const hGain = this.ctx.createGain();
        hGain.gain.setValueAtTime(0.08, now);
        hGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        noise.connect(hpf);
        hpf.connect(hGain);
        hGain.connect(this.musicGain);
        noise.start(now);
      }

      this.currentStep++;
    }, stepDuration * 1000);
  }

  stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  updateVolumes(settings) {
    this.settings = settings;
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.sfxGain) {
      this.sfxGain.gain.setValueAtTime(settings.sfxEnabled ? settings.sfxVolume : 0, now);
    }
    if (this.musicGain) {
      this.musicGain.gain.setValueAtTime(settings.musicEnabled ? settings.musicVolume * 0.35 : 0, now);
    }
  }
}

/* ===================================================================
   4. SISTEMA DE PARTÍCULAS
   =================================================================== */
class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.maxParticles = 120;

    // Geometria compartilhada para eficiência
    this.geoBox = new THREE.BoxGeometry(0.18, 0.18, 0.18);
    this.geoSpark = new THREE.PlaneGeometry(0.2, 0.2);

    this.matDust = new THREE.MeshBasicMaterial({ color: 0xc4a482, transparent: true, opacity: 0.6 });
    this.matSmoke = new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.5 });
    this.matSpark = new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
    this.matLava = new THREE.MeshBasicMaterial({ color: 0xff3700, transparent: true, opacity: 0.8 });
  }

  spawn(pos, vel, colorType = "dust", life = 0.6, scale = 1.0) {
    if (this.particles.length >= this.maxParticles) {
      const old = this.particles.shift();
      this.scene.remove(old.mesh);
    }

    let mat = this.matDust;
    if (colorType === "smoke") mat = this.matSmoke;
    else if (colorType === "spark") mat = this.matSpark;
    else if (colorType === "lava") mat = this.matLava;

    const mesh = new THREE.Mesh(this.geoBox, mat.clone());
    mesh.position.copy(pos);
    mesh.scale.setScalar(scale);
    mesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);

    this.scene.add(mesh);
    this.particles.push({
      mesh: mesh,
      vel: vel.clone(),
      life: life,
      maxLife: life,
      initialScale: scale
    });
  }

  // Rastro de poeira da roda traseira
  emitWheelDust(pos, isSkidding = false) {
    const spreadX = (Math.random() - 0.5) * 0.4;
    const spreadY = Math.random() * 0.8 + 0.3;
    const spreadZ = -Math.random() * 1.5 - 0.5;

    const vel = new THREE.Vector3(spreadX, spreadY, spreadZ);
    const type = isSkidding ? "smoke" : "dust";
    this.spawn(pos, vel, type, 0.55, isSkidding ? 1.4 : 0.8);
  }

  // Impacto de aterrissagem
  emitImpactDust(pos, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = Math.random() * 3 + 1.5;
      const vel = new THREE.Vector3(Math.cos(angle) * speed, Math.random() * 1.2 + 0.6, Math.sin(angle) * speed);
      this.spawn(pos, vel, "dust", 0.7, 1.2);
    }
  }

  // Brilho de coleta de moeda
  emitCoinSparkles(pos, count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const vel = new THREE.Vector3(Math.cos(angle) * 2.5, Math.random() * 3 + 1, Math.sin(angle) * 2.5);
      this.spawn(pos, vel, "spark", 0.5, 1.3);
    }
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
        continue;
      }

      p.mesh.position.addScaledVector(p.vel, dt);
      p.vel.y -= 4.0 * dt; // Gravidade na poeira
      p.vel.x *= 0.96;
      p.vel.z *= 0.96;

      const progress = p.life / p.maxLife;
      p.mesh.material.opacity = progress * 0.8;
      p.mesh.scale.setScalar(p.initialScale * (1 + (1 - progress) * 0.8));
    }
  }

  clear() {
    this.particles.forEach(p => this.scene.remove(p.mesh));
    this.particles = [];
  }
}

/* ===================================================================
   5. GERADOR PROCEDURAL DE TERRENO 3D
   =================================================================== */
class TerrainManager {
  constructor(scene) {
    this.scene = scene;
    this.terrainMesh = null;
    this.trackMesh = null;
    this.currentStageData = null;
    this.trackWidth = 8.0;
  }

  // Função matemática contínua de altura do terreno
  getHeight(x, z) {
    if (!this.currentStageData) return 0;
    const cfg = this.currentStageData.terrainNoise;

    // Elevação básica em ondas
    let h = Math.sin(z * cfg.freq) * Math.cos(x * 0.08) * cfg.amp;
    h += Math.sin(z * cfg.freq * 2.3 + 1.2) * (cfg.amp * 0.35);

    // Rampas de salto específicas distribuídas ao longo da pista
    const rampCycle = z % cfg.rampFreq;
    if (rampCycle > cfg.rampFreq - 16 && rampCycle < cfg.rampFreq - 4) {
      const rampT = (rampCycle - (cfg.rampFreq - 16)) / 12;
      // Curva da rampa suave para impulso vertical
      h += Math.sin(rampT * Math.PI * 0.5) * cfg.rampAmp;
    }

    // Bordas elevadas fora da pista para manter a sensação de vale/trilha
    const distFromCenter = Math.abs(x);
    if (distFromCenter > this.trackWidth * 0.5) {
      const sideDist = distFromCenter - this.trackWidth * 0.5;
      h += Math.pow(sideDist, 1.4) * 0.6;
    }

    return h;
  }

  build(stageData) {
    this.currentStageData = stageData;
    this.dispose();

    const trackLength = stageData.distance + 100;
    const segmentsZ = Math.floor(trackLength / 2.5);
    const segmentsX = 24;
    const totalWidth = 50;

    const geometry = new THREE.PlaneGeometry(totalWidth, trackLength, segmentsX, segmentsZ);
    // Rotacionar plano para ficar deitado no eixo XZ
    geometry.rotateX(-Math.PI / 2);
    // Posicionar centro ao longo de Z positivo
    geometry.translate(0, 0, trackLength / 2 - 20);

    const pos = geometry.attributes.position;
    const colors = [];
    const colTrack = new THREE.Color(stageData.trackColor);
    const colGround = new THREE.Color(stageData.groundColor);
    const colRock = new THREE.Color(stageData.rockColor);

    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      const vy = this.getHeight(vx, vz);
      pos.setY(i, vy);

      // Coloração com base na distância do centro (pista vs grama/rocha)
      const dist = Math.abs(vx);
      const c = new THREE.Color();
      if (dist <= this.trackWidth * 0.5) {
        c.copy(colTrack);
      } else if (dist <= this.trackWidth * 0.5 + 4) {
        const factor = (dist - this.trackWidth * 0.5) / 4;
        c.lerpColors(colTrack, colGround, factor);
      } else {
        const factor = Math.min(1.0, (dist - this.trackWidth * 0.5 - 4) / 10);
        c.lerpColors(colGround, colRock, factor);
      }
      colors.push(c.r, c.g, c.b);
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.85,
      metalness: 0.08,
      flatShading: true
    });

    this.terrainMesh = new THREE.Mesh(geometry, material);
    this.terrainMesh.receiveShadow = true;
    this.scene.add(this.terrainMesh);
  }

  dispose() {
    if (this.terrainMesh) {
      this.scene.remove(this.terrainMesh);
      this.terrainMesh.geometry.dispose();
      this.terrainMesh.material.dispose();
      this.terrainMesh = null;
    }
  }
}

/* ===================================================================
   6. MODELAGEM PROCEDURAL DA MOTO 3D E PILOTO
   =================================================================== */
class BikeModel {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();

    this.wheelFront = null;
    this.wheelRear = null;
    this.forkGroup = null;
    this.handlebar = null;
    this.chassis = null;
    this.rider = null;
    this.headlightMesh = null;

    this.wheelRadius = 0.48;
    this.wheelBase = 1.6; // Distância entre eixos

    this.build();
    this.scene.add(this.group);
  }

  build() {
    // Materiais
    const matTire = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9, metalness: 0.1 });
    const matRim = new THREE.MeshStandardMaterial({ color: 0xdcdde1, roughness: 0.3, metalness: 0.8 });
    const matFrame = new THREE.MeshStandardMaterial({ color: 0xff4500, roughness: 0.4, metalness: 0.5 });
    const matPlastics = new THREE.MeshStandardMaterial({ color: 0xff6b35, roughness: 0.2, metalness: 0.2 });
    const matSeat = new THREE.MeshStandardMaterial({ color: 0x1e272c, roughness: 0.9 });
    const matChrome = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.95 });
    const matEngine = new THREE.MeshStandardMaterial({ color: 0x2f3640, roughness: 0.5, metalness: 0.7 });
    const matSuit = new THREE.MeshStandardMaterial({ color: 0x1e90ff, roughness: 0.6 });
    const matHelmet = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.4 });
    const matVisor = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.9 });

    // --- RODAS ---
    const createWheel = () => {
      const wGroup = new THREE.Group();
      // Pneu com cravos (Torus)
      const tireGeo = new THREE.TorusGeometry(this.wheelRadius, 0.12, 10, 24);
      const tire = new THREE.Mesh(tireGeo, matTire);
      tire.castShadow = true;
      wGroup.add(tire);

      // Aro da roda
      const rimGeo = new THREE.CylinderGeometry(this.wheelRadius * 0.78, this.wheelRadius * 0.78, 0.1, 16);
      rimGeo.rotateX(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, matRim);
      wGroup.add(rim);

      // Raios / Eixo central
      const hubGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.18, 12);
      hubGeo.rotateX(Math.PI / 2);
      const hub = new THREE.Mesh(hubGeo, matChrome);
      wGroup.add(hub);

      return wGroup;
    };

    // Roda Traseira (Z negativo relativo ao centro da moto)
    this.wheelRear = createWheel();
    this.wheelRear.position.set(0, this.wheelRadius, -this.wheelBase * 0.5);
    this.group.add(this.wheelRear);

    // Roda Dianteira (Z positivo)
    this.wheelFront = createWheel();
    this.wheelFront.position.set(0, this.wheelRadius, this.wheelBase * 0.5);
    this.group.add(this.wheelFront);

    // --- CHASSI / QUADRO ---
    this.chassis = new THREE.Group();

    // Tubo central inferior
    const frameBaseGeo = new THREE.BoxGeometry(0.18, 0.14, 1.1);
    const frameBase = new THREE.Mesh(frameBaseGeo, matFrame);
    frameBase.position.set(0, 0.6, 0);
    frameBase.castShadow = true;
    this.chassis.add(frameBase);

    // Bloco do Motor
    const engGeo = new THREE.BoxGeometry(0.3, 0.35, 0.45);
    const engine = new THREE.Mesh(engGeo, matEngine);
    engine.position.set(0, 0.65, -0.05);
    engine.castShadow = true;
    this.chassis.add(engine);

    // Tubo de Escape curvado e Ponteira
    const exhaustGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.8, 8);
    exhaustGeo.rotateX(Math.PI / 2);
    const exhaust = new THREE.Mesh(exhaustGeo, matChrome);
    exhaust.position.set(0.16, 0.75, -0.4);
    this.chassis.add(exhaust);

    // Ponteira / Silenciador
    const silencerGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.4, 8);
    silencerGeo.rotateX(Math.PI / 2);
    const silencer = new THREE.Mesh(silencerGeo, matChrome);
    silencer.position.set(0.16, 0.88, -0.75);
    this.chassis.add(silencer);

    // Tanque de Combustível
    const tankGeo = new THREE.BoxGeometry(0.32, 0.28, 0.55);
    const tank = new THREE.Mesh(tankGeo, matPlastics);
    tank.position.set(0, 0.95, 0.25);
    tank.rotation.x = -0.15;
    tank.castShadow = true;
    this.chassis.add(tank);

    // Banco de Motocross
    const seatGeo = new THREE.BoxGeometry(0.24, 0.1, 0.65);
    const seat = new THREE.Mesh(seatGeo, matSeat);
    seat.position.set(0, 1.02, -0.22);
    seat.rotation.x = 0.08;
    this.chassis.add(seat);

    // Para-lama Traseiro
    const rearFenderGeo = new THREE.BoxGeometry(0.22, 0.04, 0.6);
    const rearFender = new THREE.Mesh(rearFenderGeo, matPlastics);
    rearFender.position.set(0, 1.0, -0.75);
    rearFender.rotation.x = -0.25;
    this.chassis.add(rearFender);

    // --- GARFO DIANTEIRO & GUIDÃO ---
    this.forkGroup = new THREE.Group();
    this.forkGroup.position.set(0, 0.9, 0.55);
    this.forkGroup.rotation.x = -0.35; // Inclinação do garfo

    // Garfos cromados da suspensão
    const forkTubeGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.85, 8);
    const forkL = new THREE.Mesh(forkTubeGeo, matChrome);
    forkL.position.set(-0.12, -0.15, 0);
    const forkR = new THREE.Mesh(forkTubeGeo, matChrome);
    forkR.position.set(0.12, -0.15, 0);
    this.forkGroup.add(forkL, forkR);

    // Para-lama Dianteiro elevado
    const frontFenderGeo = new THREE.BoxGeometry(0.22, 0.04, 0.55);
    const frontFender = new THREE.Mesh(frontFenderGeo, matPlastics);
    frontFender.position.set(0, -0.05, 0.15);
    frontFender.rotation.x = 0.45;
    this.forkGroup.add(frontFender);

    // Guidão e Manoplas
    const barGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.75, 8);
    barGeo.rotateZ(Math.PI / 2);
    this.handlebar = new THREE.Mesh(barGeo, matSeat);
    this.handlebar.position.set(0, 0.32, 0);
    this.forkGroup.add(this.handlebar);

    // Farol dianteiro
    const lightGeo = new THREE.BoxGeometry(0.16, 0.16, 0.1);
    this.headlightMesh = new THREE.Mesh(lightGeo, new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfffee0,
      emissiveIntensity: 0.6
    }));
    this.headlightMesh.position.set(0, 0.18, 0.1);
    this.forkGroup.add(this.headlightMesh);

    this.chassis.add(this.forkGroup);

    // --- PILOTO ESTILIZADO ---
    this.rider = new THREE.Group();
    this.rider.position.set(0, 1.05, -0.15);

    // Tronco inclinado para a frente
    const torsoGeo = new THREE.BoxGeometry(0.34, 0.45, 0.25);
    const torso = new THREE.Mesh(torsoGeo, matSuit);
    torso.position.set(0, 0.28, 0.05);
    torso.rotation.x = 0.4;
    this.rider.add(torso);

    // Capacete com óculos/viseira
    const helmetGeo = new THREE.SphereGeometry(0.18, 14, 14);
    const helmet = new THREE.Mesh(helmetGeo, matHelmet);
    helmet.position.set(0, 0.62, 0.2);
    this.rider.add(helmet);

    const visorGeo = new THREE.BoxGeometry(0.22, 0.08, 0.12);
    const visor = new THREE.Mesh(visorGeo, matVisor);
    visor.position.set(0, 0.62, 0.34);
    this.rider.add(visor);

    // Braços conectados ao guidão
    const armGeo = new THREE.CylinderGeometry(0.05, 0.045, 0.45, 8);
    const armL = new THREE.Mesh(armGeo, matSuit);
    armL.position.set(-0.24, 0.3, 0.25);
    armL.rotation.set(0.9, 0, -0.4);
    const armR = new THREE.Mesh(armGeo, matSuit);
    armR.position.set(0.24, 0.3, 0.25);
    armR.rotation.set(0.9, 0, 0.4);
    this.rider.add(armL, armR);

    // Pernas nos estribos
    const legGeo = new THREE.CylinderGeometry(0.06, 0.055, 0.5, 8);
    const legL = new THREE.Mesh(legGeo, matSuit);
    legL.position.set(-0.2, -0.1, -0.05);
    legL.rotation.set(-0.3, 0, -0.3);
    const legR = new THREE.Mesh(legGeo, matSuit);
    legR.position.set(0.2, -0.1, -0.05);
    legR.rotation.set(-0.3, 0, 0.3);
    this.rider.add(legL, legR);

    this.chassis.add(this.rider);
    this.group.add(this.chassis);
  }

  // Animação das rodas girando com a velocidade
  rotateWheels(deltaDist) {
    const angle = deltaDist / this.wheelRadius;
    this.wheelFront.rotation.x += angle;
    this.wheelRear.rotation.x += angle;
  }

  // Animação de suspensão e inclinação do piloto
  setSuspension(compression, steerAngle, pitchOffset) {
    this.chassis.position.y = -compression * 0.12;
    if (this.forkGroup) {
      this.forkGroup.rotation.y = steerAngle * 0.4;
    }
    if (this.rider) {
      this.rider.rotation.z = -steerAngle * 0.35;
      this.rider.rotation.x = pitchOffset * 0.3;
    }
  }
}

/* ===================================================================
   7. GERADOR DE ELEMENTOS DO MUNDO (Árvores, Pedras, Cactos, Arcos)
   =================================================================== */
class PropFactory {
  constructor(scene) {
    this.scene = scene;
    this.props = [];
  }

  createTree(x, y, z, scale = 1.0) {
    const tree = new THREE.Group();
    // Tronco
    const trunkGeo = new THREE.CylinderGeometry(0.2 * scale, 0.3 * scale, 1.8 * scale, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.9 * scale;
    trunk.castShadow = true;
    tree.add(trunk);

    // Folhagem em copas cônicas
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.8, flatShading: true });
    for (let i = 0; i < 3; i++) {
      const coneGeo = new THREE.ConeGeometry((1.4 - i * 0.3) * scale, 1.4 * scale, 6);
      const cone = new THREE.Mesh(coneGeo, foliageMat);
      cone.position.y = (1.6 + i * 0.9) * scale;
      cone.castShadow = true;
      tree.add(cone);
    }

    tree.position.set(x, y, z);
    this.scene.add(tree);
    this.props.push(tree);
    return tree;
  }

  createRock(x, y, z, scale = 1.0) {
    const geo = new THREE.DodecahedronGeometry(1.2 * scale, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0x78909c, roughness: 0.9, flatShading: true });
    const rock = new THREE.Mesh(geo, mat);
    rock.position.set(x, y + 0.6 * scale, z);
    rock.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    rock.castShadow = true;
    this.scene.add(rock);
    this.props.push(rock);
    return rock;
  }

  createCactus(x, y, z, scale = 1.0) {
    const cactus = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.7, flatShading: true });

    // Tronco principal
    const trunkGeo = new THREE.CylinderGeometry(0.3 * scale, 0.3 * scale, 3.2 * scale, 8);
    const trunk = new THREE.Mesh(trunkGeo, mat);
    trunk.position.y = 1.6 * scale;
    trunk.castShadow = true;
    cactus.add(trunk);

    // Braços
    const armGeo = new THREE.CylinderGeometry(0.18 * scale, 0.18 * scale, 1.2 * scale, 8);
    const armL = new THREE.Mesh(armGeo, mat);
    armL.position.set(-0.6 * scale, 2.0 * scale, 0);
    armL.rotation.z = -0.4;
    cactus.add(armL);

    const armR = new THREE.Mesh(armGeo, mat);
    armR.position.set(0.6 * scale, 2.3 * scale, 0);
    armR.rotation.z = 0.4;
    cactus.add(armR);

    cactus.position.set(x, y, z);
    this.scene.add(cactus);
    this.props.push(cactus);
    return cactus;
  }

  // Portal de Checkpoint com colunas e arco
  createCheckpointGate(z, terrainMgr) {
    const gate = new THREE.Group();
    const yCenter = terrainMgr.getHeight(0, z);
    const colMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 0.4 });

    // Coluna esquerda e direita
    const colGeo = new THREE.CylinderGeometry(0.25, 0.25, 6, 8);
    const leftCol = new THREE.Mesh(colGeo, colMat);
    leftCol.position.set(-4.5, 3, 0);
    const rightCol = new THREE.Mesh(colGeo, colMat);
    rightCol.position.set(4.5, 3, 0);

    // Arco superior
    const beamGeo = new THREE.BoxGeometry(9.5, 0.8, 0.6);
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(0, 5.8, 0);

    // Bandeira ou painel indicador
    const bannerGeo = new THREE.PlaneGeometry(3.5, 1.2);
    const bannerMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide });
    const banner = new THREE.Mesh(bannerGeo, bannerMat);
    banner.position.set(0, 4.8, 0);

    gate.add(leftCol, rightCol, beam, banner);
    gate.position.set(0, yCenter, z);
    this.scene.add(gate);
    this.props.push(gate);
    return gate;
  }

  // Portal da Linha de Chegada
  createFinishGate(z, terrainMgr) {
    const gate = new THREE.Group();
    const yCenter = terrainMgr.getHeight(0, z);

    const postGeo = new THREE.CylinderGeometry(0.35, 0.35, 7.5, 8);
    const postMat = new THREE.MeshStandardMaterial({ color: 0xff5e00, metalness: 0.6, roughness: 0.3 });

    const postL = new THREE.Mesh(postGeo, postMat);
    postL.position.set(-5, 3.75, 0);
    const postR = new THREE.Mesh(postGeo, postMat);
    postR.position.set(5, 3.75, 0);

    // Arco Superior com faixas
    const topGeo = new THREE.BoxGeometry(10.5, 1.4, 0.8);
    const topMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.set(0, 6.8, 0);

    gate.add(postL, postR, top);
    gate.position.set(0, yCenter, z);
    this.scene.add(gate);
    this.props.push(gate);
    return gate;
  }

  clear() {
    this.props.forEach(p => {
      this.scene.remove(p);
    });
    this.props = [];
  }
}

/* ===================================================================
   8. GERENCIADOR DE MOEDAS E ITENS
   =================================================================== */
class CoinManager {
  constructor(scene) {
    this.scene = scene;
    this.coins = [];
    this.coinGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.12, 16);
    this.coinGeo.rotateX(Math.PI / 2);
    this.coinMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0xffa500,
      emissiveIntensity: 0.25
    });
  }

  spawnCoins(stageData, terrainMgr) {
    this.clear();
    const spacing = stageData.distance / (stageData.coinsCount + 2);

    for (let i = 1; i <= stageData.coinsCount; i++) {
      const z = i * spacing + (Math.random() - 0.5) * 6;
      // Posicionar moeda em trilhas ligeiramente variadas em X (-2.5 a 2.5)
      const x = (Math.sin(i * 1.7) * 2.2);
      const groundY = terrainMgr.getHeight(x, z);

      // Algumas moedas flutuam alto nas rampas para incentivar saltos
      let extraY = 1.2;
      const rampCycle = z % stageData.terrainNoise.rampFreq;
      if (rampCycle > stageData.terrainNoise.rampFreq - 16) {
        extraY = 3.5;
      }

      const coin = new THREE.Mesh(this.coinGeo, this.coinMat);
      coin.position.set(x, groundY + extraY, z);
      coin.castShadow = true;
      this.scene.add(coin);

      this.coins.push({
        mesh: coin,
        collected: false,
        initialY: groundY + extraY,
        timeOffset: Math.random() * 10
      });
    }
  }

  update(dt, time) {
    for (let i = 0; i < this.coins.length; i++) {
      const c = this.coins[i];
      if (c.collected) continue;

      // Rotação contínua e flutuação suave
      c.mesh.rotation.y += 2.5 * dt;
      c.mesh.position.y = c.initialY + Math.sin(time * 3 + c.timeOffset) * 0.2;
    }
  }

  checkCollision(bikePos, radius = 1.3) {
    const collectedList = [];
    for (let i = 0; i < this.coins.length; i++) {
      const c = this.coins[i];
      if (c.collected) continue;

      const dist = bikePos.distanceTo(c.mesh.position);
      if (dist < radius) {
        c.collected = true;
        this.scene.remove(c.mesh);
        collectedList.push(c);
      }
    }
    return collectedList;
  }

  clear() {
    this.coins.forEach(c => {
      if (c.mesh.parent) this.scene.remove(c.mesh);
    });
    this.coins = [];
  }
}

/* ===================================================================
   9. MOTOR DE FÍSICA ARCADE (Duas Rodas + Rotação Aérea)
   =================================================================== */
class PhysicsEngine {
  constructor() {
    this.reset();
  }

  reset(startZ = 0, startY = 1) {
    this.pos = new THREE.Vector3(0, startY, startZ);
    this.vel = new THREE.Vector3(0, 0, 0);

    this.pitch = 0; // Inclinação frente/trás (rad)
    this.roll = 0;  // Inclinação lateral
    this.yaw = 0;   // Direção

    this.speed = 0;
    this.maxSpeed = 38.0; // Velocidade máxima arcade
    this.accel = 24.0;
    this.brakeForce = 32.0;
    this.drag = 0.985;
    this.gravity = 28.0;

    this.inAir = false;
    this.airTime = 0;
    this.steerAngle = 0;
    this.crashed = false;
    this.crashTimer = 0;

    this.wheelBase = 1.6;
    this.suspensionComp = 0;
  }

  update(dt, inputs, terrainMgr, sensitivity = 1.0) {
    if (this.crashed) {
      this.crashTimer += dt;
      // Fricção de derrapagem pós-capotamento
      this.vel.multiplyScalar(0.92);
      this.pos.addScaledVector(this.vel, dt);
      return;
    }

    // 1. Amostragem de altura nas duas rodas
    const frontZ = this.pos.z + (this.wheelBase * 0.5);
    const rearZ = this.pos.z - (this.wheelBase * 0.5);

    const frontGroundY = terrainMgr.getHeight(this.pos.x, frontZ);
    const rearGroundY = terrainMgr.getHeight(this.pos.x, rearZ);

    const avgGroundY = (frontGroundY + rearGroundY) * 0.5;
    const groundSlopePitch = Math.atan2(frontGroundY - rearGroundY, this.wheelBase);

    // Contato com o solo
    const rideHeight = 0.52;
    const targetY = avgGroundY + rideHeight;

    if (this.pos.y <= targetY + 0.05) {
      // No chão
      if (this.inAir) {
        // Acabou de aterrissar! Verificar se o ângulo é seguro
        const pitchDiff = Math.abs(this.pitch - groundSlopePitch);
        if (pitchDiff > 1.35) { // > ~77 graus: Capotamento fatal
          this.triggerCrash();
          return;
        }
        // Aterrissagem suave
        this.inAir = false;
        this.suspensionComp = Math.min(1.0, Math.abs(this.vel.y) * 0.1);
        this.vel.y = 0;
      }

      this.pos.y = targetY;

      // Aceleração / Frenagem
      if (inputs.gas) {
        this.speed += this.accel * dt;
      } else if (inputs.brake) {
        if (this.speed > 0) {
          this.speed -= this.brakeForce * dt;
          if (this.speed < 0) this.speed = 0;
        } else {
          this.speed -= (this.accel * 0.4) * dt; // Ré lenta
          if (this.speed < -8.0) this.speed = -8.0;
        }
      } else {
        // Desaceleração natural
        this.speed *= Math.pow(this.drag, dt * 60);
      }

      // Efeito da inclinação do morro (subida segura, descida acelera)
      this.speed -= Math.sin(groundSlopePitch) * 14.0 * dt;
      this.speed = Math.min(this.maxSpeed, Math.max(-8.0, this.speed));

      // Direção lateral (esterçamento)
      const steerFactor = Math.min(1.0, Math.abs(this.speed) / 10.0);
      if (inputs.left) {
        this.pos.x += 8.0 * steerFactor * dt;
        this.steerAngle = THREE.MathUtils.lerp(this.steerAngle, 0.4, 0.15);
      } else if (inputs.right) {
        this.pos.x -= 8.0 * steerFactor * dt;
        this.steerAngle = THREE.MathUtils.lerp(this.steerAngle, -0.4, 0.15);
      } else {
        this.steerAngle = THREE.MathUtils.lerp(this.steerAngle, 0, 0.2);
      }

      // Limitar largura máxima da pista
      this.pos.x = Math.max(-18, Math.min(18, this.pos.x));

      // No chão, o pitch acompanha a inclinação do terreno com amortecimento
      this.pitch = THREE.MathUtils.lerp(this.pitch, groundSlopePitch, 0.3);
      this.roll = THREE.MathUtils.lerp(this.roll, this.steerAngle * -0.5, 0.2);

      // Se a rampa terminar abruptamente, decola no ar!
      if (this.speed > 5 && groundSlopePitch < -0.15 && this.vel.y > -2) {
        // Manter impulso vertical
      }

    } else {
      // No Ar (Voo / Salto)
      this.inAir = true;
      this.airTime += dt;

      // Gravidade
      this.vel.y -= this.gravity * dt;
      this.pos.y += this.vel.y * dt;

      // Controle aéreo de rotação (pitch e acrobacias)
      const airPitchSpeed = 3.8 * sensitivity;
      if (inputs.tiltBack || inputs.left) {
        this.pitch += airPitchSpeed * dt; // Empinar / Backflip
      }
      if (inputs.tiltFwd || inputs.right) {
        this.pitch -= airPitchSpeed * dt; // Inclinar para frente / Frontflip
      }

      // Detecção de capotamento total de cabeça para baixo no ar
      if (Math.abs(this.pitch) > Math.PI * 1.8) {
        // Voltou a ficar de pé (completou volta 360)
        this.pitch = (this.pitch % (Math.PI * 2));
      }

      this.roll = THREE.MathUtils.lerp(this.roll, 0, 0.05);
    }

    // Avanço no eixo Z
    const vz = this.speed * Math.cos(this.pitch);
    this.pos.z += vz * dt;

    // Se decolou no solo por velocidade em aclive
    if (!this.inAir && this.pos.y > targetY + 0.1) {
      this.inAir = true;
      this.vel.y = this.speed * Math.sin(groundSlopePitch);
    }

    // Amortecimento de suspensão retorna a zero
    this.suspensionComp = THREE.MathUtils.lerp(this.suspensionComp, 0, 0.15);
  }

  triggerCrash() {
    this.crashed = true;
    this.crashTimer = 0;
    this.vel.set((Math.random() - 0.5) * 5, 4.0, this.speed * 0.4);
    this.pitch += (Math.random() > 0.5 ? 1.5 : -1.5);
    this.roll += 1.2;
  }
}

/* ===================================================================
   10. CONTROLADOR DE CÂMERA EM TERCEIRA PESSOA
   =================================================================== */
class CameraController {
  constructor(camera) {
    this.camera = camera;
    this.currentPos = new THREE.Vector3(0, 5, -8);
    this.targetLook = new THREE.Vector3(0, 1, 0);
    this.baseFOV = 60;
    this.orbitAngle = 0;
  }

  // Câmera de perseguição dinâmica com suavização (lerp) e FOV elástico
  updateFollow(bikePos, bikePitch, bikeSpeed, dt) {
    // Distância da câmera recua levemente com velocidade
    const distOffset = 6.2 + Math.min(3.0, Math.abs(bikeSpeed) * 0.08);
    const heightOffset = 2.8 + Math.max(0, -bikePitch * 1.2);

    const targetCameraPos = new THREE.Vector3(
      bikePos.x * 0.7, // Segue x de forma mais amortecida
      bikePos.y + heightOffset,
      bikePos.z - distOffset
    );

    // Interpolação suave
    this.currentPos.lerp(targetCameraPos, 0.14);
    this.camera.position.copy(this.currentPos);

    // Ponto de mira ligeiramente à frente da moto
    const targetLook = new THREE.Vector3(
      bikePos.x,
      bikePos.y + 1.2,
      bikePos.z + 5.0
    );
    this.targetLook.lerp(targetLook, 0.18);
    this.camera.lookAt(this.targetLook);

    // Efeito de velocidade: Campo de Visão (FOV) se expande
    const targetFOV = this.baseFOV + Math.min(14, (Math.abs(bikeSpeed) / 38) * 14);
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFOV, 0.1);
    this.camera.updateProjectionMatrix();
  }

  // Câmera orbital elegante para o Menu Principal
  updateOrbit(centerPos, dt) {
    this.orbitAngle += 0.35 * dt;
    const radius = 7.5;
    this.camera.position.x = centerPos.x + Math.sin(this.orbitAngle) * radius;
    this.camera.position.z = centerPos.z + Math.cos(this.orbitAngle) * radius;
    this.camera.position.y = centerPos.y + 2.5 + Math.sin(this.orbitAngle * 0.8) * 0.6;

    this.camera.lookAt(centerPos.x, centerPos.y + 0.9, centerPos.z);
    this.camera.fov = this.baseFOV;
    this.camera.updateProjectionMatrix();
  }
}

/* ===================================================================
   11. GERENCIADOR DE INTERFACE DO USUÁRIO (HUD e Telas)
   =================================================================== */
class UIManager {
  constructor(game) {
    this.game = game;
    this.bindEvents();
  }

  bindEvents() {
    // Menu Principal
    document.getElementById("btn-play").addEventListener("click", () => {
      this.game.sound.playClick();
      this.game.startStage(this.game.progress.unlockedStage);
    });

    document.getElementById("btn-stages").addEventListener("click", () => {
      this.game.sound.playClick();
      this.showStagesModal();
    });

    document.getElementById("btn-how-to").addEventListener("click", () => {
      this.game.sound.playClick();
      this.showModal("how-to-modal");
    });

    document.getElementById("btn-settings").addEventListener("click", () => {
      this.game.sound.playClick();
      this.showSettingsModal();
    });

    // Fechar Modais
    document.getElementById("btn-close-stages").addEventListener("click", () => {
      this.game.sound.playClick();
      this.hideModal("stages-modal");
    });
    document.getElementById("btn-close-how-to").addEventListener("click", () => {
      this.game.sound.playClick();
      this.hideModal("how-to-modal");
    });
    document.getElementById("btn-close-settings").addEventListener("click", () => {
      this.game.sound.playClick();
      this.hideModal("settings-modal");
    });
    document.getElementById("btn-start-from-how-to").addEventListener("click", () => {
      this.game.sound.playClick();
      this.hideModal("how-to-modal");
      this.game.startStage(this.game.progress.unlockedStage);
    });

    // Configurações
    document.getElementById("btn-save-settings").addEventListener("click", () => {
      this.game.sound.playClick();
      this.saveSettingsFromUI();
      this.hideModal("settings-modal");
    });

    document.getElementById("btn-reset-save").addEventListener("click", () => {
      if (confirm("Tem certeza que deseja zerar o progresso das fases?")) {
        StorageManager.resetAll();
        this.game.progress = StorageManager.getProgress();
        this.showStagesModal();
      }
    });

    // Sliders de Configurações
    const sfxSlider = document.getElementById("slider-sfx");
    sfxSlider.addEventListener("input", (e) => {
      document.getElementById("sfx-val-text").innerText = `${e.target.value}%`;
    });
    const musicSlider = document.getElementById("slider-music");
    musicSlider.addEventListener("input", (e) => {
      document.getElementById("music-val-text").innerText = `${e.target.value}%`;
    });
    const sensSlider = document.getElementById("slider-sens");
    sensSlider.addEventListener("input", (e) => {
      document.getElementById("sens-val-text").innerText = `${(e.target.value / 10).toFixed(1)}x`;
    });

    // Toggles de áudio e partículas
    document.getElementById("toggle-sfx").addEventListener("click", (e) => {
      e.target.classList.toggle("active");
      e.target.innerText = e.target.classList.contains("active") ? "ON" : "OFF";
    });
    document.getElementById("toggle-music").addEventListener("click", (e) => {
      e.target.classList.toggle("active");
      e.target.innerText = e.target.classList.contains("active") ? "ON" : "OFF";
    });
    document.getElementById("toggle-particles").addEventListener("click", (e) => {
      e.target.classList.toggle("active");
      e.target.innerText = e.target.classList.contains("active") ? "ATIVADO" : "DESATIVADO";
    });

    // Pausa e Botões In-Game
    document.getElementById("btn-pause").addEventListener("click", () => {
      this.game.sound.playClick();
      this.game.togglePause();
    });
    document.getElementById("btn-resume").addEventListener("click", () => {
      this.game.sound.playClick();
      this.game.togglePause();
    });
    document.getElementById("btn-restart-checkpoint").addEventListener("click", () => {
      this.game.sound.playClick();
      this.hideModal("pause-modal");
      this.game.respawnAtCheckpoint();
    });
    document.getElementById("btn-restart-stage").addEventListener("click", () => {
      this.game.sound.playClick();
      this.hideModal("pause-modal");
      this.game.startStage(this.game.currentStageIndex + 1);
    });
    document.getElementById("btn-pause-settings").addEventListener("click", () => {
      this.game.sound.playClick();
      this.showSettingsModal();
    });
    document.getElementById("btn-pause-to-menu").addEventListener("click", () => {
      this.game.sound.playClick();
      this.hideModal("pause-modal");
      this.game.returnToMenu();
    });

    // Game Over
    document.getElementById("btn-retry-gameover").addEventListener("click", () => {
      this.game.sound.playClick();
      this.hideModal("game-over-modal");
      this.game.startStage(this.game.currentStageIndex + 1);
    });
    document.getElementById("btn-menu-gameover").addEventListener("click", () => {
      this.game.sound.playClick();
      this.hideModal("game-over-modal");
      this.game.returnToMenu();
    });

    // Vitória
    document.getElementById("btn-next-stage").addEventListener("click", () => {
      this.game.sound.playClick();
      this.hideModal("victory-modal");
      const nextStage = this.game.currentStageIndex + 2;
      if (nextStage <= STAGES_DATA.length) {
        this.game.startStage(nextStage);
      } else {
        this.game.returnToMenu();
      }
    });
    document.getElementById("btn-repeat-stage").addEventListener("click", () => {
      this.game.sound.playClick();
      this.hideModal("victory-modal");
      this.game.startStage(this.game.currentStageIndex + 1);
    });
    document.getElementById("btn-victory-menu").addEventListener("click", () => {
      this.game.sound.playClick();
      this.hideModal("victory-modal");
      this.game.returnToMenu();
    });

    // Controles Virtuais Touch
    this.setupTouchControls();
  }

  setupTouchControls() {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const touchPanel = document.getElementById("touch-controls");
    if (isTouch) {
      touchPanel.classList.remove("hidden");
    }

    const bindTouch = (elemId, inputProp) => {
      const el = document.getElementById(elemId);
      if (!el) return;
      const startHandler = (e) => {
        e.preventDefault();
        this.game.inputs[inputProp] = true;
      };
      const endHandler = (e) => {
        e.preventDefault();
        this.game.inputs[inputProp] = false;
      };
      el.addEventListener("touchstart", startHandler, { passive: false });
      el.addEventListener("touchend", endHandler, { passive: false });
      el.addEventListener("touchcancel", endHandler, { passive: false });
      el.addEventListener("mousedown", startHandler);
      el.addEventListener("mouseup", endHandler);
      el.addEventListener("mouseleave", endHandler);
    };

    bindTouch("touch-gas", "gas");
    bindTouch("touch-brake", "brake");
    bindTouch("touch-tilt-back", "tiltBack");
    bindTouch("touch-tilt-fwd", "tiltFwd");

    document.getElementById("touch-respawn").addEventListener("click", () => {
      this.game.respawnAtCheckpoint();
    });
  }

  showModal(id) {
    document.getElementById(id).classList.remove("hidden");
  }

  hideModal(id) {
    document.getElementById(id).classList.add("hidden");
  }

  showStagesModal() {
    const grid = document.getElementById("stages-grid");
    grid.innerHTML = "";

    STAGES_DATA.forEach((stage, idx) => {
      const isUnlocked = (stage.id <= this.game.progress.unlockedStage);
      const bestTime = this.game.progress.bestTimes[stage.id] || null;
      const coinsCollected = this.game.progress.collectedCoins[stage.id] || 0;

      const card = document.createElement("div");
      card.className = `stage-card ${isUnlocked ? '' : 'locked'}`;

      card.innerHTML = `
        <div class="stage-card-header">
          <span class="stage-num-tag">FASE 0${stage.id}</span>
          <span class="badge-diff">${stage.difficulty}</span>
        </div>
        <h3>${stage.name}</h3>
        <p class="stage-card-theme">${stage.theme}</p>
        <div class="stage-card-stats">
          <div>Distância: <strong>${stage.distance}m</strong></div>
          <div>Moedas: <strong>${coinsCollected}/${stage.coinsCount}</strong></div>
          <div>Recorde: <strong>${bestTime ? this.formatTime(bestTime) : '--:--'}</strong></div>
        </div>
        ${!isUnlocked ? '<div class="stage-lock-overlay">🔒</div>' : ''}
      `;

      if (isUnlocked) {
        card.addEventListener("click", () => {
          this.game.sound.playClick();
          this.hideModal("stages-modal");
          this.game.startStage(stage.id);
        });
      }

      grid.appendChild(card);
    });

    this.showModal("stages-modal");
  }

  showSettingsModal() {
    const s = this.game.settings;
    document.getElementById("slider-sfx").value = Math.round(s.sfxVolume * 100);
    document.getElementById("sfx-val-text").innerText = `${Math.round(s.sfxVolume * 100)}%`;
    document.getElementById("slider-music").value = Math.round(s.musicVolume * 100);
    document.getElementById("music-val-text").innerText = `${Math.round(s.musicVolume * 100)}%`;
    document.getElementById("slider-sens").value = Math.round(s.controlSens * 10);
    document.getElementById("sens-val-text").innerText = `${s.controlSens.toFixed(1)}x`;

    const sfxBtn = document.getElementById("toggle-sfx");
    sfxBtn.className = `btn-toggle ${s.sfxEnabled ? 'active' : ''}`;
    sfxBtn.innerText = s.sfxEnabled ? "ON" : "OFF";

    const musBtn = document.getElementById("toggle-music");
    musBtn.className = `btn-toggle ${s.musicEnabled ? 'active' : ''}`;
    musBtn.innerText = s.musicEnabled ? "ON" : "OFF";

    const partBtn = document.getElementById("toggle-particles");
    partBtn.className = `btn-toggle ${s.particlesEnabled ? 'active' : ''}`;
    partBtn.innerText = s.particlesEnabled ? "ATIVADO" : "DESATIVADO";

    document.getElementById("select-quality").value = s.graphicsQuality;

    this.showModal("settings-modal");
  }

  saveSettingsFromUI() {
    const sfxVal = parseInt(document.getElementById("slider-sfx").value, 10) / 100;
    const musVal = parseInt(document.getElementById("slider-music").value, 10) / 100;
    const sensVal = parseInt(document.getElementById("slider-sens").value, 10) / 10;
    const sfxOn = document.getElementById("toggle-sfx").classList.contains("active");
    const musOn = document.getElementById("toggle-music").classList.contains("active");
    const partOn = document.getElementById("toggle-particles").classList.contains("active");
    const quality = document.getElementById("select-quality").value;

    const newSettings = {
      sfxVolume: sfxVal,
      musicVolume: musVal,
      sfxEnabled: sfxOn,
      musicEnabled: musOn,
      particlesEnabled: partOn,
      controlSens: sensVal,
      graphicsQuality: quality
    };

    this.game.settings = newSettings;
    StorageManager.saveSettings(newSettings);
    this.game.sound.updateVolumes(newSettings);
    this.game.applyGraphicsQuality();
  }

  updateHUD(speed, distance, totalDist, coins, lives, stageData, stageTime) {
    const kmh = Math.max(0, Math.round(Math.abs(speed) * 3.6));
    document.getElementById("hud-speed").innerText = kmh;
    document.getElementById("hud-coins").innerText = coins;

    // Distância e Barra de Progresso
    const currentDist = Math.max(0, Math.min(totalDist, Math.round(distance)));
    document.getElementById("hud-distance-current").innerText = currentDist;
    document.getElementById("hud-distance-total").innerText = totalDist;

    const pct = Math.min(100, Math.max(0, (distance / totalDist) * 100));
    document.getElementById("hud-progress-fill").style.width = `${pct}%`;
    document.getElementById("hud-progress-marker").style.left = `${pct}%`;

    // Tempo
    document.getElementById("hud-timer-text").innerText = this.formatTime(stageTime);

    // Vidas
    const lifeIcons = document.getElementById("hud-lives").children;
    for (let i = 0; i < 3; i++) {
      if (i < lives) {
        lifeIcons[i].className = "life-icon active";
      } else {
        lifeIcons[i].className = "life-icon lost";
      }
    }
  }

  showCheckpointBanner() {
    const banner = document.getElementById("checkpoint-banner");
    banner.classList.remove("hidden");
    setTimeout(() => {
      banner.classList.add("hidden");
    }, 2200);
  }

  showCrashAlert() {
    const alert = document.getElementById("crash-alert");
    alert.classList.remove("hidden");
  }

  hideCrashAlert() {
    const alert = document.getElementById("crash-alert");
    alert.classList.add("hidden");
  }

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}.${ms}`;
  }
}

/* ===================================================================
   12. CLASSE PRINCIPAL DO JOGO (Game Loop e Máquina de Estados)
   =================================================================== */
class Game {
  constructor() {
    this.container = document.getElementById("game-container");
    this.state = "MENU"; // MENU, PLAYING, PAUSED, CRASHED, VICTORY, GAMEOVER

    this.settings = StorageManager.getSettings();
    this.progress = StorageManager.getProgress();

    this.sound = new SoundManager();
    this.currentStageIndex = 0;
    this.currentStage = STAGES_DATA[0];

    this.coinsCollected = 0;
    this.lives = 3;
    this.stageTime = 0;
    this.lastCheckpointZ = 0;
    this.checkpointsFound = 0;

    this.inputs = {
      gas: false,
      brake: false,
      left: false,
      right: false,
      tiltBack: false,
      tiltFwd: false
    };

    this.clock = new THREE.Clock();

    this.initThree();
    this.initSceneObjects();
    this.ui = new UIManager(this);

    this.bindKeyboard();
    this.setupMenuScene();

    window.addEventListener("resize", () => this.onWindowResize());
    this.animate();
  }

  initThree() {
    // Cena
    this.scene = new THREE.Scene();

    // Câmera
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.cameraController = new CameraController(this.camera);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = (this.settings.graphicsQuality !== "low");
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Luzes
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    this.dirLight.position.set(20, 40, 20);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 150;
    const d = 25;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.scene.add(this.dirLight);

    this.scene.fog = new THREE.FogExp2(0xc8e6c9, 0.005);
  }

  applyGraphicsQuality() {
    if (this.settings.graphicsQuality === "low") {
      this.renderer.shadowMap.enabled = false;
      this.renderer.setPixelRatio(1);
    } else if (this.settings.graphicsQuality === "medium") {
      this.renderer.shadowMap.enabled = true;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    } else {
      this.renderer.shadowMap.enabled = true;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
  }

  initSceneObjects() {
    this.terrain = new TerrainManager(this.scene);
    this.bike = new BikeModel(this.scene);
    this.physics = new PhysicsEngine();
    this.particles = new ParticleSystem(this.scene);
    this.props = new PropFactory(this.scene);
    this.coinMgr = new CoinManager(this.scene);
  }

  bindKeyboard() {
    window.addEventListener("keydown", (e) => {
      this.sound.resumeContext();

      if (e.code === "KeyW" || e.code === "ArrowUp") {
        this.inputs.gas = true;
      }
      if (e.code === "KeyS" || e.code === "ArrowDown") {
        this.inputs.brake = true;
      }
      if (e.code === "KeyA" || e.code === "ArrowLeft") {
        this.inputs.left = true;
        this.inputs.tiltBack = true;
      }
      if (e.code === "KeyD" || e.code === "ArrowRight") {
        this.inputs.right = true;
        this.inputs.tiltFwd = true;
      }
      if (e.code === "KeyR") {
        if (this.state === "PLAYING" || this.state === "CRASHED") {
          this.respawnAtCheckpoint();
        }
      }
      if (e.code === "Escape") {
        if (this.state === "PLAYING" || this.state === "PAUSED") {
          this.togglePause();
        }
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.code === "KeyW" || e.code === "ArrowUp") {
        this.inputs.gas = false;
      }
      if (e.code === "KeyS" || e.code === "ArrowDown") {
        this.inputs.brake = false;
      }
      if (e.code === "KeyA" || e.code === "ArrowLeft") {
        this.inputs.left = false;
        this.inputs.tiltBack = false;
      }
      if (e.code === "KeyD" || e.code === "ArrowRight") {
        this.inputs.right = false;
        this.inputs.tiltFwd = false;
      }
    });
  }

  setupMenuScene() {
    this.state = "MENU";
    const stage1 = STAGES_DATA[0];
    this.currentStage = stage1;

    this.applyAtmosphere(stage1);
    this.terrain.build(stage1);

    // Posicionar a moto em uma colina charmosa para visualização no menu
    const menuZ = 25;
    const menuY = this.terrain.getHeight(0, menuZ) + 0.5;
    this.bike.group.position.set(0, menuY, menuZ);
    this.bike.group.rotation.set(0, 0.4, 0);

    // Elementos cenográficos em volta
    this.props.clear();
    this.props.createTree(-5, this.terrain.getHeight(-5, 20), 20, 1.4);
    this.props.createTree(6, this.terrain.getHeight(6, 28), 28, 1.2);
    this.props.createRock(-3, this.terrain.getHeight(-3, 30), 30, 1.1);

    document.getElementById("main-menu").classList.add("active");
    document.getElementById("hud").classList.add("hidden");
  }

  applyAtmosphere(stageData) {
    this.scene.background = new THREE.Color(stageData.skyColor);
    this.scene.fog.color.setHex(stageData.fogColor);
    this.scene.fog.density = stageData.fogDensity;

    this.ambientLight.color.setHex(stageData.ambientColor);
    this.dirLight.color.setHex(stageData.sunColor);
  }

  startStage(stageId) {
    this.sound.init();
    this.sound.resumeContext();

    this.currentStageIndex = stageId - 1;
    this.currentStage = STAGES_DATA[this.currentStageIndex];

    this.lives = 3;
    this.coinsCollected = 0;
    this.stageTime = 0;
    this.lastCheckpointZ = 0;
    this.checkpointsFound = 0;

    // Construir Terreno e Cenário
    this.applyAtmosphere(this.currentStage);
    this.terrain.build(this.currentStage);
    this.props.clear();
    this.populateScenery(this.currentStage);

    // Gerar moedas
    this.coinMgr.spawnCoins(this.currentStage, this.terrain);

    // Resetar Física e Moto
    const startY = this.terrain.getHeight(0, 0) + 0.55;
    this.physics.reset(0, startY);
    this.bike.group.position.set(0, startY, 0);
    this.bike.group.rotation.set(0, 0, 0);

    // Alternar Telas
    document.getElementById("main-menu").classList.remove("active");
    document.getElementById("hud").classList.remove("hidden");
    document.getElementById("hud-stage-num").innerText = this.currentStage.id;
    document.getElementById("hud-stage-title").innerText = this.currentStage.name;

    this.ui.hideCrashAlert();
    this.state = "PLAYING";

    // Iniciar trilha sonora
    this.sound.stopMusic();
    this.sound.startMusic(this.currentStage.ambientMusicTempo);
  }

  populateScenery(stageData) {
    const sc = stageData.scenery;
    const len = stageData.distance;

    for (let z = 20; z < len + 40; z += 18) {
      // Lado esquerdo e direito fora da pista
      const xLeft = - (Math.random() * 12 + 6);
      const xRight = (Math.random() * 12 + 6);
      const yLeft = this.terrain.getHeight(xLeft, z);
      const yRight = this.terrain.getHeight(xRight, z);

      if (sc.trees && Math.random() > 0.3) {
        this.props.createTree(xLeft, yLeft, z, Math.random() * 0.6 + 0.8);
      }
      if (sc.rocks && Math.random() > 0.5) {
        this.props.createRock(xRight, yRight, z, Math.random() * 0.8 + 0.6);
      }
      if (sc.cacti && Math.random() > 0.4) {
        this.props.createCactus(xLeft, yLeft, z, Math.random() * 0.6 + 0.8);
      }
    }

    // Portais de Checkpoint
    stageData.checkpoints.forEach(cpZ => {
      this.props.createCheckpointGate(cpZ, this.terrain);
    });

    // Portal da Linha de Chegada
    this.props.createFinishGate(stageData.distance, this.terrain);
  }

  respawnAtCheckpoint() {
    this.sound.stopEngine();
    this.physics.crashed = false;
    this.ui.hideCrashAlert();

    const spawnZ = this.lastCheckpointZ;
    const spawnY = this.terrain.getHeight(0, spawnZ) + 0.55;
    this.physics.reset(spawnZ, spawnY);

    this.state = "PLAYING";
  }

  handleCrash() {
    if (this.state === "CRASHED") return;
    this.state = "CRASHED";
    this.sound.playCrash();
    this.sound.stopEngine();
    this.ui.showCrashAlert();

    this.lives--;
    if (this.lives <= 0) {
      setTimeout(() => {
        this.triggerGameOver();
      }, 1400);
    } else {
      // Retornar ao checkpoint após 2 segundos
      setTimeout(() => {
        if (this.state === "CRASHED") {
          this.respawnAtCheckpoint();
        }
      }, 2000);
    }
  }

  triggerGameOver() {
    this.state = "GAMEOVER";
    this.sound.stopMusic();
    this.ui.hideCrashAlert();

    document.getElementById("go-distance").innerText = `${Math.round(this.physics.pos.z)} m`;
    document.getElementById("go-coins").innerText = this.coinsCollected;
    this.ui.showModal("game-over-modal");
  }

  triggerVictory() {
    this.state = "VICTORY";
    this.sound.stopEngine();
    this.sound.stopMusic();
    this.sound.playVictory();

    // Salvar progresso
    const stageId = this.currentStage.id;
    if (this.progress.unlockedStage <= stageId && stageId < STAGES_DATA.length) {
      this.progress.unlockedStage = stageId + 1;
    }

    const previousBest = this.progress.bestTimes[stageId];
    if (!previousBest || this.stageTime < previousBest) {
      this.progress.bestTimes[stageId] = this.stageTime;
    }

    const prevCoins = this.progress.collectedCoins[stageId] || 0;
    if (this.coinsCollected > prevCoins) {
      this.progress.collectedCoins[stageId] = this.coinsCollected;
    }
    StorageManager.saveProgress(this.progress);

    // Preencher Modal de Vitória
    document.getElementById("victory-stage-name").innerText = `${this.currentStage.name} Finalizada!`;
    document.getElementById("vic-time").innerText = this.ui.formatTime(this.stageTime);
    document.getElementById("vic-best-time").innerText = `Recorde: ${this.ui.formatTime(this.progress.bestTimes[stageId])}`;

    const totalCoins = this.currentStage.coinsCount;
    const pctCoins = Math.round((this.coinsCollected / totalCoins) * 100);
    document.getElementById("vic-coins").innerText = `${this.coinsCollected} / ${totalCoins}`;
    document.getElementById("vic-coins-pct").innerText = `${pctCoins}% coletadas`;
    document.getElementById("vic-checkpoints").innerText = `${this.checkpointsFound} / ${this.currentStage.checkpoints.length}`;
    document.getElementById("vic-lives").innerText = `${this.lives} / 3`;

    // Estrelas com base em moedas coletadas
    const starsContainer = document.getElementById("victory-stars").children;
    starsContainer[0].className = "star active";
    starsContainer[1].className = (pctCoins >= 50) ? "star active" : "star";
    starsContainer[2].className = (pctCoins >= 90) ? "star active" : "star";

    this.ui.showModal("victory-modal");
  }

  togglePause() {
    if (this.state === "PLAYING") {
      this.state = "PAUSED";
      this.sound.stopEngine();
      this.ui.showModal("pause-modal");
    } else if (this.state === "PAUSED") {
      this.state = "PLAYING";
      this.ui.hideModal("pause-modal");
    }
  }

  returnToMenu() {
    this.sound.stopEngine();
    this.sound.stopMusic();
    this.setupMenuScene();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const dt = Math.min(this.clock.getDelta(), 0.08);
    const elapsedTime = this.clock.getElapsedTime();

    if (this.state === "MENU") {
      // Rotação da câmera de exibição da moto no menu
      this.cameraController.updateOrbit(this.bike.group.position, dt);
    } else if (this.state === "PLAYING" || this.state === "CRASHED") {
      this.stageTime += dt;

      // 1. Atualizar Física
      const sens = this.settings.controlSens;
      this.physics.update(dt, this.inputs, this.terrain, sens);

      if (this.physics.crashed && this.state !== "CRASHED") {
        this.handleCrash();
      }

      // 2. Atualizar Malha da Moto
      this.bike.group.position.copy(this.physics.pos);
      this.bike.group.rotation.y = this.physics.yaw;
      this.bike.group.rotation.x = this.physics.pitch;
      this.bike.group.rotation.z = this.physics.roll;

      // Rodas giram
      this.bike.rotateWheels(this.physics.speed * dt);
      this.bike.setSuspension(this.physics.suspensionComp, this.physics.steerAngle, this.physics.pitch);

      // 3. Atualizar Luz Seguidora
      this.dirLight.position.set(this.physics.pos.x + 20, this.physics.pos.y + 40, this.physics.pos.z + 20);
      this.dirLight.target = this.bike.group;

      // 4. Som do Motor
      this.sound.updateEngine(this.physics.speed, this.inputs.gas, this.physics.inAir);

      // Som de derrapagem ao frear forte no chão
      if (!this.physics.inAir && this.inputs.brake && Math.abs(this.physics.speed) > 12) {
        this.sound.playBrakeSkid();
        if (this.settings.particlesEnabled) {
          const rearPos = this.bike.wheelRear.getWorldPosition(new THREE.Vector3());
          this.particles.emitWheelDust(rearPos, true);
        }
      }

      // 5. Partículas de Poeira da Roda Traseira
      if (this.settings.particlesEnabled && !this.physics.inAir && Math.abs(this.physics.speed) > 3) {
        const rearPos = this.bike.wheelRear.getWorldPosition(new THREE.Vector3());
        this.particles.emitWheelDust(rearPos, false);
      }

      // 6. Atualizar Moedas e Coleta
      this.coinMgr.update(dt, elapsedTime);
      const collected = this.coinMgr.checkCollision(this.physics.pos, 1.6);
      if (collected.length > 0) {
        this.coinsCollected += collected.length;
        this.sound.playCoin();
        if (this.settings.particlesEnabled) {
          collected.forEach(c => this.particles.emitCoinSparkles(c.mesh.position));
        }
      }

      // 7. Detecção de Checkpoints
      this.currentStage.checkpoints.forEach(cpZ => {
        if (this.physics.pos.z >= cpZ && this.lastCheckpointZ < cpZ) {
          this.lastCheckpointZ = cpZ;
          this.checkpointsFound++;
          this.sound.playCheckpoint();
          this.ui.showCheckpointBanner();
        }
      });

      // 8. Detecção de Linha de Chegada
      if (this.physics.pos.z >= this.currentStage.distance && this.state === "PLAYING") {
        this.triggerVictory();
      }

      // 9. Câmera Seguidora Suave
      this.cameraController.updateFollow(this.physics.pos, this.physics.pitch, this.physics.speed, dt);

      // 10. Atualizar HUD
      this.ui.updateHUD(
        this.physics.speed,
        this.physics.pos.z,
        this.currentStage.distance,
        this.coinsCollected,
        this.lives,
        this.currentStage,
        this.stageTime
      );
    }

    // Atualização de Partículas
    if (this.settings.particlesEnabled) {
      this.particles.update(dt);
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Iniciar quando o DOM estiver pronto
window.addEventListener("DOMContentLoaded", () => {
  window.motoGame = new Game();
});
