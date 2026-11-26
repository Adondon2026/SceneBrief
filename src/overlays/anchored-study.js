import {cl,ease} from '../core/math.js';

// Coordinates are in a 1280 × 720 design space. The caller owns the main view.
export function studyVisibility(time,start,end){return ease(cl((time-start)/.32))*ease(cl((end-time)/.27))}
export function drawAnchoredStudy(ctx,{time,start,end,anchor,paint,title,index,side='right'}){
  const a=studyVisibility(time,start,end);if(a<=0)return false;
  const w=308,h=384,x=(side==='left'?42:930)+(1-a)*(side==='left'?-22:22),y=111;
  const [ax,ay]=anchor,visible=ax>=24&&ax<=1256&&ay>=90&&ay<=548;
  const edge=side==='left'?x+w:x,linkY=y+72,elbow=edge+(side==='left'?28:-28);
  ctx.save();ctx.globalAlpha=a;
  const shade=ctx.createLinearGradient(side==='left'?0:1280,0,side==='left'?700:580,0);
  shade.addColorStop(0,'rgba(4,12,9,.48)');shade.addColorStop(1,'rgba(4,12,9,0)');
  ctx.fillStyle=shade;ctx.fillRect(0,90,1280,454);
  if(visible){
    ctx.strokeStyle='#c2d3a4';ctx.lineWidth=1.2;
    ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(elbow,linkY);ctx.lineTo(edge,linkY);ctx.stroke();
    ctx.beginPath();ctx.arc(ax,ay,4,0,Math.PI*2);ctx.stroke();
    for(const dx of [-1,1])for(const dy of [-1,1]){
      ctx.beginPath();ctx.moveTo(ax+dx*15,ay+dy*15);ctx.lineTo(ax+dx*15,ay+dy*8);
      ctx.moveTo(ax+dx*15,ay+dy*15);ctx.lineTo(ax+dx*8,ay+dy*15);ctx.stroke();
    }
  }
  ctx.fillStyle='#0b1713f5';ctx.fillRect(x,y,w,h);
  ctx.strokeStyle='#82977a';ctx.lineWidth=.9;ctx.strokeRect(x+.5,y+.5,w-1,h-1);
  ctx.fillStyle='#c2d3a4';ctx.fillRect(x,y,3,43);
  ctx.save();ctx.beginPath();ctx.rect(x+1,y+1,w-2,h-2);ctx.clip();
  ctx.translate(x,y);ctx.textAlign='left';ctx.textBaseline='alphabetic';
  ctx.fillStyle='#a6b89d';ctx.font='11px Consolas, monospace';ctx.fillText(index,13,19);
  ctx.fillStyle='#e1e7d6';ctx.font='600 20px Microsoft YaHei, Arial, sans-serif';ctx.fillText(title,13,43);
  ctx.strokeStyle='#91a58b45';ctx.beginPath();ctx.moveTo(13,54);ctx.lineTo(w-13,54);ctx.stroke();
  paint(ctx,{w,h,progress:cl((time-start)/(end-start)),visibility:a});
  ctx.restore();ctx.restore();return true;
}
