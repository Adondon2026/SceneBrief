import {cl,ease,mix} from '../../core/math.js';
import {shapes,prism,box,vesselShapes} from './geometry.js';
import {drawAnchoredStudy} from '../../overlays/anchored-study.js';

export const TUG_STUDY={start:8.25,end:11.72};
const origin={x:0,z:0,yaw:0};
function buildStudy(){
  shapes.length=0;vesselShapes(origin,true,true);
  const hull=[[-3.9,-15.5],[3.9,-15.5],[5,-12.4],[5,8.99],[3.9,13.02],[0,15.5],[-3.9,13.02],[-5,8.99],[-5,-12.4]];
  prism(origin,hull,-2.4,0,'#38564b','#365046','#789985');
  shapes.push({ps:hull.map(([x,z])=>[x,-2.4,z]),fill:'#38564b',edge:'#789985'});
  for(const x of [-2.3,2.3]){
    const ring=Array.from({length:16},(_,i)=>[x+1.05*Math.cos(i*Math.PI/8),-10.3+1.05*Math.sin(i*Math.PI/8)]);
    prism(origin,ring,-4.5,-2.4,'#829c84','#536f5e','#c1d5ab');
    const disc=Array.from({length:20},(_,i)=>[x+1.55*Math.cos(i*Math.PI/10),-4.1+1.55*Math.sin(i*Math.PI/10),-11.5]);
    shapes.push({ps:disc,fill:'#b3c2a6',edge:'#d0e0b7'});
    for(let i=0;i<4;i++){const a=i*Math.PI/2;shapes.push({ps:[[x,-4.1,-11.56],[x+1.35*Math.cos(a),-4.1+1.35*Math.sin(a),-11.56],[x+1.22*Math.cos(a+.55),-4.1+1.22*Math.sin(a+.55),-11.56]],fill:'#45594a',edge:'#647d65'})}
    box(origin,x,-10.2,1.65,1.9,-4.5,-3.5,'#809e82','#526b58','#b0c69b');
  }
  const faces=shapes.map(f=>({...f,ps:f.ps.map(p=>p.slice())}));shapes.length=0;return faces;
}
const studyFaces=buildStudy();
function tugText(g,s,x,y,size=12,color='#a9b9a2',bold=false){g.fillStyle=color;g.font=(bold?'600 ':'')+size+'px Microsoft YaHei, Arial, sans-serif';g.fillText(s,x,y)}
function tugLine(g,a,b,col,w=1){g.strokeStyle=col;g.lineWidth=w;g.beginPath();g.moveTo(...a);g.lineTo(...b);g.stroke()}
function paintTug(g,{w,progress}){
  const q=ease(cl((progress-.12)/.47)),az=mix(.77,2.83,q)+.075*Math.sin(progress*8),el=mix(.48,-.55,q)+.025*Math.sin(progress*7),scale=6.8;
  const sa=Math.sin(az),ca=Math.cos(az),se=Math.sin(el),ce=Math.cos(el);
  const project=([x,y,z])=>[w/2+(x*ca-z*sa)*scale,164+((x*sa+z*ca)*se-(y-2)*ce)*scale];
  const depth=f=>f.ps.reduce((sum,[x,y,z])=>sum+x*sa*ce+z*ca*ce+y*se,0)/f.ps.length;
  g.save();g.beginPath();g.rect(12,59,w-24,202);g.clip();
  for(let x=18;x<w-14;x+=24)tugLine(g,[x,59],[x,260],'#89a1841b');
  for(let y=68;y<260;y+=24)tugLine(g,[14,y],[w-14,y],'#89a1841b');
  for(const f of [...studyFaces].sort((a,b)=>depth(a)-depth(b))){
    g.beginPath();f.ps.forEach((pt,i)=>{let [x,y]=project(pt);i?g.lineTo(x,y):g.moveTo(x,y)});g.closePath();g.fillStyle=f.fill;g.fill();g.strokeStyle=f.edge;g.lineWidth=.65;g.stroke();
  }
  if(q>.74){
    g.globalAlpha*=cl((q-.74)/.26);
    for(const [i,x] of [-2.3,2.3].entries()){
      const a=project([x,-4.1,-11.7]),b=project([x+(i?1:-1)*4.6,-4.1,-14.2]);
      tugLine(g,a,b,'#e1b77e',2);
      const th=Math.atan2(b[1]-a[1],b[0]-a[0]);g.fillStyle='#e1b77e';g.beginPath();g.moveTo(...b);g.lineTo(b[0]-8*Math.cos(th-.4),b[1]-8*Math.sin(th-.4));g.lineTo(b[0]-8*Math.cos(th+.4),b[1]-8*Math.sin(th+.4));g.fill();
      g.strokeStyle='#e1b77e';g.beginPath();g.arc(...a,5,0,Math.PI*2);g.stroke();
    }
  }
  g.restore();
  tugLine(g,[13,267],[w-13,267],'#91a58b55');
  tugText(g,'31 m  ×  10 m',14,289,21,'#e1e7d6',true);
  tugText(g,'示意船型 / 非实船参数',14,306,10);
  tugText(g,q<.74?'艏护舷  /  驾驶室':'双全回转推进器',14,332,16,'#c6db96',true);
  tugText(g,q<.74?'护舷传递推靠力，缓冲接触。':'回转改变推力方向；箭头为示意。',14,352,12,'#d5ddca');
  tugText(g,'ASD / CONCEPT GEOMETRY',14,373,10);
}
export function drawTugStudy(ctx,time,anchor){return drawAnchoredStudy(ctx,{...TUG_STUDY,time,anchor,title:'港作拖轮 T01',index:'ASSET / 01 · ASD TUG',paint:paintTug})}
