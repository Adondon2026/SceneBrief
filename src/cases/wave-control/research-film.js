import {cl,mix,ease,rnd,local} from '../../core/math.js';
import {phase,continuousKeys,partialPath,blendRect} from '../../core/motion-design.js';
import {shapes,vesselShapes,box} from '../harbor-approach/geometry.js';

export const DURATION=90;
export const SECTIONS=[
 [0,12,'01 / ENGINEERING PROBLEM','波浪中，船舶还能按要求运动吗？','同一艘船、同一航向修正任务，环境改变，运动响应也可能改变。'],
 [12,23,'02 / RESEARCH BASELINE','从 SHOPERA 出发','既有研究提供逆境操纵性、时均波浪载荷及操纵试验的基准；下一步面向闭环控制需求。'],
 [23,35,'03 / HYDRODYNAMIC MECHANISM','识别波浪—操纵运动的耦合','波浪参数、运动状态及桨舵作用共同影响纵荡、横荡与艏摇。'],
 [35,47,'04 / CONTROL-ORIENTED MODEL','建立面向控制的动力学模型','结合机理、约束模试验和自由操纵数据，辨识状态相关的动力学及不确定性。'],
 [47,60,'05 / CAPABILITY BOUNDARY','从动力学预测到任务能力边界','给定状态、海况、执行器约束和任务时域，评价目标能否实现及剩余裕度。'],
 [60,72,'06 / CLOSED-LOOP CONTROL','能力约束下的精细控制','利用能力边界调整参考与控制分配，并通过反馈持续修正预测。'],
 [72,85,'07 / EXPERIMENTAL VALIDATION','让机理、模型与闭环互相验证','数值计算、约束模试验、自由航行和闭环试验形成证据链，检查尺度效应与模型误差。'],
 [85,90,'08 / RESEARCH QUESTION','环境变化下的船舶控制能力','从水动力机理出发，回答：能否实现、余度多大、边界在哪。']
];
export const NARRATION=SECTIONS.map(([at,end,code,title,text])=>({at:at+.65,end:end-.25,text}));
const C={bg:'#07110e',sea:'#132e28',hi:'#d0e7a1',white:'#e6ecda',mut:'#a4b69f',dim:'#728c77',grid:'#93ae9132',warm:'#e1b481',red:'#c98d77'};
const TAU=Math.PI*2,rad=Math.PI/180;
const cameraKeys=[
 [0,0,0,1.65,-.48,.82,614,345],
 [3,0,12,2.8,.72,.55,594,345],[6,0,8,3.15,.88,.48,548,340],
 [10,0,0,2.35,.55,.83,410,332],[12,0,0,2.0,.32,1.0,390,331],
 [16,0,0,2.12,.52,.91,365,332],[21,0,0,2.25,.70,.80,366,331],
 [24,0,12,3.25,.94,.48,410,331],[28,0,-20,3.8,1.32,.42,393,325],
 [33,0,-74,5.1,1.72,.47,385,320],[36,0,-66,3.25,1.24,.74,388,333],
 [43,0,-18,2.65,.85,.86,393,333],[47,0,0,2.1,.25,1.31,378,330],
 [54,0,0,2.2,.14,1.35,395,334],[59,0,0,2.25,.28,1.20,405,333],
 [62,0,16,2.7,.58,.79,389,329],[69,0,6,2.36,.80,.86,403,335],
 [72,0,0,1.72,.42,1.05,385,323],[77,0,0,1.88,.62,.83,391,334],
 [83,0,0,1.8,.82,.83,398,331],[86,0,0,2.25,.73,.68,620,340],
 [90,0,0,1.28,.93,.91,640,330]
];
export function sectionAt(t){let i=0;while(i<SECTIONS.length-1&&t>=SECTIONS[i+1][0])i++;return i}
export function sceneCamera(t){const [x,z,s,az,el,cx,cy]=continuousKeys(t,cameraKeys);return {x,z,s:Math.max(.4,s),az,el:cl(el,.28,1.48),cx,cy}}
export function waveAt(x,z,t){const a=phase(t,3,2),b=phase(t,26,3);return (0.65+2.1*a)*Math.sin((x*.58+z*.81)*TAU/115-t*1.15)+b*.48*Math.sin((x*.91-z*.42)*TAU/63-t*1.77)}
export function poseAt(t){const a=phase(t,3,2),yaw=.025*Math.sin(t*.39)+a*.11*Math.sin(t*.64),roll=a*.025*Math.sin(t*1.1),pitch=a*.018*Math.cos(t*1.1);return {x:a*7*Math.sin(t*.5),z:t*1.8,yaw,roll,pitch,heave:a*.8*Math.sin(t*1.1)}}
function txt(g,s,x,y,size=13,color=C.mut,bold=false,align='left',mono=false){g.fillStyle=color;g.font=(bold?'600 ':'')+size+'px '+(mono?'Consolas,monospace':'"Microsoft YaHei",Arial,sans-serif');g.textAlign=align;g.textBaseline='alphabetic';g.fillText(s,x,y)}
function rect(g,x,y,w,h,f,s){if(f){g.fillStyle=f;g.fillRect(x,y,w,h)}if(s){g.strokeStyle=s;g.lineWidth=1;g.strokeRect(x+.5,y+.5,w-1,h-1)}}
function line(g,a,b,color=C.dim,w=1){g.strokeStyle=color;g.lineWidth=w;g.beginPath();g.moveTo(...a);g.lineTo(...b);g.stroke()}
function path(g,ps,color,w=1,dash=false){if(ps.length<2)return;g.save();if(dash)g.setLineDash([6,5]);g.strokeStyle=color;g.lineWidth=w;g.beginPath();ps.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.stroke();g.restore()}
function poly(g,ps,f,s){g.beginPath();ps.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();if(f){g.fillStyle=f;g.fill()}if(s){g.strokeStyle=s;g.lineWidth=.6;g.stroke()}}
function alpha(g,a,f){if(a<=.001)return;g.save();g.globalAlpha*=cl(a);f();g.restore()}
function circle(g,p,r,c){g.strokeStyle=c;g.lineWidth=1;g.beginPath();g.arc(...p,r,0,TAU);g.stroke()}
function corners(g,p,r,c=C.hi){for(let x of [-1,1])for(let y of [-1,1]){line(g,[p[0]+x*r,p[1]+y*r],[p[0]+x*(r-8),p[1]+y*r],c,1.5);line(g,[p[0]+x*r,p[1]+y*r],[p[0]+x*r,p[1]+y*(r-8)],c,1.5)}}
function arrow(g,a,b,c,w=1.7){line(g,a,b,c,w);const th=Math.atan2(b[1]-a[1],b[0]-a[0]);poly(g,[b,[b[0]-9*Math.cos(th-.45),b[1]-9*Math.sin(th-.45)],[b[0]-9*Math.cos(th+.45),b[1]-9*Math.sin(th+.45)]],c)}
function capture(){shapes.length=0;const o={x:0,z:0,yaw:0};vesselShapes(o,false,false);
 // Conceptual single-screw rudder and shaft visible in mechanism overlay.
 box(o,0,-113,1.5,8,-5,-.5,'#b2aa87','#6d7967','#b3c79f');box(o,0,-101,1.2,18,-3.1,-2.0,'#829b85','#56715e','#9cb79a');
 const out=shapes.map(f=>({...f,ps:f.ps.map(p=>p.slice())}));shapes.length=0;return out}
