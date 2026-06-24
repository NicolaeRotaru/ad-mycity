# Esegue un "giro di perlustrazione" dell'AD con Claude Code (piano Max).
# Gira nella cartella di AD MyCity, così Claude Code prende automaticamente
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

# Kill-switch (opzionale): se il Pannello di Controllo ha messo l'AD in PAUSA, non girare.
if ($env:SUPABASE_URL -and $env:SUPABASE_SERVICE_KEY) {
  try {
    $h = @{ apikey = $env:SUPABASE_SERVICE_KEY; Authorization = "Bearer $($env:SUPABASE_SERVICE_KEY)" }
    $imp = Invoke-RestMethod -Uri "$($env:SUPABASE_URL)/rest/v1/impostazioni?select=valore&chiave=eq.pausa&limit=1" -Headers $h -Method Get
    if ($imp -and @($imp).Count -gt 0 -and @($imp)[0].valore -eq "on") {
      Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm')] AD in PAUSA (kill-switch): giro saltato."
      exit 0
    }
  } catch { }  # nessuna tabella impostazioni: prosegui
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
#   "powershell -NoProfile -ExecutionPolicy Bypass -File `"C:\Users\InfinitaPossibilita\Desktop\ad-mycity\cervello\giro.ps1`""
#
# Per più giri al giorno usa /SC HOURLY /MO 3  (ogni 3 ore), ecc.
# Per rimuoverlo:  schtasks /Delete /TN "MyCity-AD-Giro" /F
# ---------------------------------------------------------------------------
