const CDP = require('chrome-remote-interface');
const fs = require('fs');
const path = require('path');
const os = require('os');

let requests = {};
let harEntries = [];

console.log('[HAR] CDP starting...');
console.error('[HAR] Could not connect to CDP:', err.message);


function toNameValuePairs(headers) {
  return Object.entries(headers).map(([name, value]) => ({ name, value: String(value) }));
}

function createEntry(req, res, body, startTime, endTime) {
  const time = endTime - startTime;

  return {
    startedDateTime: new Date(startTime).toISOString(),
    time,
    request: {
      method: req.method,
      url: req.url,
      httpVersion: 'HTTP/1.1',
      headers: toNameValuePairs(req.headers),
      queryString: [],
      headersSize: -1,
      bodySize: req.postData ? req.postData.length : 0,
      postData: req.postData
        ? {
            mimeType: req.headers['Content-Type'] || 'application/json',
            text: req.postData
          }
        : undefined
    },
    response: {
      status: res.status,
      statusText: res.statusText,
      httpVersion: 'HTTP/1.1',
      headers: toNameValuePairs(res.headers),
      headersSize: -1,
      bodySize: body.length,
      content: {
        size: body.length,
        mimeType: res.headers['content-type'] || 'text/plain',
        text: body
      }
    },
    cache: {},
    timings: {
      send: 0,
      wait: time,
      receive: 0
    }
  };
}

exports.startRecording = async function () {
  console.log('[HAR] Starting HAR recording…');

  try {
    const client = await CDP({ port: 9222 });
    const { Network } = client;

    await Network.enable();
    console.log('[HAR] Connected to CDP!');

    Network.requestWillBeSent((params) => {
      console.log('[HAR] Request:', params.request.method, params.request.url);

      requests[params.requestId] = {
        url: params.request.url,
        method: params.request.method,
        headers: params.request.headers,
        postData: params.request.postData,
        startTime: Date.now()
      };
    });

    Network.responseReceived(async (params) => {
      console.log('[HAR] Response:', params.response.status, params.response.url);

      const requestId = params.requestId;
      const res = {
        status: params.response.status,
        statusText: params.response.statusText,
        headers: params.response.headers
      };

      try {
        const bodyResult = await Network.getResponseBody({ requestId });
        const req = requests[requestId];
        const endTime = Date.now();
        const entry = createEntry(req, res, bodyResult.body, req.startTime, endTime);
        harEntries.push(entry);
        console.log('[HAR] Captured entry:', req.method, req.url);
      } catch (err) {
        console.warn('[HAR] Failed to get body:', err.message);
      }
    });

    // Save HAR every 30 seconds
    setInterval(() => {
      if (harEntries.length > 0) {
        console.log('[HAR] Writing HAR with', harEntries.length, 'entries');
        saveHARToDesktop();
      }
    }, 30000);

    console.log('[HAR Recorder] Recording started.');

  } catch (err) {
    alert('❌ Could not connect to CDP: ' + err.message);
    console.error('[HAR] Could not connect to CDP:', err);
  }
};

function saveHARToDesktop() {
  const har = {
    log: {
      version: '1.2',
      creator: { name: 'NW.js HAR Recorder', version: '1.0' },
      entries: harEntries
    }
  };

  const desktopPath = path.join(os.homedir(), 'Desktop');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `har_${timestamp}.har`;
  const fullPath = path.join(desktopPath, filename);

  try {
    fs.writeFileSync(fullPath, JSON.stringify(har, null, 2), 'utf-8');
    console.log(`[HAR Recorder] HAR saved to ${fullPath}`);
    alert(`HAR saved to:\n${fullPath}`);
  } catch (err) {
    console.error('❌ Failed to save HAR:', err);
    alert('❌ HAR save failed: ' + err.message);
  }
}
