@echo off
setlocal

REM === Timestamp for filename ===
for /f "tokens=1-4 delims=/ " %%a in ("%date%") do (
    set "yyyy=%%d"
    set "mm=%%b"
    set "dd=%%c"
)
for /f "tokens=1-2 delims=: " %%a in ("%time%") do (
    set "hh=%%a"
    set "min=%%b"
)
set "TIMESTAMP=%yyyy%-%mm%-%dd%_%hh%%min%"

REM === Paths ===
set "CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe"
set "USER_DATA_DIR=%TEMP%\ChromeNetLogProfile"
set "NETLOG_PATH=%USERPROFILE%\Desktop\netlog_%TIMESTAMP%.json"

REM === Ensure clean directory ===
mkdir "%USER_DATA_DIR%" >nul 2>&1

REM === Launch Chrome with full NetLog capture ===
start "" "%CHROME_PATH%" ^
  --user-data-dir="%USER_DATA_DIR%" ^
  --no-first-run ^
  --no-default-browser-check ^
  --disable-popup-blocking ^
  --disable-extensions ^
  --disable-background-networking ^
  --disable-sync ^
  --log-net-log="%NETLOG_PATH%" ^
  --log-net-log-contents=everything

echo.
echo 🚀 Chrome launched with NetLog.
echo 📝 Saving to: %NETLOG_PATH%
pause
