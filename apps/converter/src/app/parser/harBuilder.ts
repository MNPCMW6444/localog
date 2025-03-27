// src/parser/harBuilder.ts

import { ParsedRequest } from './netlogParser';

export function buildHAR(parsedRequests: ParsedRequest[], timeTickOffset: number): any {
  const entries = parsedRequests.map((req) => {
    const startMs = Number(req.startTime) + timeTickOffset;
    const endMs = req.endTime ? Number(req.endTime) + timeTickOffset : startMs;
    const startedDateTime = new Date(startMs).toISOString();
    const totalTime = endMs - startMs;

    const queryString = req.url.includes('?')
      ? req.url.split('?')[1].split('&').map(pair => {
          const [name, value] = pair.split('=');
          return { name, value: decodeURIComponent(value || '') };
        })
      : [];

    const requestHeaders = toNameValuePairs(req.requestHeaders);
    const responseHeaders = toNameValuePairs(req.responseHeaders);

    return {
      startedDateTime,
      time: totalTime,
      request: {
        method: req.method,
        url: req.url,
        httpVersion: 'HTTP/1.1',
        headers: requestHeaders,
        queryString,
        postData: req.requestBody
          ? {
              mimeType: req.requestHeaders?.['content-type'] || 'application/json',
              text: req.requestBody
            }
          : undefined,
        headersSize: -1,
        bodySize: req.requestBody?.length || 0
      },
      response: {
        status: req.statusCode ?? 0,
        statusText: req.statusText ?? '',
        httpVersion: 'HTTP/1.1',
        headers: responseHeaders,
        headersSize: -1,
        bodySize: req.responseBody?.length || 0,
        content: {
          size: req.responseBody?.length || 0,
          mimeType: req.responseHeaders?.['content-type'] || 'text/plain',
          text: req.responseBody || ''
        }
      },
      timings: calculateTimings(req, totalTime),
      cache: {},
      connection: '',
      pageref: 'page_1'
    };
  });

  return {
    log: {
      version: '1.2',
      creator: {
        name: 'NetLog to HAR Converter (TS)',
        version: '1.0'
      },
      pages: [
        {
          startedDateTime: new Date().toISOString(),
          id: 'page_1',
          title: 'Captured Page',
          pageTimings: {}
        }
      ],
      entries
    }
  };
}

function toNameValuePairs(headers?: Record<string, string>): { name: string; value: string }[] {
  if (!headers) return [];
  return Object.entries(headers).map(([name, value]) => ({ name, value }));
}

function calculateTimings(req: ParsedRequest, fallbackTime: number) {
  const t = req.timings || {};
  const get = (key: string) => t[key] ?? 0;

  const dns = get('dnsEnd') - get('dnsStart');
  const connect = get('connectEnd') - get('connectStart');
  const ssl = get('sslEnd') - get('sslStart');
  const send = get('sendEnd') - get('sendStart');
  const wait = get('receiveHeadersEnd') - get('sendEnd');
  const receive = fallbackTime - get('receiveHeadersEnd');

  return {
    dns: dns >= 0 ? dns : -1,
    connect: connect >= 0 ? connect : -1,
    ssl: ssl >= 0 ? ssl : -1,
    send: send >= 0 ? send : 0,
    wait: wait >= 0 ? wait : fallbackTime,
    receive: receive >= 0 ? receive : 0
  };
}
