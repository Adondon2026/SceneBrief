import {cl,mix,ease} from '../../core/math.js';
import {pathAt,tugAt} from './motion.js';
export const ANCHOR={x:475,z:-735,yaw:-.40};
export const FLEET=[
  {id:'T01',role:'艏部推靠',bp:65,home:'北拖轮基地',start:{x:-35,z:370},active:true},
  {id:'T02',role:'艉部推靠',bp:65,home:'南拖轮基地',start:{x:-35,z:-180},active:true},
  {id:'T03',role:'进港伴航 / 待命',bp:55,home:'北拖轮基地',start:{x:5,z:370},active:false},
  {id:'T04',role:'应急机动 / 待命',bp:55,home:'南拖轮基地',start:{x:5,z:-180},active:false}
];
const reserve=[{x:280,z:-205,yaw:0},{x:310,z:-470,yaw:0}];
export function fleetAt(opTime){
  return [tugAt(opTime,0),tugAt(opTime,1),...reserve.map(o=>({...o,z:o.z+405*ease(opTime/8)+95*ease((opTime-28.5)/1.5),mode:opTime<8?'TRANSIT':opTime>=28.5?'DEPART':'STANDBY',contact:false}))];
}
export function dispatchRoute(k){
  const a=FLEET[k].start,b=fleetAt(0)[k];
  const mid=[
    [{x:78,z:355},{x:115,z:250}],
    [{x:68,z:-135},{x:120,z:-30}],
    [{x:95,z:430},{x:330,z:300},{x:340,z:-100}],
    [{x:105,z:-215},{x:230,z:-490}]
  ][k];
  const approach={x:b.x-45*Math.sin(b.yaw),z:b.z-45*Math.cos(b.yaw)};
  return [a,...mid,approach,b];
}
const shipEnd=pathAt(0);
const shipRoute=[ANCHOR,{x:380,z:-620},{x:180,z:-460},{x:shipEnd.x-45*Math.sin(shipEnd.yaw),z:shipEnd.z-45*Math.cos(shipEnd.yaw)},shipEnd];
export function shipDispatchRoute(){return shipRoute}
function interpolateRoute(route,u){
  const lengths=route.slice(1).map((b,i)=>Math.hypot(b.x-route[i].x,b.z-route[i].z));
  const total=lengths.reduce((a,b)=>a+b,0),target=cl(u)*total;let acc=0;
  for(let i=0;i<lengths.length;i++){if(target<=acc+lengths[i]||i===lengths.length-1){const a=route[i],b=route[i+1],p=cl((target-acc)/lengths[i]);const before=route[i-1]||a,after=route[i+2]||b;
    const length=lengths[i],norm=(x,z)=>{const n=Math.hypot(x,z)||1;return [x/n,z/n]};
    const m0=norm(b.x-before.x,b.z-before.z),m1=norm(after.x-a.x,after.z-a.z);
    const p2=p*p,p3=p2*p,h00=2*p3-3*p2+1,h10=p3-2*p2+p,h01=-2*p3+3*p2,h11=p3-p2;
    const dh00=6*p2-6*p,dh10=3*p2-4*p+1,dh01=-dh00,dh11=3*p2-2*p;
    const q=(k,j)=>h00*a[k]+h10*length*m0[j]+h01*b[k]+h11*length*m1[j];
    const dq=(k,j)=>dh00*a[k]+dh10*length*m0[j]+dh01*b[k]+dh11*length*m1[j];
    return {x:q('x',0),z:q('z',1),yaw:Math.atan2(dq('x',0),dq('z',1))}}acc+=lengths[i]}
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
