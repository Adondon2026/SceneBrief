import {drawAnchoredStudy} from '../../overlays/anchored-study.js';
import {cl,ease} from '../../core/math.js';
function line2(g,a,b,col='#b9c8a8',w=1){g.beginPath();g.moveTo(...a);g.lineTo(...b);g.strokeStyle=col;g.lineWidth=w;g.stroke()}
function txt2(g,text,x,y,size=12,col='#a9b9a2',bold=false){g.fillStyle=col;g.font=(bold?'600 ':'')+size+'px Microsoft YaHei, Arial,sans-serif';g.fillText(text,x,y)}
function arrow2(g,a,b,col,w=2){line2(g,a,b,col,w);let th=Math.atan2(b[1]-a[1],b[0]-a[0]);for(let k of [-1,1])line2(g,b,[b[0]-9*Math.cos(th+k*.45),b[1]-9*Math.sin(th+k*.45)],col,w)}
function vessel2(g,x,y,w,l,yaw=0){
  g.save();g.translate(x,y);g.rotate(yaw);g.beginPath();g.moveTo(0,-l/2);g.lineTo(w/2,-l*.34);g.lineTo(w/2,l*.42);g.lineTo(w*.33,l/2);g.lineTo(-w*.33,l/2);g.lineTo(-w/2,l*.42);g.lineTo(-w/2,-l*.34);g.closePath();g.fillStyle='#466452';g.fill();g.strokeStyle='#b6c9a8';g.lineWidth=1;g.stroke();
  for(let i=0;i<6;i++){g.fillStyle='#829881';g.fillRect(-w*.34,-l*.25+i*l*.095,w*.68,l*.066)}g.restore();
}
function forcePaint(g,{w,progress}){
  const y=167,shipX=128,hi='#c6db96',warm='#dfb584';
  txt2(g,'横向合力与艏摇力矩',14,76,14,'#e1e7d6',true);
  vessel2(g,shipX,y,35,159,-.055);
  const positions=[y-48,y+48];for(let k=0;k<2;k++){
    const yy=positions[k];g.save();g.translate(239,yy);g.rotate(-Math.PI/2);g.fillStyle='#75937a';g.fillRect(-7,-16,14,32);g.restore();
    arrow2(g,[219,yy],[151,yy],warm,k===1?3.7:2.3);txt2(g,k===1?'F₂ 增推':'F₁',222,yy-14,12,warm,true);
  }
  arrow2(g,[110,y],[55,y],hi,2.5);txt2(g,'ΣF',32,y-11,14,hi,true);
  g.strokeStyle=warm;g.lineWidth=1.6;g.beginPath();g.arc(shipX,y,58,1.9,4.4);g.stroke();const a=4.4,b=[shipX+58*Math.cos(a),y+58*Math.sin(a)];arrow2(g,[b[0]-10,b[1]+4],b,warm,1.7);txt2(g,'M',55,113,13,warm,true);
  line2(g,[14,261],[w-14,261],'#91a58b55');txt2(g,'F横 ≈ F₁ + F₂',14,289,20,'#e1e7d6',true);txt2(g,'推力差产生艏摇力矩，修正船艏向。',14,316,13,hi);
  txt2(g,'对称力臂下：|M| ≈ |F₂ − F₁| · l',14,344,13,'#d5ddca');txt2(g,'示意力矢量 / 非水动力计算结果',14,370,10,'#a9b9a2');
}
function rangePaint(g,{w,m}){
  const hi='#c6db96',warm='#dfb584',fore=Math.max(0,m.fore),aft=Math.max(0,m.aft);
  txt2(g,'码头基准 / 船舷测距',14,77,14,'#e1e7d6',true);
  const quayX=43,x1=quayX+18+cl(fore/80)*126,x2=quayX+18+cl(aft/80)*126;
  g.fillStyle='#7d8b75';g.fillRect(18,93,25,159);
  for(let i=0;i<6;i++){g.fillStyle='#293d31';g.fillRect(40,99+i*26,5,13)}
  g.beginPath();g.moveTo(x1+17,89);g.lineTo(x1+33,114);g.lineTo(x2+33,226);g.lineTo(x2+17,249);g.lineTo(x2,226);g.lineTo(x1,114);g.closePath();g.fillStyle='#466452';g.fill();g.strokeStyle='#b7c9a5';g.stroke();
  arrow2(g,[x1,118],[quayX,118],warm,2);arrow2(g,[x2,221],[quayX,221],hi,2);
  txt2(g,'艏',x1+40,122,12,warm,true);txt2(g,'艉',x2+40,225,12,hi,true);
  line2(g,[14,261],[w-14,261],'#91a58b55');txt2(g,'艏部',14,281,12,warm);txt2(g,'艉部',162,281,12,hi);
  txt2(g,fore.toFixed(1)+' m',14,308,23,'#e1e7d6',true);txt2(g,aft.toFixed(1)+' m',162,308,23,'#e1e7d6',true);
  txt2(g,'距离差 '+Math.abs(fore-aft).toFixed(1)+' m',14,340,16,hi,true);txt2(g,'由演示船位计算 / 俯视间隙示意',14,371,10,'#a9b9a2');
}
export function drawForceStudy(ctx,time,anchor){
 return drawAnchoredStudy(ctx,{start:63.6,end:68.85,time,anchor,title:'协同推靠',index:'MECHANISM / 02',paint:forcePaint});
}
export function drawRangeStudy(ctx,time,anchor,m){
 return drawAnchoredStudy(ctx,{start:70.6,end:75.85,time,anchor,title:'艏艉岸距',index:'MEASUREMENT / 03',paint:(g,opt)=>rangePaint(g,{...opt,m})});
}
