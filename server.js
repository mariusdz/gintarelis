/**
 * Gintarėlis – lightweight Node.js server
 *
 * Serves the static public website and a small read-only
 * JSON API (news RSS proxy).
 */
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const ROOT = __dirname;
const PORT = process.env.PORT || 8080;

const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".jfif": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
};

function getMime(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
}

function safeJoin(root, target) {
  const resolved = path.resolve(path.join(root, target));
  if (!resolved.startsWith(path.resolve(root))) {
    return null;
  }
  return resolved;
}

/* ---------- Security ---------- */

// Paths that must never be served: VCS/dotfiles, server internals,
// dependencies, tooling and content drafts.
const BLOCKED_PREFIXES = ["/node_modules", "/tools", "/scripts", "/data/source"];
const BLOCKED_FILES = new Set(["/server.js", "/package.json", "/package-lock.json", "/README.md"]);

function isBlockedPath(pathname) {
  if (BLOCKED_FILES.has(pathname)) return true;
  if (BLOCKED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) return true;
  // Any dotfile segment (e.g. /.git/config, /.env).
  return pathname.split("/").some((seg) => seg.startsWith("."));
}

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://unpkg.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "frame-src https://www.google.com https://maps.google.com",
    "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'self'",
  ].join("; "),
};

function applySecurityHeaders(res) {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.setHeader(k, v);
}

// Simple per-IP rate limiter: 300 requests / minute.
const RATE_LIMIT = 300;
const RATE_WINDOW = 60 * 1000;
const rateBuckets = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  let bucket = rateBuckets.get(ip);
  if (!bucket || now - bucket.start > RATE_WINDOW) {
    bucket = { start: now, count: 0 };
    rateBuckets.set(ip, bucket);
  }
  bucket.count += 1;
  // Occasional cleanup so the map does not grow unbounded.
  if (rateBuckets.size > 5000) {
    for (const [key, b] of rateBuckets) {
      if (now - b.start > RATE_WINDOW) rateBuckets.delete(key);
    }
  }
  return bucket.count > RATE_LIMIT;
}

async function serveStatic(req, res, filePath, pathname) {
  try {
    const stats = await stat(filePath);
    if (stats.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }
    const data = await readFile(filePath);
    const isContentJson = pathname === "/data/content.json";
    res.writeHead(200, {
      "Content-Type": getMime(filePath),
      "Content-Length": data.length,
      "Cache-Control": isContentJson ? "no-cache, no-store, must-revalidate" : "public, max-age=3600",
    });
    res.end(data);
  } catch (err) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Puslapis nerastas.");
  }
}

// Live news RSS proxy (cached 5 minutes)
let newsCache = null;
let newsCacheTime = 0;
const NEWS_CACHE_TTL = 5 * 60 * 1000;
// Per-article image lookup cache (article URL -> image URL or "").
// Persists across news refreshes so each article page is fetched once.
const articleImageCache = new Map();

const MAX_REDIRECTS = 3;

function fetchUrl(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > MAX_REDIRECTS) {
      reject(new Error("Too many redirects"));
      return;
    }
    const client = url.startsWith("https:") ? https : http;
    const req = client.get(
      url,
      { headers: { "User-Agent": "Gintarelis-NewsBot/1.0" }, timeout: 10000 },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          fetchUrl(res.headers.location, redirects + 1).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      }
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy(new Error("Request timeout"));
    });
  });
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
}

