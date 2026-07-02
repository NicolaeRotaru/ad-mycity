# Esegue un "giro di perlustrazione" dell'AD (motore AI: Cursor 'agent' o Claude 'claude').
# Gira nella cartella di AD MyCity, così il motore prende automaticamente
# CLAUDE.md, gli agenti .claude/agents/ e la memoria del vault.

$ErrorActionPreference = "Stop"

# Radice del progetto = la cartella sopra "cervello/"
$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

# Motore AI: Cursor 'agent' (default) o Claude 'claude'. Scelta via $env:CERVELLO_MOTORE (auto|cursor|claude).
$motore = $env:CERVELLO_MOTORE
if (-not $motore) { $motore = "auto" }
if ($motore -eq "auto") {
  if (Get-Command agent -ErrorAction SilentlyContinue) { $motore = "cursor" }
  elseif (Get-Command claude -ErrorAction SilentlyContinue) { $motore = "claude" }
  else { Write-Error "Nessun motore AI trovato. Installa Cursor CLI ('agent') o Claude Code ('claude')."; exit 1 }
}
$cli = if ($motore -eq "cursor") { "agent" } else { "claude" }
if (-not (Get-Command $cli -ErrorAction SilentlyContinue)) {
  Write-Error "CLI '$cli' non trovata (motore=$motore). Installala o cambia CERVELLO_MOTORE."
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

Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm')] Avvio giro di perlustrazione AD (motore: $motore)..."
# Il motore può scrivere nella memoria (il vault) senza chiedere ogni volta (cursor: --force; claude: acceptEdits).
# Le azioni 🔴 restano comunque da firmare (regole in CLAUDE.md).
if ($motore -eq "cursor") {
  if ($env:CERVELLO_MODELLO) { agent -p --force --model $env:CERVELLO_MODELLO $prompt }
  else { agent -p --force $prompt }
} else {
  claude -p $prompt --permission-mode acceptEdits
}
Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm')] Giro completato."

# ---------------------------------------------------------------------------
# PER FARLO PARTIRE DA SOLO (ogni 2 ore): NON serve scrivere comandi.
#   ▶ Doppio-clic su  cervello\attiva-giro-automatico.cmd
#   ⏹ Per fermarlo:    cervello\disattiva-giro-automatico.cmd
#
# Cambiare intervallo (es. ogni ora), da PowerShell nella cartella cervello\:
#   .\installa-giro.ps1 -OgniOre 1
#
# Richiede: PC acceso + motore AI configurato (Cursor 'agent' con CURSOR_API_KEY/login, oppure Claude 'claude' col Max).
# ⚠️ Onestà: gli abbonamenti hanno limiti d'uso. Ogni 2 ore è un buon equilibrio;
#    'ogni ora' 24/7 può incontrare i limiti — in quel caso resta su 2-3 ore.
# ---------------------------------------------------------------------------
