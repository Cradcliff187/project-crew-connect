@echo off
echo Setting up Google Calendar Webhook Renewal Task (User Level)...

REM Get the script directory
set "SCRIPT_DIR=%~dp0"
set "BATCH_FILE=%SCRIPT_DIR%renew-calendar-webhooks.bat"

REM Create the scheduled task to run daily at 1:00 AM (user level)
schtasks /create /tn "Google Calendar Webhook Renewal" /tr "\"%BATCH_FILE%\"" /sc DAILY /st 01:00 /f

if %ERRORLEVEL% EQU 0 (
    echo Task created successfully!
    echo The script will run daily at 1:00 AM to renew Google Calendar webhooks.
) else (
    echo Failed to create scheduled task. Error code: %ERRORLEVEL%
)

pause
