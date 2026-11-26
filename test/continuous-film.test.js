import test from 'node:test';
import assert from 'node:assert/strict';
import {filmCameraTime,BRIEF_DURATION,briefingBeat} from '../src/core/briefing-clock.js';
import {labCamera,LAB_DURATION} from '../src/cases/harbor-approach/motion-lab.js';
import {introCamera,DISPATCH_START,DISPATCH_END,dispatchClock} from '../src/cases/harbor-approach/continuous-intro.js';
import {NARRATION,FILM_CHAPTERS} from '../src/cases/harbor-approach/film-chrome.js';
test('port camera passes through the same world at the lab boundaries',()=>{
 assert.deepEqual(introCamera(DISPATCH_START),labCamera(0));
 assert.deepEqual(introCamera(DISPATCH_END),labCamera(LAB_DURATION));
 for(const at of [DISPATCH_START,DISPATCH_END])for(const dt of [-.001,.001]){
 const a=introCamera(at),b=introCamera(at+dt);
 assert.ok(Math.hypot(a.x-b.x,a.z-b.z)<1);
 assert.ok(Math.abs(a.s-b.s)<.01);
 }
 assert.equal(dispatchClock(43),43);
});
test('full film camera progresses throughout the reading intervals',()=>{
 assert.equal(filmCameraTime(43),0);assert.equal(filmCameraTime(90),30);
 for(let i=0;i<4700;i++){const t=43+i*.01;assert.ok(filmCameraTime(t+.01)>=filmCameraTime(t)-1e-7)}
 for(const t of [46,51,58,66,73,80,85])assert.ok(filmCameraTime(t+.5)>filmCameraTime(t));
});
test('voiceover cues are independent, ordered and bounded',()=>{
 assert.equal(BRIEF_DURATION,90);assert.equal(FILM_CHAPTERS.length,13);assert.equal(NARRATION.length,20);
 for(let i=0;i<NARRATION.length;i++){const c=NARRATION[i];assert.ok(c.at>=0&&c.end<=90&&c.end>c.at&&c.text.length>0);if(i)assert.ok(NARRATION[i-1].end<=c.at)}
});
