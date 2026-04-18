/**
 * Cloudflare Pages Function — Markdown for Agents (free-tier DIY)
 *
 * If a client sends `Accept: text/markdown` (ranking at or above text/html), we
 * serve the pre-generated /index.md companion with Content-Type: text/markdown.
 * Otherwise we pass through to the static asset layer (index.html for browsers).
 *
 * This mirrors the behaviour of Cloudflare's paid "Markdown for Agents" feature
 * but without needing Pro/Business. We only hand out markdown when the client
 * explicitly asks for it, so human browsers keep getting the normal HTML site.
 *
 * Docs:
 *   https://developers.cloudflare.com/pages/functions/
 *   https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/
 */

/** Known path → markdown-companion mappings. Extend as the site grows. */
const MARKDOWN_ALTERNATES = {
  '/':           '/index.md',
  '/index.html': '/index.md',
};

function prefersMarkdown(acceptHeader) {
  if (!acceptHeader) return false;
  // Lowercase once, tokenise on ','. Accept q= values when ranking.
  const parts = acceptHeader.toLowerCase().split(',').map(s => s.trim());
  let mdQ = -1;
  let htmlQ = -1;
  for (const part of parts) {
    const [type, ...params] = part.split(';').map(s => s.trim());
    let q = 1;
    for (const p of params) {
      if (p.startsWith('q=')) q = parseFloat(p.slice(2)) || 0;
    }
    if (type === 'text/markdown') mdQ = Math.max(mdQ, q);
    if (type === 'text/html' || type === 'application/xhtml+xml') htmlQ = Math.max(htmlQ, q);
    if (type === '*/*' && mdQ < 0) mdQ = Math.max(mdQ, q * 0.01); // very weak signal
  }
  // Only treat as markdown preference if it beats html; otherwise browsers with
  // catch-all Accept headers would accidentally get markdown.
  return mdQ > 0 && mdQ >= htmlQ;
}

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  const mdPath = MARKDOWN_ALTERNATES[url.pathname];

  if (mdPath && request.method === 'GET' && prefersMarkdown(request.headers.get('Accept'))) {
    const mdRequest = new Request(new URL(mdPath, url.origin), {
      method: 'GET',
      headers: request.headers,
    });
    const mdResp = await next(mdRequest);
    if (mdResp && mdResp.ok) {
      const headers = new Headers(mdResp.headers);
      headers.set('Content-Type', 'text/markdown; charset=utf-8');
      headers.set('Vary', 'Accept');
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('X-Content-Negotiated', 'markdown');
      headers.set('Link', `<${url.origin}/>; rel="canonical"`);
      return new Response(mdResp.body, { status: mdResp.status, headers });
    }
  }

  // Pass-through. Ensure HTML responses carry Vary: Accept so downstream caches
  // know this URL is content-negotiated.
  const resp = await next();
  const contentType = resp.headers.get('Content-Type') || '';
  if (contentType.includes('text/html')) {
    const headers = new Headers(resp.headers);
    const existingVary = headers.get('Vary') || '';
    if (!existingVary.toLowerCase().split(',').map(s => s.trim()).includes('accept')) {
      headers.set('Vary', existingVary ? `${existingVary}, Accept` : 'Accept');
    }
    return new Response(resp.body, { status: resp.status, headers });
  }
  return resp;
}
