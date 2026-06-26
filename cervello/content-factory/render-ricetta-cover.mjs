// ============================================================================
// render-ricetta-cover.mjs — COVER/keyframe del reel-ricetta "la vera stella"
// Categoria PRODOTTO-DOP/ricetta. Format derivato da Cortilia (reel C4OCvpwoWa3).
// 🟢 Locale, reversibile. Nessun servizio esterno, non tocca mycity-live.
// Riusa lo SPIRITO del template prodotto-dop (carta da salumeria, Fraunces, brand).
// Formato verticale 9:16 → 1080x1920.
// ============================================================================
import pkg from "/opt/node22/lib/node_modules/playwright/index.js";
const { chromium } = pkg;
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const OUT = "/home/user/ad-mycity/creativi/output/social/W1-ricetta-cover.png";

// Prodotto-eroe REALE di Garetti (negozio-faro, Piazza Duomo): Coppa Piacentina DOP.
// Ricetta: Gnocco fritto caldo + Coppa Piacentina DOP — semplice, piacentina, fame istantanea.
const html = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,ital,wght@9..144,0,500;9..144,0,600;9..144,0,700;9..144,0,900;9..144,1,600;9..144,1,900&family=Inter:wght@400;600;700;800;900&display=swap');
  :root{
    --terracotta:#C0492C; --senape:#E8A33D; --oliva:#5A7C42;
    --bordeaux:#B82A28; --inchiostro:#2C2A28; --panna:#FBF7F0; --bianco:#FFFFFF;
  }
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:100%;height:100%}
  body{
    font-family:'Inter','Helvetica Neue',Arial,sans-serif;
    background:var(--panna); color:var(--inchiostro);
    width:1080px; height:1920px; position:relative; overflow:hidden;
  }
  /* fondo "carta da salumeria": panna + sottile trama a righe */
  .carta{
    position:absolute; inset:0;
    background:
      repeating-linear-gradient(180deg, rgba(44,42,40,.022) 0 2px, transparent 2px 28px),
      var(--panna);
  }
  /* cornice editoriale cucita */
  .cornice{ position:absolute; inset:40px; border:3px solid var(--bordeaux); border-radius:10px; }
  .cornice::after{ content:""; position:absolute; inset:10px; border:1.5px dashed rgba(184,42,40,.5); border-radius:5px; }

  /* nastro angolare DOP */
  .nastro{
    position:absolute; top:60px; right:-78px; width:340px;
    background:var(--oliva); color:var(--panna);
    text-align:center; transform:rotate(45deg);
    padding:18px 0; font-weight:900; letter-spacing:7px; font-size:34px;
    font-family:'Inter',sans-serif; box-shadow:0 6px 18px rgba(0,0,0,.18); z-index:5;
  }

  /* ---- HOOK in alto (i primi 3 secondi del reel) ---- */
  .hook{ position:absolute; top:140px; left:80px; right:80px; text-align:center; }
  .hook .occhiello{
    font-family:'Inter',sans-serif; text-transform:uppercase;
    letter-spacing:7px; font-size:26px; font-weight:900; color:var(--terracotta);
  }
  .hook .domanda{
    margin-top:26px; font-family:'Fraunces',Georgia,serif; font-weight:900;
    font-size:80px; line-height:1.02; letter-spacing:-1px; color:var(--inchiostro);
  }
  .hook .domanda em{ font-style:italic; color:var(--bordeaux); }
  /* la "stella" = la RISPOSTA, evidenziata come sottotitolo burned-in (sotto la domanda) */
  .hook .hero{
    margin:34px auto 0; padding:20px 16px; max-width:880px;
    background:var(--senape); color:var(--inchiostro);
    font-family:'Fraunces',Georgia,serif; font-weight:900; font-style:italic;
    font-size:66px; line-height:1.05; letter-spacing:-1px;
    border-radius:10px; box-shadow:0 10px 28px rgba(44,42,40,.18);
    transform:rotate(-1.2deg);
  }

  /* ---- ZONA FOTO PIATTO (segnaposto reale) ---- */
  .foto{
    position:absolute; left:90px; right:90px; top:770px; height:660px;
    border-radius:18px; overflow:hidden; box-shadow:0 22px 50px rgba(44,42,40,.24);
  }
  .foto-ph{
    width:100%; height:100%;
    background:
      radial-gradient(circle at 32% 30%, rgba(255,255,255,.20), transparent 60%),
      linear-gradient(140deg, var(--terracotta) 0%, #9c3a23 55%, var(--bordeaux) 100%);
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    color:var(--panna); position:relative; text-align:center;
  }
  .foto-ph .star{ font-size:140px; line-height:1; }
  .foto-ph .nome{
    margin-top:18px; font-family:'Fraunces',Georgia,serif; font-weight:900;
    font-size:80px; line-height:.98; letter-spacing:-1px; text-shadow:0 4px 14px rgba(0,0,0,.28);
  }
  .foto-ph .nota{
    margin-top:16px; font-family:'Inter',sans-serif; font-size:25px; font-weight:800;
    letter-spacing:3px; text-transform:uppercase; opacity:.94;
  }
  .foto-ph .ph-tag{
    position:absolute; bottom:18px; right:20px;
    font-family:'Inter',sans-serif; font-size:18px; font-weight:800;
    letter-spacing:1px; opacity:.6;
  }

  /* riga "1 ingrediente, 1 bottega" sotto la foto */
  .credito{
    position:absolute; left:90px; right:90px; top:1462px;
    display:flex; gap:16px; justify-content:center;
  }
  .credito .chip{
    background:var(--bianco); border:2px solid var(--oliva); border-radius:50px;
    padding:14px 26px; font-family:'Inter',sans-serif; font-weight:800;
    font-size:26px; color:var(--inchiostro); letter-spacing:.3px;
  }
  .credito .chip b{ color:var(--bordeaux); }

  /* CTA finale (lista d'attesa) */
  .cta{
    position:absolute; left:80px; right:80px; bottom:230px; text-align:center;
  }
  .cta .box{
    display:inline-block; background:var(--bordeaux); color:var(--panna);
    font-family:'Inter',sans-serif; font-weight:900; font-size:40px;
    letter-spacing:.5px; padding:24px 44px; border-radius:14px;
    box-shadow:0 12px 30px rgba(184,42,40,.32);
  }
  .cta .sotto{
    margin-top:18px; font-family:'Fraunces',Georgia,serif; font-style:italic;
    font-size:30px; color:var(--inchiostro); opacity:.85;
  }

  /* footer brand */
  .brand{ position:absolute; left:0; right:0; bottom:96px; text-align:center; }
  .brand .tag{
    font-family:'Fraunces',Georgia,serif; font-style:italic; font-weight:600;
    font-size:34px; color:var(--terracotta);
  }
  .brand .handle{
    margin-top:8px; font-family:'Inter',sans-serif; font-weight:800;
    font-size:25px; letter-spacing:2px; color:var(--inchiostro); opacity:.7;
  }
</style>
</head>
<body>
  <div class="carta"></div>
  <div class="cornice"></div>
  <div class="nastro">DOP</div>

  <div class="hook">
    <div class="occhiello">Ricetta di Piacenza</div>
    <div class="domanda">La vera stella<br>di questo piatto?</div>
    <div class="hero">La Coppa Piacentina DOP<br>di Garetti, in Piazza Duomo.</div>
  </div>

  <div class="foto">
    <div class="foto-ph">
      <div class="star">⭐</div>
      <div class="nome">Gnocco fritto<br>&amp; Coppa DOP</div>
      <div class="nota">il piatto della domenica</div>
      <div class="ph-tag">[FOTO PIATTO — sostituire]</div>
    </div>
  </div>

  <div class="credito">
    <div class="chip">1 ricetta semplice</div>
    <div class="chip"><b>1 bottega vera</b></div>
  </div>

  <div class="cta">
    <div class="box">Entra in lista d'attesa →</div>
    <div class="sotto">i primi 50 = prima consegna gratis</div>
  </div>

  <div class="brand">
    <div class="tag">La spesa che tiene viva la città.</div>
    <div class="handle">@mycity.piacenza</div>
  </div>
</body>
</html>`;

async function main() {
  mkdirSync(dirname(OUT), { recursive: true });
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.setContent(html, { waitUntil: "networkidle" });
  try { await page.evaluate(() => document.fonts.ready); } catch {}
  await page.waitForTimeout(400);
  await page.screenshot({ path: OUT });
  await browser.close();
  console.log("OK ->", OUT);
}
main().catch((e) => { console.error(e); process.exit(1); });
