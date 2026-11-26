import {cl} from './core/math.js';
import {LAB_DURATION,LAB_CUES,LAB_VOICE,drawMotionLab} from './cases/harbor-approach/motion-lab.js';
import {createSoundStage} from './audio/sound-stage.js';
const $=id=>document.getElementById(id),stage=$('stage'),cv=$('base'),ctx=cv.getContext('2d');
let t=0,last=performance.now(),playing=false,started=false,muted=false,voiceEnabled=true,volume=.55,W=1280,H=720,dpr=1,prev=0,hide;
const sound=createSoundStage({cues:LAB_CUES});
const speech=window.speechSynthesis;
let currentVoice=null;
function stopVoice(){if(speech)speech.cancel();currentVoice=null}
function voiceTick(old,time){
 if(!speech||!voiceEnabled||muted||!playing)return;
 if(currentVoice&&time>=currentVoice.end){stopVoice()}
 for(const cue of LAB_VOICE)if(old<cue.at&&time>=cue.at&&time<cue.end){
   stopVoice();const u=new SpeechSynthesisUtterance(cue.text);u.lang='zh-CN';u.rate=1.16;u.pitch=.82;u.volume=cl(volume*1.25);
   const v=speech.getVoices().find(v=>/zh[-_]CN/i.test(v.lang)&&v.localService)||speech.getVoices().find(v=>/^zh/i.test(v.lang)&&v.localService);
   if(!v){$('voice').textContent='旁白不可用';return}
   u.voice=v;speech.speak(u);currentVoice=cue;
 }
}
function resize(){const r=stage.getBoundingClientRect();W=r.width;H=r.height;dpr=Math.min(2,devicePixelRatio||1);cv.width=Math.max(1,Math.round(W*dpr));cv.height=Math.max(1,Math.round(H*dpr));ctx.setTransform(dpr,0,0,dpr,0,0)}
function seek(time){t=cl(time,0,LAB_DURATION);prev=t;sound.seek(t);stopVoice();last=performance.now()}
function audioState(){sound.update({time:0,cueTime:t,intro:true,introScene:3,playing,muted,volume,motion:{ahead:0},close:0})}
function syncPlay(){ $('play').textContent=playing?'Ⅱ':'▶';$('play').setAttribute('aria-label',playing?'暂停':'播放'); }
function begin(){sound.init();$('start').style.display='none';started=true;seek(0);playing=true;syncPlay()}
function toggle(){if(!started){begin();return}sound.init();if(t>=LAB_DURATION)seek(0);playing=!playing;if(!playing){sound.cancel();stopVoice()}last=performance.now();syncPlay();audioState()}
function frame(now){const dt=cl((now-last)/1000,0,.25);last=now;prev=t;if(playing){t=Math.min(LAB_DURATION,t+dt);if(t>=LAB_DURATION){playing=false;stopVoice();syncPlay()}}voiceTick(prev,t);audioState();drawMotionLab(ctx,t,W,H);$('seek').value=t;$('time').textContent=t.toFixed(1)+' / '+LAB_DURATION.toFixed(1)+' s';requestAnimationFrame(frame)}
$('go').onclick=begin;$('play').onclick=toggle;$('restart').onclick=begin;
$('seek').oninput=e=>seek(+e.target.value);
$('mute').onclick=()=>{muted=!muted;$('mute').textContent=muted?'音效 关':'音效 开';if(muted)stopVoice();audioState()};
$('voice').onclick=()=>{voiceEnabled=!voiceEnabled;$('voice').textContent=voiceEnabled?'旁白 开':'旁白 关';if(!voiceEnabled)stopVoice()};
$('volume').oninput=e=>{volume=+e.target.value;audioState();if(currentVoice)stopVoice()};
$('full').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen();else stage.requestFullscreen?.().catch(()=>{})};
function reveal(){$('controls').classList.add('show');clearTimeout(hide);hide=setTimeout(()=>$('controls').classList.remove('show'),1900)}
stage.addEventListener('pointermove',reveal);stage.addEventListener('dblclick',()=>$('full').click());
addEventListener('keydown',e=>{if(e.code==='Space'&&!['INPUT','BUTTON'].includes(e.target.tagName)){e.preventDefault();toggle()}if(e.code==='ArrowRight'||e.code==='ArrowLeft')seek(t+(e.code==='ArrowRight'?1:-1));reveal()});
addEventListener('resize',resize);addEventListener('pagehide',()=>{stopVoice();sound.cancel()});
if(!speech){voiceEnabled=false;$('voice').textContent='旁白不可用';$('voice').disabled=true}
resize();requestAnimationFrame(frame);
