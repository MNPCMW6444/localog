const CDP = require('chrome-remote-interface');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Show DevTools immediately
nw.Window.get().showDevTools();

console.log('[HARRecorder] NW.js app started');

setInterval(() => {}, 1000); // keep alive

setTimeout(() => {
  CDP({ port: 9222 }, async (client) => {
    console.log('[HARRecorder] Connected to CDP');
    const { Network } = client;
    await Network.enable();

    let entries = [];
    let requests = {};

    Network.requestWillBeSent((params) => {
      requests[params.requestId] = {
        url: params.request.url,
        method: params.request.method,
        headers: params.request.headers,
        postData: params.request.postData,
        startTime: Date.now()
      };
    });

    Network.responseReceived(async (params) => {
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

        entries.push({
          startedDateTime: new Date(req.startTime).toISOString(),
          time: endTime - req.startTime,
          request: {
            method: req.method,
            url: req.url,
            headers: formatHeaders(req.headers),
            postData: req.postData,
          },
          response: {
            status: res.status,
            statusText: res.statusText,
            headers: formatHeaders(res.headers),
            content: {
              text: bodyResult.body
            }
          }
        });
      } catch (err) {
        console.warn('No body:', err.message);
      }
    });

    setInterval(() => {
      if (entries.length === 0) return;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outFile = path.join(os.homedir(), 'Desktop', `har_${timestamp}.json`);
      fs.writeFileSync(outFile, JSON.stringify({ log: { entries } }, null, 2));
      console.log(`[HARRecorder] Saved HAR to ${outFile}`);
      entries = [];
    }, 20000);
  });
}, 3000);
