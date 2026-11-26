import {cl,mix} from '../../core/math.js';
import {phase} from '../../core/motion-design.js';

export const FILM_CHAPTERS=[
 {at:0,title:'海域定位',code:'01 / GEOLOCATION'},
 {at:7,title:'外锚地',code:'02 / ANCHORAGE'},
 {at:11.25,title:'进港申请',code:'03 / SERVICE REQUEST'},
 {at:14.5,title:'港口调度',code:'04 / ASSIGNMENT'},
 {at:18,title:'四拖轮资源定位',code:'05 / FLEET'},
 {at:36.5,title:'起锚与会合',code:'06 / RENDEZVOUS'},
 {at:43,title:'驶向泊位',code:'07 / APPROACH'},
 {at:48,title:'进港减速',code:'08 / DECELERATION'},
 {at:54,title:'拖轮接应',code:'09 / CONTACT'},
 {at:62,title:'协同推靠',code:'10 / COORDINATION'},
 {at:69,title:'船岸距离',code:'11 / CLEARANCE'},
 {at:76,title:'接近护舷',code:'12 / FINAL CONTACT'},
 {at:82,title:'系泊完成',code:'13 / MOORING'}
];
// Voice timing is independent of the sound engine. No browser TTS is called.
// Later, an external recorded narration can be aligned to these cue boundaries.
export const NARRATION=[
 {at:.65,end:5.8,text:'东海沿岸，进港作业海域定位。'},
 {at:8.15,end:11.1,text:'MERIDIAN 号抵达外锚地，等待进港作业协调。'},
 {at:11.85,end:14.35,text:'确认目标泊位、船舶尺度及引航、系泊服务需求。'},
 {at:15.0,end:17.7,text:'本案调度四艘港作拖轮：两艘推靠，两艘伴航及待命。'},
 {at:18.3,end:19.88,text:'定位两个拖轮基地。'},
 {at:20.5,end:22.95,text:'一号拖轮，负责艏部推靠。'},
 {at:23.65,end:26.1,text:'二号拖轮，负责艉部推靠。'},
 {at:26.8,end:29.25,text:'三号拖轮，负责进港伴航。'},
 {at:29.95,end:32.55,text:'四号拖轮，在外侧应急待命。'},
 {at:33.05,end:36.2,text:'四艘拖轮确认，按计划出发。'},
 {at:37.1,end:42.5,text:'主船起锚，拖轮驶向预定会合位置。'},
 {at:43.4,end:47.7,text:'进入泊位水域；外侧拖轮伴航与机动。'},
 {at:48.45,end:53.55,text:'提前减速，预留艏艉拖轮接应空间。'},
 {at:54.55,end:58.1,text:'拖轮沿艏向接近，通过橡胶护舷传递推靠力。'},
 {at:58.3,end:61.55,text:'双全回转推进器可调节推力方向。'},
 {at:62.6,end:68.6,text:'艏艉拖轮联合推靠；差异化推力修正船舶艏向。'},
 {at:69.6,end:75.6,text:'同时观察艏、艉岸距，判断船身与码头的平行程度。'},
 {at:76.4,end:81.55,text:'最后数米逐步降低横移速度，接近码头护舷。'},
 {at:82.4,end:86.3,text:'艏缆、艉缆和倒缆依次带妥，推靠拖轮卸载。'},
 {at:87.45,end:89.9,text:'靠泊完成，解除拖轮待命。'}
];
export function filmChapter(t){let i=0;while(i<FILM_CHAPTERS.length-1&&t>=FILM_CHAPTERS[i+1].at)i++;return i}
function text(g,s,x,y,size=12,color='#a4b69f',bold=false,align='left',mono=false){g.fillStyle=color;g.font=(bold?'600 ':'')+size+'px '+(mono?'Consolas,monospace':'"Microsoft YaHei",Arial,sans-serif');g.textAlign=align;g.textBaseline='alphabetic';g.fillText(s,x,y)}
function rect(g,x,y,w,h,f){g.fillStyle=f;g.fillRect(x,y,w,h)}
function line(g,x,y,X,Y,c){g.strokeStyle=c;g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.lineTo(X,Y);g.stroke()}
function chapterLabel(g,ch,a,shift){if(a<=.001)return;g.save();g.globalAlpha*=a;text(g,ch.code,42,59+shift,11,'#a6b89d',false,'left',true);text(g,ch.title,264,59+shift,13,'#e6ecda',true);g.restore()}
export function drawFilmChrome(g,t,W,H,duration=90){
 g.save();g.scale(W/1280,H/720);g.globalAlpha=1;
 const top=g.createLinearGradient(0,0,0,98);top.addColorStop(0,'#06110eed');top.addColorStop(.70,'#06110ebc');top.addColorStop(1,'#06110e00');rect(g,0,0,1280,98,top);
 text(g,'SCENEBRIEF / HARBOR OPERATIONS',42,35,13,'#d0e7a1',true,'left',true);
 text(g,'OP.017  /  BERTH 03  /  MERIDIAN',1238,35,12,'#a4b69f',false,'right',true);
 text(g,'演示工况 / 非实测数据',1238,59,11,'#a4b69f',false,'right');
 line(g,42,73,1238,73,'#9eb79245');
 const i=filmChapter(t),ch=FILM_CHAPTERS[i],p=phase(t,ch.at,.42);
 if(i>0)chapterLabel(g,FILM_CHAPTERS[i-1],1-p,-7*p);
 chapterLabel(g,ch,i===0?1:p,7*(1-p));
 // Shared temporal strip; content above is free to retain its own visual depth.
 for(let k=0;k<FILM_CHAPTERS.length;k++)rect(g,42+k*20,81,15,2,k===i?'#d0e7a1':k<i?'#6c826e':'#31493b');
 const bottom=g.createLinearGradient(0,666,0,720);bottom.addColorStop(0,'#06110e00');bottom.addColorStop(.45,'#06110ed7');bottom.addColorStop(1,'#06110ef5');rect(g,0,666,1280,54,bottom);
 const n=NARRATION.find(c=>t>=c.at&&t<c.end);
 if(n){const a=Math.min(phase(t,n.at,.20),1-phase(t,n.end-.16,.16));g.save();g.globalAlpha=a;rect(g,42,681,3,18,'#d0e7a1');text(g,n.text,54,696,15,'#e6ecda',true);g.restore()}
 text(g,String(i+1).padStart(2,'0')+' / '+String(FILM_CHAPTERS.length).padStart(2,'0'),1238,696,11,'#a4b69f',false,'right',true);
 rect(g,0,714,1280,2,'#9ab28c26');rect(g,0,714,1280*cl(t/duration),2,'#d0e7a1');g.restore();
}