function stripHtml(str) {
  return str.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function truncate(text, len = 160) {
  if (!text) return "";
  if (text.length <= len) return text;
  return text.slice(0, len).replace(/\s+\S*$/, "") + "…";
}

// First real content image from item HTML (skips WordPress emoji images).
function extractImage(html) {
  if (!html) return "";
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    if (src.includes("s.w.org/images/core/emoji")) continue;
    if (src.includes("wp-content/uploads") || /\.(png|jpe?g|gif|webp|avif)(\?|#|$)/i.test(src)) {
      return src;
    }
  }
  return "";
}

/* ---------- article-page image extraction (fallback when RSS has none) ---------- */

function isValidImageUrl(src) {
  if (!src) return false;
  if (!/^https?:\/\//i.test(src)) return false;
  if (src.includes("s.w.org/images/core/emoji")) return false;
  return true;
}

function extractMetaContent(html, attr, value) {
  const tagRe = new RegExp("<meta[^>]+" + attr + '=["\']' + value + '["\'][^>]*>', "i");
  const tag = html.match(tagRe);
  if (!tag) return "";
  const c = tag[0].match(/content=["']([^"']+)["']/i);
  return c ? c[1].trim() : "";
}

function findImgSrc(tag) {
  const m = tag && tag.match(/src=["']([^"']+)["']/i);
  return m ? m[1].trim() : "";
}

// First usable image within `limit` chars after a content-area marker.
function imageAfter(html, markerRe, limit = 30000) {
  const m = html.match(markerRe);
  if (!m) return "";
  return extractImage(html.slice(m.index, m.index + limit));
}

function extractArticleImage(html) {
  if (!html) return "";
  const candidates = [];

  // 1. Open Graph / Twitter Card
  candidates.push(extractMetaContent(html, "property", "og:image"));
  candidates.push(extractMetaContent(html, "name", "twitter:image"));

  // 2. WordPress featured image (class-based, then wrapper-based)
  const featImg = html.match(/<img[^>]+class=["'][^"']*(?:wp-post-image|attachment-(?:post-thumbnail|full|large))[^"']*["'][^>]*>/i);
  if (featImg) candidates.push(findImgSrc(featImg[0]));
  candidates.push(imageAfter(html, /<(?:div|figure)[^>]+class=["'][^"']*(?:post-thumbnail|featured-image|entry-image)[^"']*["'][^>]*>/i, 3000));

  // 3. First image inside the article content
  candidates.push(imageAfter(html, /<div[^>]+class=["'][^"']*entry-content[^"']*["'][^>]*>/i));
  candidates.push(imageAfter(html, /<article[\s>]/i));

  for (const c of candidates) {
    if (isValidImageUrl(c)) return decodeEntities(c);
  }
  return "";
}

function parseRss(xml) {
  const items = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null && items.length < 12) {
    const block = match[1];
    const title = (block.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "";
    const link = (block.match(/<link[^>]*>([\s\S]*?)<\/link>/i) || [])[1] || "";
    const pubDate = (block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) || [])[1] || "";
    const description = (block.match(/<description[^>]*>([\s\S]*?)<\/description>/i) || [])[1] || "";
    const contentEncoded = (block.match(/<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i) || [])[1] || "";
    const rawExcerpt = description || contentEncoded;
    const cleanTitle = stripHtml(decodeEntities(title));
    const cleanExcerpt = truncate(stripHtml(decodeEntities(rawExcerpt)));
    const image = extractImage(contentEncoded || description);
    const dateObj = new Date(pubDate);
    const date = isNaN(dateObj.getTime()) ? "" : dateObj.toISOString().split("T")[0];
    if (cleanTitle && link) {
      items.push({ title: cleanTitle, link: link.trim(), date, excerpt: cleanExcerpt, image });
    }
  }
  return items;
}

async function getNews() {
  const now = Date.now();
  if (newsCache && now - newsCacheTime < NEWS_CACHE_TTL) return newsCache;
  const xml = await fetchUrl("https://www.klaipedosgiliukas.lt/category/turistu-g-30-klaipeda/feed/");
  const items = parseRss(xml);

  // For items without an image in the feed, scrape the article page:
  // og:image -> twitter:image -> featured image -> first content image.
  await Promise.all(
    items.map(async (item) => {
      if (item.image) return;
      if (articleImageCache.has(item.link)) {
        item.image = articleImageCache.get(item.link);
        return;
      }
      try {
        const html = await fetchUrl(item.link);
        item.image = extractArticleImage(html);
      } catch (err) {
        console.error("Article image fetch failed:", item.link, err.message);
        item.image = "";
      }
      articleImageCache.set(item.link, item.image);
    })
  );

  newsCache = items;
  newsCacheTime = now;
  return items;
}

const server = http.createServer(async (req, res) => {
  applySecurityHeaders(res);

  // CORS – allow public reads.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Read-only server: anything beyond GET/HEAD is not supported.
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8", Allow: "GET, OPTIONS" });
    res.end("Metodas neleidžiamas.");
    return;
  }

  if (isRateLimited(req.socket.remoteAddress || "unknown")) {
    res.writeHead(429, { "Content-Type": "text/plain; charset=utf-8", "Retry-After": "60" });
    res.end("Per daug užklausų. Pabandykite vėliau.");
    return;
  }

  let pathname;
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    pathname = decodeURIComponent(url.pathname);
  } catch (err) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Neteisinga užklausa.");
    return;
  }

  try {
    // API routes
    if (pathname === "/api/news") {
      try {
        const items = await getNews();
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ items }));
      } catch (err) {
        console.error("RSS fetch error:", err.message);
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ items: [] }));
      }
      return;
    }

    if (pathname.startsWith("/api/")) {
      res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: "API route not found" }));
      return;
    }

    // Never serve server internals, dependencies, tooling or dotfiles.
    if (isBlockedPath(pathname)) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Puslapis nerastas.");
      return;
    }

    // Static files
    const target = pathname === "/" ? "/index.html" : pathname;
    const filePath = safeJoin(ROOT, target);
    if (!filePath) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Negalima pasiekti.");
      return;
    }
    await serveStatic(req, res, filePath, pathname);
  } catch (err) {
    console.error(err);
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Serverio klaida.");
  }
});

server.listen(PORT, () => {
  console.log(`Gintarėlis server running at http://localhost:${PORT}`);
});
