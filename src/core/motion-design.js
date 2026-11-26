import {cl,mix} from './math.js';

// A finite, seekable critically damped response. No overshoot by default.
// Exact endpoints are useful for deterministic replay/export.
export function damped(u,k=7){
  u=cl(u);if(u===0||u===1)return u;
  return (1-(1+k*u)*Math.exp(-k*u))/(1-(1+k)*Math.exp(-k));
}
export function phase(t,start,duration,k=7){return damped((t-start)/duration,k)}
export function smoothstep(u){u=cl(u);return u*u*(3-2*u)}
export function blendRect(a,b,u){return a.map((v,i)=>mix(v,b[i],u))}
export function partialPath(points,p){
  if(points.length<2)return points.slice();p=cl(p);
  const lengths=points.slice(1).map((v,i)=>Math.hypot(v[0]-points[i][0],v[1]-points[i][1]));
  let left=lengths.reduce((a,b)=>a+b,0)*p,out=[points[0]];
  for(let i=0;i<lengths.length;i++){
    const len=lengths[i];if(left>=len){out.push(points[i+1]);left-=len}
    else{const f=len?left/len:0;out.push([mix(points[i][0],points[i+1][0],f),mix(points[i][1],points[i+1][1],f)]);break}
  }return out;
}
// Cubic Hermite keys with centered, time-weighted velocities, no stop at every key.
export function continuousKeys(t,keys){
  if(t<=keys[0][0])return keys[0].slice(1);
  if(t>=keys.at(-1)[0])return keys.at(-1).slice(1);
  let i=0;while(t>keys[i+1][0])i++;
  const a=keys[i],b=keys[i+1],p=keys[Math.max(0,i-1)],n=keys[Math.min(keys.length-1,i+2)],h=b[0]-a[0],u=(t-a[0])/h,u2=u*u,u3=u2*u;
  return a.slice(1).map((v,j)=>{const k=j+1,m0=(b[k]-p[k])/(b[0]-p[0]),m1=(n[k]-a[k])/(n[0]-a[0]);return (2*u3-3*u2+1)*v+(u3-2*u2+u)*h*m0+(-2*u3+3*u2)*b[k]+(u3-u2)*h*m1});
}
