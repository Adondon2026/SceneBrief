import {cl,ease,mix} from '../core/math.js';
import {phase,blendRect,partialPath} from '../core/motion-design.js';

// Persistent object identity: lock -> leader -> growth -> reading -> collapse.
export function studyVisibility(time,start,end){return ease(cl((time-start)/.32))*ease(cl((end-time)/.27))}
export function drawAnchoredStudy(ctx,{time,start,end,anchor,paint,title,index,side='right'}){
 const life=end-start,enter=phase(time,start+.11,Math.min(.55,life*.17)),exit=phase(time,end-Math.min(.48,life*.15),Math.min(.48,life*.15));
 const a=enter*(1-exit);if(time<start||time>=end)return false;
 const w=308,h=384,finalX=side==='left'?42:930,finalY=111,edge=side==='left'?finalX+w:finalX;
 const seed=[edge-8,finalY+66,16,16],target=[finalX,finalY,w,h],r=blendRect(blendRect(seed,target,enter),seed,exit),[x,y,rw,rh]=r;
 const [ax,ay]=anchor,visible=ax>=24&&ax<=1256&&ay>=90&&ay<=548;
 ctx.save();
 const shade=ctx.createLinearGradient(side==='left'?0:1280,0,side==='left'?700:580,0);
 shade.addColorStop(0,'rgba(4,12,9,'+(.42*a)+')');shade.addColorStop(1,'rgba(4,12,9,0)');
 ctx.fillStyle=shade;ctx.fillRect(0,90,1280,454);
 if(visible){
   const lock=phase(time,start,.22),trace=phase(time,start+.04,.42)*(1-exit);
   const e=side==='left'?x+rw:x,linkY=y+rh*.19,elbow=e+(side==='left'?28:-28),ps=partialPath([[ax,ay],[elbow,ay],[elbow,linkY],[e,linkY]],trace);
   ctx.globalAlpha=(1-exit)*lock;ctx.strokeStyle='#c2d3a4';ctx.lineWidth=1.25;
   ctx.beginPath();ps.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();
   ctx.beginPath();ctx.arc(ax,ay,4,0,Math.PI*2);ctx.stroke();
   const r=mix(27,15,lock);
   for(const dx of [-1,1])for(const dy of [-1,1]){
     ctx.beginPath();ctx.moveTo(ax+dx*r,ay+dy*r);ctx.lineTo(ax+dx*r,ay+dy*(r-8));ctx.moveTo(ax+dx*r,ay+dy*r);ctx.lineTo(ax+dx*(r-8),ay+dy*r);ctx.stroke();
   }
 }
 if(a>.002){
   ctx.globalAlpha=a;ctx.fillStyle='#02090560';ctx.fillRect(x+5,y+7,rw,rh);
   ctx.fillStyle='#0b1713f5';ctx.fillRect(x,y,rw,rh);ctx.strokeStyle='#a1b592';ctx.lineWidth=.9;ctx.strokeRect(x+.5,y+.5,Math.max(0,rw-1),Math.max(0,rh-1));
   ctx.fillStyle='#c2d3a4';ctx.fillRect(x,y,3,Math.min(43,rh));
   ctx.save();ctx.beginPath();ctx.rect(x+1,y+1,Math.max(0,rw-2),Math.max(0,rh-2));ctx.clip();
   ctx.translate(x,y);ctx.scale(rw/w,rh/h);ctx.textAlign='left';ctx.textBaseline='alphabetic';
   const titleA=phase(time,start+.32,.36)*(1-exit);
   ctx.globalAlpha=a*titleA;ctx.fillStyle='#a6b89d';ctx.font='11px Consolas, monospace';ctx.fillText(index,13,19);
   ctx.fillStyle='#e1e7d6';ctx.font='600 20px Microsoft YaHei, Arial, sans-serif';ctx.fillText(title,13,43);
   ctx.strokeStyle='#91a58b45';ctx.beginPath();ctx.moveTo(13,54);ctx.lineTo(w-13,54);ctx.stroke();
   ctx.globalAlpha=a*phase(time,start+.45,.42);
   paint(ctx,{w,h,progress:cl((time-start)/life),visibility:a});
   ctx.restore();
 }
 ctx.restore();return true;
}
