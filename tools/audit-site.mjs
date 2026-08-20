import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const excluded = new Set(['.git', '.wrangler', '.vercel', 'deploy', 'node_modules', '归档']);
const expectedPhone = '8618632666061';
const issues = [];

async function collectHtml(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory() && !excluded.has(entry.name)) {
      files.push(...await collectHtml(path.join(directory, entry.name)));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(path.join(directory, entry.name));
    }
  }
  return files;
}

function resolveLocal(file, value, type) {
  const clean = value.trim().split(/[?#]/)[0];
  if (!clean || /^(?:https?:|mailto:|tel:|javascript:|data:|\/\/)/i.test(clean)) return null;
  const decoded = (() => { try { return decodeURIComponent(clean); } catch { return clean; } })();
  let candidate = decoded.startsWith('/')
    ? path.resolve(root, decoded.replace(/^\//, ''))
    : path.resolve(path.dirname(file), decoded);
  if (type === 'href' && decoded === '/') return path.join(root, 'index.html');
  if (type === 'href' && decoded.endsWith('/')) return path.join(candidate, 'index.html');
  if (type === 'href' && !path.extname(candidate)) candidate += '.html';
  return candidate;
}

const files = (await collectHtml(root)).sort();
let imageCount = 0;
let blankAltCount = 0;
let optimizedImageRefs = 0;
let imagesWithoutLoading = 0;

for (const file of files) {
  const relative = path.relative(root, file).split(path.sep).join('/');
  const html = await readFile(file, 'utf8');
  const requireCount = (pattern, expected, label) => {
    const count = (html.match(pattern) || []).length;
    if (count !== expected) issues.push(`${relative}: expected ${expected} ${label}, found ${count}`);
  };

  requireCount(/<title\b/gi, 1, 'title');
  requireCount(/<h1\b/gi, 1, 'H1');
  requireCount(/rel=["']canonical["']/gi, 1, 'canonical');
  requireCount(/application\/ld\+json/gi, 1, 'JSON-LD block');
  if (!/<meta\b[^>]*name=["']description["']/i.test(html)) issues.push(`${relative}: missing meta description`);
  if (!html.includes(expectedPhone) && !html.includes('+86 186 3266 6061')) issues.push(`${relative}: missing current contact number`);
  if (/13802389591|\+86(?:-|\s*)138(?:-|\s*)0238(?:-|\s*)9591/.test(html)) issues.push(`${relative}: contains retired contact number`);

  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(match[1]); } catch (error) { issues.push(`${relative}: invalid JSON-LD (${error.message})`); }
  }

  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) issues.push(`${relative}: duplicate IDs ${[...new Set(duplicates)].join(', ')}`);

  for (const match of html.matchAll(/<img\b[^>]*(?:src|data-src)=["']([^"']+)["'][^>]*>/gi)) {
    imageCount += 1;
    const tag = match[0];
    const value = match[1];
    if (/\balt=["']\s*["']/i.test(tag)) blankAltCount += 1;
    if (!/\bloading=["']/i.test(tag)) imagesWithoutLoading += 1;
    if (value.includes('/optimized/')) optimizedImageRefs += 1;
    const local = resolveLocal(file, value, 'asset');
    if (local) {
      try { await readFile(local); } catch { issues.push(`${relative}: missing image ${value}`); }
    }
  }

  for (const match of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)=["']([^"']+)["'][^>]*>/gi)) {
    const value = match[1];
    const local = resolveLocal(file, value, 'asset');
    if (local) {
      try { await readFile(local); } catch { issues.push(`${relative}: missing asset ${value}`); }
    }
  }

  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)) {
    const value = match[1];
    const local = resolveLocal(file, value, 'href');
    if (local) {
      try { await readFile(local); } catch { issues.push(`${relative}: broken internal link ${value}`); }
    }
  }
}

const headers = await readFile(path.join(root, '_headers'), 'utf8');
for (const header of ['X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy']) {
  if (!headers.includes(header)) issues.push(`_headers: missing ${header}`);
}
if (imagesWithoutLoading) issues.push(`${imagesWithoutLoading} images are missing an explicit loading strategy`);

const report = {
  pages: files.length,
  images: imageCount,
  optimizedImageReferences: optimizedImageRefs,
  imagesWithoutLoading,
  decorativeBlankAlts: blankAltCount,
  issues: [...new Set(issues)]
};

console.log(JSON.stringify(report, null, 2));
if (report.issues.length) process.exitCode = 1;
