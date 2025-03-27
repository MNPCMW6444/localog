@echo off
REM Launch Chrome with NetLog capturing EVERYTHING

set NETLOG_PATH=%USERPROFILE%\Desktop\netlog_%date:~10,4%-%date:~4,2%-%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%.json


start chrome.exe ^
  --user-data-dir="%TEMP%\NetLogProfile" ^
  --no-first-run ^
  --no-default-browser-check ^
  --disable-popup-blocking ^
  --disable-extensions ^
  --disable-background-networking ^
  --disable-sync ^
  --log-net-log="%NETLOG_PATH%" ^
  --log-net-log-contents=everything

echo Chrome started with NetLog. Logging to: %NETLOG_PATH%
pause
