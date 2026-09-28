import {readdir, readFile} from 'node:fs/promises';
import {extname, relative, resolve} from 'node:path';

const root = resolve(import.meta.dirname, '..');
const englishRoot = resolve(root, 'docs');
const chineseRoot = resolve(
  root,
  'i18n/zh-Hans/docusaurus-plugin-content-docs/current',
);
const checkedRoots = [
  englishRoot,
  chineseRoot,
  resolve(root, 'src'),
  resolve(root, 'static'),
  resolve(root, 'README.md'),
  resolve(root, 'docusaurus.config.ts'),
];
const prohibited = ['g' + 'uance'];

async function filesAt(path) {
  const result = [];
  const entries = await readdir(path, {withFileTypes: true});
  for (const entry of entries) {
    const child = resolve(path, entry.name);
    if (entry.isDirectory()) result.push(...(await filesAt(child)));
    else result.push(child);
  }
  return result;
}

const englishFiles = (await filesAt(englishRoot)).filter(path =>
  ['.md', '.mdx'].includes(extname(path)),
);
const chineseFiles = (await filesAt(chineseRoot)).filter(path =>
  ['.md', '.mdx'].includes(extname(path)),
);
const englishNames = new Set(englishFiles.map(path => relative(englishRoot, path)));
const chineseNames = new Set(chineseFiles.map(path => relative(chineseRoot, path)));
const errors = [];

for (const name of englishNames) {
  if (!chineseNames.has(name)) errors.push(`Missing Chinese translation: ${name}`);
}
for (const name of chineseNames) {
  if (!englishNames.has(name)) errors.push(`Translation has no English source: ${name}`);
}

for (const target of checkedRoots) {
  const paths = extname(target) ? [target] : await filesAt(target);
  for (const path of paths) {
    if (!['.md', '.mdx', '.ts', '.tsx', '.css', '.svg'].includes(extname(path))) continue;
    const content = (await readFile(path, 'utf8')).toLowerCase();
    for (const word of prohibited) {
      if (content.includes(word)) errors.push(`Prohibited wording in ${relative(root, path)}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Checked ${englishNames.size} bilingual document pairs.`);
}

