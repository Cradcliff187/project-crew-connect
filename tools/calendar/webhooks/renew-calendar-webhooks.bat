@echo off
cd /d "%~dp0"
echo Running Calendar Webhook Renewal Script...
node scheduled-webhook-renewal.cjs >> renewal-log.txt 2>&1
echo Renewal process completed at %date% %time% >> renewal-log.txt
