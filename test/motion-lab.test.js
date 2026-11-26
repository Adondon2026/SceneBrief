import test from 'node:test';
import assert from 'node:assert/strict';
import {damped,partialPath,continuousKeys} from '../src/core/motion-design.js';
import {LAB_DURATION,LAB_STARTS,LAB_FINAL,labCamera,labProject,labCardState,labActive} from '../src/cases/harbor-approach/motion-lab.js';
import {dispatchTugAt} from '../src/cases/harbor-approach/dispatch-state.js';
test('damped response has exact endpoints and is monotonic',()=>{
 assert.equal(damped(0),0);assert.equal(damped(1),1);
 for(let i=1;i<=1000;i++)assert.ok(damped(i/1000)>=damped((i-1)/1000));
 assert.deepEqual(partialPath([[0,0],[4,0],[4,6]],.5),[[0,0],[4,0],[4,1]]);
});
test('camera keyframe velocities are continuous at interior keys',()=>{
 const keys=[[0,0,0],[1,3,5],[3,7,6],[4,10,1]],h=1e-5;
 for(let t of [1,3]){const a=continuousKeys(t-h,keys),b=continuousKeys(t,keys),c=continuousKeys(t+h,keys);for(let j=0;j<b.length;j++)assert.ok(Math.abs((b[j]-a[j])/h-(c[j]-b[j])/h)<.001)}
});
test('active anchors stay visible through their reading intervals',()=>{
 for(let k=0;k<4;k++){const start=LAB_STARTS[k],end=LAB_STARTS[k+1]??LAB_FINAL,o=dispatchTugAt(24,k);
  for(let t=start+.75;t<end-.18;t+=.05){const a=labProject(labCamera(t),o.x,3,o.z);assert.ok(a[0]>20&&a[0]<780&&a[1]>75&&a[1]<510)}
 }
});
test('dossiers remain in the final resource index; deterministic after seeking',()=>{
 assert.equal(labActive(LAB_FINAL),-1);
 for(let k=0;k<4;k++){const state=labCardState(LAB_DURATION,k,[400,300]);assert.equal(state.dock,1);assert.deepEqual(state.rect,[42+k*302,516,286,150]);assert.equal(state.focus,0);assert.deepEqual(state,labCardState(LAB_DURATION,k,[400,300]))}
});
