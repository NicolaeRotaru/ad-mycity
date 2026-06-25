@echo off
REM Doppio-clic per ATTIVARE il giro automatico dell'AD MyCity (ogni 2 ore).
REM %~dp0 = la cartella di questo file -> il percorso si rileva da solo, niente da scrivere.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0installa-giro.ps1"
echo.
pause
