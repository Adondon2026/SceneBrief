import {local} from '../../core/math.js';
import {curve} from './motion.js';
// Camera keys: time, azimuth, elevation, scale, local focus x/y/z. Continuous framing, not a persistent wide shot.
const CAM=[[0,-.08,1.35,.86,-20,0,135],[2,.10,1.15,1.45,-10,4,65],[4.8,.68,.53,3.0,0,10,-46],[6.8,1.0,.36,7.5,63,8,76],[8.4,.94,.34,12.0,82,8,85],[10.2,.73,.42,16.0,37,5,64],[11.7,.42,.65,10.5,29,6,64],[13.8,.08,1.35,2.4,4,0,4],[16.1,-.30,1.27,2.55,-1,1,0],[18.4,-.72,.64,8.2,-27,4,60],[20.3,-.76,.49,13.5,-29,3,64],[22.2,-.92,.34,18.5,-20.5,3,64],[24.6,-.70,.40,21,-19,3,64],[26.3,-.47,.62,13,-15,8,92],[28,-.21,1.06,6,-19,7,91],[30,.12,1.35,2.1,-4,0,0]];
export function harborCamera(time,s,W,H){let focus=local(s,curve(time,4,CAM),curve(time,5,CAM),curve(time,6,CAM));return {az:curve(time,1,CAM),el:curve(time,2,CAM),scale:curve(time,3,CAM)*W/1280,tx:focus[0],ty:focus[1],tz:focus[2],cx:W*.53,cy:H*.43}}
