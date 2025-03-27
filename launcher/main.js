const CDP = require('chrome-remote-interface');
const fs = require('fs');
const os = require('os');
const path = require('path');



const logBuffer = [];
const logTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
const logFilePath = path.join(os.homedir(), 'Desktop', `console_${logTimestamp}.log`);

function writeLogFile() {
  if (logBuffer.length === 0) return;
  const logs = logBuffer.splice(0, logBuffer.length).join('\n') + '\n';
  fs.appendFileSync(logFilePath, logs, 'utf8');
}

// Every 20 seconds: flush logs to file
setInterval(writeLogFile, 20000);

// Replace console methods
['log', 'warn', 'error', 'info', 'debug'].forEach(level => {
  const original = console[level].bind(console);
  console[level] = (...args) => {
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] [${level.toUpperCase()}] ${args.map(String).join(' ')}`;
    logBuffer.push(message);
    original(...args);
  };
});

console.log(`[NW.js] Logging to: ${logFilePath}`);

let devWin;

// Open log window
/* nw.Window.open('dev-log.html', {
  width: 600,
  height: 400,
  position: 'right',
  focus: false
}, function (w) {
  devWin = w;

  const oldLog = console.log;
  console.log = function (...args) {
    oldLog.apply(console, args);
    const msg = args.map(String).join(' ');
    if (devWin?.window?.log) {
      devWin.window.log(msg);
    }
  };

  console.log('[NW] Log window initialized');
}); */

console.log('[HARRecorder] NW.js app started');

// Keep NW alive
setInterval(() => {}, 1000);
setInterval(() => {
  console.log(`[Heartbeat] App is running - ${new Date().toISOString()}`);
}, 3000);

setTimeout(() => {
  console.log('[HARRecorder] Looking for the target tab...');

  CDP.List({ port: 9222, host: '127.0.0.1' })
  .then(targets => {
      const target = targets.find(t => t.url.includes('osftclient.netlify.app'));

      if (!target) {
        console.error('[HARRecorder] ❌ Target tab not found');
        alert('❌ Could not find the app tab.');
        return;
      }

      console.log('[HARRecorder] Found target:', target.title);

      CDP({ target, port: 9222, host: '127.0.0.1' })
        .then(async client => {
          console.log('[HARRecorder] Connected to target tab');

          const { Network } = client;
          await Network.enable();

          let entries = [];
          let requests = {};

          Network.requestWillBeSent(params => {
            console.log('[HAR] Request:', params.request.method, params.request.url);
            requests[params.requestId] = {
              url: params.request.url,
              method: params.request.method,
              headers: params.request.headers,
              postData: params.request.postData,
              startTime: Date.now()
            };
          });

          Network.responseReceived(async params => {
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

              const entry = {
                startedDateTime: new Date(req.startTime).toISOString(),
                time: endTime - req.startTime,
                request: {
                  method: req.method,
                  url: req.url,
                  httpVersion: 'HTTP/1.1',
                  headers: formatHeaders(req.headers),
                  headersSize: -1,
                  bodySize: req.postData?.length || 0,
                  postData: req.postData
                    ? {
                        mimeType: req.headers['Content-Type'] || 'application/json',
                        text: req.postData
                      }
                    : undefined,
                  queryString: []
                },
                response: {
                  status: res.status,
                  statusText: res.statusText,
                  httpVersion: 'HTTP/1.1',
                  headers: formatHeaders(res.headers),
                  headersSize: -1,
                  bodySize: bodyResult.body?.length || 0,
                  content: {
                    size: bodyResult.body?.length || 0,
                    mimeType: res.headers['content-type'] || 'text/plain',
                    text: bodyResult.body
                  }
                },
                cache: {},
                timings: {
                  send: 0,
                  wait: endTime - req.startTime,
                  receive: 0
                }
              };

              entries.push(entry);
              console.log('[HAR] Recorded:', req.method, req.url);
            } catch (err) {
              console.warn('[HAR] Failed to get body:', err.message);
            }
          });

          setInterval(() => {
            if (entries.length === 0) return;

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `har_${timestamp}.har`;
            const filePath = path.join(os.homedir(), 'Desktop', filename);

            fs.writeFileSync(filePath, JSON.stringify({
              log: {
                version: '1.2',
                creator: { name: 'NW.js HAR Recorder', version: '1.0' },
                entries
              }
            }, null, 2));

            console.log(`[HARRecorder] HAR saved to: ${filePath}`);
            entries = [];
          }, 20000);
        })
        .catch(err => {
          console.error('[HARRecorder] ❌ Failed to attach to target tab:', err.message);
          alert('❌ Failed to attach to target tab: ' + err.message);
        });
    })
    .catch(err => {
      console.error('[HARRecorder] ❌ Failed to list CDP targets:', err.message);
      alert('❌ Failed to list DevTools targets: ' + err.message);
    });
}, 3000);

function formatHeaders(obj) {
  return Object.entries(obj || {}).map(([name, value]) => ({ name, value: String(value) }));
}
