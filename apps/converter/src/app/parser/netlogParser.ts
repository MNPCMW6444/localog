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
}

function parseRawHeaders(raw: string[]): Record<string, string> {
  const headers: Record<string, string> = {};
  for (let i = 0; i < raw.length; i += 2) {
    headers[raw[i]] = raw[i + 1];
  }
  return headers;
}

export function parseNetLog(json: any): ParsedRequest[] {
  const events: NetLogEvent[] = json.events;
  const requests: Record<number, ParsedRequest> = {};

  for (const event of events) {
    const id = event.source.id;
    const type = event.type;
    const params = event.params || {};

    if (!requests[id]) {
      requests[id] = {
        id,
        url: '',
        method: 'GET',
        startTime: event.time
      };
    }

    const req = requests[id];

    // Extract URL and method from early request events
    if (params.url) req.url = params.url;
    if (params.method) req.method = params.method;
    if (!req.startTime) req.startTime = event.time;

    // Response headers
    if (params.headers) {
      req.responseHeaders = req.responseHeaders || params.headers;
    }

    // Fallback: raw_headers (array)
    if (params.raw_headers) {
      req.responseHeaders = parseRawHeaders(params.raw_headers);
    }

    // Extract status code
    if (params.status_code) {
      req.statusCode = params.status_code;
    }
    if (params.status_line) {
      req.statusText = params.status_line;
    }

    // Response body chunks
    if (params.bytes && typeof params.bytes === 'string') {
      req.responseBody = (req.responseBody || '') + params.bytes;
    }

    // Mark end time if present
    if (!req.endTime && event.phase === 2 /* PHASE_END */) {
      req.endTime = event.time;
    }
  }

  return Object.values(requests).filter(r => r.url);
}
