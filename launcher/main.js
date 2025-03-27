const { exec } = require('child_process');
const path = require('path');

nw.Window.open('https://osftclient.netlify.app/', {
  id: 'mainWindow',
  new_instance: true
}, function(win) {
  win.on('loaded', () => {
    setTimeout(() => {
      require('./harRecorder').startRecording(win);
    }, 2000); // give the page time to load
  });
});
