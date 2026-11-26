import {cl,mix,ease,rnd} from '../../core/math.js';
import {shapes,vesselShapes} from './geometry.js';
import {EARTH_MASK,REGION_MASK,decodeLand} from './earth-data.js';
import {ANCHOR,FLEET,dispatchRoute,dispatchTugAt,dispatchShipAt,shipDispatchRoute,sampledDispatchRoute,sampledShipRoute,dispatchTiming} from './dispatch-state.js';

const C={bg:'#081411',water:'#142e28',land:'#566553',white:'#e5ebd9',mut:'#a6b6a0',dim:'#81957d',hi:'#cfe2a1',warm:'#e2b87b',grid:'#a0b79924'};
const tau=Math.PI*2,rad=Math.PI/180;
const land=decodeLand(EARTH_MASK,120,60,-178.5,-88.5,3);
const region=decodeLand(REGION_MASK,72,52,104.25,17.25,.5);
function drect(g,x,y,w,h,f,s){g.fillStyle=f;g.fillRect(x,y,w,h);if(s){g.strokeStyle=s;g.lineWidth=1;g.strokeRect(x+.5,y+.5,w-1,h-1)}}
function dline(g,a,b,col=C.dim,w=1){g.strokeStyle=col;g.lineWidth=w;g.beginPath();g.moveTo(...a);g.lineTo(...b);g.stroke()}
function dtext(g,s,x,y,size=12,col=C.mut,bold=false,align='left'){g.fillStyle=col;g.font=(bold?'600 ':'')+size+'px Microsoft YaHei, Arial, sans-serif';g.textAlign=align;g.textBaseline='alphabetic';g.fillText(s,x,y)}
function dcircle(g,x,y,r,col,fill=false){g.beginPath();g.arc(x,y,r,0,tau);if(fill){g.fillStyle=col;g.fill()}else{g.strokeStyle=col;g.lineWidth=1;g.stroke()}}
function dpath(g,points,col,w=1,dashed=false){if(!points.length)return;g.save();g.strokeStyle=col;g.lineWidth=w;if(dashed)g.setLineDash([5,6]);g.beginPath();points.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.stroke();g.restore()}
function corners(g,x,y,r,col=C.hi){for(const a of [-1,1])for(const b of [-1,1]){dline(g,[x+a*r,y+b*r],[x+a*(r-9),y+b*r],col,1.5);dline(g,[x+a*r,y+b*r],[x+a*r,y+b*(r-9)],col,1.5)}}
function opacity(g,a,fn){g.save();g.globalAlpha*=cl(a);fn();g.restore()}
function show(t,a,b=.45){return ease((t-a)/b)}
function blank(g){const bg=g.createLinearGradient(0,0,1280,720);bg.addColorStop(0,'#1b2b24');bg.addColorStop(.6,C.bg);bg.addColorStop(1,'#050d0b');drect(g,0,0,1280,720,bg)}
function frameHead(g,code,detail){drect(g,0,0,1280,78,'#081410ec');dtext(g,'SCENEBRIEF / HARBOR OPERATIONS',42,38,13,C.hi,true);dtext(g,code,42,60,11,C.mut);dtext(g,'演示工况 / 非实测数据',1238,38,12,C.mut,false,'right');dtext(g,detail,1238,59,11,C.mut,false,'right');dline(g,[42,74],[1238,74],'#9cb19750')}
function frameFoot(g,t,title,note,code){
  const f=g.createLinearGradient(0,545,0,720);f.addColorStop(0,'#07120e00');f.addColorStop(.24,'#07120eac');f.addColorStop(1,'#07120ef9');drect(g,0,545,1280,175,f);
  drect(g,42,574,3,70,C.hi);dtext(g,code,57,581,11,C.hi);dtext(g,title,57,617,32,C.white,true);dtext(g,note,57,642,15,C.mut);dline(g,[42,662],[1238,662],'#9cb19750');dtext(g,'ILLUSTRATIVE OPERATION / NOT FOR NAVIGATION',42,680,10,C.dim);
}
function globe(g,t){
  blank(g);
  for(let i=0;i<155;i++){let x=rnd(i*31)*1280,y=80+rnd(i*31+1)*510;drect(g,x,y,.7+rnd(i*31+2),.7,'#9cb49c2a')}
  const turn=ease(t/2.6),zoom=ease((t-3.9)/2.0),lon=mix(38,122.1,turn)*rad,lat=mix(6,30.5,turn)*rad,R=mix(253,920,zoom),cx=mix(638,640,zoom),cy=mix(330,347,zoom);
  const proj=(a,b)=>{a=a*rad-lon;b*=rad;let z=Math.sin(lat)*Math.sin(b)+Math.cos(lat)*Math.cos(b)*Math.cos(a);return [cx+R*Math.cos(b)*Math.sin(a),cy-R*(Math.cos(lat)*Math.sin(b)-Math.sin(lat)*Math.cos(b)*Math.cos(a)),z]};
  const sphere=g.createRadialGradient(cx-R*.28,cy-R*.36,0,cx,cy,R);sphere.addColorStop(0,'#466456');sphere.addColorStop(.6,'#203d34');sphere.addColorStop(1,'#0a1816');
  g.save();g.beginPath();g.arc(cx,cy,R,0,tau);g.clip();drect(g,0,0,1280,720,sphere);
  for(const [x,y] of land){let [px,py,z]=proj(x,y);if(z<0||px<0||px>1280||py<0||py>720)continue;let r=R*.014*(.4+.6*z);g.fillStyle='rgba(158,184,139,'+(.24+.42*z)+')';g.fillRect(px-r,py-r,r*2,r*2)}
  function meshLine(points){let prev=null;for(const p of points){const a=proj(...p);if(a[2]>0&&prev&&prev[2]>0)dline(g,prev.slice(0,2),a.slice(0,2),'#9db59a38',.8);prev=a}}
  for(let a=-180;a<180;a+=30)meshLine(Array.from({length:61},(_,i)=>[a,-90+i*3]));
  for(let a=-60;a<=60;a+=30)meshLine(Array.from({length:121},(_,i)=>[-180+i*3,a]));
  g.restore();dcircle(g,cx,cy,R,'#99b29580');dcircle(g,cx,cy,R+3,'#8da98a22');
  const q=proj(122.1,30.5);
  if(q[2]>0)opacity(g,show(t,1.8),()=>{corners(g,q[0],q[1],25,C.hi);dcircle(g,q[0],q[1],7,C.hi);dpath(g,[[q[0]+24,q[1]-18],[q[0]+65,q[1]-51],[q[0]+160,q[1]-51]],C.hi);dtext(g,'EAST CHINA SEA',q[0]+68,q[1]-60,13,C.hi,true)});
  frameHead(g,'01 / GEOLOCATION','GLOBAL LAND MASK / NATURAL EARTH');
  frameFoot(g,t,'东海 · 进港任务定位','从全球地理空间逐级进入作业海域。','GLOBAL / REGIONAL');
}
function regional(g,t){
  blank(g);const u=ease((t-5.7)/1.05),sc=mix(21,81,u),lon=mix(123,122.1,u),lat=mix(30,30.5,u),p=(a,b)=>[640+(a-lon)*sc*.866,330-(b-lat)*sc];
  for(let y=18;y<=43;y+=2){let a=p(104,y),b=p(140,y);dline(g,a,b,C.grid);dtext(g,y+'°N',60,a[1]-3,10,C.dim)}
  for(let x=104;x<=140;x+=2){let a=p(x,17),b=p(x,43);dline(g,a,b,C.grid);dtext(g,x+'°E',a[0]+3,94,10,C.dim)}
  for(const [x,y] of region){let a=p(x,y);drect(g,a[0]-sc*.22,a[1]-sc*.25,sc*.435+.5,sc*.5+.5,'#62765b')}
  const q=p(122.1,30.5);for(const r of [12,36,82])dcircle(g,...q,r,C.hi+'55');corners(g,...q,36,C.hi);dcircle(g,...q,4,C.hi,true);dpath(g,[q,[q[0]+80,q[1]-70],[q[0]+250,q[1]-70]],C.hi,1.4);
  dtext(g,'东海沿岸 / 示意港区',q[0]+86,q[1]-86,20,C.white,true);dtext(g,'区域定位 ≠ 实际港口坐标',q[0]+86,q[1]-50,12,C.mut);
  frameHead(g,'01 / GEOLOCATION','REGIONAL VIEW / GENERALIZED COASTLINE');
  frameFoot(g,t,'锁定外海作业区域','区域海岸线来自 Natural Earth；后续港区布局为虚构示意。','REGIONAL / PORT');
}
function snapshot(tug){
  shapes.length=0;vesselShapes({x:0,z:0,yaw:0},tug,true);
  const faces=shapes.map(f=>({...f,ps:f.ps.map(p=>p.slice())}));shapes.length=0;return faces;
}
const modelTug=snapshot(true),modelShip=snapshot(false);
function model(g,faces,x,y,scale,az,el){
  const ca=Math.cos(az),sa=Math.sin(az),se=Math.sin(el),ce=Math.cos(el);
  const p=([a,b,c])=>[x+(a*ca-c*sa)*scale,y+((a*sa+c*ca)*se-b*ce)*scale];
  const depth=f=>f.ps.reduce((n,[a,b,c])=>n+(-a*sa-c*ca)*ce-b*se,0)/f.ps.length;
  for(const f of [...faces].sort((a,b)=>(a.layer||0)-(b.layer||0)||depth(b)-depth(a))){
    g.beginPath();f.ps.forEach((pt,i)=>{let [a,b]=p(pt);i?g.lineTo(a,b):g.moveTo(a,b)});g.closePath();g.fillStyle=f.fill;g.fill();g.strokeStyle=f.edge;g.lineWidth=.65;g.stroke();
  }return p;
}
function anchorShot(g,t){
  blank(g);const u=ease((t-8)/1.25),az=mix(.34,.72,u)+.035*Math.sin((t-9)*.5),el=mix(1.14,.60,u),scale=mix(2.25,4.5,u);
  for(let i=0;i<820;i++){let x=rnd(i*9)*1280,y=88+rnd(i*9+1)*465;dline(g,[x,y],[x+6+rnd(i*9+2)*25,y+1.1],'#a9c5a322',.8)}
  const p=model(g,modelShip,625,355,scale,az,el),bow=p([0,3,120]),chain=p([14,0,154]);
  dpath(g,[bow,[(bow[0]+chain[0])/2,(bow[1]+chain[1])/2+12],chain],C.warm,2,true);dcircle(g,...chain,7,C.warm);
  opacity(g,show(t,9.15),()=>{dpath(g,[chain,[chain[0]+40,chain[1]+30],[1100,chain[1]+30]],C.warm);dtext(g,'锚泊待命',1092,chain[1]+22,22,C.white,true,'right');dtext(g,'锚链示意 / 主机待命',1092,chain[1]+49,12,C.mut,false,'right');
    drect(g,42,119,214,119,'#0b1916de','#8ba18360');dtext(g,'MV MERIDIAN',55,144,14,C.hi,true);dtext(g,'240 m',55,181,29,C.white,true);dtext(g,'总长 / 船宽 36 m',55,206,13,C.mut);dtext(g,'抵达锚地 · 航行速度趋近零',55,225,12,C.mut);
  });
  frameHead(g,'02 / ANCHORAGE','ARRIVAL / A-01');
  frameFoot(g,t,'主船抵达外锚地','保持锚泊待命，等待泊位及引航、拖轮服务协调。','VESSEL / ARRIVAL');
}
function request(g,t){
  blank(g);const a=show(t,14,.45),q=show(t,17.25,.45);
  opacity(g,a,()=>{
    drect(g,42,105,742,405,'#0d201ae8','#82977a88');drect(g,42,105,3,70,C.hi);
    dtext(g,'INBOUND SERVICE REQUEST / SB-017',62,133,13,C.hi,true);dtext(g,'进港靠泊申请',62,177,35,C.white,true);
    dline(g,[62,195],[764,195],C.grid);
    const fields=[['主船','MV MERIDIAN / 集装箱船'],['总长 × 船宽 / 吃水','240 × 36 m / 12 m'],['目标泊位','03 / 左舷靠泊'],['当前状态','外锚地 A-01 / 待命']];
    fields.forEach(([k,v],i)=>{let y=225+i*55;dtext(g,k,64,y,13,C.mut);dtext(g,v,220,y+2,20,C.white,true);dline(g,[64,y+15],[489,y+15],C.grid)});
    g.save();g.beginPath();g.rect(504,205,260,253);g.clip();model(g,modelShip,634,355,.92,.95,.58);g.restore();
    dtext(g,'SHIP / PARTICULARS · CONCEPT',516,476,10,C.dim);
    dtext(g,'协调事项：泊位可用性、引航时间、拖轮配置、系泊人员',64,483,14,C.mut);
  });
  opacity(g,q,()=>{
    dpath(g,[[784,287],[814,287],[827,265]],C.hi,1.7);
    drect(g,828,105,410,405,'#11271fe8','#a7bd8c');drect(g,828,105,3,68,C.hi);
    dtext(g,'PORT DISPATCH / SB-017',847,133,13,C.hi,true);dtext(g,'调度作业结果',847,171,26,C.white,true);
    dtext(g,'04',846,270,94,C.hi,true);dtext(g,'艘港作拖轮',984,256,25,C.white,true);dtext(g,'2 艘推靠 + 2 艘伴航 / 待命',849,308,20,C.white,true);
    dline(g,[847,332],[1218,332],C.grid);dtext(g,'配置依据',847,360,13,C.mut);
    dtext(g,'船舶尺度 · 泊位进路 · 操纵条件',847,387,16,C.white);dtext(g,'假设侧风 9 m/s · 流速 0.5 kn',847,407,13,C.mut);
    dtext(g,'本案为示意调度结果，非实际港口配拖标准',847,428,12,C.warm);
    dtext(g,'状态 / 四船确认后出发',847,477,14,C.hi,true);
  });
  frameHead(g,'03 / SERVICE COORDINATION','REQUEST → DISPATCH');
  frameFoot(g,t,t<17.25?'建立靠泊作业需求':'港口调度：四艘拖轮','引航、拖轮与系泊服务需协调；具体配置由实际工况决定。','SERVICE REQUEST / ASSIGNMENT');
}
function chartBase(g,scale=.49,cx=640,cy=303,ox=105,oz=-95){
  blank(g);const p=o=>[cx+(o.x-ox)*scale,cy-(o.z-oz)*scale],P=(x,z)=>p({x,z});
  drect(g,0,78,1280,474,'#132d27');
  for(let x=-600;x<=1000;x+=100){let a=P(x,-1100),b=P(x,900);dline(g,a,b,C.grid,.7)}
  for(let z=-1100;z<=900;z+=100){let a=P(-600,z),b=P(1000,z);dline(g,a,b,C.grid,.7)}
  let a=P(-350,420),b=P(-70,-210);drect(g,a[0],a[1],b[0]-a[0],b[1]-a[1],'#62705e','#99aa8d');
  for(let x=-320;x<-140;x+=27)for(let z=-180;z<410;z+=31){const a=P(x,z+18);drect(g,...a,15*scale,17*scale,'#a0a88a85','#425744')}
  const berthA=P(-70,245),berthB=P(-70,-15);dline(g,berthA,berthB,C.hi,3);
  const buoys=[{x:20,z:-500},{x:180,z:-480},{x:35,z:-280},{x:210,z:-280},{x:240,z:30},{x:265,z:180}];
  buoys.forEach((o,i)=>{let q=p(o);dcircle(g,...q,3,i%2?C.warm:C.hi,true)});
  const mark=P(-88,115);dtext(g,'B03',mark[0]-7,mark[1]-7,12,C.hi,true,'right');
  const north=P(-35,370),south=P(-35,-180);for(const [q,label] of [[north,'北基地'],[south,'南基地']]){dcircle(g,...q,10,C.mut+'80');dtext(g,label,q[0]-9,q[1]-16,12,C.mut,false,'right')}
  dtext(g,'港池 / 示意水域',P(250,380)[0],P(250,380)[1],13,C.dim);dtext(g,'N ↑',915,115,13,C.hi,true);
  dline(g,[900,520],[900+100*scale,520],C.mut,2);dtext(g,'100 m',900,513,10,C.mut);
  return p;
}
function chartVessel(g,p,o,L,B,col,label){
  const [x,y]=p(o),s=Math.hypot(p({x:o.x+1,z:o.z})[0]-x,p({x:o.x+1,z:o.z})[1]-y);
  g.save();g.translate(x,y);g.rotate(o.yaw||0);const l=Math.max(L*s,12),w=Math.max(B*s,5);
  g.beginPath();g.moveTo(0,-l/2);g.lineTo(w/2,-l*.25);g.lineTo(w/2,l/2);g.lineTo(-w/2,l/2);g.lineTo(-w/2,-l*.25);g.closePath();g.fillStyle=col;g.fill();g.strokeStyle='#d8e7c5';g.lineWidth=.7;g.stroke();g.restore();
  if(label)dtext(g,label,x+9,y-10,12,col,true);
}
const cardPos=[[42,110],[960,110],[42,326],[960,326]];
function tugCard(g,t,k,p,active){
  const f=FLEET[k],at=24+k*2,alpha=show(t,at,.40);if(alpha<=0)return;
  const o=dispatchTugAt(t,k),[x,y]=cardPos[k],w=278,h=188,anchor=p(o),left=x<640,edge=left?x+w:x,dy=y+68;
  opacity(g,alpha*(active?1:.72),()=>{
    dpath(g,[anchor,[edge+(left?34:-34),dy],[edge,dy]],active?C.hi:'#93aa8a80',active?1.6:1);
    corners(g,...anchor,12,active?C.hi:C.mut);drect(g,x,y,w,h,'#091813f5',active?C.hi:'#82977a99');drect(g,x,y,3,40,active?C.hi:'#82977a');
    dtext(g,'ASSET / '+f.id,x+12,y+18,11,C.hi,true);dtext(g,f.role,x+12,y+42,20,C.white,true);
    dline(g,[x+12,y+50],[x+w-12,y+50],C.grid);
    g.save();g.beginPath();g.rect(x+8,y+54,w-16,89);g.clip();
    for(let v=0;v<6;v++)dline(g,[x+10,y+60+v*14],[x+w-10,y+60+v*14],C.grid);
    model(g,modelTug,x+w*.51,y+106,4.15,(k*.6+.7)+(active?.36*Math.sin((t-at)*.9):0),.48);g.restore();
    dtext(g,f.bp+' t',x+12,y+162,21,C.white,true);dtext(g,'系柱拖力 / 假设值',x+86,y+160,11,C.mut);dtext(g,f.home+' / '+(o.mode==='TRANSIT'?'出发':o.mode==='AT_STATION'?'到达':'已分配'),x+12,y+179,11,C.mut);
  });
}
function dispatchChart(g,t){
  const p=chartBase(g,.36,640,298,100,-170),q=p(ANCHOR);g.save();g.beginPath();g.rect(0,78,1280,474);g.clip();
  dcircle(g,...q,20,C.warm+'88');chartVessel(g,p,ANCHOR,240,36,C.warm,'A-01 / MV MERIDIAN');
  for(let k=0;k<FLEET.length;k++){
    const o=dispatchTugAt(t,k);chartVessel(g,p,o,31,10,C.hi,t<24+k*2?FLEET[k].id:'');
    opacity(g,show(t,24+k*2),()=>dpath(g,sampledDispatchRoute(k).map(p),'#bdd4a260',1.25,true));
  }
  const newest=Math.min(3,Math.max(0,Math.floor((t-24)/2)));
  for(let k=0;k<4;k++)if(k!==newest)tugCard(g,t,k,p,t>=32);
  tugCard(g,t,newest,p,true);
  opacity(g,show(t,32,.55),()=>{drect(g,482,97,316,62,'#0a1915ed','#a9bf87');dtext(g,'04 / 04',502,136,31,C.hi,true);dtext(g,'拖轮全部分配',640,134,19,C.white,true)});
  g.restore();frameHead(g,'04 / TUG DISPATCH','ASD FLEET / 4 ASSIGNED');
  frameFoot(g,t,'四艘拖轮分配与定位','从两个拖轮基地调集，艏艉推靠与外侧待命角色分别确认。','FLEET / RESOURCE ALLOCATION');
}
function rendezvous(g,t){
  const u=ease((t-38.8)/3.2),p=chartBase(g,mix(.36,.60,u),640,298,mix(100,115,u),mix(-170,-125,u));
  g.save();g.beginPath();g.rect(0,78,1280,474);g.clip();const ship=dispatchShipAt(t);dpath(g,sampledShipRoute().map(p),C.warm,2,true);chartVessel(g,p,ship,240,36,C.warm,'MERIDIAN');
  for(let k=0;k<4;k++){
    let o=dispatchTugAt(t,k),r=dispatchRoute(k);
    dpath(g,sampledDispatchRoute(k).map(p),'#bad19e91',1.4,true);const dest=p(r.at(-1));dcircle(g,...dest,8,C.hi+'90');chartVessel(g,p,o,31,10,C.hi,FLEET[k].id);
  }
  const count=FLEET.filter((_,k)=>t>=dispatchTiming(k).end).length;
  drect(g,42,112,265,173,'#0b1916ec','#82977a99');dtext(g,'DISPATCH / RENDEZVOUS',56,135,12,C.hi,true);dtext(g,count+' / 4',56,180,38,C.white,true);dtext(g,'拖轮到达预定会合位置',56,208,14,C.mut);
  dline(g,[56,222],[292,222],C.grid);dtext(g,t<36.8?'主船待引航与起锚协调':'起锚完成 / 驶入港区',56,248,16,C.white,true);dtext(g,'路径为压缩时间示意',56,270,11,C.mut);
  g.restore();frameHead(g,'05 / RENDEZVOUS','ROUTE / COMPRESSED TIME');
  frameFoot(g,t,t<41.5?'起锚与拖轮会合':'进入靠泊作业水域','四艘拖轮到达预定位置，两艘进入后续推靠，另外两艘在外侧待命。','APPROACH / RENDEZVOUS');
}
export function drawDispatchBrief(ctx,time,W,H){
  ctx.save();ctx.scale(W/1280,H/720);ctx.globalAlpha=1;
  if(time<5.7)globe(ctx,time);
  else if(time<8){regional(ctx,time);if(time<6.1)opacity(ctx,1-show(time,5.7,.4),()=>globe(ctx,time))}
  else if(time<14)anchorShot(ctx,time);
  else if(time<22)request(ctx,time);
  else if(time<36)dispatchChart(ctx,time);
  else rendezvous(ctx,time);
  ctx.restore();
}
