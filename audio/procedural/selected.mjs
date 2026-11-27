// Adapted from the exact user-provided original-lab.html DSP class.
// Original synthesis equations preserved; optional injected offline context and seeded impulse generation.
class SciFiDspEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.dryBus = null;
    this.bodyShelf = null;   // 中低频金属机身共振增益 (190Hz)
    this.plasticCut = null;  // 削去轻飘塑料感的带阻/高频衰减 (4.2kHz)
    this.reverbNode = null;
    this.reverbGain = null;
    this.compressor = null;
    this.analyser = null;
    this.noiseBuf = null;
    this.pinkBuf = null;

    this.vol = 0.85;
    this.rev = 0.22;
    this.weight = 1.0;       // 默认锁定 100% 工业重量
    this.pitchSemis = -12;   // 默认锁定最低音调 -12 st
  }

  // 计算全局频率倍率（半音转倍率）
  f(baseFreq) {
    return baseFreq * Math.pow(2, this.pitchSemis / 12);
  }

  // 初始化 Web Audio 主总线与工业重质感滤波链
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = this.contextFactory ? this.contextFactory() : new AudioCtx();

      // 预生成白噪声与粉红噪声缓冲
      const sr = this.ctx.sampleRate;
      this.noiseBuf = this.ctx.createBuffer(1, sr * 2, sr);
      this.pinkBuf = this.ctx.createBuffer(1, sr * 2, sr);
      const nData = this.noiseBuf.getChannelData(0);
      const pData = this.pinkBuf.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < sr * 2; i++) {
        const w = (this.random || Math.random)() * 2 - 1;
        nData[i] = w;
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.96900 * b2 + w * 0.1538520;
        b3 = 0.86650 * b3 + w * 0.3104856;
        b4 = 0.55000 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.0168980;
        pData[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.05;
        b6 = w * 0.115926;
      }

      this.dryBus = this.ctx.createGain();
      this.dryBus.gain.setValueAtTime(1.0, this.ctx.currentTime);

      // 工业重量链：增强 185Hz 金属腔体厚重感 + 适度削去 4.2kHz 轻飘塑料感
      this.bodyShelf = this.ctx.createBiquadFilter();
      this.bodyShelf.type = 'lowshelf';
      this.bodyShelf.frequency.setValueAtTime(185, this.ctx.currentTime);

      this.plasticCut = this.ctx.createBiquadFilter();
      this.plasticCut.type = 'highshelf';
      this.plasticCut.frequency.setValueAtTime(4200, this.ctx.currentTime);

      // 合成立体声空间混响脉冲响应
      const revLen = Math.floor(sr * 1.15);
      const irBuf = this.ctx.createBuffer(2, revLen, sr);
      for (let ch = 0; ch < 2; ch++) {
        const chData = irBuf.getChannelData(ch);
        for (let i = 0; i < revLen; i++) {
          const decay = Math.pow(1 - i / revLen, 2.4);
          chData[i] = ((this.random || Math.random)() * 2 - 1) * decay * 0.32;
        }
      }
      this.reverbNode = this.ctx.createConvolver();
      this.reverbNode.buffer = irBuf;

      const revLp = this.ctx.createBiquadFilter();
      revLp.type = 'lowpass';
      revLp.frequency.setValueAtTime(2200, this.ctx.currentTime);

      this.reverbGain = this.ctx.createGain();
      this.reverbGain.gain.setValueAtTime(this.rev, this.ctx.currentTime);

      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(18, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.005, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.14, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 2048;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.vol, this.ctx.currentTime);

      this.dryBus.connect(this.bodyShelf);
      this.dryBus.connect(this.reverbNode);
      this.reverbNode.connect(revLp);
      revLp.connect(this.reverbGain);
      this.reverbGain.connect(this.bodyShelf);

      this.bodyShelf.connect(this.plasticCut);
      this.plasticCut.connect(this.compressor);
      this.compressor.connect(this.analyser);
      this.analyser.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.applyWeight();
    }

    if (!this.offline && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  applyWeight() {
    if (!this.ctx || !this.bodyShelf || !this.plasticCut) return;
    const now = this.ctx.currentTime;
    this.bodyShelf.gain.setTargetAtTime(this.weight * 8.5, now, 0.03);
    this.plasticCut.gain.setTargetAtTime(-this.weight * 7.5, now, 0.03);
  }

  setWeight(w) {
    this.weight = w;
    this.init();
    this.applyWeight();
  }

  setPitch(semis) {
    this.pitchSemis = semis;
    this.init();
  }

  setVolume(v) {
    this.vol = v;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.02);
    }
  }

  setReverb(r) {
    this.rev = r;
    if (this.reverbGain && this.ctx) {
      this.reverbGain.gain.setTargetAtTime(r, this.ctx.currentTime, 0.03);
    }
  }

  // 注入工业机身低频分量，增强重量感
  injectChassisMass(time, intensity = 1.0) {
    if (!this.ctx || !this.dryBus || this.weight <= 0.01) return;
    const osc = this.ctx.createOscillator();
    const lp = this.ctx.createBiquadFilter();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    const startF = this.f(125);
    osc.frequency.setValueAtTime(startF, time);
    osc.frequency.exponentialRampToValueAtTime(Math.max(28, startF * 0.36), time + 0.14);

    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(220, time);

    const amp = 0.24 * this.weight * intensity;
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(amp, time + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);

    osc.connect(lp);
    lp.connect(g);
    g.connect(this.dryBus);
    osc.start(time);
    osc.stop(time + 0.18);
  }

  // 11. 卫星遥测数据包 (母版)
  play11_SatelliteTelemetry() {
    this.init();
    const now = this.ctx.currentTime;
    this.injectChassisMass(now, 0.85);
    const bits = [1, 0, 1, 1, 0, 1, 0, 0, 1, 1];
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    const step = 0.021;
    bits.forEach((b, i) => {
      osc.frequency.setValueAtTime(this.f(b ? 2100 : 1550), now + i * step);
    });
    const dur = bits.length * step;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.15, now + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur + 0.02);
    osc.connect(g);
    g.connect(this.dryBus);
    osc.start(now);
    osc.stop(now + dur + 0.03);
  }

  // 12. 生物特征/虹膜验证通过 (母版)
  play12_BiometricVerified() {
    this.init();
    const now = this.ctx.currentTime;
    this.injectChassisMass(now, 0.9);
    [587.33, 880.0].forEach((rawF, idx) => {
      const t0 = now + idx * 0.08;
      const dur = 0.36;
      const osc = this.ctx.createOscillator();
      const lp = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(this.f(rawF), t0);
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(this.f(2100), t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(0.17, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(lp);
      lp.connect(g);
      g.connect(this.dryBus);
      osc.start(t0);
      osc.stop(t0 + dur + 0.03);
    });
  }

  // 13. 相控阵雷达脉冲 (母版)
  play13_PhasedRadar() {
    this.init();
    const now = this.ctx.currentTime;
    const dur = 0.62;
    this.injectChassisMass(now, 0.95);
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const delay = this.ctx.createDelay();
    const fb = this.ctx.createGain();

    osc.type = 'sine';
    const base = this.f(932.33);
    osc.frequency.setValueAtTime(base, now);
    osc.frequency.exponentialRampToValueAtTime(base * 0.96, now + dur);

    delay.delayTime.setValueAtTime(0.095, now);
    fb.gain.setValueAtTime(0.42, now);

    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.18, now + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(g);
    g.connect(this.dryBus);
    g.connect(delay);
    delay.connect(fb);
    fb.connect(delay);
    delay.connect(this.dryBus);

    osc.start(now);
    osc.stop(now + dur + 0.05);
  }

  // 17. 深空声呐/海底地形测绘 (母版)
  play17_DeepSonar() {
    this.init();
    const now = this.ctx.currentTime;
    const dur = 1.25;
    this.injectChassisMass(now, 1.0);
    const osc = this.ctx.createOscillator();
    const lp = this.ctx.createBiquadFilter();
    const g = this.ctx.createGain();
    const delay = this.ctx.createDelay();
    const fb = this.ctx.createGain();

    osc.type = 'sine';
    const base = this.f(523.25);
    osc.frequency.setValueAtTime(base, now);
    osc.frequency.exponentialRampToValueAtTime(base * 0.975, now + dur);

    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(1400, now);

    delay.delayTime.setValueAtTime(0.16, now);
    fb.gain.setValueAtTime(0.48, now);

    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.2, now + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(lp);
    lp.connect(g);
    g.connect(this.dryBus);
    g.connect(delay);
    delay.connect(fb);
    fb.connect(delay);
    delay.connect(this.dryBus);

    osc.start(now);
    osc.stop(now + dur + 0.08);
  }

  // 24. 威胁等级提升警报 (母版)
  play24_ThreatStinger() {
    this.init();
    const now = this.ctx.currentTime;
    const dur = 0.88;

    [65.41, 98.0, 130.81].forEach((rawF, idx) => {
      const f = this.f(rawF);
      const osc = this.ctx.createOscillator();
      const lp = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now);

      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(this.f(200), now);
      lp.frequency.exponentialRampToValueAtTime(this.f(980), now + 0.12);
      lp.frequency.exponentialRampToValueAtTime(this.f(220), now + dur);

      const peak = idx === 0 ? 0.22 : 0.12;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(peak, now + 0.025);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      osc.connect(lp);
      lp.connect(g);
      g.connect(this.dryBus);
      osc.start(now);
      osc.stop(now + dur + 0.04);
    });
  }

  // ==========================================================================
  // 基于 #11 / #12 / #13 / #17 / #24 声学特征泛化出的 18 种衍生音色 (G01 - G18)
  // ==========================================================================

  // G01. 窄带星地短报文 (#11 极简短促版：适合小标签/字幕出现)
  playG01_ShortTelemetry() {
    this.init();
    const now = this.ctx.currentTime;
    this.injectChassisMass(now, 0.7);
    const bits = [1, 0, 1, 1, 0, 1];
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    const step = 0.018;
    bits.forEach((b, i) => osc.frequency.setValueAtTime(this.f(b ? 2160 : 1620), now + i * step));
    const dur = bits.length * step;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.14, now + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur + 0.02);
    osc.connect(g);
    g.connect(this.dryBus);
    osc.start(now);
    osc.stop(now + dur + 0.03);
  }

  // G02. 硬件域控握手报文 (#11 + 金属底座双帧流：适合 AGX Orin 连线)
  playG02_ControllerHandshake() {
    this.init();
    const now = this.ctx.currentTime;
    [0, 0.14].forEach((off, block) => {
      const t0 = now + off;
      this.injectChassisMass(t0, block === 0 ? 0.8 : 1.0);
      const bits = block === 0 ? [0, 1, 0, 1, 1] : [1, 0, 1, 1, 1, 0];
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      const step = 0.016;
      bits.forEach((b, i) => osc.frequency.setValueAtTime(this.f(b ? (block ? 2400 : 1920) : 1440), t0 + i * step));
      const dur = bits.length * step;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(0.13, t0 + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + 0.02);
      osc.connect(g);
      g.connect(this.dryBus);
      osc.start(t0);
      osc.stop(t0 + dur + 0.03);
    });
  }

  // G03. 坐标矩阵逐行写入 (#11 阶梯上行遥测：适合表格/参数面板展开)
  playG03_MatrixTelemetry() {
    this.init();
    const now = this.ctx.currentTime;
    this.injectChassisMass(now, 0.85);
    const freqs = [1100, 1320, 1485, 1650, 1980, 2200];
    freqs.forEach((rawF, i) => {
      const t0 = now + i * 0.034;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(this.f(rawF), t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(0.12, t0 + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.045);
      osc.connect(g);
      g.connect(this.dryBus);
      osc.start(t0);
      osc.stop(t0 + 0.05);
    });
  }

  // G04. 水声调制解调器回传 (#11 + #17 融合：水下信道遥测波)
  playG04_AcousticModem() {
    this.init();
    const now = this.ctx.currentTime;
    this.injectChassisMass(now, 0.9);
    const seq = [1200, 1600, 1200, 1800, 2400, 1800, 2400];
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const delay = this.ctx.createDelay();
    const fb = this.ctx.createGain();
    osc.type = 'sine';
    seq.forEach((f, i) => osc.frequency.setValueAtTime(this.f(f), now + i * 0.028));
    const dur = seq.length * 0.028;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.14, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur + 0.12);
    delay.delayTime.setValueAtTime(0.065, now);
    fb.gain.setValueAtTime(0.35, now);
    osc.connect(g);
    g.connect(this.dryBus);
    g.connect(delay);
    delay.connect(fb);
    fb.connect(delay);
    delay.connect(this.dryBus);
    osc.start(now);
    osc.stop(now + dur + 0.25);
  }

  // G05. 航行日志封包归档 (#11 下行收束遥测：适合测试结束上传日志)
  playG05_PacketArchive() {
    this.init();
    const now = this.ctx.currentTime;
    const seq = [2200, 1760, 1485, 1100, 880];
    seq.forEach((rawF, i) => {
      const t0 = now + i * 0.036;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(this.f(rawF), t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(0.13, t0 + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.07);
      osc.connect(g);
      g.connect(this.dryBus);
      osc.start(t0);
      osc.stop(t0 + 0.08);
    });
    this.injectChassisMass(now + 0.144, 1.0);
  }

  // G06. 十二任务算术平均汇总 (#11 + #12 复合：多任务聚合计算完成)
  playG06_TaskAggregation() {
    this.init();
    const now = this.ctx.currentTime;
    const notes = [880, 1100, 1320, 1760];
    notes.forEach((rawF, i) => {
      const t0 = now + i * 0.042;
      const dur = i === 3 ? 0.42 : 0.08;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(this.f(rawF), t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(i === 3 ? 0.16 : 0.11, t0 + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g);
      g.connect(this.dryBus);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    });
    this.injectChassisMass(now + 0.126, 1.1);
  }

  // G07. 舰载相控阵近距扫描 (#13 紧凑双脉冲：适合虚拟交通船只检出)
  playG07_CloseArrayPing() {
    this.init();
    const now = this.ctx.currentTime;
    [0, 0.09].forEach((off, idx) => {
      const t0 = now + off;
      this.injectChassisMass(t0, idx === 0 ? 0.7 : 0.95);
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      const f = this.f(idx === 0 ? 1046.5 : 1318.5);
      osc.frequency.setValueAtTime(f, t0);
      osc.frequency.exponentialRampToValueAtTime(f * 0.97, t0 + 0.34);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(idx === 0 ? 0.13 : 0.17, t0 + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.34);
      osc.connect(g);
      g.connect(this.dryBus);
      osc.start(t0);
      osc.stop(t0 + 0.36);
    });
  }

  // G08. 虚实边界测距回波 (#13 + #17 长尾波导反射：适合航道边界线高亮)
  playG08_BoundaryEcho() {
    this.init();
    const now = this.ctx.currentTime;
    const dur = 0.95;
    this.injectChassisMass(now, 0.9);
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    const base = this.f(784);
    osc.frequency.setValueAtTime(base, now);
    osc.frequency.exponentialRampToValueAtTime(base * 0.95, now + dur);

    const delay = this.ctx.createDelay();
    delay.delayTime.setValueAtTime(0.11, now);
    const fb = this.ctx.createGain();
    fb.gain.setValueAtTime(0.52, now);

    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.18, now + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(g);
    g.connect(this.dryBus);
    g.connect(delay);
    delay.connect(fb);
    fb.connect(delay);
    delay.connect(this.dryBus);
    osc.start(now);
    osc.stop(now + dur + 0.1);
  }

  // G09. 深水声呐双频探测 (#17 八度谐波加强版：更厚重的舰船吃水/地形探测)
  playG09_DualBathymetry() {
    this.init();
    const now = this.ctx.currentTime;
    const dur = 1.35;
    this.injectChassisMass(now, 1.0);
    [440, 880].forEach((rawF, idx) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      const base = this.f(rawF);
      osc.frequency.setValueAtTime(base, now);
      osc.frequency.exponentialRampToValueAtTime(base * 0.985, now + dur);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(idx === 0 ? 0.19 : 0.09, now + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.connect(g);
      g.connect(this.dryBus);
      osc.start(now);
      osc.stop(now + dur + 0.05);
    });
  }

  // G10. 多普勒目标掠过 (#13 频率微俯冲：适合对向船只交会/横驶区掠过)
  playG10_DopplerPass() {
    this.init();
    const now = this.ctx.currentTime;
    const dur = 0.72;
    this.injectChassisMass(now + 0.15, 0.85);
    const osc = this.ctx.createOscillator();
    const pan = this.ctx.createStereoPanner();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(this.f(1120), now);
    osc.frequency.exponentialRampToValueAtTime(this.f(760), now + dur);
    pan.pan.setValueAtTime(0.75, now);
    pan.pan.linearRampToValueAtTime(-0.75, now + dur);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.17, now + dur * 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(g);
    g.connect(pan);
    pan.connect(this.dryBus);
    osc.start(now);
    osc.stop(now + dur + 0.03);
  }

  // G11. 声学信标定时滴答 (#17 短促版：适合船闸等待倒计时/秒表刻度)
  playG11_SonarBeaconTick() {
    this.init();
    const now = this.ctx.currentTime;
    this.injectChassisMass(now, 0.65);
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    const base = this.f(987.77);
    osc.frequency.setValueAtTime(base, now);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.15, now + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    osc.connect(g);
    g.connect(this.dryBus);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // G12. 虚实空间融合锁定 (#13 + #17 宽声场和弦雷达：适合“真实环境+虚拟交通”同框)
  playG12_FusionSpacePing() {
    this.init();
    const now = this.ctx.currentTime;
    const dur = 1.1;
    this.injectChassisMass(now, 1.0);
    [587.33, 880, 1174.66].forEach((rawF, i) => {
      const t0 = now + i * 0.025;
      const osc = this.ctx.createOscillator();
      const pan = this.ctx.createStereoPanner();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(this.f(rawF), t0);
      pan.pan.setValueAtTime((i - 1) * 0.55, t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(0.12 / (1 + i * 0.25), t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g);
      g.connect(pan);
      pan.connect(this.dryBus);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    });
  }

  // G13. 沉稳低频双音核验 (#12 降调纯四度版：更厚重的阶段切换提示)
  playG13_DeepVerified() {
    this.init();
    const now = this.ctx.currentTime;
    this.injectChassisMass(now, 1.0);
    [523.25, 698.46].forEach((rawF, idx) => {
      const t0 = now + idx * 0.075;
      const dur = 0.42;
      const osc = this.ctx.createOscillator();
      const lp = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(this.f(rawF), t0);
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(this.f(1800), t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(0.17, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(lp);
      lp.connect(g);
      g.connect(this.dryBus);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    });
  }

  // G14. 三段赛程递进确认 (#12 三音阶版：适合“01域控 -> 02实船 -> 03竞评”三阶段点亮)
  playG14_TriStageStep() {
    this.init();
    const now = this.ctx.currentTime;
    this.injectChassisMass(now, 0.9);
    [440, 554.37, 659.25].forEach((rawF, idx) => {
      const t0 = now + idx * 0.068;
      const dur = idx === 2 ? 0.45 : 0.14;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(this.f(rawF), t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(0.15, t0 + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g);
      g.connect(this.dryBus);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    });
  }

  // G15. 船闸闸门开启就绪 (#12 + 机械底座：适合人字闸门完全开启通行)
  playG15_LockGateReady() {
    this.init();
    const now = this.ctx.currentTime;
    this.injectChassisMass(now, 1.15);
    [392.0, 587.33].forEach((rawF, idx) => {
      const t0 = now + idx * 0.095;
      const dur = 0.52;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(this.f(rawF), t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(0.19, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g);
      g.connect(this.dryBus);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    });
  }

  // G16. 航速超限低频警示 (#24 短促双脉冲版：适合 1.5m/s 限速阈值红线提示)
  playG16_SpeedThresholdWarn() {
    this.init();
    const now = this.ctx.currentTime;
    [0, 0.16].forEach((off) => {
      const t0 = now + off;
      const dur = 0.13;
      [82.41, 123.47].forEach((rawF, idx) => {
        const osc = this.ctx.createOscillator();
        const lp = this.ctx.createBiquadFilter();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(this.f(rawF), t0);
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(this.f(680), t0);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.linearRampToValueAtTime(idx === 0 ? 0.22 : 0.13, t0 + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        osc.connect(lp);
        lp.connect(g);
        g.connect(this.dryBus);
        osc.start(t0);
        osc.stop(t0 + dur + 0.02);
      });
    });
  }

  // G17. 可航边界越界零分否决 (#24 下行压迫重击：适合“驶出可航区：0分”判罚)
  playG17_VetoLowStinger() {
    this.init();
    const now = this.ctx.currentTime;
    const dur = 0.95;
    [73.42, 65.41].forEach((rawF, idx) => {
      const t0 = now + idx * 0.14;
      const osc = this.ctx.createOscillator();
      const lp = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(this.f(rawF), t0);
      osc.frequency.exponentialRampToValueAtTime(this.f(rawF * 0.88), t0 + dur * 0.7);
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(this.f(720), t0);
      lp.frequency.exponentialRampToValueAtTime(this.f(180), t0 + dur * 0.75);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(0.24, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur * 0.8);
      osc.connect(lp);
      lp.connect(g);
      g.connect(this.dryBus);
      osc.start(t0);
      osc.stop(t0 + dur);
    });
  }

  // G18. 战略简报终章定格 (#24 + #12 复合：厚重铜管底座 + 清亮核验尾音，适合 98s 结尾主标题)
  playG18_FinaleLock() {
    this.init();
    const now = this.ctx.currentTime;
    this.play24_ThreatStinger();
    [660, 990].forEach((rawF, idx) => {
      const t0 = now + 0.06 + idx * 0.07;
      const dur = 0.65;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(this.f(rawF), t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(0.14, t0 + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g);
      g.connect(this.dryBus);
      osc.start(t0);
      osc.stop(t0 + dur + 0.03);
    });
  }
}
export const SELECTED = Object.freeze({
  "11": {
    "name": "卫星遥测数据包",
    "method": "play11_SatelliteTelemetry",
    "family": "data",
    "renderSeconds": 2
  },
  "17": {
    "name": "深空声呐/海底地形测绘",
    "method": "play17_DeepSonar",
    "family": "probe",
    "renderSeconds": 4
  },
  "24": {
    "name": "威胁等级提升警报",
    "method": "play24_ThreatStinger",
    "family": "warning",
    "renderSeconds": 3
  },
  "G01": {
    "name": "窄带星地短报文",
    "method": "playG01_ShortTelemetry",
    "family": "data",
    "renderSeconds": 2
  },
  "G08": {
    "name": "虚实边界测距回波",
    "method": "playG08_BoundaryEcho",
    "family": "probe",
    "renderSeconds": 4
  },
  "G11": {
    "name": "声学信标定时滴答",
    "method": "playG11_SonarBeaconTick",
    "family": "timing",
    "renderSeconds": 2
  },
  "G16": {
    "name": "航速超限低频警示",
    "method": "playG16_SpeedThresholdWarn",
    "family": "warning",
    "renderSeconds": 2
  },
  "G17": {
    "name": "可航边界越界零分否决",
    "method": "playG17_VetoLowStinger",
    "family": "warning",
    "renderSeconds": 3
  }
});
export const DEFAULTS = Object.freeze({weight:1,pitchSemis:-12,reverb:0.216,volume:0.85});
function seeded(seed) {let s=seed>>>0;return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
export function createEngine(options={}) {
  const engine=new SciFiDspEngine();
  const o={...DEFAULTS,...options};
  engine.weight=o.weight;engine.pitchSemis=o.pitchSemis;engine.rev=o.reverb;engine.vol=o.volume;
  if(Number.isInteger(o.seed))engine.random=seeded(o.seed);
  if(o.contextFactory)engine.contextFactory=o.contextFactory;
  engine.offline=!!o.offline;
  return engine;
}
export function playSelected(engine,id) {
  if(!Object.hasOwn(SELECTED,id))throw new Error("Unknown/unselected SceneBrief sound: "+id);
  engine[SELECTED[id].method]();
}
export async function renderSelected(id,{sampleRate=48000,seed=20261127,...options}={}) {
  if(!Object.hasOwn(SELECTED,id))throw new Error("Unknown/unselected SceneBrief sound: "+id);
  const ctx=new OfflineAudioContext(2,Math.ceil(sampleRate*SELECTED[id].renderSeconds),sampleRate);
  const engine=createEngine({...options,seed,offline:true,contextFactory:()=>ctx});
  playSelected(engine,id);
  return ctx.startRendering();
}
