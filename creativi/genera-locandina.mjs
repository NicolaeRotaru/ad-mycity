// Genera una locandina A5 stampabile (PDF) col brand MyCity, con QR incorporato.
// Uso:  node genera-locandina.mjs "<URL>" "[titolo]" "[sottotitolo]" [output.pdf]
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { createWriteStream, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { BRAND } from "./brand.mjs";

const url = process.argv[2];
const titolo = process.argv[3] || "LE BOTTEGHE DEL CENTRO, A CASA TUA";
const sottotitolo = process.argv[4] || "Inquadra e iscriviti: i primi 10 hanno la prima spesa in regalo.";
const out = process.argv[5] || "output/locandina.pdf";
if (!url) {
  console.error('Uso: node genera-locandina.mjs "<URL>" "[titolo]" "[sottotitolo]" [output.pdf]');
  process.exit(1);
}
mkdirSync(dirname(out), { recursive: true });

// QR come buffer PNG da incorporare nel PDF
const qrDataUrl = await QRCode.toDataURL(url, {
  margin: 1,
  width: 600,
  errorCorrectionLevel: "M",
  color: { dark: BRAND.colori.inchiostro, light: BRAND.colori.bianco },
});
const qrBuf = Buffer.from(qrDataUrl.split(",")[1], "base64");

const doc = new PDFDocument({ size: "A5", margin: 0 });
doc.pipe(createWriteStream(out));
const W = doc.page.width;
const H = doc.page.height;

// Sfondo panna
doc.rect(0, 0, W, H).fill(BRAND.colori.panna);

// Banda titolo terracotta
doc.rect(0, 0, W, 110).fill(BRAND.colori.terracotta);
doc.fill(BRAND.colori.panna).font("Helvetica-Bold").fontSize(22)
  .text(titolo, 30, 36, { width: W - 60, align: "center" });

// Sottotitolo
doc.fill(BRAND.colori.inchiostro).font("Helvetica").fontSize(13)
  .text(sottotitolo, 36, 138, { width: W - 72, align: "center" });

// QR centrato + cornice senape
const qrSize = 230;
const qrX = (W - qrSize) / 2;
const qrY = 188;
doc.rect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16).lineWidth(2).stroke(BRAND.colori.senape);
doc.image(qrBuf, qrX, qrY, { width: qrSize, height: qrSize });

// Piede: brand + tagline
doc.fill(BRAND.colori.bordeaux).font("Helvetica-Bold").fontSize(16)
  .text("MyCity", 0, H - 74, { width: W, align: "center" });
doc.fill(BRAND.colori.inchiostro).font("Helvetica-Oblique").fontSize(11)
  .text(BRAND.tagline, 0, H - 52, { width: W, align: "center" });

doc.end();
console.log(`Locandina creata: ${out}  (QR -> ${url})`);
