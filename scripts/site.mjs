import { spawnSync } from 'node:child_process';

const command = process.argv[2] ?? 'help';

const help = `
Site maintenance commands

  pnpm run help                          Show this list
  pnpm dev                               Start the local Astro development server
  pnpm check                             Type-check Astro files and content
  pnpm build                             Run checks and build dist/
  pnpm preview                           Preview a completed production build
  pnpm new:post -- <slug>                Create paired post drafts and assets/
  pnpm new:project -- <slug>             Create paired project drafts and assets/
  pnpm new:page -- <slug>                Create a generic bilingual page and routes
  pnpm deploy                            Build, require a clean worktree, then git push

New post and project drafts are excluded from the site until draft: false.
`.trim();

if (command === 'help' || command === '--help' || command === '-h') {
  console.log(help);
  process.exit(0);
}

if (command !== 'deploy') {
  console.error(`Unknown command: ${command}\n\n${help}`);
  process.exit(1);
}

const statusCheck = spawnSync('git', ['status', '--short'], { encoding: 'utf8' });
if (statusCheck.status !== 0 && !statusCheck.stdout) {
  console.error(`Unable to inspect the Git working tree: ${statusCheck.error?.message ?? statusCheck.stderr ?? 'unknown error'}`);
  process.exit(statusCheck.status ?? 1);
}
const status = statusCheck.stdout.trim();
if (status) {
  console.error('Refusing to push with uncommitted changes. Commit or stash them first.');
  process.exit(1);
}

const build = spawnSync('pnpm', ['run', 'build'], { stdio: 'inherit' });
if (build.status !== 0) process.exit(build.status ?? 1);

const push = spawnSync('git', ['push'], { stdio: 'inherit' });
process.exit(push.status ?? 1);
