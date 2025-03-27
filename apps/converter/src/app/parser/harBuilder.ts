// src/parser/harBuilder.ts
import { ParsedRequest } from './netlogParser';

export function buildHAR(parsedRequests: ParsedRequest[]): any {
  const entries = parsedRequests.map(req => {
    const startedDateTime = new Date(req.startTime).toISOString();
    const totalTime = req.endTime
      ? new Date(req.endTime).getTime() - new Date(req.startTime).getTime()
      : 0;

    return {
      startedDateTime,
      time: totalTime,
      request: {
        method: req.method,
        url: req.url,
        httpVersion: 'HTTP/1.1',
        headers: toNameValuePairs(req.requestHeaders),
        queryString: [], // Could be parsed from URL if needed
        headersSize: -1,
        bodySize: -1
      },
      response: {
        status: req.statusCode || 200,
        statusText: req.statusText || 'OK',
        httpVersion: 'HTTP/1.1',
        headers: toNameValuePairs(req.responseHeaders),
        headersSize: -1,
        bodySize: -1,
        content: {
          size: -1,
          mimeType: req.responseHeaders?.['content-type'] || 'text/plain',
          text: ''
        }
      },
      timings: {
        send: 0,
        wait: totalTime,
        receive: 0
      }
    };
  });

  return {
    log: {
      version: '1.2',
      creator: {
        name: 'NetLog to HAR Converter',
        version: '1.0'
      },
      entries
    }
  };
}

function toNameValuePairs(headers?: Record<string, string>): { name: string; value: string }[] {
  if (!headers) return [];
  return Object.entries(headers).map(([name, value]) => ({ name, value }));
}
