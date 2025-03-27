// src/parser/netlogParser.ts

export interface NetLogEvent {
    time: string;
    type: string;
    phase: string;
    source: { id: number; type: string };
    params: any;
  }
  
  export interface ParsedRequest {
    id: number;
    url: string;
    method: string;
    startTime: string;
    requestHeaders?: Record<string, string>;
    responseHeaders?: Record<string, string>;
    statusCode?: number;
    statusText?: string;
    endTime?: string;
    responseBody?: string;

  }
  
  export function parseNetLog(json: any): ParsedRequest[] {
    const events: NetLogEvent[] = json.events;
    const requests: Record<number, ParsedRequest> = {};
  
    for (const event of events) {
      const id = event.source.id;
      const type = event.type;
      const phase = event.phase;
  
      if (!requests[id]) {
        requests[id] = {
          id,
          url: '',
          method: 'GET',
          startTime: event.time
        };
      }
  
      // Standard events (keep if present)
      if (type === 'URL_REQUEST' && phase === 'PHASE_BEGIN') {
        requests[id].url = event.params?.url || requests[id].url;
      }
  
      if (type === 'HTTP_TRANSACTION_SEND_REQUEST_HEADERS') {
        requests[id].requestHeaders = event.params?.headers || {};
        requests[id].method = event.params?.method || requests[id].method;
      }

      if (type === 'URL_REQUEST_JOB_FILTERED_BYTES_READ') {
        if (!requests[id].responseBody) requests[id].responseBody = '';
        const data = event.params?.bytes;
        if (typeof data === 'string') {
          requests[id].responseBody += data;
        }
      }
      
  
      if (event.params?.status_code) {
        requests[id].statusCode = event.params.status_code;
      }
      
      if (event.params?.status_line) {
        requests[id].statusText = event.params.status_line;
      }
      
      if (event.params?.headers && !requests[id].responseHeaders) {
        requests[id].responseHeaders = event.params.headers;
      }
      
  
      if (type === 'URL_REQUEST' && phase === 'PHASE_END') {
        requests[id].endTime = event.time;
      }
  
      // New fallback: CORS_REQUEST (570)
      if (type === 570 && event.params?.url) {
        requests[id].url = event.params.url;
        requests[id].method = event.params.method || 'GET';
        requests[id].startTime = event.time;
      }
  
      // Fallback: URL_REQUEST_START_JOB (123)
      if (type === 123 && event.params?.url) {
        requests[id].url = event.params.url;
        requests[id].method = event.params.method || 'GET';
      }
  
      // End fallback: use NETWORK_DELEGATE_BEFORE_START_TRANSACTION (126)
      if (type === 126 && phase === 2) {
        requests[id].endTime = event.time;
      }
    }
  
    return Object.values(requests).filter(r => r.url);
  }
  
  