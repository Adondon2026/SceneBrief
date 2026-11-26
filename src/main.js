import {D,cl,mix,ease,rnd,local} from './core/math.js';
import {SIM,curve,pathAt,contactZ,tugAt,motion} from './cases/harbor-approach/motion.js';
import {shapes,vesselShapes,portShapes} from './cases/harbor-approach/geometry.js';
import {harborCamera} from './cases/harbor-approach/camera.js';
import {drawTugStudy,TUG_STUDY} from './cases/harbor-approach/tug-study.js';
import {createSoundStage} from './audio/sound-stage.js';
import {INTRO_END,BRIEF_DURATION,briefingBeat,screenForOperation} from './core/briefing-clock.js';
import {fleetAt} from './cases/harbor-approach/dispatch-state.js';
import {drawContinuousIntro} from './cases/harbor-approach/continuous-intro.js';
import {drawFilmChrome} from './cases/harbor-approach/film-chrome.js';
import {LAB_CUES} from './cases/harbor-approach/motion-lab.js';
import {phase,partialPath} from './core/motion-design.js';
import {drawForceStudy,drawRangeStudy,drawMooringStudy} from './cases/harbor-approach/operation-studies.js';
'use strict';const $=x=>document.getElementById(x),stage=$('stage'),base=$('base'),ui=$('ui'),b=base.getContext('2d'),c=ui.getContext('2d');let W=1280,H=720,dpr=1,t=0,screenT=0,playing=false,started=false,last=performance.now(),idx=-1,muted=false,ready=false,T,renderer,world,camera,shipG,tugGs=[],water,threeObjects=[];const shots=[
{a:0,z:4,code:'06 / APPROACH',title:'驶向 03 号泊位',note:'主船驶向泊位；T03 / T04 在外侧伴航与机动。'},
{a:4,z:8,code:'07 / DECELERATION',title:'减速，建立平行船位',note:'主船继续减速；预留岸外水域供拖轮接应。'},
{a:8,z:12,code:'08 / RENDEZVOUS',title:'拖轮接近与护舷接触',note:'拖轮沿艏向接近；减速后以橡胶护舷抵住主船外舷。'},
{a:12,z:17,code:'09 / COORDINATION',title:'联合推靠，修正艏向',note:'艉部拖轮增推，使艉部向岸移动；两艘推靠拖轮协调横移。'},
{a:17,z:22,code:'10 / FINAL APPROACH',title:'监测艏艉离岸距离',note:'船身趋于平行，逐步降低横移速度，接近码头护舷。'},
{a:22,z:26,code:'11 / CONTACT',title:'最后数米：控制接触速度',note:'主船接近码头护舷，横移速度逐步趋近于零。'},
{a:26,z:30,code:'12 / MOORING',title:'建立系泊，完成靠泊',note:'艏缆、艉缆及倒缆逐步带妥，推靠拖轮卸载，外侧拖轮解除待命。'}];
function resize(){let r=stage.getBoundingClientRect();W=r.width;H=r.height;dpr=Math.min(devicePixelRatio||1,2);for(let cv of [base,ui]){cv.width=W*dpr;cv.height=H*dpr;cv.getContext('2d').setTransform(dpr,0,0,dpr,0,0)}if(renderer){renderer.setPixelRatio(dpr);renderer.setSize(W,H)}}addEventListener('resize',resize);resize();
function line(g,x,y,X,Y,col='#a4b595',w=1){g.beginPath();g.moveTo(x,y);g.lineTo(X,Y);g.strokeStyle=col;g.lineWidth=w;g.stroke()}function poly(g,ps,fill,stroke,w=1){g.beginPath();ps.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.strokeStyle=stroke;g.lineWidth=w;g.stroke()}}function txt(g,s,x,y,size=12,col='#c5d0b7',font='Consolas, monospace',align='left',bold=false){g.font=`${bold?'600 ':''}${size}px ${font}`;g.fillStyle=col;g.textAlign=align;g.textBaseline='alphabetic';g.fillText(s,x,y)}function rect(g,x,y,w,h,fill,stroke){if(fill){g.fillStyle=fill;g.fillRect(x,y,w,h)}if(stroke){g.strokeStyle=stroke;g.lineWidth=1;g.strokeRect(x,y,w,h)}}function circle(g,x,y,r,col,w=1){g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.strokeStyle=col;g.lineWidth=w;g.stroke()}function arrow(g,x,y,X,Y,col,w=1){line(g,x,y,X,Y,col,w);let a=Math.atan2(Y-y,X-x);poly(g,[[X,Y],[X-9*Math.cos(a-.4),Y-9*Math.sin(a-.4)],[X-9*Math.cos(a+.4),Y-9*Math.sin(a+.4)]],col)}
function view(j,p,s,tugs,beat){
  const v=harborCamera(beat.cameraTime,s,W,H);
  if(j===2){
    const a=ease((screenT-54)/1.65),leave=ease((screenT-61.2)/.8),f=a*(1-leave);
    v.tx=mix(v.tx,tugs[0].x-3,f);v.tz=mix(v.tz,tugs[0].z,f);v.ty=mix(v.ty,5,f);v.cx=mix(v.cx,W*.39,f);
  }
  return v;
}
let V;function project(x,y,z){let dx=x-V.tx,dz=z-V.tz,ca=Math.cos(V.az),sa=Math.sin(V.az),ce=Math.cos(V.el),se=Math.sin(V.el);return [V.cx+(dx*ca-dz*sa)*V.scale,V.cy+(dx*sa+dz*ca)*se*V.scale-(y-V.ty)*ce*V.scale]}
function lp(o,x,y,z){return project(...local(o,x,y,z))}
function drawSoftware(j,p,s,tugs){let g=b;let grad=g.createLinearGradient(0,0,W,H);grad.addColorStop(0,'#30443c');grad.addColorStop(.5,'#1e3631');grad.addColorStop(1,'#10251f');g.fillStyle=grad;g.fillRect(0,0,W,H);for(let i=0;i<2400;i++){let wx=-420+rnd(i*3)*950,wz=-680+rnd(i*3+1)*1350,phase=Math.sin(t*2+i*.6),[x,y]=project(wx,.1,wz),[X,Y]=project(wx+3+rnd(i*3+2)*16,.1,wz+phase*1.6);line(g,x,y,X,Y,`rgba(172,194,164,${.026+.026*(phase+1)/2})`,.7)}shapes.length=0;portShapes();vesselShapes(s,false,false);for(let o of tugs)vesselShapes(o,true,false);let ca=Math.cos(V.az),sa=Math.sin(V.az),se=Math.sin(V.el),ce=Math.cos(V.el);let groups=new Map();for(let f of shapes){if(!groups.has(f.id))groups.set(f.id,[]);groups.get(f.id).push(f)}let depth=a=>a.ps.reduce((r,v)=>r+(-v[0]*sa-v[2]*ca)*ce-v[1]*se,0)/a.ps.length;let ordered=[...groups.values()].map(fs=>({fs,layer:fs[0].layer,d:fs.reduce((n,f)=>n+depth(f),0)/fs.length})).sort((a,b)=>a.layer-b.layer||b.d-a.d).flatMap(a=>a.fs.sort((A,B)=>depth(B)-depth(A)));for(let f of ordered){poly(g,f.ps.map(v=>project(...v)),f.fill,f.edge,j===4?.75:.55)}// water disturbance around hull and tug sterns
for(let [k,o] of [s,...tugs].entries()){let L=k?31:240,bb=k?5:18,amp=k?(['WAIT','STANDBY'].includes(o.mode)?0:['TRANSIT','DEPART'].includes(o.mode)?.35:o.mode==='HOLD'?.12:o.mode==='APPROACH'?.6:o.mode==='REVERSE'?.45:t<22?1:.35):cl(motion(t).ahead/2.0);if(amp<.025)continue;for(let side of [-1,1])for(let i=0;i<12;i++){let z=(k&&o.mode==='REVERSE'?1:-1)*(L/2+i*(k?4:9)),x=side*(bb+i*(k?1.1:2.6)),a=lp(o,x,.1,z),d=lp(o,x+side*3,.1,z+(k&&o.mode==='REVERSE'?8:-8));line(g,...a,...d,`rgba(211,225,203,${.24*(1-i/13)*amp})`,1)}}}
// Three.js: same scene geometry as the software renderer, with independent moving vessels.
function meshGroup(build){shapes.length=0;build();let g=new T.Group();for(let f of shapes){let verts=[];for(let k=1;k<f.ps.length-1;k++)for(let v of [f.ps[0],f.ps[k],f.ps[k+1]])verts.push(...v);let geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.computeVertexNormals();let mat=new T.MeshBasicMaterial({color:f.fill,side:T.DoubleSide});g.add(new T.Mesh(geo,mat));let pts=f.ps.concat([f.ps[0]]).map(v=>new T.Vector3(...v));g.add(new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:f.edge||'#33463c',transparent:true,opacity:.75})));}return g}
let twinG,twinTugs=[];function initThree(namespace){T=namespace;renderer=new T.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(dpr);renderer.setSize(W,H);$('gl').append(renderer.domElement);world=new T.Scene();world.background=new T.Color('#172c25');camera=new T.OrthographicCamera(-300,300,180,-180,.1,5000);let geom=new T.PlaneGeometry(3000,3000);geom.rotateX(-Math.PI/2);let mat=new T.ShaderMaterial({uniforms:{time:{value:0}},vertexShader:`varying vec3 p;void main(){p=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec3 p;uniform float time;void main(){float r=sin(p.x*.38+p.z*.12+time*1.5)*sin(p.z*.34-p.x*.17-time*.7);float s=sin(p.x*.09-p.z*.06+time*.2);float f=pow(max(0.,r),6.);vec3 col=mix(vec3(.09,.16,.14),vec3(.19,.28,.23),.43+s*.18)+f*.027;gl_FragColor=vec4(col,1.);}`});water=new T.Mesh(geom,mat);water.position.y=-.3;world.add(water);world.add(meshGroup(portShapes));let origin={x:0,z:0,yaw:0};shipG=meshGroup(()=>vesselShapes(origin));twinG=meshGroup(()=>vesselShapes(origin,false,true));world.add(shipG,twinG);for(let i=0;i<4;i++){let a=meshGroup(()=>vesselShapes(origin,true)),d=meshGroup(()=>vesselShapes(origin,true,true));tugGs.push(a);twinTugs.push(d);world.add(a,d)}ready=true;$('mode').textContent='SIM / WEBGL';}
function drawThree(j,s,tugs){let sc=V.scale;camera.left=-V.cx/sc;camera.right=(W-V.cx)/sc;camera.top=V.cy/sc;camera.bottom=-(H-V.cy)/sc;let ca=Math.cos(V.az),sa=Math.sin(V.az),ce=Math.cos(V.el),se=Math.sin(V.el);camera.position.set(V.tx+sa*ce*900,V.ty+se*900,V.tz+ca*ce*900);camera.lookAt(V.tx,V.ty,V.tz);camera.updateProjectionMatrix();function set(g,o,v){g.position.set(o.x,0,o.z);g.rotation.y=o.yaw;g.visible=v}set(shipG,s,true);set(twinG,s,false);for(let k=0;k<4;k++){set(tugGs[k],tugs[k],true);set(twinTugs[k],tugs[k],false)}water.material.uniforms.time.value=t;renderer.render(world,camera)}
// The overlay is composed at 1280 × 720, not separate fixed sidebars.
const white='#e1e7d6',mut='#a9b9a2',accent='#c6db96',dim='#92a78a70',orange='#dfb584';function screen(v){return [v[0]*1280/W,v[1]*720/H]}function sp(x,y,z){return screen(project(x,y,z))}function sl(o,x,y,z){return screen(lp(o,x,y,z))}
function bracket(x,y,r,col=accent){for(let a of [-1,1])for(let d of [-1,1]){line(c,x+a*r,y+d*r,x+a*(r-10),y+d*r,col,1.5);line(c,x+a*r,y+d*r,x+a*r,y+d*(r-10),col,1.5)}}function leader(pt,x,y,head,detail,col=accent){let [px,py]=pt;circle(c,px,py,4,col,1.5);let ex=x>px?x-9:x+9;line(c,px,py,ex,y-8,col,1);line(c,ex,y-8,x+(x>px?125:-125),y-8,col,1);let al=x>px?'left':'right';rect(c,al==='left'?x-3:x-165,y-5,168,35,'#102019bd');txt(c,head,x,y+9,16,col,'Microsoft YaHei, Arial, sans-serif',al,true);txt(c,detail,x,y+25,10,mut,'Consolas',al)}
function shipMark(o,label,col=accent){let p=sl(o,0,10,0);bracket(p[0],p[1],20,col);txt(c,label,p[0]+26,p[1]-8,12,col);}
function routeOverlay(s,j){let pts=[[158,-322],[122,-175],[65,-35],[-10,115],[-48,115]].map(v=>sp(v[0],.2,v[1]));c.setLineDash([8,7]);c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.strokeStyle=accent;c.lineWidth=2;c.stroke();c.setLineDash([]);for(let [i,p] of pts.entries()){circle(c,...p,5,accent);txt(c,`WP-${i+1}`,...[p[0]+9,p[1]-9],10,mut)}if(j===0){let a=sp(-70,4,-5),b=sp(-70,4,235);line(c,...a,...b,accent,3);let f=sp(-78,5,115);leader(f,320,240,'03 号泊位','BERTH / 260 M');let m=sl(s,0,10,0);bracket(m[0],m[1],35,accent);leader(m,820,175,'目标船','MERIDIAN-01 / TRACKED');let p=sp(120,0,-80);txt(c,'进港航道',p[0]+40,p[1]+30,15,accent,'Microsoft YaHei,Arial,sans-serif');for(let k=0;k<7;k++){let a=sp(265,-.1,-260+k*70);arrow(c,a[0],a[1],a[0]-36,a[1]+12,'#a0b39a9b',1)}}}
function overlay(j,p,s,tugs){c.clearRect(0,0,W,H);c.save();c.scale(W/1280,H/720);let sh=shots[j],m=motion(t),fade=phase(screenT,briefingBeat(screenT).j===0?43:[43,48,54,62,69,76,82][j],.65),f=t>=29.8?1:fade;
// Narrow identity strip and quiet positional references persist through the continuous camera move.
let h=c.createLinearGradient(0,552,0,666);h.addColorStop(0,'#08130e00');h.addColorStop(.5,'#08130eb0');h.addColorStop(1,'#08130edb');rect(c,0,552,1280,114,h);
// Header and narration strip are rendered once by drawFilmChrome.
// Berth boundary, longitudinal distance ticks, and real projected hull positions.
let A=sp(-70,4,-15),B=sp(-70,4,245);line(c,...A,...B,'#c5d2a65c',1.4);for(let z=-15;z<=245;z+=20){let a=sp(-71,4,z),b=sp(-75,4,z);line(c,...a,...b,'#c0cbae78',1)}let q=sp(-79,4,235);if(q[0]>20&&q[0]<1250&&q[1]>110&&q[1]<525)txt(c,'B03',q[0]-8,q[1]-9,12,mut);
function label(pt,x,y,head,detail,col=accent){
 let [px,py]=pt;if(px<20||px>1260||py<92||py>550)return;
 const start=[43,48,54,62,69,76,82][j],reveal=phase(screenT,start+.12,.57),info=phase(screenT,start+.37,.38);
 if(reveal<=0)return;let right=x>px,ex=right?x-10:x+10,yy=y-10,width=168,lx=right?x:x-width;
 let pts=partialPath([[px,py],[ex,yy]],reveal);for(let i=1;i<pts.length;i++)line(c,...pts[i-1],...pts[i],col,1);
 circle(c,px,py,4,col,1.2);
 c.save();c.globalAlpha*=info;rect(c,right?lx-6:x+6-(width+12)*info,yy,(width+12)*info,44,'#0b1813cd');
 line(c,right?lx-6:x+6-(width+12)*info,yy,right?lx-6+(width+12)*info:x+6,yy,col,1.2);
 txt(c,head,x,y+9+4*(1-info),16,col,'Microsoft YaHei,Arial',right?'left':'right',true);
 txt(c,detail,x,y+27+4*(1-info),11,mut,'Consolas, monospace',right?'left':'right');c.restore();
}
function dist(z,which){let a=sl(s,-18,3,z),worldZ=local(s,-18,3,z)[2],b=sp(-68.2,3,worldZ);if(a[0]<20||a[0]>1260||a[1]<85||a[1]>545)return;line(c,...a,...b,orange,1.9);for(let v of [a,b])circle(c,...v,3,orange,1.2);let mid=[(a[0]+b[0])/2,(a[1]+b[1])/2];txt(c,`${which}  ${Math.max(0,local(s,-18,0,z)[0]+68.2).toFixed(1)}m`,mid[0]+8,mid[1]-10,14,orange,'Consolas','left',true)}
function tugLabel(k){let o=tugs[k],a=sl(o,0,8,0);bracket(...a,19,accent);label(a,k?1040:1030,k?390:170,k?'艉拖轮 T02':'艏拖轮 T01',o.contact?'FENDER / CONTACT':'STANDBY / APPROACH')}
c.globalAlpha=f;
if(j===0||j===1){let target=sp(-70,4,115);label(target,280,j===1?218:172,'03 号泊位','BERTH / 260 M');let prev=sl(s,0,12,0);bracket(...prev,30,accent);label(prev,1020,164,'主船 MERIDIAN','LOA 240 M / BEAM 36 M');let pts=[];for(let q=t;q<=12;q+=.35){let a=pathAt(q);pts.push(sp(a.x,.25,a.z))}if(pts.length>1){c.setLineDash([7,6]);for(let i=1;i<pts.length;i++)line(c,...pts[i-1],...pts[i],'#c6db968c',1.7);c.setLineDash([])}if(j===1){label(sl(s,0,26,-94),1040,142,'驾驶台','BRIDGE / MANOEUVRING');let a=sl(s,0,3,120),d=sp(s.x+Math.sin(s.yaw)*158,.25,s.z+Math.cos(s.yaw)*158);arrow(c,...a,...d,accent,2);label(sl(s,0,27,-94),230,382,'纵向减速','SPEED OVER GROUND')}}
if(j===2&&!(t>TUG_STUDY.start&&t<TUG_STUDY.end)){let a=sl(tugs[0],0,2.6,14.8);label(a,1040,160,'橡胶护舷','BOW FENDER / PUSH CONTACT',orange);label(sl(tugs[0],0,7,4),240,320,'驾驶室','WHEELHOUSE / CONTROL');if(V.scale<5*W/1280)tugLabel(1);for(let [k,o] of tugs.slice(0,2).entries()){let a=sl(o,0,2.5,15.5),d=sl(s,18,2.5,contactZ(t,k));c.setLineDash([4,5]);line(c,...a,...d,'#d0dcb18a',1.3);c.setLineDash([])}}
if(j===3){for(let k=0;k<2;k++){let a=sl(tugs[k],0,4,10),d=sl(s,9,4,contactZ(t,k));arrow(c,...a,...d,orange,k?4:2);txt(c,k?'F₂ / 增推':'F₁',a[0]+8,a[1]-9,14,orange,'Microsoft YaHei,Arial','left',true)}if(screenT<63.6||screenT>68.85)label(sl(s,0,7,60),1020,165,'艏向差','ALIGN TO QUAY',accent);let a=sl(s,0,3,0),d=sl(s,-45,3,0);arrow(c,...a,...d,accent,2.5)}
if(j===4||j===5){dist(64,'FORE');dist(-64,'AFT');let fz=s.z+64;let nearest=-175+Math.round((fz+175)/28)*28;label(sp(-69,4,nearest),270,245,'码头护舷','RUBBER FENDER',orange);if(j===5){let a=sl(s,-18,4,64);if(a[0]>0&&a[0]<1280&&a[1]>80&&a[1]<550)bracket(...a,17,orange)}}
if(j===6){let lines=[[-15,100,-82,245],[-15,-104,-82,-35],[-15,94,-82,161],[-15,-92,-82,77]];for(let [k,l] of lines.entries()){let u=ease(cl((t-26-k*.55)/1.1));let a=sl(s,l[0],10,l[1]),b=sp(l[2],6,l[3]);if(u>0){line(c,...a,mix(a[0],b[0],u),mix(a[1],b[1],u),'#d6ddbc',1.7);if(u>.99)circle(c,...b,4,accent)}}label(sl(s,-15,10,100),270,180,'艏缆 / 倒缆','MOORING LINES');if(screenT<83||screenT>87.05)label(sl(s,-15,10,-104),1020,390,'艉缆','STERN LINE');}
// Quiet historical evidence: actual trajectory-derived samples, no invented live telemetry.
if(j===1||j===4||j===5){let xx=45,yy=108,ww=174,hh=66;rect(c,xx,yy,ww,hh,'#0b1813a6');txt(c,j===1?'SOG / 纵向速度':'CLEARANCE / 艏艉离岸距离',xx+6,yy+14,10,mut,'Microsoft YaHei,Consolas');for(let n=0;n<3;n++)line(c,xx+6,yy+23+n*15,xx+ww-6,yy+23+n*15,'#84977d27');let start=j===1?0:12,end=j===1?12:26,den=j===1?3:90;let count=j===1?1:2;for(let k=0;k<count;k++){c.beginPath();let n=0;for(let q=start;q<=Math.min(t,end)+.001;q+=.15){let m=motion(q),v=j===1?m.ahead:k?m.aft:m.fore,X=xx+7+(q-start)/(end-start)*(ww-14),Y=yy+hh-8-cl(v/den)*35;n++?c.lineTo(X,Y):c.moveTo(X,Y)}c.strokeStyle=k?'#aab8ad':accent;c.lineWidth=1.25;c.stroke()}}
// Small context information, one dominant statement and at most two live readings.
let metrics=[['纵向速度',m.ahead.toFixed(2),'kn'],['剩余纵距',Math.max(0,115-s.z).toFixed(0),'m']];if(j===2)metrics=[['艏拖轮',tugs[0].contact?'就位':tugs[0].mode==='WAIT'?'待命':'接近',''],['艉拖轮',tugs[1].contact?'就位':tugs[1].mode==='WAIT'?'待命':'接近','']];if(j===3)metrics=[['艏向偏差',Math.abs(m.heading).toFixed(1),'°'],['横移速度',m.sway.toFixed(2),'m/s']];if(j===4||j===5)metrics=[['艏部间隙',Math.max(0,m.fore).toFixed(1),'m'],['艉部间隙',Math.max(0,m.aft).toFixed(1),'m']];if(j===6)metrics=[['系泊缆绳',String([0,1,2,3].filter(k=>t>=27.1+k*.55).length)+'/4',''],['横移速度',m.sway.toFixed(2),'m/s']];
const settle=phase(screenT,[43,48,54,62,69,76,82][j]+.22,.52),dy=9*(1-settle);
c.save();c.globalAlpha*=settle;rect(c,42,574+dy,3,56,accent);txt(c,sh.title,57,613+dy,30,white,'Microsoft YaHei,Arial','left',true);
for(let i=0;i<2;i++){let x=850+i*196;line(c,x-14,572,x-14,644,'#a1b39645');txt(c,metrics[i][0],x,581,13,mut,'Microsoft YaHei,Arial');txt(c,metrics[i][1],x,618,31,accent,'Microsoft YaHei,Consolas','left',true);txt(c,metrics[i][2],x,641,12,mut)}c.restore();
c.globalAlpha=1;if(j===2)drawTugStudy(c,t,sl(tugs[0],0,5,0));if(j===3)drawForceStudy(c,screenT,sl(s,0,5,0));if(j===4)drawRangeStudy(c,screenT,sl(s,-18,3,64),m);if(j===6)drawMooringStudy(c,screenT,sl(s,-15,10,100),t);if(j===0||j===6){for(let k=2;k<4;k++){const a=sl(tugs[k],0,6,0);if(a[0]>50&&a[0]<1160&&a[1]>105&&a[1]<525){bracket(...a,12,mut);txt(c,'T0'+(k+1)+' / '+(j===6?'撤离':'伴航'),a[0]+15,a[1]-8,11,mut,'Microsoft YaHei,Arial')}}}c.restore()}
// Shared play clock drives scene-specific sound and window Foley.
let audioVolume=.55;
const sound=createSoundStage({cues:[[11.25,'window'],[14.5,'window'],...LAB_CUES.map(([at,kind])=>[18+at,kind]),[63.6,'window'],[70.6,'window'],[83,'window'],...[[TUG_STUDY.start,'window'],[11.58,'rubber'],[12,'rubber'],[25.8,'contact'],[26.6,'chain'],[27.3,'rope'],[28.2,'chain']].map(([at,kind])=>[screenForOperation(at),kind])]});
function audioInit(){sound.init()}
function cancelFoley(){sound.cancel()}
function cue(j){}
function audioState(j){const intro=screenT<INTRO_END,introScene=screenT<7?0:screenT<11.25?1:screenT<18?2:screenT<36.5?3:4;sound.update({time:t,cueTime:screenT,intro,introScene,playing,muted,volume:audioVolume,motion:motion(t),close:cl((V?.scale||0)*1280/W/12)});}

