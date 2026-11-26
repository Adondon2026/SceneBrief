import {cl,ease} from '../core/math.js';

// Provisional harmonic synthesis, not a recording of an actual vessel.
// Replace individual loop sources with licensed samples via loopSamples.
export function createSoundStage({loopSamples={},cues=[]}={}){
  let ac,master,previous=0,events=new Set(),buses={};
  const tau=2*Math.PI;
  const specs={
    harbor:{f:[31,47,63,83,109,137],a:[1,.49,.31,.27,.19,.11],mod:.5,depth:.12,pan:-.2},
    main:{f:[26,52,78,104,130,156,208,260],a:[1,.55,.42,.25,.21,.13,.075,.04],mod:6.5,depth:.26,pan:-.1},
    tug:{f:[37,74,111,148,185,222,296],a:[1,.72,.44,.34,.18,.11,.06],mod:9.25,depth:.3,pan:.14},
    wash:{f:[43,53.25,68,79.5,91.75,112,131,153.5,183,219.25,251.5],a:[.45,.65,1,.72,.61,.48,.37,.3,.2,.13,.07],mod:1.25,depth:.24,pan:.2},
    water:{f:[45,57.25,69,83.5,103,126.25,148,169,201.5,223],a:[.4,.62,.85,1,.81,.62,.4,.27,.14,.08],mod:.75,depth:.3,pan:-.18},
    winch:{f:[46,92,138,184,276,368],a:[1,.64,.36,.31,.13,.065],mod:12,depth:.22,pan:-.18}
  };
  function harmonicLoop(spec){
    const dur=4,N=ac.sampleRate*dur,buffer=ac.createBuffer(1,N,ac.sampleRate),out=buffer.getChannelData(0);
    let peak=0;
    for(let i=0;i<N;i++){
      const t=i/ac.sampleRate,phase=.055*Math.sin(tau*.5*t);
      let v=0;
      for(let k=0;k<spec.f.length;k++)v+=spec.a[k]*Math.sin(tau*spec.f[k]*t+k*1.713+phase*(k+1));
      v*=1-spec.depth*.5+spec.depth*.5*Math.cos(tau*spec.mod*t);
      out[i]=v;peak=Math.max(peak,Math.abs(v));
    }
    for(let i=0;i<N;i++)out[i]*=.68/(peak||1);
    return buffer;
  }
  function sourceFor(buffer,g){
    const src=ac.createBufferSource();src.buffer=buffer;src.loop=true;src.connect(g);src.start();return src;
  }
  function addLoop(name,spec){
    const g=ac.createGain();g.gain.value=0;
    if(ac.createStereoPanner){const pan=ac.createStereoPanner();pan.pan.value=spec.pan;g.connect(pan);pan.connect(master)}else g.connect(master);
    const src=sourceFor(harmonicLoop(spec),g);
    const bus=buses[name]={g,src,sample:false};
    if(loopSamples[name])fetch(loopSamples[name]).then(r=>{if(!r.ok)throw Error(r.status);return r.arrayBuffer()}).then(b=>ac.decodeAudioData(b)).then(buffer=>{
      const now=ac.currentTime,old=bus.src;bus.g.gain.cancelScheduledValues(now);bus.g.gain.setTargetAtTime(0,now,.025);
      setTimeout(()=>{try{old.stop()}catch{}bus.src=sourceFor(buffer,bus.g);bus.sample=true},110);
    }).catch(e=>console.warn('Sample fallback:',name,e.message));
  }
  function init(){
    if(ac){ac.resume().catch(()=>{});return true}
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
    ac=new AC();master=ac.createGain();master.gain.value=0;
    const limiter=ac.createDynamicsCompressor();limiter.threshold.value=-18;limiter.knee.value=10;limiter.ratio.value=4;limiter.attack.value=.006;limiter.release.value=.24;
    master.connect(limiter);limiter.connect(ac.destination);
    for(const [name,spec] of Object.entries(specs))addLoop(name,spec);
    ac.resume().catch(()=>{});return true;
  }
  const hits={
    window:{dur:.38,f:[65,103,174,289],amp:[.95,.42,.18,.085],decay:[12,18,24,38],gain:.29,offsets:[0,.073]},
    rubber:{dur:.52,f:[39,67,109,151],amp:[1,.48,.22,.08],decay:[7,12,18,25],gain:.25,offsets:[0]},
    contact:{dur:.8,f:[32,56,85,125,211],amp:[1,.6,.35,.19,.07],decay:[4,7,10,15,25],gain:.36,offsets:[0]},
    chain:{dur:.56,f:[92,176,293,487,733],amp:[1,.46,.28,.14,.055],decay:[14,20,32,43,58],gain:.2,offsets:[0,.09,.21]},
    rope:{dur:.65,f:[49,81,137,196],amp:[1,.49,.27,.07],decay:[5,8,13,19],gain:.17,offsets:[0,.12]}
  };
  function playHit(kind){
    if(!ac||!hits[kind])return;
    const spec=hits[kind],n=Math.ceil(ac.sampleRate*spec.dur),buffer=ac.createBuffer(1,n,ac.sampleRate),samples=buffer.getChannelData(0);
    let peak=0;
    for(let i=0;i<n;i++){
      const t=i/ac.sampleRate;let v=0;
      for(const [j,o] of spec.offsets.entries()){
        const u=t-o;if(u<0)continue;
        const env=Math.min(1,u/.008)*Math.min(1,(spec.dur-t)/.03)/(1+j*.75);
        for(let k=0;k<spec.f.length;k++)v+=env*spec.amp[k]*Math.exp(-spec.decay[k]*u)*Math.sin(tau*spec.f[k]*u);
      }
      samples[i]=v;peak=Math.max(peak,Math.abs(v));
    }
    for(let i=0;i<n;i++)samples[i]*=.8/(peak||1);
    const src=ac.createBufferSource(),g=ac.createGain();src.buffer=buffer;g.gain.value=spec.gain;src.connect(g);g.connect(master);
    events.add(src);src.onended=()=>{events.delete(src);src.disconnect();g.disconnect()};src.start();
  }
  function cancel(){for(const src of events){try{src.stop()}catch{}}events.clear()}
  function seek(time){previous=time;cancel()}
  function update({time,playing,muted,volume,motion,close}){
    if(!ac)return;const now=ac.currentTime,p=playing?1:0,eng=cl(motion.ahead/2.5);
    const approach=ease((time-6)/2)*(1-ease((time-11)/1)),push=ease((time-11.5)/1)*(1-.82*ease((time-21)/5)),depart=ease((time-28)/.5),shore=ease((time-17)/2)*(1-ease((time-29)/1.3)),winch=ease((time-26)/.6)*(1-ease((time-29.1)/.7));
    const gains={harbor:.06*(1-.35*close),main:.11*eng+.02,tug:(.018+.18*approach+.22*push+.12*depart)*(.5+.5*close),wash:(.012+.055*push+.035*depart)*(.5+.5*close),water:.02+.06*shore*close,winch:.14*winch};
    for(const [name,bus] of Object.entries(buses)){
      bus.g.gain.setTargetAtTime(p*gains[name],now,.19);
      const rate=name==='main'?.88+.15*eng:name==='tug'?.92+.10*approach+.14*push+.07*depart:1;
      bus.src.playbackRate.setTargetAtTime(bus.sample?1:rate,now,.32);
    }
    master.gain.setTargetAtTime(muted?0:cl(volume),now,.09);
    if(playing&&!muted&&time>=previous&&time-previous<.55)for(const [at,kind] of cues)if(previous<at&&time>=at)playHit(kind);
    if(!playing||muted)cancel();previous=time;
  }
  return {init,update,seek,cancel};
}
