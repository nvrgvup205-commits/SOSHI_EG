const FALLBACK_API = 'https://soshi-eg-api.nvrgvup205.workers.dev';

const NO_CACHE = 'no-cache, no-store, must-revalidate';

function isHtmlAsset(pathname: string, contentType: string | null) {
  if (contentType?.includes('text/html')) return true;
  if (pathname === '/' || pathname.endsWith('.html')) return true;
  return !pathname.includes('.') && !pathname.startsWith('/api/');
}

function withNoCacheHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', NO_CACHE);
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: {
    ASSETS: { fetch: (request: Request) => Promise<Response> };
    API_ORIGIN: string;
  }): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': url.origin,
            'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      }
      const target = `${env.API_ORIGIN || FALLBACK_API}${url.pathname}${url.search}`;
      const headers = new Headers(request.headers);
      headers.delete('host');
      const init: RequestInit & { duplex?: 'half' } = {
        method: request.method,
        headers,
        redirect: 'manual',
      };
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        init.body = request.body;
        init.duplex = 'half';
      }
      const res = await fetch(target, init);
      const out = new Headers(res.headers);
      out.set('Access-Control-Allow-Origin', url.origin);
      return new Response(res.body, { status: res.status, statusText: res.statusText, headers: out });
    }

    const response = await env.ASSETS.fetch(request);
    if (isHtmlAsset(url.pathname, response.headers.get('content-type'))) {
      return withNoCacheHeaders(response);
    }
    return response;
  },
};
