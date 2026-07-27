import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const domain = 'https://zhrjshelving.com';
const write = process.argv.includes('--write');

const excludedDirectories = new Set([
  '.git', '.wrangler', '.vercel', 'deploy', 'node_modules', '归档'
]);

async function collectHtml(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!excludedDirectories.has(entry.name)) {
        files.push(...await collectHtml(path.join(dir, entry.name)));
      }
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

function decodeEntities(value) {
  return (value || '')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripTags(value) {
  return decodeEntities((value || '').replace(/<[^>]+>/g, ' '));
}

function extractMeta(html, key) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const name = tag.match(/\bname=(["'])(.*?)\1/i)?.[2];
    if (name?.toLowerCase() !== key.toLowerCase()) continue;
    return tag.match(/\bcontent=(["'])(.*?)\1/i)?.[2] || '';
  }
  return '';
}

function canonicalFor(relativePath) {
  const webPath = relativePath.split(path.sep).join('/');
  if (webPath === 'index.html') return domain + '/';
  return domain + '/' + webPath.replace(/\.html$/i, '');
}

function prefixFor(relativePath) {
  const depth = relativePath.split(path.sep).length - 1;
  return depth > 0 ? '../'.repeat(depth) : '';
}

function absoluteAssetUrl(value, canonical) {
  const clean = (value || '').trim();
  if (!clean || /^(data:|https?:|\/\/)/i.test(clean)) return clean;
  try {
    return new URL(clean, canonical).href;
  } catch {
    return '';
  }
}

function addOrReplaceCanonical(html, canonical) {
  const tag = `<link rel="canonical" href="${canonical}">`;
  if (/<link\b[^>]*rel=["']canonical["'][^>]*>/i.test(html)) {
    return html.replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/i, tag);
  }
  return html.replace('</title>', `</title>\n${tag}`);
}

function ensureThemeColor(html) {
  if (/<meta\b[^>]*name=["']theme-color["']/i.test(html)) return html;
  return html.replace('</title>', '</title>\n<meta name="theme-color" content="#081117">');
}

function ensureDescription(html, title) {
  if (extractMeta(html, 'description')) return html;
  const content = `${title} from ZHENGHERUNJI, a wire shelving manufacturer established in 1999 with OEM and ODM support for global buyers.`;
  return html.replace('</title>', `</title>\n<meta name="description" content="${content.replace(/"/g, '&quot;')}">`);
}

function ensureH1(html, relativePath) {
  if (/<h1\b/i.test(html)) return html;

  if (relativePath.split(path.sep)[0] === 'products') {
    const productTitle = /<div(\s+class=(["'])t1 v24 color-3 f-Bold\2[^>]*)>([\s\S]*?)<\/div>/i;
    if (productTitle.test(html)) {
      return html.replace(productTitle, '<h1$1>$3</h1>');
    }
  }

  const heroTitle = /<div(\s+class=(["'])tit\b[^"']*\2[^>]*)>([\s\S]*?)<\/div>/i;
  if (heroTitle.test(html)) {
    return html.replace(heroTitle, '<h1$1>$3</h1>');
  }

  const firstH2 = /<h2\b([^>]*)>([\s\S]*?)<\/h2>/i;
  if (firstH2.test(html)) {
    return html.replace(firstH2, '<h1$1>$2</h1>');
  }

  return html;
}

function ensureSharedAssets(html, prefix) {
  const cssHref = `${prefix}static/home/css/site-foundation.css?v=20260727-4`;
  const jsSrc = `${prefix}static/home/js/site-foundation.js?v=20260727-4`;

  if (html.includes('site-foundation.css')) {
    html = html.replace(/(?:\.\.\/)*static\/home\/css\/site-foundation\.css\?v=[^"']+/i, cssHref);
  } else {
    html = html.replace('</head>', `    <link rel="stylesheet" href="${cssHref}">\n</head>`);
  }
  if (html.includes('site-foundation.js')) {
    html = html.replace(/(?:\.\.\/)*static\/home\/js\/site-foundation\.js\?v=[^"']+/i, jsSrc);
  } else {
    html = html.replace('</body>', `    <script defer src="${jsSrc}"></script>\n</body>`);
  }
  return html;
}

function organizationSchema() {
  return {
    '@type': 'Organization',
    '@id': `${domain}/#organization`,
    name: 'ZHENGHERUNJI',
    alternateName: '正合润极',
    url: `${domain}/`,
    logo: `${domain}/upload/images/site/20260707/zhengherunji-logo-white-gold.jpg`,
    email: 'mailto:zhengherunji@gmail.com',
    telephone: '+86-138-0238-9591',
    foundingDate: '1999',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Huayu Shelving Factory No. 1',
      addressLocality: 'Bazhou',
      addressRegion: 'Hebei',
      addressCountry: 'CN'
    },
    sameAs: [
      'https://www.instagram.com/hebei.zhengherunji',
      'https://www.tiktok.com/@hebei.zhengherunj'
    ]
  };
}

function schemaFor(html, relativePath, canonical, title, description) {
  const graph = [organizationSchema()];

  graph.push({
    '@type': 'WebSite',
    '@id': `${domain}/#website`,
    url: `${domain}/`,
    name: 'ZHENGHERUNJI Wire Shelving',
    publisher: { '@id': `${domain}/#organization` },
    inLanguage: 'en'
  });

  const page = {
    '@type': 'WebPage',
    '@id': `${canonical}#webpage`,
    url: canonical,
    name: title,
    description,
    isPartOf: { '@id': `${domain}/#website` },
    about: { '@id': `${domain}/#organization` },
    inLanguage: 'en'
  };

  if (relativePath.split(path.sep)[0] === 'products') {
    const block = html.slice(Math.max(0, html.search(/class=["']md-prod-2/)));
    const imageSource = block.match(/<img\b[^>]*(?:src|data-src)=["']([^"']+)["']/i)?.[1] || '';
    const sku = stripTags(block.match(/Item\s*No[：:]?\s*([^<\r\n]+)/i)?.[1] || '');
    const product = {
      '@type': 'Product',
      '@id': `${canonical}#product`,
      name: title,
      description,
      brand: { '@type': 'Brand', name: 'ZHENGHERUNJI' },
      manufacturer: { '@id': `${domain}/#organization` }
    };
    const image = absoluteAssetUrl(imageSource, canonical);
    if (image) product.image = [image];
    if (sku) product.sku = sku;
    graph.push(product);
    page.mainEntity = { '@id': `${canonical}#product` };
  }

  graph.push(page);
  return { '@context': 'https://schema.org', '@graph': graph };
}

function ensureJsonLd(html, schema) {
  const json = JSON.stringify(schema).replace(/</g, '\\u003c');
  const tag = `<script type="application/ld+json">${json}</script>`;
  if (/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/i.test(html)) {
    return html.replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/i, tag);
  }
  return html.replace('</head>', `    ${tag}\n</head>`);
}

function normalizeBrandAndContact(html) {
  return html
    .replace(/\/?归档\/10\.png/g, 'upload/images/optimized/site/about-factory-campus.webp')
    .replace(/\/?归档\/9\.png/g, 'upload/images/optimized/site/commercial-kitchen-shelving.webp')
    .replace(/\/?归档\/7\.png/g, 'upload/images/optimized/site/home-laundry-shelving.webp')
    .replace(/\/?归档\/5\.png/g, 'upload/images/optimized/site/service-consultation.webp')
    .replace(/\/?归档\/6\.png/g, 'upload/images/optimized/site/contact-support.webp')
    .replace(/\/?归档\/丝网置物架储物间商品图美国\.png/g, 'upload/images/optimized/site/process-pantry-shelving.webp')
    .replace(/\/?归档\/丝网置物架浴室商品图美国\.png/g, 'upload/images/optimized/site/process-bathroom-shelving.webp')
    .replace(/https:\/\/www\.zs-cs\.com/gi, domain)
    .replace(/https:\/\/zs-cs\.com/gi, domain)
    .replace(/www\.zs-cs\.com/gi, domain)
    .replace(/Zhongshan\s+CHANGSHENG/gi, 'ZHENGHERUNJI')
    .replace(/CHANGSHENG METAL PRODUCTS/gi, 'ZHENGHERUNJI SHELVING')
    .replace(/\bCHANGSHENG\b/gi, 'ZHENGHERUNJI')
    .replace(/\bWELLAND\b/gi, 'ZHENGHERUNJI')
    .replace(/hangsheng factory's\s+zhengherunji brand since 1999\./gi, 'ZHENGHERUNJI has specialized in wire shelving manufacturing since 1999.')
    .replace(/Bazhou Shengfang zhengherunji Co\., Ltd\./gi, 'Bazhou Shengfang ZHENGHERUNJI Co., Ltd.')
    .replace(/\bzhengherunji(?=(?:'s|\s+(?:Manufacturer|Home|Industry|Custom|product|storage|shelving|brand|wire|logo|正合)))/gi, 'ZHENGHERUNJI')
    .replace(/About zhengherunji/gi, 'About ZHENGHERUNJI')
    .replace(/(>\s*)zhengherunji(\s*<)/gi, '$1ZHENGHERUNJI$2')
    .replace(/Fast response guaranteed\./gi, 'Direct support for international buyers.')
    .replace(/\s*<meta\s+name=["']author["']\s+content=["']网站建设：互诺科技 - http:\/\/www\.hunuo\.com["']\s*\/?>/gi, '')
    .replace(/\s*<meta\s+name=["']baidu-site-verification["']\s+content=["']code-xxxxxxxxxx["']\s*\/?>/gi, '')
    .replace(/(<meta\b[^>]*property=["']og:site_name["'][^>]*content=["'])[^"']*(["'][^>]*>)/gi, '$1ZHENGHERUNJI$2')
    .replace(/\s*<a\s+href=["']http:\/\/beian\.miit\.gov\.cn["']\s+target=["']_blank["']>\s*京ICP备17063119号-2\s*<\/a>\s*/gi, '\n')
    .replace(/\s*<!--\s*<a\s+href=["'][^"']*["']>Powered by hunuo\.com<\/a>\s*-->/gi, '')
    .replace(/CHANGSHENG Manufacturer/g, 'ZHENGHERUNJI Manufacturer')
    .replace(/WELLAND Home Storage/g, 'ZHENGHERUNJI Home Storage')
    .replace(/WELLAND Restaurant\/Cold Storage\/Plant Cultivation\/ESD Racks/g, 'ZHENGHERUNJI Restaurant, Cold Storage, Plant Cultivation and ESD Racks')
    .replace(/ZHONGSHAN CHANGSHENG METAL PRODUCTS CO\.,?LTD/gi, 'ZHENGHERUNJI SHELVING')
    .replace(/Copyright ©\s*zhongshan changsheng metal products co,?\.?ltd\s*all rights reserved/gi, 'Copyright © ZHENGHERUNJI. All rights reserved.')
    .replace(/Copyright ©\s*zhengherunji\s*all rights reserved/gi, 'Copyright © ZHENGHERUNJI. All rights reserved.')
    .replace(/\+1\(380\)238-9591/g, '+86 138 0238 9591')
    .replace(/tel:\+13802389591/g, 'tel:+8613802389591')
    .replace(/phone=13802389591/g, 'phone=8613802389591')
    .replace(/WELLAND\+English\+WEB\+inquiry/gi, 'ZHENGHERUNJI+English+WEB+inquiry');
}

function replacePropertyMeta(html, property, value) {
  const expression = new RegExp(`(<meta\\b[^>]*property=["']${property.replace(':', '\\:')}["'][^>]*content=["'])[^"']*(["'][^>]*>)`, 'i');
  if (expression.test(html)) return html.replace(expression, `$1${value}$2`);
  return html;
}

async function transform(file) {
  const relativePath = path.relative(root, file);
  const canonical = canonicalFor(relativePath);
  const prefix = prefixFor(relativePath);
  const original = await readFile(file, 'utf8');
  let html = normalizeBrandAndContact(original);

  const rawTitle = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || 'ZHENGHERUNJI Wire Shelving';
  const title = stripTags(rawTitle);
  html = ensureDescription(html, title);
  const description = decodeEntities(extractMeta(html, 'description'));
  html = ensureThemeColor(html);
  html = addOrReplaceCanonical(html, canonical);
  html = replacePropertyMeta(html, 'og:url', canonical);
  html = ensureH1(html, relativePath);
  html = ensureSharedAssets(html, prefix);
  html = ensureJsonLd(html, schemaFor(html, relativePath, canonical, title, description));

  if (write && html !== original) await writeFile(file, html, 'utf8');
  return {
    file: relativePath.split(path.sep).join('/'),
    canonical,
    changed: html !== original,
    h1: (html.match(/<h1\b/gi) || []).length,
    description: Boolean(extractMeta(html, 'description')),
    jsonLd: (html.match(/application\/ld\+json/gi) || []).length
  };
}

const files = (await collectHtml(root)).sort();
const results = [];
for (const file of files) results.push(await transform(file));

if (write) {
  const urls = results.map((item) => item.canonical);
  const today = new Date().toISOString().slice(0, 10);
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => {
      const priority = url === `${domain}/` ? '1.0' : url.includes('/products/') ? '0.7' : '0.8';
      return `  <url><loc>${url}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>${priority}</priority></url>`;
    }),
    '</urlset>',
    ''
  ].join('\n');
  await writeFile(path.join(root, 'sitemap.xml'), sitemap, 'utf8');
  await writeFile(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${domain}/sitemap.xml\n`, 'utf8');
}

console.log(JSON.stringify({ write, pages: results.length, changed: results.filter((r) => r.changed).length, results }, null, 2));
