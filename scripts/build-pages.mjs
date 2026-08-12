import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const output = path.join(root, '_site');
const publishedDirectories = ['apis', 'docs', 'templates'];
const publishedRootFiles = ['README.md', 'LICENSE', 'CONTRIBUTING.md', 'SECURITY.md', 'CODE_OF_CONDUCT.md', 'AGENTS.md'];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const directory of publishedDirectories) {
  await cp(path.join(root, directory), path.join(output, directory), { recursive: true });
}

await cp(path.join(root, 'site'), output, { recursive: true });
for (const file of publishedRootFiles) {
  await cp(path.join(root, file), path.join(output, file));
}
const license = await readFile(path.join(root, 'LICENSE'), 'utf8');
await writeFile(path.join(output, 'LICENSE.md'), `# MIT License\n\n\`\`\`text\n${license.trimEnd()}\n\`\`\`\n`);
await writeFile(path.join(output, '.nojekyll'), '');

const allFiles = await walk(output);
for (const file of allFiles) {
  if (file.endsWith('.json') || file.endsWith('.yaml') || file.endsWith('.yml')) {
    await createArtifactPage(file);
  }
}

await writeFile(path.join(output, '_sidebar.md'), await createSidebar());
await validateMarkdownLinks(await walk(output));

console.log(`Built GitHub Pages site in ${path.relative(root, output)}/`);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(target));
    else files.push(target);
  }

  return files;
}

async function createArtifactPage(file) {
  const extension = path.extname(file).slice(1);
  const source = await readFile(file, 'utf8');
  const relative = path.relative(output, file).split(path.sep).join('/');
  const title = path.basename(file);
  const markdown = [
    `# ${title}`,
    '',
    `<a href="./${encodeURI(relative)}" download>Download raw artifact</a>`,
    '',
    `\`\`\`${extension}`,
    source.trimEnd(),
    '\`\`\`',
    ''
  ].join('\n');

  await writeFile(`${file}.md`, markdown);
}

async function createSidebar() {
  const lines = [
    '- [Home](/README.md)',
    '- [API index](/apis/README.md)',
    '- [Contributing](/CONTRIBUTING.md)',
    '- [Security](/SECURITY.md)',
    '- [Code of Conduct](/CODE_OF_CONDUCT.md)',
    '- [MIT License](/LICENSE.md)',
    '- Repository guide',
    '  - [Conventions](/docs/repository-conventions.md)',
    '  - [Versioning](/docs/versioning.md)',
    '  - [Modification protocol](/docs/specification-modification-protocol.md)',
    '  - [Security review](/docs/security-review.md)',
    '  - [Agent instructions](/AGENTS.md)'
  ];
  const apiRoot = path.join(output, 'apis');
  const apiEntries = await readdir(apiRoot, { withFileTypes: true });

  for (const api of apiEntries.filter((entry) => entry.isDirectory()).sort(byName)) {
    const apiPath = `apis/${api.name}`;
    lines.push(`- [${api.name}](/${apiPath}/README.md)`);
    const releaseRoot = path.join(output, apiPath, 'releases');
    const releases = await readdir(releaseRoot, { withFileTypes: true });

    for (const release of releases.filter((entry) => entry.isDirectory()).sort(byName).reverse()) {
      const releasePath = `${apiPath}/releases/${release.name}`;
      lines.push(`  - [${release.name}](/${releasePath}/README.md)`);
      lines.push(`    - [Overview](/${releasePath}/documents/README.md)`);
      lines.push(`    - [Discovery](/${releasePath}/documents/discovery.md)`);
      lines.push(`    - [JSON API](/${releasePath}/documents/json-api.md)`);
      lines.push(`    - [Filtering](/${releasePath}/documents/filtering.md)`);
      lines.push(`    - [Authentication](/${releasePath}/documents/authentication.md)`);
      lines.push(`    - [WebSocket](/${releasePath}/documents/websocket.md)`);
      lines.push(`    - [Protocol versioning](/${releasePath}/documents/versioning.md)`);
      lines.push(`    - [Changelog](/${releasePath}/CHANGELOG.md)`);
      lines.push(`    - [OpenAPI](/${releasePath}/specifications/openapi.yaml.md)`);
      lines.push(`    - [AsyncAPI](/${releasePath}/specifications/asyncapi.yaml.md)`);
      lines.push(`    - [Schemas and examples](/${releasePath}/README.md#artifacts)`);
    }
  }

  lines.push('- [API template](/templates/api/README.md)');
  return `${lines.join('\n')}\n`;
}

async function validateMarkdownLinks(files) {
  const markdownFiles = files.filter((file) => file.endsWith('.md'));
  const missing = [];
  const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;

  for (const file of markdownFiles) {
    const source = await readFile(file, 'utf8');
    for (const match of source.matchAll(linkPattern)) {
      const target = match[1];
      if (/^(?:https?:|mailto:|#)/.test(target) || target.startsWith('<')) continue;

      const pathname = decodeURI(target.split('#')[0].split('?')[0]);
      if (!pathname) continue;
      const resolved = pathname.startsWith('/')
        ? path.resolve(output, pathname.slice(1))
        : path.resolve(path.dirname(file), pathname);
      try {
        await stat(resolved);
      } catch {
        missing.push(`${path.relative(root, file)} -> ${target}`);
      }
    }
  }

  if (missing.length) {
    throw new Error(`Broken site links:\n${missing.join('\n')}`);
  }
}

function byName(left, right) {
  return left.name.localeCompare(right.name);
}
