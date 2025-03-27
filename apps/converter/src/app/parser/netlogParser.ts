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
          method: '',
          startTime: event.time,
        };
      }
  
      if (type === 'URL_REQUEST' && phase === 'PHASE_BEGIN') {
        requests[id].url = event.params.url || '';
      }
  
      if (type === 'HTTP_TRANSACTION_SEND_REQUEST_HEADERS') {
        requests[id].requestHeaders = event.params.headers;
        requests[id].method = event.params?.method || 'GET';
      }
  
      if (type === 'HTTP_TRANSACTION_READ_RESPONSE_HEADERS') {
        requests[id].responseHeaders = event.params.headers || {};
        requests[id].statusCode = event.params.status_code || 200;
        requests[id].statusText = event.params.status_line || 'OK';
      }
  
      if (type === 'URL_REQUEST' && phase === 'PHASE_END') {
        requests[id].endTime = event.time;
      }
    }
  
    return Object.values(requests).filter(r => r.url);
  }
  