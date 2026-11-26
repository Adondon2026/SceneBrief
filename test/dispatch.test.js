import test from 'node:test';
import assert from 'node:assert/strict';
import {BEATS,BRIEF_DURATION,INTRO_END,briefingBeat,screenForOperation} from '../src/core/briefing-clock.js';
import {dispatchTugAt,dispatchShipAt,fleetAt,FLEET,dispatchTiming} from '../src/cases/harbor-approach/dispatch-state.js';
import {pathAt} from '../src/cases/harbor-approach/motion.js';
import {EARTH_MASK,REGION_MASK,decodeLand} from '../src/cases/harbor-approach/earth-data.js';
function separation(a,b,L,B,l,w){
  const axes=o=>[[Math.cos(o.yaw),-Math.sin(o.yaw)],[Math.sin(o.yaw),Math.cos(o.yaw)]],dot=(a,b)=>a[0]*b[0]+a[1]*b[1];
  const [x,z]=axes(a),[u,v]=axes(b),d=[a.x-b.x,a.z-b.z];
  return Math.max(...[x,z,u,v].map(q=>Math.abs(dot(q,d))-B/2*Math.abs(dot(q,x))-L/2*Math.abs(dot(q,z))-w/2*Math.abs(dot(q,u))-l/2*Math.abs(dot(q,v))));
}
test('screen beats separate camera movement from reading hold',()=>{
  assert.equal(BEATS[0].start,INTRO_END);assert.equal(BEATS.at(-1).end,BRIEF_DURATION);
  for(let i=0;i<BEATS.length;i++){
    const b=BEATS[i];assert.ok(b.end-b.start-b.move>=3);
    if(i)assert.equal(BEATS[i-1].end,b.start);
    assert.equal(briefingBeat(screenForOperation((b.from+b.to)/2)).j,i);
  }
});
test('dispatch-to-operation handoff is spatially continuous',()=>{
  assert.equal(FLEET.length,4);
  for(let k=0;k<4;k++){
    const a=dispatchTugAt(INTRO_END,k),b=fleetAt(0)[k];assert.deepEqual([a.x,a.z,a.yaw],[b.x,b.z,b.yaw]);assert.ok(dispatchTiming(k).end<INTRO_END);
  }
  assert.deepEqual(dispatchShipAt(INTRO_END),pathAt(0));
});
test('four-tug dispatch hull envelopes stay separate',()=>{
  for(let i=0;i<=4300;i++){
    const t=i/100,s=dispatchShipAt(t),f=FLEET.map((_,k)=>dispatchTugAt(t,k));
    for(let k=0;k<4;k++){assert.ok([f[k].x,f[k].z,f[k].yaw].every(Number.isFinite));assert.ok(separation(s,f[k],240,36,31,10)>0);for(let n=k+1;n<4;n++)assert.ok(separation(f[k],f[n],31,10,31,10)>0);}
  }
});
test('reserve tug hull envelopes stay away from the working vessels',()=>{
  for(let i=0;i<=3000;i++){let t=i/100,s=pathAt(t),f=fleetAt(t);for(let k=2;k<4;k++){assert.ok(separation(s,f[k],240,36,31,10)>0);for(let n=0;n<k;n++)assert.ok(separation(f[n],f[k],31,10,31,10)>0)}}
});
test('generalized land mask is complete',()=>{
  assert.equal(atob(EARTH_MASK).length,900);assert.equal(atob(REGION_MASK).length,468);
  assert.ok(decodeLand(EARTH_MASK,120,60,-178.5,-88.5,3).length>2000);
  assert.ok(decodeLand(REGION_MASK,72,52,104.25,17.25,.5).length>1000);
});