function clockString(value){const n=Math.floor(value);return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0')}
let bridgeCanvas=null;
function drawBridge(){
 const a=1-phase(screenT,43,.92);if(a<=0)return;
 if(!bridgeCanvas)bridgeCanvas=document.createElement('canvas');
 const pw=Math.max(1,Math.round(W*dpr)),ph=Math.max(1,Math.round(H*dpr));
 if(bridgeCanvas.width!==pw||bridgeCanvas.height!==ph){bridgeCanvas.width=pw;bridgeCanvas.height=ph}
 const g=bridgeCanvas.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,H);
 drawContinuousIntro(g,43,W,H);
 c.save();c.globalAlpha=a;c.drawImage(bridgeCanvas,0,0,W,H);c.restore();
}
function frame(now){
  const dt=Math.min(.25,Math.max(0,(now-last)/1000));last=now;
  if(playing){screenT=Math.min(BRIEF_DURATION,screenT+dt);if(screenT===BRIEF_DURATION){playing=false;$('play').textContent='▶'}}
  if(screenT<INTRO_END){
    t=0;$('gl').style.display='none';$('mode').textContent='BRIEF / GEO + DISPATCH';c.clearRect(0,0,W,H);drawContinuousIntro(b,screenT,W,H);audioState(-1);
  }else{
    const beat=briefingBeat(screenT),j=beat.j;t=beat.opTime;const s=pathAt(t),tugs=fleetAt(t);V=view(j,beat.fraction,s,tugs,beat);
    audioState(j);
    $('mode').textContent=ready?'SIM / WEBGL':'SIM / SOFTWARE 3D';
    if(ready){$('gl').style.display='block';drawThree(j,s,tugs)}else{$('gl').style.display='none';drawSoftware(j,beat.fraction,s,tugs)}
    overlay(j,beat.fraction,s,tugs);drawBridge();
  }
  drawFilmChrome(c,screenT,W,H,BRIEF_DURATION);
  $('seek').value=screenT;$('time').textContent=clockString(screenT)+' / '+clockString(BRIEF_DURATION);requestAnimationFrame(frame)
}
function begin(){audioInit();$('start').style.display='none';started=true;cancelFoley();screenT=0;t=0;sound.seek(0);idx=-1;playing=true;$('play').textContent='Ⅱ'}$('go').onclick=begin;function toggle(){if(!started){begin();return}audioInit();if(screenT>=BRIEF_DURATION){screenT=0;t=0;sound.seek(0);idx=-1}playing=!playing;$('play').textContent=playing?'Ⅱ':'▶'}$('play').onclick=toggle;$('restart').onclick=()=>{audioInit();cancelFoley();screenT=0;t=0;sound.seek(0);idx=-1;playing=true;$('play').textContent='Ⅱ'};$('seek').oninput=e=>{cancelFoley();screenT=+e.target.value;sound.seek(screenT);idx=-1};$('mute').onclick=()=>{muted=!muted;$('mute').textContent=muted?'音效 关':'音效 开';audioState(idx)};$('volume').oninput=e=>{audioVolume=+e.target.value;audioState(idx)};$('full').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen();else stage.requestFullscreen?.().catch(()=>{})};let hide;function reveal(){$('controls').classList.add('show');clearTimeout(hide);hide=setTimeout(()=>$('controls').classList.remove('show'),1700)}stage.addEventListener('pointermove',reveal);stage.addEventListener('dblclick',()=>$('full').click());addEventListener('keydown',e=>{if(e.code==='Space'&&!['INPUT','BUTTON'].includes(e.target.tagName)){e.preventDefault();toggle()}if(e.code==='ArrowRight'||e.code==='ArrowLeft'){screenT=cl(screenT+(e.code==='ArrowRight'?2:-2),0,BRIEF_DURATION);sound.seek(screenT);idx=-1;}if(e.key.toLowerCase()==='m')$('mute').click();reveal()});requestAnimationFrame(frame);
function disposeFailedRenderer(){ready=false;if(renderer){renderer.dispose();renderer=null;$('gl').replaceChildren()}tugGs=[];twinTugs=[];}
(async()=>{
  try{const namespace=await import('three');initThree(namespace);return}catch(e){disposeFailedRenderer();console.warn('Local Three.js unavailable:',e.message)}
  for(const url of ['https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js','https://unpkg.com/three@0.160.1/build/three.module.js']){
    try{const namespace=await import(/* @vite-ignore */ url);initThree(namespace);return}catch(e){disposeFailedRenderer();console.warn('CDN Three.js unavailable:',e.message)}
  }
  $('mode').textContent='SIM / SOFTWARE 3D';
})();
