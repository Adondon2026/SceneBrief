import {cl,mix,ease,rnd,local} from '../../core/math.js';
import {phase,smoothstep,blendRect,partialPath,continuousKeys} from '../../core/motion-design.js';
import {shapes,vesselShapes} from './geometry.js';
import {FLEET,ANCHOR,dispatchTugAt,sampledDispatchRoute} from './dispatch-state.js';

export const LAB_DURATION=18.5;
export const LAB_STARTS=[1.9,5.05,8.2,11.35];
export const LAB_FINAL=14.65;
export const LAB_VOICE=[
 {at:.30,end:1.88,text:'调度中心，配拖四艘。'},
 {at:2.50,end:4.95,text:'一号，艏部推靠。'},
 {at:5.65,end:8.10,text:'二号，艉部推靠。'},
 {at:8.80,end:11.25,text:'三号，进港伴航。'},
 {at:11.95,end:14.55,text:'四号，应急待命。'},
 {at:15.05,end:18.20,text:'四船确认，按计划出发。'}
];
export const LAB_CUES=LAB_STARTS.map(t=>[t+.34,'window']).concat([[LAB_FINAL,'window']]);
const palette={bg:'#07110e',water:'#132e28',land:'#566959',white:'#e6ecda',mut:'#a4b69f',hi:'#d0e7a1',warm:'#d9b080',dim:'#748c77',grid:'#93ae9131'};
const C=palette,PI=Math.PI,TAU=PI*2;
const roles=['艏部推靠','艉部推靠','进港伴航','应急待命'];
const notes=['于主船艏侧建立推靠位置','与艏部拖轮协调修正艏向','沿进港水域伴航，随后待命','于外侧保留机动余量'];
const mainRect=[794,118,438,373];
const dockRect=k=>[42+k*302,516,286,150];
// Camera keys: world center x/z, magnification, azimuth, tilt.
const keys=[
 [0,75,20,.42,-.10,.88],[1.3,20,222,.72,-.04,.78],
 [2.5,-30,362,1.02,.16,.66],[4.0,-10,375,.94,.24,.72],
 [5.1,2,12,.83,.05,.83],[5.9,-35,-175,1.04,-.11,.70],
 [7.2,-24,-182,.94,-.21,.74],[8.25,0,180,.81,-.06,.84],
 [9.0,8,425,1.03,.15,.69],[10.4,21,432,.93,.25,.74],
 [11.4,38,25,.83,.03,.82],[12.1,5,-250,1.04,-.13,.70],
 [13.6,26,-251,.95,-.22,.75],[14.7,70,-32,.61,-.08,.91],
 [16.0,105,-145,.42,.02,.95],[18.5,122,-158,.39,.06,.94]
];
export function labCamera(t){
 const [x,z,s,az,tilt]=continuousKeys(cl(t,0,LAB_DURATION),keys);
 return {x,z,s:Math.max(.32,s),az,tilt,cx:mix(470,645,phase(t,14.25,1.5)),cy:mix(300,290,phase(t,14.25,1.5))};
}
export function labProject(camera,x,y,z){
 const dx=x-camera.x,dz=z-camera.z,ca=Math.cos(camera.az),sa=Math.sin(camera.az);
 const u=dx*ca-dz*sa,v=dx*sa+dz*ca,depth=1+v*.00020;
 const p=camera.s/Math.max(.72,depth);
 return [camera.cx+u*p,camera.cy-v*p*camera.tilt-y*p*(1-camera.tilt*.48)];
}
export function labActive(t){let k=-1;for(let i=0;i<4;i++)if(t>=LAB_STARTS[i])k=i;return t>=LAB_FINAL?-1:k}
export function labCardState(t,k,anchor){
 const start=LAB_STARTS[k],end=k<3?LAB_STARTS[k+1]:LAB_FINAL;
 const lock=phase(t,start,.25),trace=phase(t,start+.10,.40),open=phase(t,start+.34,.65),dock=phase(t,end-.18,.84);
 const ready=t>=start,edge=[mainRect[0],mainRect[1]+mainRect[3]*.47];
 const origin=[edge[0]-9,edge[1]-9,18,18];
 const rect=blendRect(blendRect(origin,mainRect,open),dockRect(k),dock);
 const focus=open*(1-dock),model=phase(t,start+.52,.82),info=phase(t,start+.88,.40);
 return {ready,lock,trace,open,dock,focus,rect,model,info,anchor};
}
function rect(g,x,y,w,h,fill,stroke){if(fill){g.fillStyle=fill;g.fillRect(x,y,w,h)}if(stroke){g.strokeStyle=stroke;g.lineWidth=1;g.strokeRect(x+.5,y+.5,w-1,h-1)}}
function line(g,a,b,color=C.dim,width=1){g.strokeStyle=color;g.lineWidth=width;g.beginPath();g.moveTo(...a);g.lineTo(...b);g.stroke()}
function path(g,ps,color,width=1,dashed=false){if(ps.length<2)return;g.save();g.strokeStyle=color;g.lineWidth=width;if(dashed)g.setLineDash([5,5]);g.beginPath();ps.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.stroke();g.restore()}
function poly(g,ps,fill,edge){g.beginPath();ps.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();if(fill){g.fillStyle=fill;g.fill()}if(edge){g.strokeStyle=edge;g.lineWidth=.7;g.stroke()}}
function text(g,s,x,y,size=12,col=C.mut,bold=false,align='left'){g.fillStyle=col;g.font=(bold?'600 ':'')+size+'px "Microsoft YaHei",Arial,sans-serif';g.textAlign=align;g.textBaseline='alphabetic';g.fillText(s,x,y)}
function mono(g,s,x,y,size=11,col=C.mut,align='left'){g.fillStyle=col;g.font=size+'px Consolas,monospace';g.textAlign=align;g.textBaseline='alphabetic';g.fillText(s,x,y)}
function circle(g,p,r,col,fill=false){g.beginPath();g.arc(...p,r,0,TAU);if(fill){g.fillStyle=col;g.fill()}else{g.strokeStyle=col;g.lineWidth=1;g.stroke()}}
function alpha(g,a,f){if(a<=.001)return;g.save();g.globalAlpha*=cl(a);f();g.restore()}
function corners(g,p,r,c=C.hi){const [x,y]=p;for(const a of [-1,1])for(const b of [-1,1]){line(g,[x+a*r,y+b*r],[x+a*(r-8),y+b*r],c,1.5);line(g,[x+a*r,y+b*r],[x+a*r,y+b*(r-8)],c,1.5)}}
function facesFor(tug){shapes.length=0;vesselShapes({x:0,z:0,yaw:0},tug,true);const result=shapes.map(f=>({...f,ps:f.ps.map(p=>p.slice())}));shapes.length=0;return result}
const tugFaces=facesFor(true),shipFaces=facesFor(false),routes=FLEET.map((_,k)=>sampledDispatchRoute(k));
function renderModel(g,x,y,scale,az,el,reveal){
 const ca=Math.cos(az),sa=Math.sin(az),se=Math.sin(el),ce=Math.cos(el);
 const p=([a,b,c])=>[x+(a*ca-c*sa)*scale,y+((a*sa+c*ca)*se-b*ce)*scale];
 const depth=f=>f.ps.reduce((n,[a,b,c])=>n+(-a*sa-c*ca)*ce-b*se,0)/f.ps.length;
 const sorted=[...tugFaces].sort((a,b)=>(a.layer||0)-(b.layer||0)||depth(b)-depth(a));
 for(const f of sorted){const pts=f.ps.map(p);alpha(g,smoothstep((reveal-.18)/.64),()=>poly(g,pts,f.fill,null));poly(g,pts,null,f.edge)}
}
function worldRect(g,p,x,z,w,l,h=0,fill='#657862',edge='#8fa28a'){
 const ps=[[x-w/2,z-l/2],[x+w/2,z-l/2],[x+w/2,z+l/2],[x-w/2,z+l/2]];
 if(h>0){const top=ps.map(([a,b])=>p(a,h,b)),base=ps.map(([a,b])=>p(a,0,b));poly(g,[base[0],base[1],top[1],top[0]],'#293e34',edge);poly(g,[base[1],base[2],top[2],top[1]],'#344a3d',edge);poly(g,top,fill,edge)}
 else poly(g,ps.map(([a,b])=>p(a,0,b)),fill,edge)
}
function shipSymbol(g,p,o,L,B,fill,edge){
 const ca=Math.cos(o.yaw||0),sa=Math.sin(o.yaw||0),local=(x,z)=>p(o.x+x*ca+z*sa,1,o.z+z*ca-x*sa);
 poly(g,[[0,L*.5],[B*.5,L*.29],[B*.5,-L*.42],[B*.3,-L*.5],[-B*.3,-L*.5],[-B*.5,-L*.42],[-B*.5,L*.29]].map(([x,z])=>local(x,z)),fill,edge);
 if(L>100){for(let k=-4;k<=4;k++){let z=k*L*.08;poly(g,[[-B*.35,z-5],[B*.35,z-5],[B*.35,z+5],[-B*.35,z+5]].map(([x,z])=>local(x,z)),'#788877',null)}}
 else poly(g,[[-B*.28,-3],[B*.28,-3],[B*.28,7],[-B*.28,7]].map(([x,z])=>local(x,z)),'#c0cbb3',null);
}
function worldVessel(g,p,o,faces,camera){
 const ca=Math.cos(camera.az),sa=Math.sin(camera.az);
 const fs=faces.map(f=>({...f,ps:f.ps.map(v=>local(o,...v))}));
 const depth=f=>f.ps.reduce((n,[x,y,z])=>n+(x*sa+z*ca)*camera.tilt-y*(1-camera.tilt*.48),0)/f.ps.length;
 for(const f of fs.sort((a,b)=>(a.layer||0)-(b.layer||0)||depth(b)-depth(a)))poly(g,f.ps.map(v=>p(...v)),f.fill,f.edge);
}
export function drawLabWorld(g,t,camera,active,options={}){
 const {ship=ANCHOR,positions=FLEET.map((_,k)=>dispatchTugAt(24,k)),detail=0,routeTime=t,showRoutes=true,shipTag=true}=options;
 const p=(x,y,z)=>labProject(camera,x,y,z);
 const bg=g.createLinearGradient(0,0,1280,720);bg.addColorStop(0,'#172d26');bg.addColorStop(.55,'#102720');bg.addColorStop(1,'#081511');rect(g,0,0,1280,720,bg);
 // The same world geometry persists throughout the sequence. Surface marks move with camera.
 for(let x=-1200;x<=1400;x+=100)line(g,p(x,0,-1400),p(x,0,1400),C.grid,.6);
 for(let z=-1400;z<=1400;z+=100)line(g,p(-1200,0,z),p(1400,0,z),C.grid,.6);
 for(let i=0;i<260;i++){const x=-550+rnd(i*17)*1600,z=-1100+rnd(i*17+1)*1900,dx=7+rnd(i*17+2)*17;line(g,p(x,0,z),p(x+dx,0,z+Math.sin(t*.8+i)*1.7),'#bbcfac16',.7)}
 worldRect(g,p,-210,105,280,630,4,'#526252','#82977d');worldRect(g,p,-78,105,16,630,4.4,'#7b8b74','#a0af94');
 for(let x=-318;x<-145;x+=22)for(let z=-160;z<390;z+=28){const r=rnd(x*3+z);if(r>.22)worldRect(g,p,x,z,16,22,7+r*4,['#819077','#687d6a','#89967d'][Math.floor(r*3)],'#425c4a')}
 for(let z=-175;z<=375;z+=28)worldRect(g,p,-69,z,2,4,4.8,'#2f4538','#516958');
 for(let z=-135;z<385;z+=115){worldRect(g,p,-111,z,35,4,42,'#718b73','#79927b');worldRect(g,p,-91,z,4,4,70,'#7a9175','#647e67')}
 // Temporary tug bases are extensions of the illustrative quay. Not a real chart.
 for(const z of [400,-215]){worldRect(g,p,-25,z,80,9,3.3,'#6b806d','#92a58a');worldRect(g,p,-51,z,18,66,4,'#617660','#82977d')}
 line(g,p(-68,4,-15),p(-68,4,245),C.hi,2.3);
 const berth=p(-83,4,115);mono(g,'B03',berth[0]-8,berth[1]-8,12,C.hi,'right');
 const qNorth=p(-45,0,470),qSouth=p(-45,0,-300);text(g,'北拖轮基地',qNorth[0],qNorth[1],13,C.mut,false,'right');text(g,'南拖轮基地',qSouth[0],qSouth[1],13,C.mut,false,'right');
 for(const [i,o] of [{x:35,z:-500},{x:185,z:-480},{x:35,z:-280},{x:210,z:-280},{x:240,z:30},{x:265,z:180}].entries())circle(g,p(o.x,0,o.z),2.5,i%2?C.warm:C.hi,true);
 const ap=p(ship.x,0,ship.z);
 if(detail>0.02)alpha(g,detail,()=>worldVessel(g,p,ship,shipFaces,camera));
 if(detail<.99)alpha(g,1-detail,()=>shipSymbol(g,p,ship,240,36,'#b5a77e','#d8c79d'));
 if(shipTag){circle(g,ap,19,C.warm+'88');text(g,'MERIDIAN',ap[0]+22,ap[1]-8,12,C.warm,true)}
 for(let k=0;k<4;k++){
  const o=positions[k],q=p(o.x,0,o.z),a=showRoutes?phase(routeTime,LAB_STARTS[k]+.6,.95):0;
  alpha(g,a*.82,()=>path(g,partialPath(routes[k].map(o=>p(o.x,0,o.z)),a),k===active?C.hi:'#a6bf9290',k===active?1.6:1,true));
  shipSymbol(g,p,o,31,10,k===active?C.hi:'#9ab395','#d3dfbd');
  const label=active===k?'':FLEET[k].id;if(label)mono(g,label,q[0]+10,q[1]-7,11,k===active?C.hi:C.mut);
 }
 return positions.map(o=>p(o.x,3,o.z));
}
function modelCard(g,t,k,st){
 if(st.open<=.001)return;
 const [x,y,w,h]=st.rect,f=FLEET[k],d=st.dock,active=1-d;
 // Shadow and foreground opacity are coordinated with the same focus curve.
 g.save();g.globalAlpha*=mix(1,.86,d);
 rect(g,x+5,y+8,w,h,'#02090666');rect(g,x,y,w,h,'#0a1915f5',st.focus>.3?C.hi:'#7e967d');
 rect(g,x,y,3,Math.min(46,h),st.focus>.3?C.hi:'#7e967d');
 g.beginPath();g.rect(x+2,y+2,Math.max(0,w-4),Math.max(0,h-4));g.clip();
 const localT=t-LAB_STARTS[k],head=phase(t,LAB_STARTS[k]+.55,.36);
 // Text moves only a few pixels and is held still for reading.
 alpha(g,head,()=>{mono(g,'ASSET / '+f.id,x+14,y+20+5*(1-head),11,C.hi);text(g,roles[k],x+14,y+mix(48,41,d)+5*(1-head),mix(26,18,d),C.white,true)});
 line(g,[x+14,y+mix(60,50,d)],[x+w-14,y+mix(60,50,d)],C.grid);
 const mx=x+w*mix(.51,.69,d),my=y+h*mix(.48,.62,d),modelScale=Math.min(w/31,h/28)*mix(.77,.53,d)*mix(.08,1,st.model);
 const az=mix(0,.83,st.model)+.22*Math.sin(Math.max(0,localT-1)*.72)*active+k*.14;
 const el=mix(PI/2,.53,st.model)+.045*Math.sin(t*.85)*active;
 const modelTop=y+mix(68,53,d),modelBottom=y+h*mix(.72,.93,d);
 g.save();g.beginPath();g.rect(x+8,modelTop,w-16,Math.max(0,modelBottom-modelTop));g.clip();
 for(let v=0;v<9;v++)line(g,[x+12,modelTop+v*22],[x+w-12,modelTop+v*22],C.grid,.5);
 for(let v=0;v<12;v++)line(g,[x+12+v*36,modelTop],[x+12+v*36,modelBottom],C.grid,.5);
 alpha(g,st.model,()=>renderModel(g,mx,my,modelScale,az,el,st.model));g.restore();
 // Main and archived layouts cross-morph; important numbers retain meaning.
 alpha(g,st.info*(1-smoothstep((d-.05)/.55)),()=>{
   const yy=y+h*.76;line(g,[x+14,yy-11],[x+w-14,yy-11],C.grid);text(g,f.bp+' t',x+14,yy+25,32,C.white,true);text(g,'系柱拖力 / 假设值',x+119,yy+20,13,C.mut);
   text(g,notes[k],x+14,yy+55,16,C.white);mono(g,f.home+' / ASSIGNED',x+14,y+h-13,11,C.hi);
 });
 alpha(g,st.info*smoothstep((d-.25)/.55),()=>{text(g,f.bp+' t',x+14,y+h*.65,23,C.white,true);text(g,'系柱拖力',x+14,y+h*.79,11,C.mut);text(g,f.home,x+14,y+h-12,11,C.hi)});
 g.restore();
}
function drawConnection(g,t,k,st,active){
 if(!st.ready)return;const [x,y,w,h]=st.rect,a=st.anchor;
 const edge=[x,y+h*.47],mid=[mix(a[0],edge[0],.72),edge[1]];
 const p=partialPath([a,[mid[0],a[1]],mid,edge],st.trace);
 alpha(g,mix(.94,.22,st.dock),()=>path(g,p,k===active?C.hi:C.mut,k===active?1.5:1));
 if(st.lock>0){alpha(g,mix(.95,.60,st.dock)*st.lock,()=>{corners(g,a,mix(29,13,st.lock),k===active?C.hi:C.mut);circle(g,a,3,k===active?C.hi:C.mut,true)})}
}
export function drawLabDossiers(g,t,anchors,{archive=0}={}){
 const active=labActive(t),states=anchors.map((a,k)=>labCardState(t,k,a));
 // Once dispatch is confirmed, the same cards collapse into a narrow live resource strip.
 if(archive>0)for(let k=0;k<states.length;k++){const st=states[k];st.rect=blendRect(st.rect,[42+k*302,578,286,86],archive)}

 // Focus creates a soft depth gradient; the map remains live and visible behind the panel.
 const emphasis=states.reduce((m,s)=>Math.max(m,s.focus),0),shade=g.createLinearGradient(660,0,1280,0);shade.addColorStop(0,'rgba(4,12,9,0)');shade.addColorStop(1,'rgba(4,12,9,'+(.53*emphasis)+')');rect(g,660,78,620,423,shade);
 for(let k=0;k<4;k++)drawConnection(g,t,k,states[k],active);
 // Previous dossiers move into a persistent index; current dossier owns foreground.
 for(let k=0;k<4;k++)if(k!==active){
   alpha(g,1-archive,()=>modelCard(g,t,k,states[k]));
   if(archive>0){const [x,y,w,h]=states[k].rect;alpha(g,archive,()=>{rect(g,x,y,w,h,'#0a1915ec','#78937a');mono(g,FLEET[k].id+' / '+FLEET[k].bp+' t',x+12,y+21,12,C.hi);text(g,roles[k],x+12,y+44,17,C.white,true)})}
 }
 if(active>=0)modelCard(g,t,active,states[active]);
 return states;
}
export function drawMotionLab(g,t,W,H,{chrome=true,subtitle=true}={}){
 t=cl(t,0,LAB_DURATION);g.save();g.scale(W/1280,H/720);g.globalAlpha=1;
 const cam=labCamera(t),active=labActive(t),anchors=drawLabWorld(g,t,cam,active);
 drawLabDossiers(g,t,anchors);
 if(!chrome){g.restore();return}
 const top=g.createLinearGradient(0,0,0,108);top.addColorStop(0,'#06110eea');top.addColorStop(1,'#06110e00');rect(g,0,0,1280,108,top);
 mono(g,'SCENEBRIEF / PORT DISPATCH',42,36,13,C.hi);mono(g,'OP.017  /  BERTH 03  /  MV MERIDIAN',42,56,11,C.mut);text(g,'演示工况 / 非实测数据',1238,36,12,C.mut,false,'right');line(g,[42,70],[1238,70],'#a7bd9650');
 const assigned=FLEET.filter((_,k)=>t>=LAB_STARTS[k]+.8).length;
 mono(g,'ALLOCATED',1129,59,10,C.mut,'right');text(g,String(assigned).padStart(2,'0')+' / 04',1238,61,20,C.hi,true,'right');
 if(active<0&&t<LAB_STARTS[0]){alpha(g,1-phase(t,1.6,.4),()=>{text(g,'四拖轮调度',44,125,35,C.white,true);text(g,'两个基地 · 四个作业角色',46,152,15,C.mut)})}
 if(t>=LAB_FINAL){const a=phase(t,LAB_FINAL,.9);alpha(g,a,()=>{text(g,'四船确认 / 等待出发',44,118,27,C.white,true);text(g,'2 艘推靠 + 2 艘伴航与待命',46,143,14,C.mut);mono(g,'DISPATCH COMPLETE',46,164,11,C.hi)})}
 const bottom=g.createLinearGradient(0,662,0,720);bottom.addColorStop(0,'#08151100');bottom.addColorStop(1,'#081511ef');rect(g,0,662,1280,58,bottom);
 const voice=LAB_VOICE.find(v=>t>=v.at&&t<v.end);
 if(voice&&subtitle){rect(g,42,681,3,19,C.hi);text(g,voice.text,54,696,15,C.white,true)}
 mono(g,'MOTION LAB / '+(active>=0?FLEET[active].id:t>=LAB_FINAL?'COMPLETE':'OVERVIEW'),1238,697,11,C.mut,'right');
 rect(g,0,714,1280,2,'#9ab28c26');rect(g,0,714,1280*t/LAB_DURATION,2,C.hi);
 g.restore();
}
