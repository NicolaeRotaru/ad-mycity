# Esegue un "giro di perlustrazione" dell'AD con Claude Code (piano Max).
# Gira nella cartella "secondo cervello", così Claude Code prende automaticamente
# CLAUDE.md, gli agenti .claude/agents/ e la memoria del vault.

$ErrorActionPreference = "Stop"

# Radice del progetto = la cartella sopra "cervello/"
$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

# Verifica che Claude Code sia installato e loggato (piano Max)
if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
  Write-Error "Claude Code (CLI 'claude') non trovato. Installalo e fai login col tuo piano Max."
  exit 1
}

# Il prompt del giro
$prompt = Get-Content -Raw -Path (Join-Path $PSScriptRoot "giro.md")

Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm')] Avvio giro di perlustrazione AD..."
# acceptEdits: l'AD può scrivere nella sua memoria (il vault) senza chiedere ogni volta.
# Le azioni 🔴 restano comunque da firmare (regole in CLAUDE.md).
claude -p $prompt --permission-mode acceptEdits
Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm')] Giro completato."

# ---------------------------------------------------------------------------
# PROGRAMMARLO (una volta sola). Esempio: ogni mattina alle 8:00.
# Incolla questo comando in PowerShell (adatta il percorso se serve):
#
# schtasks /Create /TN "MyCity-AD-Giro" /SC DAILY /ST 08:00 /TR `
#   "powershell -NoProfile -ExecutionPolicy Bypass -File `"C:\Users\InfinitaPossibilita\Desktop\secondo cervello\cervello\giro.ps1`""
#
# Per più giri al giorno usa /SC HOURLY /MO 3  (ogni 3 ore), ecc.
# Per rimuoverlo:  schtasks /Delete /TN "MyCity-AD-Giro" /F
# ---------------------------------------------------------------------------