const faces=capture();
function projection(cam,pose){
 const ca=Math.cos(cam.az),sa=Math.sin(cam.az),ce=Math.cos(cam.el),se=Math.sin(cam.el);
 return (x,y,z)=>{const dx=x-pose.x-cam.x,dz=z-pose.z-cam.z,u=dx*ca-dz*sa,v=dx*sa+dz*ca,depth=Math.max(.67,1+v*.00035);return [cam.cx+u*cam.s/depth,cam.cy-(v*se+y*ce)*cam.s/depth]};
}
function shipPoint(p,x,y,z){const a=p.roll,b=p.pitch,xx=x*Math.cos(a)-y*Math.sin(a),yy=x*Math.sin(a)+y*Math.cos(a),zz=z*Math.cos(b)+yy*Math.sin(b),yyy=yy*Math.cos(b)-z*Math.sin(b);return local(p,xx,yyy+p.heave,zz)}
function drawSea(g,t,cam,pose,P){
 const bg=g.createLinearGradient(0,0,1280,720);bg.addColorStop(0,'#1d362f');bg.addColorStop(.48,'#122923');bg.addColorStop(1,'#071713');rect(g,0,0,1280,720,bg);
 // World-space wave fronts and longitudinal texture retain parallax with ship tracking.
 const z0=Math.floor(pose.z/40)*40-640;
 for(let z=z0;z<=z0+1280;z+=20){const ps=[];for(let x=-800;x<=800;x+=22)ps.push(P(x,waveAt(x,z,t),z));path(g,ps,z%80===0?'#9ebc9d27':'#92b99c13',z%80===0?1.05:.6)}
 for(let x=-780;x<=780;x+=48){const ps=[];for(let z=z0;z<=z0+1280;z+=28)ps.push(P(x,waveAt(x,z,t),z));path(g,ps,'#8db49b0e',.55)}
 for(let i=0;i<180;i++){const x=(rnd(i*11)-.5)*1000,z=pose.z+(rnd(i*11+1)-.5)*1050;const a=P(x,waveAt(x,z,t)+.15,z),b=P(x+12,waveAt(x+12,z+4,t)+.15,z+4);line(g,a,b,'#bacdb01e',.7)}
 // A trace of requested course, not a real trajectory result.
 const guide=phase(t,.9,.8)*(1-phase(t,11,.6))+phase(t,46.9,.8)*(1-phase(t,71.5,.5));
 alpha(g,guide,()=>path(g,[P(0,.2,pose.z-260),P(0,.2,pose.z+310)],'#d4e6a1b0',1.6,true));
}
function drawShip(g,t,cam,pose,P){
 const q=(x,y,z)=>P(...shipPoint(pose,x,y,z)),ca=Math.cos(cam.az),sa=Math.sin(cam.az);
 const depth=f=>f.ps.reduce((n,[x,y,z])=>n+(x*sa+z*ca)*Math.sin(cam.el)+y*Math.cos(cam.el),0)/f.ps.length;
 const ordered=[...faces].sort((a,b)=>(a.layer||0)-(b.layer||0)||depth(b)-depth(a));
 const wire=phase(t,22.8,1.1)*(1-phase(t,35.4,1.2));
 for(const f of ordered){let ps=f.ps.map(v=>q(...v));poly(g,ps,f.fill,f.edge);alpha(g,.65*wire,()=>poly(g,ps,'#0b2c23a0','#bad3aa'))}
 for(let s of [-1,1])for(let i=0;i<15;i++){const zz=-126-i*9,xx=s*(17+i*3.3);const a=q(xx,.1,zz),b=q(xx+s*9,.1,zz-13);line(g,a,b,'rgba(194,219,192,'+(.17*(1-i/16))+')',1)}
 return q;
}
function panel(g,t,start,end,anchor,title,k,paint){
 const enter=phase(t,start+.10,.72),exit=phase(t,end-.65,.65),a=enter*(1-exit);
 const lock=phase(t,start,.3),trace=phase(t,start+.08,.55);
 if(t<start||t>=end)return;
 const target=[770,117,466,425],origin=[762,268,16,16],r=blendRect(blendRect(origin,target,enter),[1010,126,226,66],exit),[x,y,w,h]=r;
 const shade=g.createLinearGradient(650,0,1280,0);shade.addColorStop(0,'#07110e00');shade.addColorStop(1,'rgba(7,17,14,'+(.52*a)+')');rect(g,650,85,630,460,shade);
 if(anchor[0]>15&&anchor[0]<745&&anchor[1]>85&&anchor[1]<550)alpha(g,lock*(1-exit),()=>{corners(g,anchor,mix(27,14,lock));path(g,partialPath([anchor,[x-44,anchor[1]],[x-44,y+h*.35],[x,y+h*.35]],trace),C.hi,1.2)});
 alpha(g,a,()=>{rect(g,x+6,y+9,w,h,'#02070580');rect(g,x,y,w,h,'#0b1c16f5','#8fa782');rect(g,x,y,3,45,C.hi);g.save();g.beginPath();g.rect(x+2,y+2,Math.max(0,w-4),Math.max(0,h-4));g.clip();g.translate(x,y);g.scale(w/466,h/425);txt(g,'RESEARCH / '+String(k+1).padStart(2,'0'),16,23,11,C.hi,false,'left',true);txt(g,title,16,53,24,C.white,true);line(g,[16,67],[450,67],C.grid);alpha(g,phase(t,start+.42,.45),()=>paint(g,cl((t-start)/(end-start)),t));g.restore()})
}
function row(g,label,detail,y,p=1){alpha(g,p,()=>{txt(g,label,18,y,15,C.white,true);txt(g,detail,18,y+24,13,C.mut);line(g,[18,y+34],[448,y+34],C.grid)})}
function smallShip(g,x,y,s,ang=0,col='#8aa489'){g.save();g.translate(x,y);g.rotate(ang);poly(g,[[0,-s*.52],[s*.16,-s*.32],[s*.16,s*.46],[-s*.16,s*.46],[-s*.16,-s*.32]],col,C.hi);g.restore()}
function baseline(g,p,t){
 const u=phase(t,12.6,.45);alpha(g,u,()=>{txt(g,'2013—2016',18,119,30,C.hi,true);txt(g,'SHOPERA / 欧盟研究项目',18,146,16,C.white,true);txt(g,'逆境操纵性与推进、操舵能力评估',18,168,14,C.mut)});
 row(g,'2018 · 国际数值方法基准','时均波浪载荷 + 波浪中操纵；与模型试验比较。',216,phase(t,14,.5));
 row(g,'待进一步回答的研究问题','运动状态如何影响载荷？误差如何传递至闭环？',292,phase(t,17,.5));
 alpha(g,phase(t,19.4,.5),()=>{txt(g,'研究切入点：面向控制的耦合动力学',18,385,17,C.hi,true);txt(g,'资料：CORDIS / Shigunov et al., Ocean Engineering (2018)',18,407,10,C.mut)})
}
function mechanism(g,p,t){
 const u=phase(t,23.6,1),v=phase(t,27.2,1),w=phase(t,30.6,.8);
 const a=[210,179];for(let i=0;i<6;i++){let y=99+i*25;path(g,Array.from({length:45},(_,j)=>[20+j*9.5,y+6*Math.sin(j*.25-t*2+i)]),'#91b69a40',.9)}
 smallShip(g,...a,131,-.15);
 alpha(g,u,()=>{arrow(g,[39,130],[142,164],C.warm,2);txt(g,'波浪入射 μ',23,117,13,C.warm,true);arrow(g,[210,179],[283,179],C.hi,2);txt(g,'Y / 横向力',287,175,13,C.hi);arrow(g,[210,179],[210,101],C.hi,2);txt(g,'X',218,105,13,C.hi)});
 alpha(g,v,()=>{g.beginPath();g.arc(...a,76,-.4,1.7);g.strokeStyle=C.warm;g.lineWidth=2;g.stroke();txt(g,'N / 艏摇力矩',286,230,14,C.warm,true);txt(g,'v / 横荡    r / 艏摇角速度',18,281,14,C.white)});
 alpha(g,w,()=>{line(g,[18,298],[448,298],C.grid);txt(g,'载荷不是海况参数的单独函数',18,330,19,C.hi,true);txt(g,'F = F(U, v, r, H, λ, μ, n, δ, …)',18,362,17,C.white,true,true);txt(g,'示意变量依赖；尚需辨识和验证',18,392,12,C.mut)})
}
function node(g,x,y,w,h,title,sub,active=1){alpha(g,active,()=>{rect(g,x,y,w,h,'#142e24','#7e9879');txt(g,title,x+10,y+23,15,C.white,true);if(sub)txt(g,sub,x+10,y+43,11,C.mut)})}
function model(g,p,t){
 const s=35;node(g,18,95,206,60,'物理机理','势流、黏性与桨舵作用',phase(t,s+.55,.45));node(g,242,95,206,60,'实验 / 数值数据','约束模与自由操纵',phase(t,s+1.4,.45));
 alpha(g,phase(t,s+2.1,.45),()=>{path(g,[[121,155],[121,181],[233,181],[345,181],[345,155]],C.hi,1.3);arrow(g,[233,181],[233,202],C.hi)});
 node(g,75,202,316,66,'动力学结构 + 参数辨识','状态相关导数、耦合项及不确定性',phase(t,s+2.5,.5));
 alpha(g,phase(t,s+4.5,.5),()=>{arrow(g,[233,268],[233,289],C.hi);txt(g,'Mν̇ + C(ν)ν = τ + Fhydro + Fwave',18,319,16,C.white,true,'left',true);txt(g,'Yv / Yr / Nv / Nr 等：检验海况相关性',18,350,15,C.hi,true);txt(g,'示意动力学结构，非已辨识模型',18,392,12,C.mut)})
}
function capability(g,p,t){
 const u=phase(t,47.6,.8),v=phase(t,50,1),w=phase(t,54,1),cx=210,cy=246;
 // Conceptual reachable sets: not calculated or measured bounds.
 for(let i=0;i<6;i++){line(g,[42,103+i*35],[420,103+i*35],C.grid,.7);line(g,[55+i*62,93],[55+i*62,284],C.grid,.7)}
 arrow(g,[cx,cy],[cx,93],C.dim,1);arrow(g,[48,cy],[420,cy],C.dim,1);txt(g,'纵向位移',218,99,12,C.mut);txt(g,'横向位移',420,265,12,C.mut,false,'right');
 const shape=(r,b)=>Array.from({length:65},(_,i)=>{let a=i*TAU/64;return [cx+r*Math.sin(a)*(1+.13*Math.cos(2*a)),cy-b*(.5+.5*Math.cos(a))]});
 alpha(g,u,()=>poly(g,shape(141,145),'#a1c28d19','#9fbd91'));alpha(g,v,()=>poly(g,shape(78,105),'#e0b38426',C.warm));
 alpha(g,w,()=>{const goal=[317,127];corners(g,goal,12,C.white);txt(g,'任务目标',goal[0]+15,goal[1]-9,13,C.white,true);path(g,[[cx,cy],[249,201],[goal[0],goal[1]]],C.white,1,true)});
 txt(g,'海况 A / B：概念能力域',18,292,13,C.mut);
 alpha(g,phase(t,55.5,.45),()=>{txt(g,'能否实现？  余度多大？  边界在哪？',18,337,18,C.hi,true);txt(g,'条件：状态、执行器约束、任务时域与环境',18,364,13,C.white);txt(g,'概念图；非可达集求解结果',18,396,12,C.mut)})
}
function control(g,p,t){
 const s=60;node(g,18,92,185,59,'任务参考','航向 / 航迹目标',phase(t,s+.5,.4));node(g,263,92,185,59,'能力约束','可实现性与裕度',phase(t,s+1,.4));
 alpha(g,phase(t,s+1.6,.4),()=>arrow(g,[203,121],[263,121],C.hi));
 node(g,135,180,196,59,'控制器','精细运动控制 / 方法待定',phase(t,s+2.2,.4));alpha(g,phase(t,s+2,.4),()=>path(g,[[355,151],[355,166],[233,166],[233,180]],C.hi,1.3));
 node(g,135,267,196,60,'船舶 + 环境','桨、舵与波浪扰动',phase(t,s+3.5,.4));
 alpha(g,phase(t,s+3.3,.4),()=>arrow(g,[233,239],[233,267],C.hi));
 alpha(g,phase(t,s+4.1,.6),()=>{path(g,[[135,297],[55,297],[55,209],[135,209]],C.warm,1.6);arrow(g,[103,209],[135,209],C.warm);txt(g,'状态反馈',22,258,12,C.warm,true)});
 alpha(g,phase(t,s+6,.5),()=>{txt(g,'评价：跟踪误差、约束违背、任务可行性',18,373,15,C.hi,true);txt(g,'研究框架；不预设具体控制算法或性能提升',18,397,12,C.mut)})
}
function validate(g,p,t){
 const a=72;const items=[['01','数值计算 / 机理验证','势流、CFD 与不确定性分析'],['02','约束模试验 / 辨识','漂角、艏摇、波浪参数与桨舵载荷'],['03','自由航行 / 模型检验','独立操纵工况及模型误差'],['04','闭环任务 / 能力验证','边界邻域、控制性能、重复试验']];
 for(let k=0;k<4;k++){const y=90+k*73,q=phase(t,a+.5+k*1.4,.5);alpha(g,q,()=>{txt(g,items[k][0],18,y+22,25,C.hi,true);txt(g,items[k][1],76,y+20,17,C.white,true);txt(g,items[k][2],76,y+44,13,C.mut);line(g,[18,y+59],[448,y+59],C.grid)})}
 alpha(g,phase(t,79,.6),()=>txt(g,'船模 → 实船：检查尺度效应，明确外推适用性',18,408,13,C.warm,true))
}
function taskOverlay(g,t,pose,q,P){
 const u=phase(t,2,.8)*(1-phase(t,11.2,.65));alpha(g,u,()=>{const anchor=q(0,6,80),end=[1024,171];corners(g,anchor,19);path(g,partialPath([anchor,[anchor[0]+55,anchor[1]-22],[end[0]-30,end[1]],end],phase(t,2.1,.7)),C.hi,1.3);
 txt(g,'任务：航向修正',1024,160,27,C.white,true,'right');txt(g,'有限桨舵能力 / 波浪扰动',1024,193,15,C.mut,false,'right');
 const a=q(0,3,0),b=q(0,3,140),r=P(0,3,pose.z+140);arrow(g,a,b,C.warm,2);path(g,[a,r],C.hi,1.3,true);
 if(t>5.2){txt(g,'期望航向',r[0]+8,r[1]-8,13,C.hi);txt(g,'示意瞬时船艏向',b[0]+8,b[1]+14,13,C.warm)}
 })
}
function tank(g,t,cam,pose,P){
 const u=phase(t,72,.9)*(1-phase(t,84,.8));alpha(g,u*.85,()=>{
 const ps=[P(-155,0,pose.z-190),P(155,0,pose.z-190),P(155,0,pose.z+190),P(-155,0,pose.z+190)];
 path(g,[...ps,ps[0]],'#d1ddbd',2);
 for(let z=-185;z<190;z+=32){let a=P(-155,0,pose.z+z),b=P(-143,0,pose.z+z);line(g,a,b,'#c0cfac80',1)}
 txt(g,'波浪水池 / 试验布置示意',42,115,19,C.white,true);
 const q=P(-155,0,pose.z+190);path(g,[q,[q[0]+38,q[1]-35],[200,155]],C.hi,1.1);txt(g,'造波与测量系统',200,147,13,C.hi);
 })
}
function chrome(g,t,i){
 const top=g.createLinearGradient(0,0,0,100);top.addColorStop(0,'#06110ef6');top.addColorStop(1,'#06110e00');rect(g,0,0,1280,100,top);
 txt(g,'SCENEBRIEF / RESEARCH SERIES',42,35,13,C.hi,true,'left',true);txt(g,'WAVE–MANOEUVRING COUPLING',1238,35,12,C.mut,false,'right',true);
 txt(g,SECTIONS[i][2],42,59,11,C.mut,false,'left',true);txt(g,'研究构想 / 示意模型 · 非实测数据',1238,59,12,C.mut,false,'right');line(g,[42,73],[1238,73],C.grid);
 for(let k=0;k<SECTIONS.length;k++)rect(g,42+k*25,82,20,2,k===i?C.hi:k<i?'#8ca38b':'#405848');
 const b=g.createLinearGradient(0,550,0,720);b.addColorStop(0,'#06110e00');b.addColorStop(.4,'#06110edb');b.addColorStop(1,'#06110efc');rect(g,0,550,1280,170,b);
 const [start,end,code,title,note]=SECTIONS[i],a=phase(t,start,.46);
 if(i>0)alpha(g,1-a,()=>txt(g,SECTIONS[i-1][3],58,611-8*a,29,C.white,true));
 alpha(g,i===0?1:a,()=>{rect(g,42,574,3,54,C.hi);txt(g,title,58,613+6*(1-a),31,C.white,true)});
 const n=NARRATION[i];if(t>=n.at&&t<n.end)alpha(g,Math.min(phase(t,n.at,.25),1-phase(t,n.end-.2,.2)),()=>txt(g,note,58,652,15,C.mut));
 line(g,[42,673],[1238,673],C.grid);txt(g,'RESEARCH CONCEPT / NOT A VALIDATED SIMULATION',42,695,10,C.mut,false,'left',true);txt(g,String(i+1).padStart(2,'0')+' / 08',1238,695,11,C.hi,false,'right',true);
 rect(g,0,714,1280,2,'#9ab28c26');rect(g,0,714,1280*t/DURATION,2,C.hi)
}
export function drawResearch(g,time,W,H){
 const t=cl(time,0,DURATION),i=sectionAt(t),cam=sceneCamera(t),pose=poseAt(t),P=projection(cam,pose);
 g.save();g.scale(W/1280,H/720);g.globalAlpha=1;
 drawSea(g,t,cam,pose,P);const q=drawShip(g,t,cam,pose,P);
 taskOverlay(g,t,pose,q,P);tank(g,t,cam,pose,P);
 if(i>=1&&i<=6){const [start,end]=SECTIONS[i],func=[baseline,mechanism,model,capability,control,validate][i-1],anchor=i===2?q(0,2,-110):q(0,10,20);
 panel(g,t,start,end,anchor,['研究基准','波浪与操纵水动力','模型与辨识','任务可实现能力','约束与反馈','证据链'][i-1],i,func)}
 if(i===2){const a=phase(t,25,1)*(1-phase(t,34.3,.6));alpha(g,a,()=>{const f=q(0,2,-106);corners(g,f,18,C.warm);path(g,[f,[f[0]+50,f[1]+32],[640,f[1]+32]],C.warm);txt(g,'桨舵效能 / 待辨识',640,f[1]+22,13,C.warm,false,'right')})}
 if(i===7){const a=phase(t,85.5,.8);alpha(g,a,()=>{rect(g,42,115,342,108,'#0b1c16d9','#80977c');txt(g,'研究对象',57,140,13,C.mut);txt(g,'环境变化下的控制能力',57,178,25,C.hi,true);txt(g,'机理 → 表征 → 控制 → 验证',57,205,14,C.white)})}
 chrome(g,t,i);g.restore();
}
