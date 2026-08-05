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
const contentDir = resolve(root, 'src', 'content', collectionDir, slug);
const assetDir = resolve(contentDir, 'assets');
const files = [resolve(contentDir, 'zh.md'), resolve(contentDir, 'en.md')];
const routeFiles = type === 'page'
  ? [resolve(root, 'src', 'pages', `${slug}.astro`), resolve(root, 'src', 'pages', 'en', `${slug}.astro`)]
  : [];

const date = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());

const templates = type === 'post'
  ? {
      zh: `---\ntitle: "TODO：中文标题"\nslug: ${slug}\npublishedAt: ${date}\nlang: zh\ntranslationKey: ${slug}\ndraft: true\n# tags: [astro, note]\n# updatedAt: ${date}\n# legacyPath: /old/path/\n---\n\n在这里开始写中文正文。发布前将 \`draft\` 改为 \`false\`。\n`,
      en: `---\ntitle: "TODO: English title"\nslug: ${slug}\npublishedAt: ${date}\nlang: en\ntranslationKey: ${slug}\ndraft: true\n# tags: [astro, note]\n# updatedAt: ${date}\n# legacyPath: /old/path/\n---\n\nStart writing the English article here. Change \`draft\` to \`false\` before publishing.\n`,
    }
  : type === 'project' ? {
      zh: `---\nname: "TODO：项目名称"\nlang: zh\ntranslationKey: ${slug}\ndescription: "TODO：一句话介绍项目。"\nhref: https://example.com/${slug}\nstatus: 草稿\norder: 999\ndraft: true\n# stack: [Astro, TypeScript]\n# image: ./assets/cover.webp\n---\n\n在这里记录项目的中文背景、目标和进展。发布前填写真实链接，并将 \`draft\` 改为 \`false\`。\n`,
      en: `---\nname: "TODO: Project name"\nlang: en\ntranslationKey: ${slug}\ndescription: "TODO: Describe the project in one sentence."\nhref: https://example.com/${slug}\nstatus: Draft\norder: 999\ndraft: true\n# stack: [Astro, TypeScript]\n# image: ./assets/cover.webp\n---\n\nDocument the English background, goals, and progress here. Add the real link and change \`draft\` to \`false\` before publishing.\n`,
    } : {
      zh: `---\npageKey: ${slug}\nlang: zh\ntitle: "TODO：页面标题"\ndescription: "TODO：一句话说明这个页面。"\n---\n\n在这里开始写页面正文。\n`,
      en: `---\npageKey: ${slug}\nlang: en\ntitle: "TODO: Page title"\ndescription: "TODO: Describe this page in one sentence."\n---\n\nStart writing the page here.\n`,
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
    [routeFiles[0], `---\nimport ContentPage from '../components/pages/ContentPage.astro';\n---\n<ContentPage locale="zh" pageKey="${slug}" />\n`],
    [routeFiles[1], `---\nimport ContentPage from '../../components/pages/ContentPage.astro';\n---\n<ContentPage locale="en" pageKey="${slug}" />\n`],
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
