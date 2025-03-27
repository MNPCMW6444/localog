import http, { IncomingMessage, ServerResponse } from 'http';
import { fetch } from 'undici';

const PORT = 5001;
const SPACEX_URL = 'https://spacex-production.up.railway.app/';
const ERROR_CODES = [400, 401, 500, 504];

let requestCount = 0;

function parseBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function shouldInjectError(): number | null {
  requestCount++;
  const trigger = Math.floor(Math.random() * 6) + 5;
  if (requestCount % trigger === 0) {
    return ERROR_CODES[Math.floor(Math.random() * ERROR_CODES.length)];
  }
  return null;
}

const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  // POST /graphql only
  if (req.method !== 'POST' || req.url !== '/graphql/') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Not found' }));
  }

  const errorCode = shouldInjectError();
  if (errorCode) {
    console.log(`[SIMULATED ERROR] → HTTP ${errorCode}`);
    res.writeHead(errorCode, {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    });
    return res.end(JSON.stringify({ error: `Simulated HTTP ${errorCode}` }));
  }

  try {
    const body = await parseBody(req);

    const result = await fetch(SPACEX_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    const responseBody = await result.text();

    res.writeHead(result.status, {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    });

    return res.end(responseBody);
  } catch (err: any) {
    console.error('[ERROR]', err.message);
    res.writeHead(502, {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    });
    return res.end(JSON.stringify({ error: 'Upstream fetch failed' }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Raw proxy running at http://localhost:${PORT}/graphql`);
});
