@echo off
REM Doppio-clic per FERMARE il giro automatico dell'AD MyCity.
schtasks /Delete /TN "MyCity-AD-Giro" /F
echo.
echo Giro automatico disattivato.
pause
