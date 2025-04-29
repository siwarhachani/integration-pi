# PowerShell script to activate venv and run event_translate_api.py

Write-Host "`n[INFO] Activating virtual environment..."
& "$PSScriptRoot\venv\Scripts\Activate.ps1"

Write-Host "`n[INFO] Running event_translate_api.py..."
python "$PSScriptRoot\event_translate_api.py"

Write-Host "`n[INFO] Done. Press Enter to close."
Read-Host
