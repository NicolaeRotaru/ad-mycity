// Genera un QR code PNG in locale (offline, nessun servizio esterno).
// Uso:  node genera-qr.mjs "<URL>" [output.png]
import QRCode from "qrcode";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { BRAND } from "./brand.mjs";

const url = process.argv[2];
const out = process.argv[3] || "output/qr.png";
if (!url) {
  console.error('Uso: node genera-qr.mjs "<URL>" [output.png]');
  process.exit(1);
}
mkdirSync(dirname(out), { recursive: true });
await QRCode.toFile(out, url, {
  width: 1000,
  margin: 2,
  errorCorrectionLevel: "M",
  color: { dark: BRAND.colori.inchiostro, light: BRAND.colori.bianco },
});
console.log(`QR creato: ${out}  ->  ${url}`);
