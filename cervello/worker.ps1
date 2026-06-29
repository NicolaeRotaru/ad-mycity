# Worker della coda "lavori" (Modo B del README).
# Prende i lavori "in_attesa" dalla memoria Supabase e li fa eseguire all'AD
# (Claude Code, piano Max), poi riscrive il risultato. Serve solo se usi anche
# il Pannello di Controllo web (cartella pannello/).
#
# Richiede le variabili d'ambiente del progetto MEMORIA (NON del marketplace):
#   SUPABASE_URL          = https://LA-MEMORIA.supabase.co
#   SUPABASE_SERVICE_KEY  = eyJ... (service_role)

$ErrorActionPreference = "Stop"

$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

$URL = $env:SUPABASE_URL
$KEY = $env:SUPABASE_SERVICE_KEY
if (-not $URL -or -not $KEY) {
  Write-Error "Mancano SUPABASE_URL e SUPABASE_SERVICE_KEY (progetto MEMORIA). Vedi cervello/README.md."
  exit 1
}
if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
  Write-Error "Claude Code (CLI 'claude') non trovato. Installalo e fai login col tuo piano Max."
  exit 1
}

$headers = @{ apikey = $KEY; Authorization = "Bearer $KEY"; "Content-Type" = "application/json" }
$INTERVALLO = 5   # secondi tra un controllo e l'altro (basso = chat reattiva)

Write-Host "Worker AD avviato. Controllo la coda 'lavori' ogni $INTERVALLO s. (Ctrl+C per fermare)"
while ($true) {
  try {
    # Kill-switch: se nel Pannello di Controllo l'AD è in PAUSA, non eseguire nulla.
    try {
      $imp = Invoke-RestMethod -Uri "$URL/rest/v1/impostazioni?select=valore&chiave=eq.pausa&limit=1" -Headers $headers -Method Get
      if ($imp -and @($imp).Count -gt 0 -and @($imp)[0].valore -eq "on") {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] AD in PAUSA (kill-switch): salto questo giro."
        Start-Sleep -Seconds $INTERVALLO
        continue
      }
    } catch { }  # tabella 'impostazioni' assente: prosegui normalmente

    $q = "$URL/rest/v1/lavori?stato=eq.in_attesa&order=created_at.asc&limit=1"
    $righe = Invoke-RestMethod -Uri $q -Headers $headers -Method Get
    if ($righe -and @($righe).Count -gt 0) {
      $lav = @($righe)[0]
      Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Lavoro $($lav.id): $($lav.richiesta)"

      # 1) segna "in_corso"
      $upd = @{ stato = "in_corso" } | ConvertTo-Json
      Invoke-RestMethod -Uri "$URL/rest/v1/lavori?id=eq.$($lav.id)" -Headers $headers -Method Patch -Body $upd | Out-Null

      # 2) esegui con Claude Code (prende CLAUDE.md + agenti dal repo)
      if ($lav.tipo -eq "esegui-azione") {
        # Azione APPROVATA dal Pannello di Controllo: va eseguita davvero con le "mani".
        $prompt = "Sei l'AD digitale di MyCity (segui CLAUDE.md). $($lav.richiesta)`n`n" +
                  "Usa cervello/esegui-azione.mjs sul canale indicato (LIVE se AZIONI_LIVE=1, altrimenti dry-run). " +
                  "Poi aggiorna MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md (riga -> stato ✅ FATTO) e appendi la traccia in DECISIONI.md. " +
                  "Restituisci a Nicola, in chiaro, COSA è partito (canale, destinatario) o, se in dry-run, cosa partirebbe."
      } else {
        $prompt = "Sei l'AD digitale di MyCity (segui CLAUDE.md). Esegui questo lavoro e restituisci un risultato chiaro e azionabile per Nicola, rispettando 🟢🟡🔴:`n`n$($lav.richiesta)"
      }
      $out = (claude -p $prompt --permission-mode acceptEdits | Out-String)

      # 3) riscrivi il risultato
      $body = @{ stato = "fatto"; risultato = $out } | ConvertTo-Json
      Invoke-RestMethod -Uri "$URL/rest/v1/lavori?id=eq.$($lav.id)" -Headers $headers -Method Patch -Body $body | Out-Null
      Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Lavoro $($lav.id) completato."
    } else {
      Start-Sleep -Seconds $INTERVALLO
    }
  } catch {
    Write-Warning "Errore: $($_.Exception.Message)"
    Start-Sleep -Seconds $INTERVALLO
  }
}
