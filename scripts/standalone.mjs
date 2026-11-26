import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {NARRATION} from '../src/cases/harbor-approach/film-chrome.js';
const root=new URL('../',import.meta.url),read=p=>readFile(new URL(p,root),'utf8');
const order=[
  "src/core/math.js",
  "src/core/motion-design.js",
  "src/cases/harbor-approach/motion.js",
  "src/cases/harbor-approach/geometry.js",
  "src/cases/harbor-approach/camera.js",
  "src/overlays/anchored-study.js",
  "src/cases/harbor-approach/tug-study.js",
  "src/core/briefing-clock.js",
  "src/cases/harbor-approach/earth-data.js",
  "src/cases/harbor-approach/dispatch-state.js",
  "src/cases/harbor-approach/dispatch-brief.js",
  "src/cases/harbor-approach/motion-lab.js",
  "src/cases/harbor-approach/continuous-intro.js",
  "src/cases/harbor-approach/film-chrome.js",
  "src/cases/harbor-approach/operation-studies.js",
  "src/audio/sound-stage.js",
  "src/main.js"
];
const parts=await Promise.all(order.map(read));
// Bundle small, explicit ES modules into isolated namespaces for local file playback.
const code=parts.map((s,i)=>{
  const imports=[...s.matchAll(/^import \{([^}]+)\} from ['"]([^'"]+)['"];\s*$/gm)];
  const names=[...s.matchAll(/\bexport (?:const|function|let|class)\s+(\w+)/g)].map(m=>m[1]);
  const pre=imports.map(m=>{
    const url=new URL(m[2],new URL(order[i],root));const j=order.findIndex(p=>new URL(p,root).href===url.href);
    if(j<0||j>=i)throw Error('Invalid dependency '+m[2]);return 'const {'+m[1]+'}=M'+j+';';
  }).join('\n');
  return 'const M'+i+'=(()=>{'+pre+'\n'+s.replace(/^import .*;\r?\n/gm,'').replace(/\bexport (?=(?:const|function|let|class)\b)/g,'')+'\nreturn {'+names.join(',')+'};})();';
}).join('\n');
const css=await read('src/style.css'),html=(await read('index.html')).replace('<link rel="stylesheet" href="./src/style.css">',()=>'<style>'+css+'</style>').replace('<script type="module" src="./src/main.js"></script>',()=>'<script type="module">'+code.replace(/<\/script/gi,'<\\/script')+'</script>');
const fmt=n=>{const ms=Math.round(n*1000);return [Math.floor(ms/3600000),Math.floor(ms/60000)%60,Math.floor(ms/1000)%60].map(v=>String(v).padStart(2,'0')).join(':')+','+String(ms%1000).padStart(3,'0')};
const srt=NARRATION.map((v,i)=>(i+1)+'\n'+fmt(v.at)+' --> '+fmt(v.end)+'\n'+v.text+'\n').join('\n');
await mkdir(new URL('examples/harbor-approach/',root),{recursive:true});
await writeFile(new URL('examples/harbor-approach/v9.html',root),html);
await writeFile(new URL('examples/harbor-approach/v9-narration.srt',root),srt);
console.log('V9 preview and narration track exported');
