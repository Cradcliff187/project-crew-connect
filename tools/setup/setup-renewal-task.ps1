# Setup Google Calendar Webhook Renewal Task
Write-Host "Setting up Google Calendar Webhook Renewal Task..." -ForegroundColor Cyan

# Get absolute paths
$scriptPath = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
$batchFilePath = Join-Path -Path $scriptPath -ChildPath "renew-calendar-webhooks.bat"

# Verify batch file exists
if (-not (Test-Path $batchFilePath)) {
    Write-Error "Batch file not found at: $batchFilePath"
    Write-Host "Press any key to exit..."
    $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
    exit 1
}

# Create scheduled task using schtasks.exe
Write-Host "Creating scheduled task to run daily at 1:00 AM..." -ForegroundColor Yellow
$taskName = "Google Calendar Webhook Renewal"
$command = "schtasks.exe /create /tn `"$taskName`" /tr `"$batchFilePath`" /sc DAILY /st 01:00 /ru SYSTEM /f"

# Execute the command
try {
    $result = Invoke-Expression $command
    Write-Host "Task created successfully!" -ForegroundColor Green
    Write-Host "The script will run daily at 1:00 AM to renew Google Calendar webhooks."
} catch {
    Write-Error "Failed to create scheduled task: $_"
    Write-Host "You may need to run this script as Administrator." -ForegroundColor Red
}

Write-Host "Press any key to exit..."
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
