// I tre abbonamenti, uguali a quelli del programma della scheda (cervello/scheda-cliente.mjs → FASCE),
// che a sua volta li prende dal sito (mycity, lib/agenzia/preventivo.ts) e dal registro dei fatti
// (sdg.abbonamenti). Qui ne serve solo la parte che il venditore legge in strada.
// La prova test/fasce.test.mjs diventa rossa se questa copia e quella del programma si separano.

export type IdFascia = 'base' | 'business' | 'premium';

export type Fascia = {
  nome: string;
  centesimi: number;
  post: number;
  video: number;
  inPratica: { sito: string; piano: string; foto: string; analisi: string };
  perChi: string;
};

export const FASCE: Record<IdFascia, Fascia> = {
  base: {
    nome: 'Base', centesimi: 30000, post: 8, video: 0,
    inPratica: { sito: 'Una pagina col vostro nome', piano: '8 contenuti al mese, senza video', foto: 'Una sessione all’avvio', analisi: 'Una, all’avvio' },
    perChi: 'Per essere online e vendere da subito, con un aiuto costante ma leggero.',
  },
  business: {
    nome: 'Business', centesimi: 50000, post: 12, video: 2,
    inPratica: { sito: 'Più pagine col vostro nome', piano: '12 contenuti al mese, di cui 2 video brevi', foto: 'Una sessione di foto ogni tre mesi, più un video al mese', analisi: 'Una ogni mese' },
    perChi: 'Per crescere ogni settimana: più contenuti, più clienti che ti trovano.',
  },
  premium: {
    nome: 'Premium', centesimi: 99900, post: 20, video: 4,
    inPratica: { sito: 'Più pagine, aggiornato da noi ogni mese', piano: '20 contenuti al mese, 4 sono video, più le storie', foto: 'Foto e video ogni mese', analisi: 'Una ogni settimana, e un incontro al mese' },
    perChi: 'Il servizio completo: foto e video ogni mese, un referente tutto tuo.',
  },
};

export const ID_FASCE = Object.keys(FASCE) as IdFascia[];

/** Il 10% sui prodotti venduti tramite MyCity resta anche con l'abbonamento (pricing.commissione, 26/11/2026). */
export const CONDIZIONI = 'Nessun vincolo di durata: disdici quando vuoi, con 30 giorni di preavviso. Il primo mese costa la metà. Su quello che vendete al banco non prendiamo niente; sui prodotti venduti tramite MyCity resta il 10%, che paga la consegna e il servizio.';

/** Come si paga oggi (sdg.pagamento, 26/11/2026): la prova lo confronta col registro dei fatti. */
export const PAGAMENTO = 'Per ora l’abbonamento si paga in contanti, di persona: il pagamento online sul sito arriva più avanti.';

export const euro = (c: number) =>
  (c / 100).toLocaleString('it-IT', { minimumFractionDigits: c % 100 ? 2 : 0, maximumFractionDigits: 2 }) + ' €';

export const eFascia = (v: unknown): v is IdFascia => typeof v === 'string' && v in FASCE;
