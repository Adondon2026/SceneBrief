import {cl} from './core/math.js';
import {DURATION,drawResearch} from './cases/wave-control/research-film.js';
const $=id=>document.getElementById(id),stage=$('stage'),canvas=$('base'),ctx=canvas.getContext('2d');
let t=0,playing=false,started=false,last=performance.now(),W=1280,H=720,dpr=1,hide;
function resize(){let r=stage.getBoundingClientRect();W=r.width;H=r.height;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(W*dpr));canvas.height=Math.max(1,Math.round(H*dpr));ctx.setTransform(dpr,0,0,dpr,0,0)}
function sync(){ $('play').textContent=playing?'Ⅱ':'▶';$('play').setAttribute('aria-label',playing?'暂停':'播放') }
function seek(v){t=cl(v,0,DURATION);last=performance.now()}
function begin(){started=true;$('start').style.display='none';seek(0);playing=true;sync()}
function toggle(){if(!started){begin();return}if(t>=DURATION)seek(0);playing=!playing;last=performance.now();sync()}
function fmt(v){let n=Math.floor(v);return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0')}
function frame(now){const dt=cl((now-last)/1000,0,.25);last=now;if(playing){t=Math.min(DURATION,t+dt);if(t>=DURATION){playing=false;sync()}}drawResearch(ctx,t,W,H);$('seek').value=t;$('time').textContent=fmt(t)+' / '+fmt(DURATION);requestAnimationFrame(frame)}
$('go').onclick=begin;$('play').onclick=toggle;$('restart').onclick=begin;$('seek').oninput=e=>seek(+e.target.value);
$('full').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen();else stage.requestFullscreen?.().catch(()=>{})};
function reveal(){$('controls').classList.add('show');clearTimeout(hide);hide=setTimeout(()=>$('controls').classList.remove('show'),2000)}
stage.addEventListener('pointermove',reveal);stage.addEventListener('dblclick',()=>$('full').click());addEventListener('resize',resize);
addEventListener('keydown',e=>{if(e.code==='Space'&&!['INPUT','BUTTON'].includes(e.target.tagName)){e.preventDefault();toggle()}if(e.code==='ArrowRight'||e.code==='ArrowLeft')seek(t+(e.code==='ArrowRight'?2:-2));reveal()});
resize();requestAnimationFrame(frame);
