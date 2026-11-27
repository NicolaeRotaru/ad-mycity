// Controllo dell'HTML come lo legge Telegram (parse_mode HTML): tag ammessi, tag chiusi e annidati bene, entità
// valide, lunghezza del testo dopo il parsing ≤ 4096. Restituisce l'elenco dei problemi (vuoto = a posto).
export function controllaTg(s) {
  const problemi = [];
  const ammessi = new Set(['b', 'strong', 'i', 'em', 'u', 'ins', 's', 'strike', 'del', 'a', 'code', 'pre', 'tg-spoiler', 'span', 'blockquote', 'tg-emoji']);
  const pila = [];
  let testo = '';
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === '<') {
      const fine = s.indexOf('>', i);
      if (fine < 0) { problemi.push(`tag aperto e mai chiuso con «>» alla posizione ${i}: «${s.slice(i, i + 40)}»`); break; }
      const dentro = s.slice(i + 1, fine);
      const m = /^(\/?)([a-z-]+)(\s[^]*)?$/i.exec(dentro);
      if (!m) { problemi.push(`tag illeggibile «<${dentro.slice(0, 30)}>»`); i = fine + 1; continue; }
      const [, chiude, nome] = m;
      if (!ammessi.has(nome.toLowerCase())) problemi.push(`tag non ammesso «${nome}»`);
      if (chiude) { const top = pila.pop(); if (top !== nome.toLowerCase()) problemi.push(`chiusura «</${nome}>» ma era aperto «${top}»`); }
      else pila.push(nome.toLowerCase());
      i = fine + 1; continue;
    }
    if (c === '&') {
      const m = /^&(lt|gt|amp|quot|#\d+|#x[0-9a-f]+);/i.exec(s.slice(i, i + 12));
      if (!m) problemi.push(`«&» non protetto alla posizione ${i}: «${s.slice(i, i + 12)}»`);
      testo += 'x'; i += m ? m[0].length : 1; continue;
    }
    testo += c; i++;
  }
  if (pila.length) problemi.push(`tag rimasti aperti: ${pila.join(', ')}`);
  if (testo.length > 4096) problemi.push(`testo di ${testo.length} caratteri dopo il parsing (Telegram: 4096)`);
  if (/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(s)) problemi.push('mezzo carattere (surrogato spaiato)');
  return problemi;
}
