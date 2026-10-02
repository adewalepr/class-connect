import server from '../dist/server/server.js';

export default async function handler(req, res) {
  try {
    if (req instanceof Request) {
      return await server.fetch(req);
    }

    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    const url = new URL(req.url || '/', `${protocol}://${host}`);

    const headers = new Headers();
    for (const [key, val] of Object.entries(req.headers)) {
      if (val) {
        if (Array.isArray(val)) {
          val.forEach((v) => headers.append(key, v));
        } else {
          headers.set(key, val);
        }
      }
    }

    let body = null;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      body = Buffer.concat(buffers);
    }

    const webRequest = new Request(url.toString(), {
      method: req.method,
      headers,
      body,
    });

    const webResponse = await server.fetch(webRequest);

    if (res) {
      res.statusCode = webResponse.status;
      webResponse.headers.forEach((val, key) => {
        res.setHeader(key, val);
      });
      const arrayBuffer = await webResponse.arrayBuffer();
      res.end(Buffer.from(arrayBuffer));
    } else {
      return webResponse;
    }
  } catch (err) {
    console.error('Vercel server handler error:', err);
    if (res && !res.headersSent) {
      res.statusCode = 500;
      res.end('Internal Server Error: ' + err.message);
    } else {
      return new Response('Internal Server Error: ' + err.message, { status: 500 });
    }
  }
}
