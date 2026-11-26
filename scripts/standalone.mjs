import {readFile,writeFile,mkdir} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const read=p=>readFile(new URL(p,root),'utf8');
const order=['src/core/math.js','src/cases/harbor-approach/motion.js','src/cases/harbor-approach/geometry.js','src/cases/harbor-approach/camera.js','src/overlays/anchored-study.js','src/cases/harbor-approach/tug-study.js','src/audio/sound-stage.js','src/main.js'];
const code=(await Promise.all(order.map(read))).map(s=>s.replace(/^import .*;\r?\n/gm,'').replace(/\bexport (?=(?:const|function|let|class)\b)/g,'')).join('\n');
const css=await read('src/style.css');
const html=(await read('index.html')).replace('<link rel="stylesheet" href="./src/style.css">',()=>'<style>'+css+'</style>').replace('<script type="module" src="./src/main.js"></script>',()=>'<script type="module">'+code.replace(/<\/script/gi,'<\\/script')+'</script>');
const dest='examples/harbor-approach/v6.html';await mkdir(new URL('examples/harbor-approach/',root),{recursive:true});await writeFile(new URL(dest,root),html);console.log(dest);
