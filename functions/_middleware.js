export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return response;

  const CDN_BASE = 'https://cdn.jsdelivr.net/gh/maximnightingale/cpc-archive@gh-pages';
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