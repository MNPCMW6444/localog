// src/parser/netlogParser.ts

export interface NetLogEvent {
  time: string; // tick time (number as string)
  type: number; // numeric event type
  phase: number;
  source: { id: number; type: number };
  params?: any;
}

export interface ParsedRequest {
  id: number;
  url: string;
  method: string;
  startTime: string;
  endTime?: string;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  statusCode?: number;
  statusText?: string;
  responseBody?: string;
  requestBody?: string;
  timings?: Record<string, number>;
  rawEvents?: NetLogEvent[]; // For debug
}

function parseRawHeaders(raw: string[]): { headers: Record<string, string>, statusCode?: number, statusText?: string } {
  const headers: Record<string, string> = {};
  let statusCode: number | undefined;
  let statusText: string | undefined;

  if (raw.length >= 2 && raw[0].startsWith('HTTP/')) {
    const code = parseInt(raw[1], 10);
    if (!isNaN(code)) {
      statusCode = code;
      statusText = `${raw[0]} ${raw[1]}`;
    }
  }

  for (let i = 2; i < raw.length; i += 2) {
    const name = raw[i];
    const value = raw[i + 1];
    if (name && value) {
      headers[name] = value;
    }
  }

  return { headers, statusCode, statusText };
}

export function parseNetLog(json: any): ParsedRequest[] {
  const events: NetLogEvent[] = json.events;
  const requests: Record<number, ParsedRequest> = {};

  for (const event of events) {
    const id = event.source.id;
    const type = event.type;
    const phase = event.phase;
    const params = event.params || {};

    if (!requests[id]) {
      requests[id] = {
        id,
        url: '',
        method: 'GET',
        startTime: event.time,
        rawEvents: [],
        timings: {}
      };
    }

    const req = requests[id];
    req.rawEvents?.push(event);

    // Always extract URL/method if found
    if (params.url) req.url = params.url;
    if (params.method) req.method = params.method;
    if (!req.startTime) req.startTime = event.time;

    // Request body from upload data
    if (type === 120 /* HTTP_STREAM_REQUEST */ && params.upload_data) {
      req.requestBody = params.upload_data;
    }

    // HTTP/QUIC/HTTP2-style headers (array)
    if (Array.isArray(params.headers)) {
      for (let i = 0; i < params.headers.length; i += 2) {
        const name = params.headers[i];
        const value = params.headers[i + 1];

        if (name === ':status' || name === 'status') {
          const code = parseInt(value, 10);
          if (!isNaN(code)) {
            req.statusCode = code;
            req.statusText = `:status ${value}`;
          }
        } else {
          req.responseHeaders = req.responseHeaders || {};
          req.responseHeaders[name] = value;
        }
      }
    }

    // Object headers
    if (params.headers && typeof params.headers === 'object' && !Array.isArray(params.headers)) {
      req.responseHeaders = { ...(req.responseHeaders || {}), ...params.headers };
    }

    // raw_headers fallback
    if (params.raw_headers) {
      const { headers, statusCode, statusText } = parseRawHeaders(params.raw_headers);
      req.responseHeaders = req.responseHeaders || headers;
      req.statusCode = req.statusCode ?? statusCode;
      req.statusText = req.statusText ?? statusText;
    }

    // Explicit status code
    if (params.status_code) {
      req.statusCode = req.statusCode ?? params.status_code;
    }
    if (params.status_line) {
      req.statusText = req.statusText ?? params.status_line;
    }

    // Response body chunks
    if ((type === 288 || params?.body) && params.bytes) {
      if (typeof params.bytes === 'string') {
        req.responseBody = (req.responseBody || '') + params.bytes;
      } else if (Array.isArray(params.bytes)) {
        try {
          const chunk = new TextDecoder().decode(new Uint8Array(params.bytes));
          req.responseBody = (req.responseBody || '') + chunk;
        } catch (e) {}
      }
    }

    // Capture timings
    const timingMap: Record<number, string> = {
      51: 'dnsStart',
      52: 'dnsEnd',
      54: 'connectStart',
      55: 'connectEnd',
      64: 'sslStart',
      65: 'sslEnd',
      56: 'sendStart',
      57: 'sendEnd',
      67: 'receiveHeadersEnd'
    };

    if (timingMap[type]) {
      req.timings![timingMap[type]] = parseFloat(event.time);
    }

    // Capture end of request
    if (phase === 2 /* PHASE_END */ && !req.endTime) {
      req.endTime = event.time;
    }
  }

  return Object.values(requests).filter(r => r.url);
}