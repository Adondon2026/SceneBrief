import {cl,mix,ease} from './math.js';
import {continuousKeys} from './motion-design.js';
// Screen time is separate from the compressed illustrative operation clock.
export const INTRO_END=43;
export const BEATS=[
  {start:43,end:48,from:0,to:4,camera:2,move:1.5},
  {start:48,end:54,from:4,to:8,camera:4.8,move:1.25},
  {start:54,end:62,from:8,to:12,camera:10.2,move:1.65},
  {start:62,end:69,from:12,to:17,camera:13.8,move:1.4},
  {start:69,end:76,from:17,to:22,camera:20.3,move:1.45},
  {start:76,end:82,from:22,to:26,camera:24.6,move:1.3},
  {start:82,end:90,from:26,to:30,camera:26.3,move:1.5}
];
export const BRIEF_DURATION=90;
// Fast discovery moves alternate with low-speed drift. These are screen time -> camera sample time keys.
// Reading holds stabilize the primary caption, not the camera or world.
const CAMERA_TIME_KEYS=[
 [43,0],[44.5,1.55],[47.6,2.32],[49.25,4.30],[53.6,5.25],
 [55.65,9.25],[59.7,10.45],[61.7,11.45],
 [63.4,13.75],[68.6,15.75],[70.5,19.40],[75.6,21.0],
 [77.3,23.15],[81.6,24.85],[83.5,26.25],[85.9,27.15],[87.4,29.15],[90,30]
];
export function filmCameraTime(time){return cl(continuousKeys(time,CAMERA_TIME_KEYS)[0],0,30)}
export function briefingBeat(screenTime){
  const i=Math.max(0,BEATS.findIndex(b=>screenTime<b.end));
  const j=screenTime>=BRIEF_DURATION?BEATS.length-1:i,b=BEATS[j];
  const fraction=cl((screenTime-b.start)/(b.end-b.start));
  const prev=j?BEATS[j-1].camera:0;
  return {j,opTime:mix(b.from,b.to,fraction),cameraTime:filmCameraTime(screenTime),fraction,settled:screenTime>=b.start+b.move};
}
export function screenForOperation(opTime){
  const b=BEATS.find(b=>opTime<=b.to)||BEATS[BEATS.length-1];
  return mix(b.start,b.end,cl((opTime-b.from)/(b.to-b.from)));
}
