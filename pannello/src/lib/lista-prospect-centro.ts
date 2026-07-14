/** Mappa prospect Piacenza — fonte chat AD 14/7/2026 (pre-Kaefu). */
export type VoceProspect = {
  nome: string;
  tipo: string;
  indirizzo?: string;
  nota?: string;
};

export type SezioneProspect = {
  id: string;
  titolo: string;
  nota?: string;
  apertoDefault?: boolean;
  voci: VoceProspect[];
};

export const LISTA_PROSPECT_CENTRO: SezioneProspect[] = [
  {
    id: "live",
    titolo: "Già su MyCity",
    nota: "Completare, non reinserire",
    apertoDefault: true,
    voci: [{ nome: "Pane Quotidiano", tipo: "panetteria", indirizzo: "Via Calzolai" }],
  },
  {
    id: "carrello",
    titolo: "Priorità massima — completano il carrello",
    nota: "Dopo PQ e bici · onda 1",
    apertoDefault: true,
    voci: [
      { nome: "Antica Salumeria Garetti", tipo: "salumeria DOP", indirizzo: "Piazza Duomo 44" },
      { nome: "Peretti Frutta e Verdura", tipo: "ortofrutta", indirizzo: "Via Alberici Fratelli" },
      { nome: "Caseificio Amendolara", tipo: "formaggi/gastronomia", indirizzo: "Via Trento 7" },
    ],
  },
  {
    id: "centro",
    titolo: "Altre botteghe del centro",
    nota: "Mappa giugno 2026 — verificare sul campo",
    voci: [
      { nome: "Manzotti", tipo: "forno" },
      { nome: "Groppi", tipo: "forno", indirizzo: "Via Chiapponi", nota: "anche pasticceria — verificare" },
      { nome: "Bertonazzi", tipo: "forno" },
      { nome: "Sidoli", tipo: "forno" },
      { nome: "Tota", tipo: "forno" },
      { nome: "Montanari", tipo: "salumeria", indirizzo: "P.za Casali" },
      { nome: "Sbarretti", tipo: "salumeria/gastronomia" },
      { nome: "Tansini", tipo: "salumeria/gastronomia" },
      { nome: "Equina Bissi", tipo: "macelleria" },
      { nome: "Serafini", tipo: "macelleria" },
      { nome: "BioVivo", tipo: "ortofrutta" },
      { nome: "Valemar", tipo: "pescheria", indirizzo: "Mercato" },
      { nome: "Perdoni", tipo: "pescheria", indirizzo: "Via Cittadella 25" },
      { nome: "Bricchi", tipo: "pescheria" },
      { nome: "Taverna del Gusto", tipo: "enoteca" },
      { nome: "Maison du Cognac", tipo: "enoteca" },
      { nome: "Marenghi", tipo: "enoteca" },
      { nome: "da Renato", tipo: "enoteca" },
      { nome: "Alloni Fiori", tipo: "fioraio", indirizzo: "Corso V.E. 114" },
      { nome: "L'Arcobaleno del Fiore", tipo: "fioraio" },
      { nome: "Mercato del Caffè", tipo: "torrefazione" },
      { nome: "Torrefazione Artigianale", tipo: "torrefazione", indirizzo: "Chiostri Duomo" },
      { nome: "Pelizzeni", tipo: "caffè/torrefazione" },
    ],
  },
  {
    id: "database",
    titolo: "Dieci botteghe dal database lead",
    nota: "Onda 2 · fonte lead 30/6/2026",
    voci: [
      { nome: "Frolla Couture", tipo: "panetteria", indirizzo: "Via Felice Frasi 8f" },
      { nome: "Rasparini panificio", tipo: "panetteria", indirizzo: "Piazza Borgo 26" },
      { nome: "Struzzi", tipo: "panetteria", indirizzo: "Via Roma 95" },
      { nome: "Panetteria Del Corso", tipo: "panetteria", indirizzo: "Corso V.E. II 181" },
      { nome: "Macelleria Callegari dal 1961", tipo: "macelleria", indirizzo: "Stradone Farnese" },
      { nome: "Anzico Forno", tipo: "forno", indirizzo: "Via Giuseppe Taverna 82" },
      { nome: "L'Albero del Pane", tipo: "panetteria", indirizzo: "Via Dieci Giugno 80" },
      { nome: "Macelleria", tipo: "macelleria", indirizzo: "Via Scalabrini 16a" },
      { nome: "Macelleria Polleria", tipo: "polleria", indirizzo: "Viale Pubblico Passeggio 88" },
      { nome: "Macelleria Carne Bovina", tipo: "macelleria", indirizzo: "Via Campagna 54" },
    ],
  },
  {
    id: "ristoranti",
    titolo: "Ristoranti e trattorie",
    nota: "Non clienti MyCity (regola 13/7)",
    voci: [
      { nome: "Tigellabella", tipo: "tigelleria", indirizzo: "Via Illica" },
      { nome: "Trattoria La Forchetta", tipo: "trattoria", indirizzo: "Via Borghetto 1" },
      { nome: "Le Tre Ganasce da Andrea", tipo: "osteria", indirizzo: "Via San Bartolomeo 62" },
      { nome: "Osteria Carducci", tipo: "osteria", indirizzo: "Via Carducci" },
      { nome: "La Dispensa de i Balocchi", tipo: "ristorante", indirizzo: "Largo Gioia 3" },
      { nome: "Trattoria dei Pescatori", tipo: "trattoria", indirizzo: "Calendasco", nota: "fuori raggio città" },
    ],
  },
  {
    id: "gelaterie",
    titolo: "Gelaterie e pasticcerie",
    nota: "Non botteghe core — prospect separati",
    voci: [
      { nome: "Bardini", tipo: "gelateria/ciocolateria", indirizzo: "Largo Battisti 19" },
      { nome: "Gelateria del Duomo", tipo: "gelateria" },
      { nome: "La Golosa", tipo: "gelateria" },
      { nome: "Opi", tipo: "pasticceria" },
      { nome: "Gobbi", tipo: "pasticceria" },
    ],
  },
  {
    id: "bar",
    titolo: "Bar e caffè",
    nota: "Non botteghe spesa",
    voci: [
      { nome: "Grida Caffè", tipo: "bar", indirizzo: "P.za Cavalli" },
      { nome: "I Portici", tipo: "bar", indirizzo: "P.za Duomo" },
      { nome: "Seven Café", tipo: "bar" },
      { nome: "Mirabilia", tipo: "bar" },
      { nome: "Kiosko", tipo: "bar" },
      { nome: "Bar tabaccheria", tipo: "bar", indirizzo: "Via Cittadella" },
    ],
  },
  {
    id: "delivery",
    titolo: "Pizza, sushi, burger",
    nota: "Terreno Glovo/Deliveroo",
    voci: [
      { nome: "l'arte della pizza", tipo: "pizzeria" },
      { nome: "Pizzeria al km zero", tipo: "pizzeria" },
      { nome: "Chiere", tipo: "pizzeria" },
      { nome: "Crudo", tipo: "pizzeria" },
      { nome: "Kashima", tipo: "sushi" },
      { nome: "SoSushi", tipo: "sushi" },
      { nome: "Koya", tipo: "sushi" },
      { nome: "Giustospirito", tipo: "burger" },
      { nome: "Walker Burger", tipo: "burger" },
      { nome: "KPC", tipo: "burger" },
    ],
  },
  {
    id: "super",
    titolo: "Supermercati di vicinato",
    nota: "Non target fase 1",
    voci: [
      { nome: "Conad", tipo: "supermercato", indirizzo: "Via Deledda" },
      { nome: "CRAI", tipo: "supermercato", indirizzo: "Via Cittadella" },
      { nome: "Gulliver", tipo: "supermercato", indirizzo: "Via Rio Farnese" },
    ],
  },
];

export function totaleProspect(): number {
  return LISTA_PROSPECT_CENTRO.reduce((n, s) => n + s.voci.length, 0);
}
