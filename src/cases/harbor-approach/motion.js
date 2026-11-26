import {D,cl,mix,ease,local} from '../../core/math.js';
// All distances, numbers and equipment are fictional concept data. Coordinates are meters.
// Illustrative harbor operation, time compressed 42:1. Coordinates in metres.
export const SIM=42, P=[[0,95,-330,-.09],[4,78,-95,-.08],[8,40,88,-.055],[10,32,115,-.045],[12,32,115,-.045],[17,-8,115,-.018],[22,-44,115,0],[26,-50.2,115,0],[30,-50.2,115,0]];
export function curve(time,k,arr=P){let n=arr.length,i=0;while(i<n-2&&time>arr[i+1][0])i++;let h=arr[i+1][0]-arr[i][0],u=cl((time-arr[i][0])/h),a=arr[i][k],b=arr[i+1][k];function slope(j){if(j===0)return (arr[1][k]-arr[0][k])/(arr[1][0]-arr[0][0]);if(j===n-1)return 0;let m=(arr[j][k]-arr[j-1][k])/(arr[j][0]-arr[j-1][0]),q=(arr[j+1][k]-arr[j][k])/(arr[j+1][0]-arr[j][0]);return m*q>0?2*m*q/(m+q):0}return (2*u*u*u-3*u*u+1)*a+(u*u*u-2*u*u+u)*h*slope(i)+(-2*u*u*u+3*u*u)*b+(u*u*u-u*u)*h*slope(i+1)}
export function pathAt(time){return {x:curve(time,1),z:curve(time,2),yaw:curve(time,3)}}
// World-space approach, tangent-aligned heading, then longitudinal push and reverse retreat.
const station=[64,-64], join=[11.6,12], leave=[28.1,28.5], contactX=33.65;
const drift=[[],[]];
for(let k=0;k<2;k++){let z=station[k]; for(let i=0;i<=1800;i++){let tt=12+i*.01;drift[k].push(z);let a=pathAt(tt),b=pathAt(Math.min(30,tt+.01));let along=(b.x-a.x)*Math.sin(a.yaw)+(b.z-a.z)*Math.cos(a.yaw);z+=contactX*(b.yaw-a.yaw)-along;}}
export function contactZ(time,k){let n=cl((time-12)*100,0,1799),i=Math.floor(n);return mix(drift[k][i],drift[k][i+1],n-i)}
export function tugAt(time,k){let end=join[k],start=6.2+k*.45,ref=pathAt(12),z=station[k],s=pathAt(time);
 if(time<end){let u=ease(cl((time-start)/(end-start))),p0=[115,z+(k?-42:40)],p1=[88,z+(k?-36:34)],p2=[55,z],p3=[contactX,z],v=1-u;
 let pos=[0,1].map(i=>v*v*v*p0[i]+3*v*v*u*p1[i]+3*v*u*u*p2[i]+u*u*u*p3[i]);let d=[0,1].map(i=>3*v*v*(p1[i]-p0[i])+6*v*u*(p2[i]-p1[i])+3*u*u*(p3[i]-p2[i]));let pt=local(ref,pos[0],0,pos[1]);return {x:pt[0],z:pt[2],yaw:ref.yaw+Math.atan2(d[0],d[1]),contact:false,mode:time<start?'WAIT':'APPROACH'};}
 let out=ease(cl((time-leave[k])/(30-leave[k]))),pt=local(s,contactX+out*27,0,contactZ(time,k));return {x:pt[0],z:pt[2],yaw:s.yaw-Math.PI/2,contact:time<leave[k],mode:time<12?'HOLD':time<26?'PUSH':time<leave[k]?'HOLD':'REVERSE'};}
export function motion(time){let a=pathAt(Math.max(0,time-.025)),b=pathAt(Math.min(D,time+.025)),dt=(Math.min(D,time+.025)-Math.max(0,time-.025))*SIM||1;let s=pathAt(time),fx=(b.x-a.x)/dt,fz=(b.z-a.z)/dt;return {ahead:Math.max(0,(fx*Math.sin(s.yaw)+fz*Math.cos(s.yaw))*1.94384),sway:Math.abs(fx*Math.cos(s.yaw)-fz*Math.sin(s.yaw)),fore:local(s,-18,0,64)[0]+68.2,aft:local(s,-18,0,-64)[0]+68.2,heading:s.yaw*180/Math.PI}}
