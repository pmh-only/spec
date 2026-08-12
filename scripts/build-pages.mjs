import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const output = path.join(root, '_site');
const contentDirectories = ['apis', 'docs', 'templates'];
const rootDocuments = ['README.md', 'LICENSE', 'CONTRIBUTING.md', 'SECURITY.md', 'CODE_OF_CONDUCT.md', 'AGENTS.md'];
const artifactExtensions = new Set(['.json', '.yaml', '.yml']);
const statusDescriptions = {
  current: 'This is the current published release recommended for implementation.',
  draft: 'This is an unpublished draft. Its contents can change before publication and must not be treated as the current contract.',
  deprecated: 'This release is deprecated. New implementations should use the current release.',
  retired: 'This release is retained for historical reference and should not be used for new implementations.'
};

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.join(root, 'site'), output, { recursive: true });
await writeFile(path.join(output, '.nojekyll'), '');

const sourceFiles = [];
for (const directory of contentDirectories) sourceFiles.push(...await walk(path.join(root, directory)));
for (const file of rootDocuments) sourceFiles.push(path.join(root, file));

const releaseMetadata = await readReleaseMetadata(sourceFiles);
const pages = [];
for (const sourceFile of sourceFiles) {
  const relative = relativeFromRoot(sourceFile);
  const extension = path.extname(sourceFile).toLowerCase();

  if (relative === 'LICENSE') {
    const license = await readFile(sourceFile, 'utf8');
    pages.push(await createMarkdownPage(sourceFile, relative, `# MIT License\n\n\`\`\`text\n${license.trimEnd()}\n\`\`\`\n`));
  } else if (extension === '.md') {
    pages.push(await createMarkdownPage(sourceFile, relative));
  } else {
    const target = path.join(output, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await cp(sourceFile, target);
    if (artifactExtensions.has(extension)) pages.push(await createArtifactPage(sourceFile, relative));
  }
}

await createSearchPage(pages);
await validateGeneratedLinks(await walk(output));
console.log(`Built ${pages.length + 1} HTML pages in ${path.relative(root, output)}/`);

async function createMarkdownPage(sourceFile, relative, suppliedMarkdown) {
  const markdown = suppliedMarkdown ?? await readFile(sourceFile, 'utf8');
  const pagePath = outputPathFor(relative);
  const context = pageContext(relative);
  const rendered = renderMarkdown(markdown, relative);
  const title = rendered.title || titleFromPath(relative);
  const description = firstParagraph(markdown);
  const html = renderPage({
    body: rendered.html,
    description,
    headings: rendered.headings,
    pagePath,
    relative,
    status: context.status,
    title
  });

  await mkdir(path.dirname(pagePath), { recursive: true });
  await writeFile(pagePath, html);
  return { description, href: siteHrefFor(relative), status: context.status, title };
}

async function createArtifactPage(sourceFile, relative) {
  const source = await readFile(sourceFile, 'utf8');
  const pagePath = outputPathFor(relative);
  const extension = path.extname(relative).slice(1);
  const title = path.basename(relative);
  const rawHref = relativeHref(pagePath, path.join(output, relative));
  const body = `<div class="artifact-actions"><a class="button-link" href="${escapeAttribute(rawHref)}" download>Download raw artifact</a></div>\n${renderCodeBlock(source.trimEnd(), extension)}`;
  const context = pageContext(relative);
  const html = renderPage({
    body,
    description: `Machine-readable ${extension.toUpperCase()} artifact.`,
    headings: [],
    pagePath,
    relative,
    status: context.status,
    title
  });

  await mkdir(path.dirname(pagePath), { recursive: true });
  await writeFile(pagePath, html);
  return { description: `${extension.toUpperCase()} artifact`, href: siteHrefFor(relative), status: context.status, title };
}

async function createSearchPage(pageEntries) {
  const pagePath = path.join(output, 'search', 'index.html');
  const data = JSON.stringify(pageEntries).replaceAll('<', '\\u003c');
  const body = `<div class="search-results" id="search-results"><p>Enter a term in the search field.</p></div>
<script type="application/json" id="search-index">${data}</script>
<script>
  const query = new URLSearchParams(location.search).get('q')?.trim() || '';
  const target = document.querySelector('#search-results');
  if (query) {
    const terms = query.toLowerCase().split(/\\s+/);
    const pages = JSON.parse(document.querySelector('#search-index').textContent);
    const matches = pages.filter((page) => terms.every((term) => (page.title + ' ' + page.description).toLowerCase().includes(term)));
    document.title = 'Search: ' + query + ' | API Specifications';
    target.innerHTML = matches.length ? matches.map((page) => '<article class="search-result"><h2><a href="../' + page.href + '">' + escapeHtml(page.title) + '</a></h2><p>' + escapeHtml(page.description) + '</p></article>').join('') : '<p>No documents match <strong>' + escapeHtml(query) + '</strong>.</p>';
  }
  function escapeHtml(value) { const node = document.createElement('span'); node.textContent = value; return node.innerHTML; }
</script>`;
  const html = renderPage({ body, description: 'Search the API specifications.', headings: [], pagePath, relative: 'search/', status: null, title: 'Search' });
  await mkdir(path.dirname(pagePath), { recursive: true });
  await writeFile(pagePath, html);
}

function renderPage({ body, description, headings, pagePath, relative, status, title }) {
  const homeHref = relativeHref(pagePath, path.join(output, 'index.html'));
  const stylesheetHref = relativeHref(pagePath, path.join(output, 'assets', 'site.css'));
  const scriptHref = relativeHref(pagePath, path.join(output, 'assets', 'site.js'));
  const searchHref = relativeHref(pagePath, path.join(output, 'search', 'index.html'));
  const currentHref = path.relative(output, pagePath).split(path.sep).join('/');
  const context = pageContext(relative);
  const statusClass = status && statusDescriptions[status] ? ` status-${status}` : '';
  const statusBox = status ? `<aside class="status-box" aria-label="Document status"><strong>${escapeHtml(status)}</strong>: ${escapeHtml(statusDescriptions[status] || 'This document has a repository-defined status.')}</aside>` : '';
  const toc = headings.length > 1 ? `<nav class="toc" aria-labelledby="toc-title"><h2 id="toc-title">Contents</h2><ol>${headings.map((heading) => `<li><a href="#${heading.id}">${escapeHtml(heading.text)}</a></li>`).join('')}</ol></nav>` : '';
  const eyebrow = context.release ? `${context.api} / ${context.release}${status ? ` / ${status}` : ''}` : context.section;

  return `<!doctype html>
<html lang="en" class="${statusClass.trim()}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeAttribute(description)}">
  <meta name="theme-color" content="#17242c">
  <title>${escapeHtml(title)} | API Specifications</title>
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%2317242c'/%3E%3Cpath d='M14 16h36v7H14zm0 13h27v7H14zm0 13h36v7H14z' fill='white'/%3E%3C/svg%3E">
  <link rel="stylesheet" href="${stylesheetHref}">
</head>
<body>
  <header class="site-header">
    <a class="brand" href="${homeHref}"><span class="brand-mark">SPEC</span><span><span class="brand-name">API Specifications</span><span class="brand-note">Versioned implementation contracts</span></span></a>
    <form class="search-form" action="${searchHref}" role="search"><input type="search" name="q" aria-label="Search specifications" placeholder="Search specifications"><button type="submit">Search</button></form>
  </header>
  <div class="status-stripe"></div>
  <div class="page-grid">
    ${renderNavigation(currentHref, pagePath, context)}
    <main class="document">
      <header class="document-head"><p class="eyebrow">${escapeHtml(eyebrow)}</p><h1>${escapeHtml(title)}</h1>${description ? `<p class="document-summary">${escapeHtml(description)}</p>` : ''}</header>
      ${statusBox}${toc}<article class="prose">${body}</article>
      <footer class="site-footer">Generated from the repository source. Dated published releases remain immutable.</footer>
    </main>
  </div>
  <script src="${scriptHref}" defer></script>
</body>
</html>
`;
}

function renderNavigation(currentHref, pagePath, context) {
  const groups = [
    ['Repository', [
      ['Home', 'README.md'], ['API index', 'apis/README.md'], ['Contributing', 'CONTRIBUTING.md'], ['Security', 'SECURITY.md']
    ]],
    ['Guides', [
      ['Repository conventions', 'docs/repository-conventions.md'], ['Versioning', 'docs/versioning.md'], ['Modification protocol', 'docs/specification-modification-protocol.md'], ['Security review', 'docs/security-review.md']
    ]]
  ];

  if (context.api) {
    const apiBase = `apis/${context.api}`;
    const apiLinks = [['API overview', `${apiBase}/README.md`]];
    for (const release of releaseMetadata.get(context.api) || []) {
      apiLinks.push([release.name, `${apiBase}/releases/${release.name}/README.md`, release.status]);
    }
    groups.push([context.api, apiLinks]);
  }

  if (context.release) {
    const base = `apis/${context.api}/releases/${context.release}`;
    const files = sourceFiles
      .map(relativeFromRoot)
      .filter((file) => file.startsWith(`${base}/`) && (file.endsWith('.md') || artifactExtensions.has(path.extname(file))))
      .sort(navigationSort);
    groups.push([context.release, files.map((file) => [navigationLabel(file, base), file])]);
  }

  const content = groups.map(([label, links]) => `<h2>${escapeHtml(label)}</h2><ul>${links.map(([text, target, linkStatus]) => {
    const targetPath = outputPathFor(target);
    const href = relativeHref(pagePath, targetPath);
    const targetHref = path.relative(output, targetPath).split(path.sep).join('/');
    return `<li><a href="${escapeAttribute(href)}"${targetHref === currentHref ? ' aria-current="page"' : ''}>${escapeHtml(text)}${linkStatus ? `<span class="nav-status">${escapeHtml(linkStatus)}</span>` : ''}</a></li>`;
  }).join('')}</ul>`).join('');
  return `<nav class="site-nav" aria-label="Site navigation">${content}</nav>`;
}

function renderMarkdown(markdown, relative) {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n');
  const outputLines = [];
  const headings = [];
  const usedIds = new Map();
  let title = '';
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) { index += 1; continue; }

    const fence = line.match(/^```([^`]*)$/);
    if (fence) {
      const code = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith('```')) code.push(lines[index++]);
      index += 1;
      outputLines.push(renderCodeBlock(code.join('\n'), fence[1].trim()));
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const text = stripInlineMarkdown(heading[2]);
      if (level === 1 && !title) title = text;
      else {
        const baseId = slug(text) || 'section';
        const count = usedIds.get(baseId) || 0;
        usedIds.set(baseId, count + 1);
        const id = count ? `${baseId}-${count + 1}` : baseId;
        if (level <= 3) headings.push({ id, text });
        outputLines.push(`<h${level} id="${id}">${renderInline(heading[2], relative)}<a class="heading-anchor" href="#${id}" aria-label="Link to ${escapeAttribute(text)}">#</a></h${level}>`);
      }
      index += 1;
      continue;
    }

    if (/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
      outputLines.push('<hr>'); index += 1; continue;
    }

    if (line.includes('|') && index + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[index + 1])) {
      const rows = [splitTableRow(line)];
      index += 2;
      while (index < lines.length && lines[index].includes('|') && lines[index].trim()) rows.push(splitTableRow(lines[index++]));
      const header = rows.shift();
      outputLines.push(`<div class="table-wrap"><table><thead><tr>${header.map((cell) => `<th>${renderInline(cell, relative)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${header.map((_, cellIndex) => `<td>${renderInline(row[cellIndex] || '', relative)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }

    const list = line.match(/^\s*(?:([-*+])|(\d+)\.)\s+(.+)$/);
    if (list) {
      const ordered = Boolean(list[2]);
      const items = [];
      while (index < lines.length) {
        const match = lines[index].match(/^\s*(?:([-*+])|(\d+)\.)\s+(.+)$/);
        if (!match || Boolean(match[2]) !== ordered) break;
        let item = match[3];
        index += 1;
        while (index < lines.length && /^\s{2,}\S/.test(lines[index]) && !/^\s*(?:[-*+]|\d+\.)\s+/.test(lines[index])) item += ` ${lines[index++].trim()}`;
        items.push(`<li>${renderInline(item, relative)}</li>`);
      }
      const tag = ordered ? 'ol' : 'ul';
      outputLines.push(`<${tag}>${items.join('')}</${tag}>`);
      continue;
    }

    if (line.startsWith('>')) {
      const quote = [];
      while (index < lines.length && lines[index].startsWith('>')) quote.push(lines[index++].replace(/^>\s?/, ''));
      outputLines.push(`<blockquote><p>${renderInline(quote.join(' '), relative)}</p></blockquote>`);
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (index < lines.length && lines[index].trim() && !startsBlock(lines, index)) paragraph.push(lines[index++].trim());
    outputLines.push(`<p>${renderInline(paragraph.join(' '), relative)}</p>`);
  }

  return { headings, html: outputLines.join('\n'), title };
}

function renderInline(value, relative) {
  const tokens = [];
  const reserve = (html) => `\u0000${tokens.push(html) - 1}\u0000`;
  let result = value.replace(/`([^`]+)`/g, (_, code) => reserve(`<code>${escapeHtml(code)}</code>`));
  result = escapeHtml(result);
  result = result.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (_, alt, target, title) => {
    const href = rewriteContentHref(target, relative);
    return reserve(`<img src="${escapeAttribute(href)}" alt="${escapeAttribute(alt)}"${title ? ` title="${escapeAttribute(title)}"` : ''}>`);
  });
  result = result.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (_, label, target, title) => {
    const href = rewriteContentHref(target, relative);
    const external = /^(?:https?:|mailto:)/.test(target);
    return reserve(`<a href="${escapeAttribute(href)}"${title ? ` title="${escapeAttribute(title)}"` : ''}${external ? ' rel="external"' : ''}>${label}</a>`);
  });
  result = result.replace(/\*\*([^*]+)\*\*|__([^_]+)__/g, '<strong>$1$2</strong>');
  result = result.replace(/(?<!\*)\*([^*]+)\*|(?<!_)_([^_]+)_/g, '<em>$1$2</em>');
  result = result.replace(/\u0000(\d+)\u0000/g, (_, token) => tokens[Number(token)]);
  return result;
}

function renderCodeBlock(source, language) {
  return `<pre class="code-block">${language ? `<span class="code-language">${escapeHtml(language)}</span>` : ''}<button class="copy-button" type="button">Copy</button><code>${escapeHtml(source)}</code></pre>`;
}

function rewriteContentHref(target, sourceRelative) {
  if (/^(?:[a-z]+:|#|\/\/)/i.test(target)) return target;
  const [pathname, suffix = ''] = target.split(/(?=[?#])/);
  if (!pathname) return target;
  const decoded = decodeURI(pathname);
  const absoluteSource = path.join(root, sourceRelative);
  const resolved = pathname.startsWith('/') ? path.join(root, decoded) : path.resolve(path.dirname(absoluteSource), decoded);
  const sourceTarget = relativeFromRoot(resolved);
  const extension = path.extname(sourceTarget).toLowerCase();
  if (extension === '.md' || artifactExtensions.has(extension) || !extension) {
    const sourcePage = outputPathFor(sourceRelative);
    const targetPage = outputPathFor(sourceTarget);
    return `${relativeHref(sourcePage, targetPage)}${suffix}`;
  }
  return target;
}

function outputPathFor(relative) {
  const normalized = relative.split(path.sep).join('/');
  if (normalized.endsWith('/')) return path.join(output, normalized, 'index.html');
  if (normalized.endsWith('/README.md')) return path.join(output, normalized.slice(0, -'/README.md'.length), 'index.html');
  if (normalized === 'README.md') return path.join(output, 'index.html');
  if (normalized === 'LICENSE') return path.join(output, 'LICENSE.html');
  if (normalized.endsWith('.md') || artifactExtensions.has(path.extname(normalized))) return path.join(output, `${normalized.replace(/\.md$/, '')}.html`);
  return path.join(output, normalized, 'index.html');
}

function siteHrefFor(relative) {
  return path.relative(output, outputPathFor(relative)).split(path.sep).join('/');
}

function pageContext(relative) {
  const normalized = relative.split(path.sep).join('/');
  const releaseMatch = normalized.match(/^apis\/([^/]+)\/releases\/([^/]+)/);
  if (releaseMatch) {
    const [, api, release] = releaseMatch;
    const metadata = (releaseMetadata.get(api) || []).find((entry) => entry.name === release);
    return { api, release, section: 'API specification', status: metadata?.status || null };
  }
  if (normalized === 'apis/README.md') return { api: null, release: null, section: 'API index', status: null };
  const apiMatch = normalized.match(/^apis\/([^/]+)/);
  if (apiMatch) return { api: apiMatch[1], release: null, section: 'API specification', status: null };
  if (normalized.startsWith('docs/')) return { api: null, release: null, section: 'Repository guide', status: null };
  if (normalized.startsWith('templates/')) return { api: null, release: null, section: 'Specification template', status: null };
  return { api: null, release: null, section: 'Specification repository', status: null };
}

async function readReleaseMetadata(files) {
  const metadata = new Map();
  for (const file of files.filter((entry) => /apis[/\\][^/\\]+[/\\]releases[/\\][^/\\]+[/\\]README\.md$/.test(entry))) {
    const relative = relativeFromRoot(file);
    const match = relative.match(/^apis\/([^/]+)\/releases\/([^/]+)\/README\.md$/);
    const source = await readFile(file, 'utf8');
    const status = source.match(/^- Status:\s*`?([^`\n]+)`?\s*$/mi)?.[1].trim().toLowerCase() || 'unspecified';
    if (!metadata.has(match[1])) metadata.set(match[1], []);
    metadata.get(match[1]).push({ name: match[2], status });
  }
  for (const releases of metadata.values()) releases.sort((left, right) => right.name.localeCompare(left.name));
  return metadata;
}

async function validateGeneratedLinks(files) {
  const htmlFiles = files.filter((file) => file.endsWith('.html'));
  const missing = [];
  for (const file of htmlFiles) {
    const html = await readFile(file, 'utf8');
    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const target = match[1];
      if (/^(?:[a-z]+:|#|\/\/|data:)/i.test(target) || target.includes("' +")) continue;
      const pathname = decodeURI(target.split('#')[0].split('?')[0]);
      if (!pathname) continue;
      const resolved = path.resolve(path.dirname(file), pathname);
      try { await stat(resolved); } catch { missing.push(`${path.relative(root, file)} -> ${target}`); }
    }
  }
  if (missing.length) throw new Error(`Broken generated links:\n${missing.join('\n')}`);
}

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

function startsBlock(lines, index) {
  const line = lines[index];
  return /^```|^#{1,6}\s|^\s*(?:[-*+] |\d+\. )|^>|^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line) || (line.includes('|') && /^\s*\|?\s*:?-{3,}/.test(lines[index + 1] || ''));
}

function splitTableRow(line) {
  return line.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((cell) => cell.trim().replaceAll('\\|', '|'));
}

function firstParagraph(markdown) {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n');
  let index = lines.findIndex((line) => line.startsWith('# ')) + 1;
  while (index < lines.length && (!lines[index].trim() || /^[-*] /.test(lines[index]))) index += 1;
  const paragraph = [];
  while (index < lines.length && lines[index].trim() && !startsBlock(lines, index)) paragraph.push(lines[index++].trim());
  return stripInlineMarkdown(paragraph.join(' ')).slice(0, 240);
}

function stripInlineMarkdown(value) {
  return value.replace(/!??\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[`*~]/g, '').trim();
}

function titleFromPath(relative) {
  const base = path.basename(relative, path.extname(relative));
  return base === 'README' ? path.basename(path.dirname(relative)) || 'API Specifications' : base.replaceAll('-', ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

function navigationLabel(file, base) {
  const local = file.slice(base.length + 1);
  if (local === 'README.md') return 'Release overview';
  if (local === 'documents/README.md') return 'Protocol overview';
  return local.replace(/\.(?:md|json|ya?ml)$/, '').replaceAll('/', ' / ').replaceAll('-', ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

function navigationSort(left, right) {
  const rank = (file) => file.endsWith('/README.md') ? 0 : file.includes('/documents/') ? 1 : file.endsWith('/CHANGELOG.md') ? 2 : file.includes('/specifications/') ? 3 : file.includes('/schemas/') ? 4 : 5;
  return rank(left) - rank(right) || left.localeCompare(right);
}

function relativeHref(fromPage, target) {
  let relative = path.relative(path.dirname(fromPage), target).split(path.sep).join('/');
  if (!relative) relative = path.basename(target);
  return encodeURI(relative);
}

function relativeFromRoot(file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/[\s-]+/g, '-');
}

function escapeHtml(value = '') {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function escapeAttribute(value = '') {
  return escapeHtml(value).replaceAll("'", '&#39;');
}
