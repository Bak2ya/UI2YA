import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const source = name => readFile(new URL(name,import.meta.url),'utf8');
let html = await source('index.html');
for (const [tag,name] of [...html.matchAll(/(<link rel="stylesheet" href="([^"]+)">)/g)].map(m=>[m[1],m[2]])) {
  let css = await source(name);
  for (const [reference, asset] of css.matchAll(/url\('(assets\/[\w-]+\.jpg)'\)/g)) {
    const bytes = await readFile(new URL(asset, import.meta.url));
    css = css.replace(reference, `url('data:image/jpeg;base64,${bytes.toString('base64')}')`);
  }
  html = html.replace(tag,() => '<style>\n' + css.replace(/<\/style/gi,'<\\/style') + '\n</style>');
}
const scripts = [...html.matchAll(/(<script defer src="([^"]+)"><\/script>)/g)].map(m=>[m[1],m[2]]);
const code = [];
for (const [tag,name] of scripts) {
  html = html.replace(tag,'');
  code.push((await source(name)).replace(/<\/script/gi,'<\\/script'));
}
html = html.replace('</body>',() => '<script>\n'+code.join('\n;\n')+'\n</script>\n</body>');
const destination = process.argv[2] ? resolve(process.argv[2]) : new URL('UI2YA.html',import.meta.url);
await writeFile(destination, html);
