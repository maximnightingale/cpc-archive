export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html') && !contentType.includes('text/css')) {
    return response;
  }
  const CDN_BASE = 'https://cdn.jsdelivr.net/gh/maximnightingale/cpc-archive@gh-pages';
  if (contentType.includes('text/css')) {
    const text = await response.text();
    const replaced = text.replace(/\/fonts\//g, `${CDN_BASE}/fonts/`);
    return new Response(replaced, {
      status: response.status,
      headers: {
        ...response.headers,
        'content-type': 'text/css',
        'content-length': String(replaced.length)
      }
    });
  }
  return new HTMLRewriter().on('*', {
    element(element) {
      ['href', 'src'].forEach(attr => {
        const value = element.getAttribute(attr);
        if (value && ['/fonts/', '/img/'].some(p => value.startsWith(p))) {
          element.setAttribute(attr, CDN_BASE + value);
        }
      });
    }
  }).transform(response);
}