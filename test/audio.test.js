import test from 'node:test';
import assert from 'node:assert/strict';
import {createSoundStage} from '../src/audio/sound-stage.js';
test('harmonic beds, synchronized cues, pause and seek',()=>{
  const buffers=[],sources=[];
  const param=()=>({value:0,setTargetAtTime(){},cancelScheduledValues(){}});
  const node=()=>({connect(){},disconnect(){},gain:param(),pan:param(),playbackRate:param(),threshold:param(),knee:param(),ratio:param(),attack:param(),release:param()});
  globalThis.window={AudioContext:class {
    constructor(){this.sampleRate=8000;this.currentTime=0;this.destination=node()}
    resume(){return Promise.resolve()}createGain(){return node()}createDynamicsCompressor(){return node()}createStereoPanner(){return node()}
    createBuffer(ch,n,sr){const data=new Float32Array(n);buffers.push(data);return{getChannelData:()=>data}}
    createBufferSource(){const n={...node(),start(){},stop(){this.stopped=true}};sources.push(n);return n}
  }};
  const sound=createSoundStage({cues:[[8.25,'window'],[11.58,'rubber']]});
  sound.init();assert.equal(sources.length,6);
  const update=(time,playing=true)=>sound.update({time,playing,muted:false,volume:.55,motion:{ahead:1},close:.8});
  sound.seek(8.2);update(8.26);assert.equal(sources.length,7);
  update(8.27,false);assert.equal(sources[6].stopped,true);
  sound.seek(11.55);update(11.59);assert.equal(sources.length,8);
  for(const b of buffers){assert.ok(b.every(Number.isFinite));assert.ok(b.reduce((m,x)=>Math.max(m,Math.abs(x)),0)<=.801)}
  sound.cancel();delete globalThis.window;
});
