import {cl,mix,ease} from './math.js';
// Screen time is separate from the compressed illustrative operation clock.
export const INTRO_END=43;
export const BEATS=[
  {start:43,end:48,from:0,to:4,camera:2,move:1.5},
  {start:48,end:54,from:4,to:8,camera:4.8,move:1.25},
  {start:54,end:62,from:8,to:12,camera:10.2,move:1.65},
  {start:62,end:69,from:12,to:17,camera:13.8,move:1.4},
  {start:69,end:76,from:17,to:22,camera:20.3,move:1.45},
  {start:76,end:82,from:22,to:26,camera:24.6,move:1.3},
  {start:82,end:88,from:26,to:30,camera:30,move:2.1}
];
export const BRIEF_DURATION=88;
export function briefingBeat(screenTime){
  const i=Math.max(0,BEATS.findIndex(b=>screenTime<b.end));
  const j=screenTime>=BRIEF_DURATION?BEATS.length-1:i,b=BEATS[j];
  const fraction=cl((screenTime-b.start)/(b.end-b.start));
  const prev=j?BEATS[j-1].camera:0;
  return {j,opTime:mix(b.from,b.to,fraction),cameraTime:mix(prev,b.camera,ease((screenTime-b.start)/b.move)),fraction,settled:screenTime>=b.start+b.move};
}
export function screenForOperation(opTime){
  const b=BEATS.find(b=>opTime<=b.to)||BEATS[BEATS.length-1];
  return mix(b.start,b.end,cl((opTime-b.from)/(b.to-b.from)));
}
