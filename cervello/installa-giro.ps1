# installa-giro.ps1 — Attiva il GIRO AUTOMATICO dell'AD MyCity (Claude Code, piano Max).
# Registra un'attivita' pianificata di Windows che esegue cervello/giro.ps1 a intervalli
# regolari, SENZA bisogno di scrivere comandi a mano e SENZA permessi di amministratore.
#
# Uso normale: NON serve aprire PowerShell. Fai doppio-clic su
#   cervello/attiva-giro-automatico.cmd
# Per cambiare l'intervallo (es. ogni ora): da PowerShell, in questa cartella:
#   .\installa-giro.ps1 -OgniOre 1
#
# Per FERMARLO: doppio-clic su cervello/disattiva-giro-automatico.cmd

param(
  [int]$OgniOre = 2,                 # ogni quante ore parte il giro (default: 2)
  [string]$NomeTask = "MyCity-AD-Giro"
)

$ErrorActionPreference = "Stop"

# Percorso assoluto di giro.ps1 (auto-rilevato: niente path scritti a mano).
$script = Join-Path $PSScriptRoot "giro.ps1"
if (-not (Test-Path $script)) {
  Write-Error "Non trovo giro.ps1 accanto a questo script ($script). Tieni i file della cartella cervello/ insieme."
  exit 1
}

# Avviso (non bloccante) se nessun motore AI e' nel PATH: il task si crea comunque,
# cosi' parte appena installi/configuri il motore.
if (-not (Get-Command agent -ErrorAction SilentlyContinue) -and -not (Get-Command claude -ErrorAction SilentlyContinue)) {
  Write-Warning "Nessun motore AI nel PATH. Installa Cursor CLI ('agent', con CURSOR_API_KEY) o Claude Code ('claude', login Max), altrimenti il giro fallira'."
}

# L'azione: lancia PowerShell che esegue giro.ps1 (le virgolette gestiscono i percorsi con spazi).
$action = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$script`""

# Il trigger: parte ora e si ripete ogni N ore, all'infinito.
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) `
  -RepetitionInterval (New-TimeSpan -Hours $OgniOre)

# Impostazioni sane: parte anche a corrente di rete, non si ferma se va per le lunghe.
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -TaskName $NomeTask -Action $action -Trigger $trigger -Settings $settings `
  -Description "Giro di perlustrazione AD MyCity (Claude Code, piano Max). Vedi cervello/giro.md." -Force | Out-Null

Write-Host ""
Write-Host "OK! Giro automatico ATTIVATO." -ForegroundColor Green
Write-Host "  Attivita':  $NomeTask"
Write-Host "  Intervallo: ogni $OgniOre ora/e"
Write-Host "  Esegue:     $script"
Write-Host ""
Write-Host "  Da ora l'AD fa un giro DA SOLO ogni $OgniOre ora/e (usa il tuo piano Max, niente API)."
Write-Host "  Richiede: questo PC acceso + Claude Code loggato col Max."
Write-Host ""
Write-Host "  Per cambiare intervallo:  .\installa-giro.ps1 -OgniOre 1   (oppure 3, ...)"
Write-Host "  Per fermarlo:             doppio-clic su disattiva-giro-automatico.cmd"
Write-Host ""
# Nota onesta: il Max ha limiti d'uso che si resettano ogni poche ore. Ogni 2 ore e' un buon
# equilibrio; 'ogni ora' 24/7 puo' incontrare i limiti -> in quel caso usa -OgniOre 2 o 3.
