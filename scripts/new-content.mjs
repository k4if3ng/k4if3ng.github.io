import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const [type, ...rawArgs] = process.argv.slice(2);
const slug = rawArgs.find(value => value !== '--');
const validTypes = new Set(['post', 'project', 'page']);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

if (type === '--help' || type === '-h' || slug === '--help' || slug === '-h') {
  console.log('Usage: pnpm new:post -- <kebab-case-slug>');
  console.log('       pnpm new:project -- <kebab-case-slug>');
  console.log('       pnpm new:page -- <kebab-case-slug>');
  console.log('Each command creates paired zh.md / en.md files and an assets directory.');
  process.exit(0);
}

if (!validTypes.has(type) || !slugPattern.test(slug ?? '')) {
  console.error('Usage: pnpm new:post -- <kebab-case-slug>');
  console.error('       pnpm new:project -- <kebab-case-slug>');
  console.error('       pnpm new:page -- <kebab-case-slug>');
  process.exit(1);
}

const root = process.cwd();
const collectionDir = type === 'post' ? 'posts' : type === 'project' ? 'projects' : 'pages';
const date = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());
const contentDir = type === 'page'
  ? resolve(root, 'src', 'content', slug)
  : type === 'post'
    ? resolve(root, 'src', 'content', collectionDir, date.slice(0, 4), date.slice(5, 7), slug)
    : resolve(root, 'src', 'content', collectionDir, slug);
const assetDir = resolve(contentDir, 'assets');
const files = [resolve(contentDir, 'zh.md'), resolve(contentDir, 'en.md')];
const routeFiles = type === 'page'
  ? [resolve(root, 'src', 'pages', `${slug}.astro`), resolve(root, 'src', 'pages', 'en', `${slug}.astro`)]
  : [];

const templates = type === 'post'
  ? {
      zh: `---\ntitle: "TODO：中文标题"\npublishedAt: ${date}\ndraft: true\n# tags: [astro, note]\n---\n\n在这里开始写中文正文。发布前将 \`draft\` 改为 \`false\`。\n`,
      en: `---\ntitle: "TODO: English title"\npublishedAt: ${date}\ndraft: true\n# tags: [astro, note]\n---\n\nStart writing the English article here. Change \`draft\` to \`false\` before publishing.\n`,
    }
  : type === 'project' ? {
      zh: `---\nname: "TODO：项目名称"\nhref: https://example.com/${slug}\nstatus: ""\norder: 999\ndraft: true\n# stack: [Astro, TypeScript]\n# image: ./assets/cover.webp\n---\n\n在这里编写项目介绍，可以包含多句话和多个段落。发布前填写真实链接，并将 \`draft\` 改为 \`false\`。\n`,
      en: `---\nname: "TODO: Project name"\nhref: https://example.com/${slug}\nstatus: ""\norder: 999\ndraft: true\n# stack: [Astro, TypeScript]\n# image: ./assets/cover.webp\n---\n\nWrite the project introduction here. It may contain multiple sentences and paragraphs. Add the real link and change \`draft\` to \`false\` before publishing.\n`,
    } : {
      zh: `---\ntitle: "TODO：页面标题"\n---\n\n在这里开始写页面正文。\n`,
      en: `---\ntitle: "TODO: Page title"\n---\n\nStart writing the page here.\n`,
    };

const plannedFiles = [...files, ...routeFiles];
const existing = plannedFiles.filter(existsSync);
if (existing.length) {
  console.error(`Refusing to overwrite existing file(s):\n${existing.map(file => `- ${file}`).join('\n')}`);
  process.exit(1);
}

await Promise.all([
  mkdir(contentDir, { recursive: true }),
  mkdir(assetDir, { recursive: true }),
  ...(type === 'page' ? [mkdir(resolve(root, 'src', 'pages', 'en'), { recursive: true })] : []),
]);
const generated = [
  [files[0], templates.zh],
  [files[1], templates.en],
  ...(type === 'page' ? [
    [routeFiles[0], `---\nimport ContentPage from '../components/pages/ContentPage.astro';\n---\n<ContentPage locale="zh" contentKey="${slug}" />\n`],
    [routeFiles[1], `---\nimport ContentPage from '../../components/pages/ContentPage.astro';\n---\n<ContentPage locale="en" contentKey="${slug}" />\n`],
  ] : []),
];
await Promise.all(generated.map(([file, content]) => writeFile(file, content, 'utf8')));

console.log(`Created ${type} draft: ${slug}`);
console.log(`- ${files[0].replace(`${root}/`, '')}`);
console.log(`- ${files[1].replace(`${root}/`, '')}`);
console.log(`- ${assetDir.replace(`${root}/`, '')}/`);
if (type === 'page') {
  console.log(`- ${routeFiles[0].replace(`${root}/`, '')}`);
  console.log(`- ${routeFiles[1].replace(`${root}/`, '')}`);
  console.log('Add the page to the main navigation only when it should become a primary destination.');
} else {
  console.log('Both language versions are drafts and will not be published until draft: false.');
}
