import {cl,mix,ease,local} from '../../core/math.js';
import {phase,smoothstep,blendRect,partialPath,continuousKeys} from '../../core/motion-design.js';
import {globe,regional} from './dispatch-brief.js';
import {ANCHOR,FLEET,dispatchTugAt,dispatchShipAt,sampledShipRoute,dispatchTiming} from './dispatch-state.js';
import {LAB_DURATION,LAB_STARTS,LAB_FINAL,labCamera,labProject,labActive,drawLabWorld,drawLabDossiers} from './motion-lab.js';

export const DISPATCH_START=18,DISPATCH_END=36.5;
const C={hi:'#d0e7a1',white:'#e6ecda',mut:'#a4b69f',warm:'#d9b080',grid:'#93ae9140'};
const startCamera=labCamera(0),endCamera=labCamera(LAB_DURATION);
const preKeys=[
 [7,475,-735,.48,-.18,.96,640,330],
 [8.8,475,-735,2.6,-.50,.58,628,330],
 [10.4,481,-731,2.52,-.64,.60,605,330],
 [12.0,475,-735,2.16,-.75,.66,356,330],
 [14.0,471,-733,2.08,-.81,.68,336,328],
 [16.0,477,-729,1.95,-.88,.71,330,323],
 [16.8,463,-698,1.60,-.82,.74,355,319],
 [18,startCamera.x,startCamera.z,startCamera.s,startCamera.az,startCamera.tilt,startCamera.cx,startCamera.cy]
];
const postKeys=[
 [36.5,endCamera.x,endCamera.z,endCamera.s,endCamera.az,endCamera.tilt,endCamera.cx,endCamera.cy],
 [38,108,-212,.49,.04,.92,623,315],
 [40.1,120,-332,.63,-.06,.87,618,314],
 [41.5,115,-280,.75,-.11,.91,638,307],
 [43,95,-210,.86,-.08,.96,678,310]
];
export function introCamera(t){
 if(t>=DISPATCH_START&&t<=DISPATCH_END)return labCamera(t-DISPATCH_START);
 const [x,z,s,az,tilt,cx,cy]=continuousKeys(t,t<DISPATCH_START?preKeys:postKeys);
 return {x,z,s:Math.max(.32,s),az,tilt:cl(tilt,.45,.99),cx,cy};
}
export function dispatchClock(t){return mix(32.7,43,ease((t-DISPATCH_END)/(43-DISPATCH_END)))}
function rect(g,x,y,w,h,f,s){if(f){g.fillStyle=f;g.fillRect(x,y,w,h)}if(s){g.strokeStyle=s;g.lineWidth=1;g.strokeRect(x+.5,y+.5,w-1,h-1)}}
function text(g,s,x,y,size=14,col=C.mut,bold=false,align='left'){g.fillStyle=col;g.font=(bold?'600 ':'')+size+'px "Microsoft YaHei",Arial,sans-serif';g.textAlign=align;g.textBaseline='alphabetic';g.fillText(s,x,y)}
function line(g,a,b,col=C.mut,w=1){g.strokeStyle=col;g.lineWidth=w;g.beginPath();g.moveTo(...a);g.lineTo(...b);g.stroke()}
function path(g,points,col,w=1,dashed=false){if(points.length<2)return;g.save();if(dashed)g.setLineDash([6,5]);g.strokeStyle=col;g.lineWidth=w;g.beginPath();points.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.stroke();g.restore()}
function alpha(g,a,f){if(a<=.001)return;g.save();g.globalAlpha*=cl(a);f();g.restore()}
function mark(g,p,r,col=C.hi){let [x,y]=p;for(const a of [-1,1])for(const b of [-1,1]){line(g,[x+a*r,y+b*r],[x+a*(r-8),y+b*r],col,1.4);line(g,[x+a*r,y+b*r],[x+a*r,y+b*(r-8)],col,1.4)}}
function headerLabel(g,t,anchor){
 const inA=phase(t,8.2,.55)*(1-phase(t,11.3,.6));
 if(inA<=0)return;
 const target=[1060,179],p=partialPath([anchor,[anchor[0]+65,anchor[1]-35],[target[0]-34,target[1]],target],phase(t,8.2,.65));
 alpha(g,inA,()=>{mark(g,anchor,17,C.warm);path(g,p,C.warm,1.3);
  const u=phase(t,8.55,.5);g.save();g.translate(0,8*(1-u));alpha(g,u,()=>{text(g,'外锚地 A-01',1060,165,27,C.white,true,'right');text(g,'锚泊待命 / 主机待命',1060,200,15,C.mut,false,'right');text(g,'MV MERIDIAN  ·  240 m',1060,221,13,C.hi,false,'right')});g.restore()});
}
function requestPanel(g,t,anchor){
 const enter=phase(t,11.25,.8),decision=phase(t,14.5,.65),retire=phase(t,16.8,1.55),visible=enter*(1-retire);
 if(visible<=.002)return;
 const dest=[746,118,480,405],edge=[dest[0],dest[1]+126],origin=[edge[0]-8,edge[1]-8,16,16];
 const r=blendRect(blendRect(origin,dest,enter),[965,100,254,75],retire),[x,y,w,h]=r;
 const leader=partialPath([anchor,[anchor[0]+48,anchor[1]], [x-28,y+h*.31],[x,y+h*.31]],phase(t,11.02,.55));
 alpha(g,visible,()=>{path(g,leader,C.hi,1.2);mark(g,anchor,18,C.hi);rect(g,x+5,y+8,w,h,'#030c0955');rect(g,x,y,w,h,'#0b1d16f5','#94ac85');rect(g,x,y,3,Math.min(48,h),C.hi);
  g.save();g.beginPath();g.rect(x+2,y+2,Math.max(0,w-4),Math.max(0,h-4));g.clip();
  alpha(g,(1-decision)*phase(t,11.65,.42),()=>{
   text(g,'SERVICE REQUEST / SB-017',x+18,y+25,12,C.hi);
   text(g,'进港靠泊申请',x+18,y+64,30,C.white,true);line(g,[x+18,y+81],[x+w-18,y+81],C.grid);
   const rows=[['船舶','MERIDIAN / 集装箱船'],['尺度 / 吃水','240 × 36 m / 12 m'],['目标泊位','03 / 左舷靠泊'],['作业需求','引航、拖轮、系泊服务']];
   rows.forEach(([a,b],i)=>{const q=phase(t,11.9+i*.13,.45),yy=y+116+i*48;alpha(g,q,()=>{text(g,a,x+18,yy+5*(1-q),13,C.mut);text(g,b,x+153,yy+5*(1-q),19,C.white,true);line(g,[x+18,yy+14],[x+w-18,yy+14],C.grid)})});
   text(g,'状态 / 外锚地待命',x+18,y+365,14,C.hi);
  });
  alpha(g,decision,()=>{
   text(g,'PORT DISPATCH / SB-017',x+18,y+25,12,C.hi);text(g,'港口调度结果',x+18,y+64,27,C.white,true);
   line(g,[x+18,y+80],[x+w-18,y+80],C.grid);
   const q=phase(t,14.8,.42);alpha(g,q,()=>{text(g,'04',x+18,y+176,85,C.hi,true);text(g,'艘港作拖轮',x+157,y+160,24,C.white,true)});
   alpha(g,phase(t,15.1,.38),()=>{text(g,'2 艘推靠 + 2 艘伴航与待命',x+18,y+216,22,C.white,true);line(g,[x+18,y+237],[x+w-18,y+237],C.grid);text(g,'配置考虑 / 船舶尺度、泊位及风流',x+18,y+267,16,C.mut);text(g,'假设侧风 9 m/s · 流速 0.5 kn',x+18,y+295,15,C.mut);text(g,'本案示意调度，非通用配拖标准',x+18,y+329,13,C.warm);text(g,'下一步 / 资源定位',x+18,y+371,15,C.hi,true)});
  });
  g.restore();
 });
}
function drawRendezvous(g,t,cam,ship,positions,anchors){
 const st=dispatchClock(t),p=o=>labProject(cam,o.x,0,o.z);
 const route=sampledShipRoute().map(p);
 path(g,route,C.warm,1.7,true);
 const u=phase(t,36.5,1.2);
 drawLabDossiers(g,LAB_DURATION,anchors,{archive:u});
 const q=phase(t,37.1,.5);
 alpha(g,q,()=>{const count=FLEET.filter((_,k)=>st>=dispatchTiming(k).end).length;
  rect(g,42,106,234,98,'#0a1915eb','#81977b');text(g,'会合位置确认',55,130,14,C.mut);text(g,count+' / 4',55,174,32,C.hi,true);text(g,'艘到位',145,171,16,C.white);
  const a=p(ship);mark(g,a,16,C.warm);text(g,'主船进港',a[0]+22,a[1]+22,13,C.warm,true);
 });
}
export function drawContinuousIntro(g,t,W,H){
 g.save();g.scale(W/1280,H/720);
 // Geographical scale changes are blended at the same central focus. The port is an illustrative layout, not the regional chart.
 if(t<5.95){globe(g,t,false);alpha(g,phase(t,5.05,.9),()=>regional(g,t,false))}
 else if(t<7){regional(g,t,false)}
 else{
   const cam=introCamera(t),labT=cl(t-DISPATCH_START,0,LAB_DURATION),inLab=t>=DISPATCH_START&&t<=DISPATCH_END,post=t>DISPATCH_END,st=post?dispatchClock(t):24;
   const ship=post?dispatchShipAt(st):ANCHOR,positions=FLEET.map((_,k)=>dispatchTugAt(st,k));
   const detail=t<DISPATCH_START?phase(t,7.2,1.15)*(1-phase(t,16.65,1.1)):post?phase(t,40.7,2.2)*.85:0;
   const anchors=drawLabWorld(g,t,cam,inLab?labActive(labT):-1,{ship,positions,detail,routeTime:labT,showRoutes:t>=DISPATCH_START,shipTag:detail<.45});
   if(t<7.75)alpha(g,1-phase(t,7,.75),()=>regional(g,t,false));
   if(t>=8&&t<18){
     const a=labProject(cam,...local(ship,0,2,119)),b=labProject(cam,...local(ship,10,0,152)),u=phase(t,8.15,.9),fade=1-phase(t,16.7,1.2);
     alpha(g,u*fade,()=>{path(g,partialPath([a,[mix(a[0],b[0],.48),mix(a[1],b[1],.48)+7],b],u),C.warm,1.7,true);if(u>.85){mark(g,b,8,C.warm);if(t<11.5)text(g,'锚链 / 示意',b[0]+12,b[1]+14,12,C.warm)}})
   }
   if(t>=8&&t<12)headerLabel(g,t,labProject(cam,ship.x,0,ship.z));
   if(t>=11&&t<18.4)requestPanel(g,t,labProject(cam,ship.x,8,ship.z));
   if(inLab){
     drawLabDossiers(g,labT,anchors);
     const assigned=FLEET.filter((_,k)=>labT>=LAB_STARTS[k]+.8).length;
     alpha(g,phase(labT,0,.55),()=>{text(g,'ALLOCATED',1110,104,11,C.mut,false,'right');text(g,String(assigned).padStart(2,'0')+' / 04',1230,104,23,C.hi,true,'right')});
     if(labT<LAB_STARTS[0])alpha(g,phase(labT,0,.35)*(1-phase(labT,1.4,.4)),()=>{text(g,'四拖轮资源定位',42,130,30,C.white,true);text(g,'北 / 南拖轮基地',42,153,14,C.mut)});
     if(labT>=LAB_FINAL)alpha(g,phase(labT,LAB_FINAL,.65),()=>{text(g,'四船确认 / 等待出发',42,126,27,C.white,true);text(g,'2 艘推靠 + 2 艘伴航与待命',42,150,14,C.mut)});
   }
   if(post)drawRendezvous(g,t,cam,ship,positions,anchors);
 }
 g.restore();
}
