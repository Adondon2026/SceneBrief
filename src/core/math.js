export const D=30;
export const cl=(v,a=0,z=1)=>Math.max(a,Math.min(z,v));
export const mix=(a,b,p)=>a+(b-a)*p;
export const ease=p=>{p=cl(p);return p*p*(3-2*p)};
export const rnd=i=>{let q=Math.sin(i*127.1+311.7)*43758.5453;return q-Math.floor(q)};
export function local(o,x,y,z){let a=o.yaw||0;return [o.x+x*Math.cos(a)+z*Math.sin(a),y,(o.z+z*Math.cos(a)-x*Math.sin(a))]}
