import {readFile,writeFile,mkdir} from 'node:fs/promises';
const root=new URL('../',import.meta.url),read=p=>readFile(new URL(p,root),'utf8');
const order=['src/core/math.js','src/core/motion-design.js','src/cases/harbor-approach/motion.js','src/cases/harbor-approach/geometry.js','src/cases/harbor-approach/dispatch-state.js','src/cases/harbor-approach/motion-lab.js','src/audio/sound-stage.js','src/motion-lab-player.js'];
// Keep module scopes; names from renderer/player are intentionally independent.
// The module-free preview uses a tiny build-time IIFE namespace wrapper.
const parts=await Promise.all(order.map(read));
const code=parts.map((s,i)=>{
  const imports=[...s.matchAll(/^import \{([^}]+)\} from ['"]([^'"]+)['"];\s*$/gm)];
  const names=[...s.matchAll(/\bexport (?:const|function|let|class)\s+(\w+)/g)].map(m=>m[1]);
  const pre=imports.map(m=>{
    const url=new URL(m[2],new URL(order[i],root));const j=order.findIndex(p=>new URL(p,root).href===url.href);
    if(j<0||j>=i)throw Error('Invalid dependency '+m[2]);return 'const {'+m[1]+'}=M'+j+';';
  }).join('\n');
  const body=s.replace(/^import .*;\r?\n/gm,'').replace(/\bexport (?=(?:const|function|let|class)\b)/g,'');
  return 'const M'+i+'=(()=>{'+pre+'\n'+body+'\nreturn {'+names.join(',')+'};})();';
}).join('\n');
const css=await read('src/style.css'),html=(await read('motion-lab.html')).replace('<link rel="stylesheet" href="./src/style.css">',()=>'<style>'+css+'</style>').replace('<script type="module" src="./src/motion-lab-player.js"></script>',()=>'<script>'+code.replace(/<\/script/gi,'<\\/script')+'</script>');
const dest='examples/harbor-approach/motion-lab-v8.html';await mkdir(new URL('examples/harbor-approach/',root),{recursive:true});await writeFile(new URL(dest,root),html);console.log(dest);
