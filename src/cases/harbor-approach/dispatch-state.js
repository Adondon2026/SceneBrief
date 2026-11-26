import {cl,mix,ease} from '../../core/math.js';
import {pathAt,tugAt} from './motion.js';
export const ANCHOR={x:475,z:-735,yaw:-.40};
export const FLEET=[
  {id:'T01',role:'艏部推靠',bp:65,home:'北拖轮基地',start:{x:-35,z:370},active:true},
  {id:'T02',role:'艉部推靠',bp:65,home:'南拖轮基地',start:{x:-35,z:-180},active:true},
  {id:'T03',role:'进港伴航 / 待命',bp:55,home:'北拖轮基地',start:{x:5,z:370},active:false},
  {id:'T04',role:'应急机动 / 待命',bp:55,home:'南拖轮基地',start:{x:5,z:-180},active:false}
];
const reserve=[{x:280,z:260,yaw:Math.PI/2},{x:300,z:-95,yaw:Math.PI/2}];
export function fleetAt(opTime){
  return [tugAt(opTime,0),tugAt(opTime,1),...reserve.map(o=>({...o,mode:opTime>=29?'RELEASED':'STANDBY',contact:false}))];
}
export function dispatchRoute(k){
  const a=FLEET[k].start,b=fleetAt(0)[k];
  const mid=[
    [{x:78,z:355},{x:115,z:250}],
    [{x:68,z:-135},{x:120,z:-30}],
    [{x:75,z:405},{x:220,z:360}],
    [{x:105,z:-215},{x:230,z:-170}]
  ][k];
  return [a,...mid,b];
}
const shipRoute=[ANCHOR,{x:380,z:-620},{x:180,z:-460},pathAt(0)];
export function shipDispatchRoute(){return shipRoute}
function interpolateRoute(route,u){
  const lengths=route.slice(1).map((b,i)=>Math.hypot(b.x-route[i].x,b.z-route[i].z));
  const total=lengths.reduce((a,b)=>a+b,0),target=cl(u)*total;let acc=0;
  for(let i=0;i<lengths.length;i++){if(target<=acc+lengths[i]||i===lengths.length-1){const a=route[i],b=route[i+1],p=cl((target-acc)/lengths[i]);return {x:mix(a.x,b.x,p),z:mix(a.z,b.z,p),yaw:Math.atan2(b.x-a.x,b.z-a.z)}}acc+=lengths[i]}
}
export function dispatchTugAt(time,k){
  const route=dispatchRoute(k),goal=route[route.length-1];
  const start=35.9+k*.16,end=40.6+k*.25;
  if(time>=end)return {...goal,mode:'WAIT'};
  return {...interpolateRoute(route,ease((time-start)/(end-start))),mode:time<start?'WAIT':'TRANSIT'};
}
export function dispatchShipAt(time){
  if(time<36.8)return {...ANCHOR};
  if(time>=42.35)return pathAt(0);
  return interpolateRoute(shipRoute,ease((time-36.8)/(42.35-36.8)));
}
