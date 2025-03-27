console.log('[HARRecorder] NW.js app started');

// Show DevTools immediately
nw.Window.get().showDevTools();

// Keep the app alive
setInterval(() => {}, 1000);

// Delay HAR recorder start
setTimeout(() => {
  console.log('[HARRecorder] Starting HAR recorder...');
  require('./harRecorder').startRecording();
}, 3000);
