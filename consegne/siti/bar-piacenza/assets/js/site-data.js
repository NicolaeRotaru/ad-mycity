/* Bar Piacenza — UNICA fonte dei contenuti del sito.
   Ogni valore con il commento «DA CONFERMARE» è un segnaposto: l'elenco completo
   è in CONTENUTI-DA-SOSTITUIRE.md. Dopo una modifica: node tools/sincronizza.mjs
   (aggiorna il <noscript> e i link statici) e node tools/controlla.mjs. */
window.BP = window.BP || {};
window.BP.data = {
  locale: {
    nome: 'Bar Piacenza',
    tipo: 'BarOrPub', // schema.org: BarOrPub oppure CafeOrCoffeeShop
    frase: 'Caffè al banco, pranzo veloce e aperitivo in centro a Piacenza.',
    indirizzo: { // DA CONFERMARE
      via: 'Via XX Settembre 1',
      cap: '29121',
      citta: 'Piacenza',
      provincia: 'PC',
      regione: 'Emilia-Romagna',
      zona: 'a due passi da Piazza Cavalli'
    },
    geo: { lat: 45.0521, lng: 9.6937 }, // DA CONFERMARE (indicative)
    telefono: { e164: '+390523000000', testo: '0523\u00a0000000' }, // DA CONFERMARE
    whatsapp: '393330000000', // DA CONFERMARE · solo cifre con prefisso; null = niente WhatsApp
    email: 'ciao@barpiacenza.it', // DA CONFERMARE
    social: { // DA CONFERMARE
      instagram: { url: 'https://www.instagram.com/barpiacenza/', nome: '@barpiacenza' },
      facebook: { url: 'https://www.facebook.com/barpiacenza', nome: 'Facebook' },
      tiktok: null
    },
    ragioneSociale: 'Bar Piacenza s.n.c.', // DA CONFERMARE
    partitaIva: '01823450330', // DA CONFERMARE · d'esempio, cifra di controllo volutamente errata
    dominio: 'https://DOMINIO-DA-DEFINIRE.it', // DA CONFERMARE · senza barra finale
    prezzi: '€', // fascia di prezzo per Google
    agenzia: { nome: 'Studio Gotico', url: '' }, // DA CONFERMARE
    parcheggio: 'Il centro storico è zona a traffico limitato. Il parcheggio più comodo è in Piazza Cittadella, a circa cinque minuti a piedi.', // DA CONFERMARE
    mezzi: 'Dalla stazione ferroviaria sono circa quindici minuti a piedi; diverse linee urbane fermano in centro.' // DA CONFERMARE
  },

  // Orari nel fuso di Piacenza. Fasce "HH:MM"; se la chiusura è prima dell'apertura
  // la fascia finisce dopo mezzanotte (es. ['18:00', '02:00']). Giorni: 0 = domenica.
  orari: { // DA CONFERMARE
    fuso: 'Europe/Rome',
    settimana: {
      1: [['06:30', '20:00']],
      2: [['06:30', '20:00']],
      3: [['06:30', '20:00']],
      4: [['06:30', '20:00']],
      5: [['06:30', '20:00']],
      6: [['07:00', '23:00']],
      0: []
    },
    // Eccezioni su un giorno: fasce: [] = chiuso. Vincono su ferie e settimana.
    eccezioni: [
      { data: '2026-12-24', fasce: [['07:00', '15:00']], nota: 'Vigilia di Natale' },
      { data: '2026-12-25', fasce: [], nota: 'Natale' },
      { data: '2026-12-26', fasce: [], nota: 'Santo Stefano' },
      { data: '2026-12-31', fasce: [['07:00', '15:00']], nota: 'San Silvestro' },
      { data: '2027-01-01', fasce: [], nota: 'Capodanno' }
    ],
    ferie: [
      { dal: '2027-08-09', al: '2027-08-22', nota: 'Ferie estive' }
    ]
  },

  prenotazioni: true, // DA CONFERMARE · true = il modulo prenota un tavolo via WhatsApp

  giornata: [ // DA CONFERMARE
    { ora: '6:30', titolo: 'Colazione', testo: 'Espresso al banco, cappuccino, brioche sfogliate e spremute. Due minuti in piedi o mezz’ora con il giornale.' },
    { ora: '12:00', titolo: 'Pranzo veloce', testo: 'Panini con la coppa, toast, insalatone e un primo del giorno scritto sulla lavagna.' },
    { ora: '18:00', titolo: 'Aperitivo', testo: 'Spritz al bitter, Gutturnio al calice e il tagliere dei salumi piacentini.' },
    { ora: '21:00', titolo: 'Il sabato sera', testo: 'Il sabato restiamo aperti fino alle 23:00: due chiacchiere e un ultimo bicchiere.' }
  ],

  // Immagini: «img» è il nome base in assets/img/ (esistono -480, -960, -1600 in .avif .webp .jpg).
  // provvisoria: true = illustrazione segnaposto, da sostituire con la foto vera (SHOTLIST.md).
  prodottiFirma: [ // DA CONFERMARE
    { nome: 'Cappuccino e brioche', testo: 'Latte montato a vapore e una brioche sfogliata al burro: la colazione del bar.', prezzo: 3.0, img: 'cappuccino-brioche', alt: 'Cappuccino con il cuore di latte e brioche sul bancone in marmo, vista dall’alto', provvisoria: true },
    { nome: 'Bortellina con i salumi', testo: 'La frittella sottile della tradizione piacentina, con coppa e salame.', prezzo: 7.5, img: 'bortellina', alt: 'Bortellina piegata su un piatto con fette di coppa e salame', provvisoria: true },
    { nome: 'Tagliere dei tre DOP', testo: 'Coppa, salame e pancetta piacentini, con pane e chisolini.', prezzo: 14, img: 'tagliere', alt: 'Tagliere di legno con coppa, salame, pancetta e pane', provvisoria: true },
    { nome: 'Spritz al bitter', testo: 'Bitter, prosecco, soda e una fetta d’arancia.', prezzo: 6.5, img: 'spritz', alt: 'Bicchiere di spritz rosso con ghiaccio e fetta d’arancia, visto dall’alto', provvisoria: true },
    { nome: 'Gutturnio al calice', testo: 'Il rosso frizzante dei Colli Piacentini, servito fresco.', prezzo: 4.5, img: 'gutturnio', alt: 'Calice di vino rosso accanto alla bottiglia', provvisoria: true }
  ],

  allergeni: ['Cereali contenenti glutine', 'Crostacei', 'Uova', 'Pesce', 'Arachidi', 'Soia', 'Latte', 'Frutta a guscio', 'Sedano', 'Senape', 'Semi di sesamo', 'Anidride solforosa e solfiti', 'Lupini', 'Molluschi'],
  etichette: { veg: 'Vegetariano', vegan: 'Vegano', sg: 'Senza glutine' },

  // Menu: prezzo in euro; tag tra veg, vegan, sg; allergeni = numeri della legenda (1–14).
  menu: [ // DA CONFERMARE tutto: voci, prezzi e soprattutto allergeni
    { id: 'caffetteria', nome: 'Caffetteria', voci: [
      { nome: 'Espresso', testo: 'Al banco, con il bicchiere d’acqua.', prezzo: 1.3, tag: ['vegan', 'sg'], all: [] },
      { nome: 'Caffè macchiato', testo: 'Espresso con una goccia di latte montato.', prezzo: 1.4, tag: ['veg', 'sg'], all: [7] },
      { nome: 'Cappuccino', testo: 'Espresso e latte montato a vapore. Anche con latte d’avena.', prezzo: 1.7, tag: ['veg', 'sg'], all: [7] },
      { nome: 'Marocchino', testo: 'Espresso, cacao e schiuma di latte.', prezzo: 1.8, tag: ['veg', 'sg'], all: [7] },
      { nome: 'Caffè d’orzo', testo: 'In tazza piccola o grande.', prezzo: 1.5, tag: ['vegan'], all: [1] },
      { nome: 'Caffè al ginseng', testo: 'Dolce e cremoso.', prezzo: 1.6, tag: ['veg'], all: [7] },
      { nome: 'Cioccolata calda', testo: 'Densa, con panna a richiesta.', prezzo: 3.5, tag: ['veg'], all: [7] },
      { nome: 'Tè e tisane', testo: 'Chiedi al banco le miscele del giorno.', prezzo: 2.5, tag: ['vegan', 'sg'], all: [] }
    ] },
    { id: 'colazione', nome: 'Colazione', voci: [
      { nome: 'Brioche vuota', testo: 'Sfogliata al burro.', prezzo: 1.3, tag: ['veg'], all: [1, 3, 7] },
      { nome: 'Brioche alla crema o alla marmellata', testo: 'Sfogliata al burro, farcita.', prezzo: 1.5, tag: ['veg'], all: [1, 3, 7] },
      { nome: 'Brioche vegana ai frutti di bosco', testo: 'Senza burro, latte e uova.', prezzo: 1.6, tag: ['vegan'], all: [1, 6] },
      { nome: 'Bomba alla crema', testo: 'Fritta, ripiena di crema pasticcera.', prezzo: 2, tag: ['veg'], all: [1, 3, 7] },
      { nome: 'Yogurt, granola e frutta', testo: 'Yogurt bianco, granola croccante e frutta di stagione.', prezzo: 4.5, tag: ['veg'], all: [1, 7, 8] },
      { nome: 'Spremuta d’arancia', testo: 'Spremuta al momento.', prezzo: 3.5, tag: ['vegan', 'sg'], all: [] },
      { nome: 'Toast prosciutto e formaggio', testo: 'Pane in cassetta, prosciutto cotto e formaggio fuso.', prezzo: 4, tag: [], all: [1, 7] }
    ] },
    { id: 'pranzo', nome: 'Pranzo', voci: [
      { nome: 'Panino con la coppa piacentina', testo: 'Pane del forno e coppa DOP tagliata al momento.', prezzo: 5.5, tag: [], all: [1] },
      { nome: 'Tramezzino tonno e uova', testo: 'Pane morbido, tonno, uova sode e maionese.', prezzo: 3, tag: [], all: [1, 3, 4] },
      { nome: 'Focaccia farcita del giorno', testo: 'Chiedi al banco la farcitura di oggi.', prezzo: 5, tag: [], all: [1, 7] },
      { nome: 'Bortellina con i salumi', testo: 'La frittella sottile piacentina, con coppa e salame.', prezzo: 7.5, tag: [], all: [1, 3, 7] },
      { nome: 'Primo del giorno', testo: 'Scritto ogni mattina sulla lavagna.', prezzo: 9, tag: [], all: [1, 3, 7] },
      { nome: 'Insalatona', testo: 'Insalata, pomodori, mozzarella e tonno.', prezzo: 9, tag: ['sg'], all: [4, 7] },
      { nome: 'Insalatona vegana', testo: 'Insalata, ceci, verdure grigliate e semi di sesamo.', prezzo: 8.5, tag: ['vegan', 'sg'], all: [11] }
    ] },
    { id: 'aperitivo', nome: 'Aperitivo', voci: [
      { nome: 'Tagliere dei tre DOP, per due', testo: 'Coppa, salame e pancetta piacentini, con pane e chisolini.', prezzo: 14, tag: [], all: [1, 12] },
      { nome: 'Chisolini caldi', testo: 'La pasta fritta piacentina, da mangiare con i salumi.', prezzo: 4.5, tag: [], all: [1] },
      { nome: 'Grana Padano e miele', testo: 'Scaglie di Grana Padano DOP con miele di acacia.', prezzo: 9, tag: ['veg', 'sg'], all: [7] },
      { nome: 'Olive e patatine', testo: 'Per accompagnare il bicchiere.', prezzo: 3, tag: ['vegan'], all: [] }
    ] },
    { id: 'cocktail', nome: 'Cocktail', voci: [
      { nome: 'Spritz al bitter', testo: 'Bitter, prosecco, soda e fetta d’arancia.', prezzo: 6.5, tag: ['vegan', 'sg'], all: [12] },
      { nome: 'Spritz all’Aperol', testo: 'Aperol, prosecco, soda e fetta d’arancia.', prezzo: 6.5, tag: ['vegan', 'sg'], all: [12] },
      { nome: 'Hugo', testo: 'Prosecco, sciroppo di sambuco, menta e soda.', prezzo: 6.5, tag: ['vegan', 'sg'], all: [12] },
      { nome: 'Americano', testo: 'Bitter, vermouth rosso e soda.', prezzo: 7, tag: ['vegan', 'sg'], all: [12] },
      { nome: 'Negroni', testo: 'Gin, bitter e vermouth rosso.', prezzo: 8, tag: ['vegan', 'sg'], all: [12] },
      { nome: 'Gin tonic', testo: 'Gin e acqua tonica, con scorza di limone.', prezzo: 8, tag: ['vegan', 'sg'], all: [] }
    ] },
    { id: 'vini-birre', nome: 'Vini e birre', voci: [
      { nome: 'Gutturnio frizzante, al calice', testo: 'Il rosso dei Colli Piacentini, servito fresco.', prezzo: 4.5, tag: ['sg'], all: [12] },
      { nome: 'Ortrugo frizzante, al calice', testo: 'Bianco secco dei Colli Piacentini.', prezzo: 4.5, tag: ['sg'], all: [12] },
      { nome: 'Malvasia di Candia, al calice', testo: 'Bianco aromatico dei Colli Piacentini.', prezzo: 5, tag: ['sg'], all: [12] },
      { nome: 'Prosecco, al calice', testo: 'Secco e fresco.', prezzo: 4.5, tag: ['sg'], all: [12] },
      { nome: 'Birra alla spina, piccola', testo: 'Chiara, 20 cl.', prezzo: 3.5, tag: ['vegan'], all: [1] },
      { nome: 'Birra alla spina, media', testo: 'Chiara, 40 cl.', prezzo: 5, tag: ['vegan'], all: [1] }
    ] },
    { id: 'analcolici', nome: 'Analcolici', voci: [
      { nome: 'Acqua minerale, mezzo litro', testo: 'Naturale o frizzante.', prezzo: 1.5, tag: ['vegan', 'sg'], all: [] },
      { nome: 'Bibite in lattina', testo: 'Cola, aranciata, chinotto.', prezzo: 3, tag: ['vegan', 'sg'], all: [] },
      { nome: 'Succhi di frutta', testo: 'Pesca, pera, albicocca.', prezzo: 3, tag: ['vegan', 'sg'], all: [] },
      { nome: 'Bitter analcolico', testo: 'Rosso o bianco, con ghiaccio e arancia.', prezzo: 3.5, tag: ['vegan', 'sg'], all: [] },
      { nome: 'Spritz analcolico', testo: 'Bitter analcolico, soda e arancia.', prezzo: 5.5, tag: ['vegan', 'sg'], all: [] },
      { nome: 'Centrifuga del giorno', testo: 'Frutta e verdura: chiedi al banco quella di oggi.', prezzo: 5, tag: ['vegan', 'sg'], all: [] }
    ] }
  ],

  // Eventi: { titolo, inizio: 'AAAA-MM-GGTHH:MM', fine: 'AAAA-MM-GGTHH:MM', testo }.
  // Quelli finiti spariscono da soli. Elenco vuoto = stato vuoto con il link a Instagram.
  eventi: [], // DA CONFERMARE

  // Solo per mostrare al titolare come appaiono le serate: index.html?anteprima=eventi
  eventiAnteprima: [
    { titolo: 'Aperitivo con il trio jazz', inizio: '+3T19:00', fine: '+3T22:00', testo: 'Esempio di serata: contrabbasso, chitarra e voce al banco.' },
    { titolo: 'Degustazione Gutturnio e Ortrugo', inizio: '+10T18:30', fine: '+10T20:30', testo: 'Esempio di serata: tre calici con il produttore e il tagliere dei tre DOP.' },
    { titolo: 'Partita sul maxischermo', inizio: '+17T20:45', fine: '+17T22:45', testo: 'Esempio di serata: la partita, gli amici e i chisolini caldi.' }
  ],

  galleria: [ // DA CONFERMARE · tutte illustrazioni segnaposto (SHOTLIST.md)
    { img: 'insegna-sera', alt: 'L’insegna del bar accesa la sera, con il cartello «aperto» sulla porta', w: 1600, h: 2000, provvisoria: true },
    { img: 'bicchieri-aperitivo', alt: 'Tre bicchieri dell’aperitivo sul bancone, visti dall’alto: spritz, americano e negroni', w: 1600, h: 1600, provvisoria: true },
    { img: 'palazzo-gotico', alt: 'Il Palazzo Gotico di Piazza Cavalli: marmo sotto, mattone e merli sopra', w: 1600, h: 1600, provvisoria: true },
    { img: 'caffe-zucchero', alt: 'Due tazzine di espresso e le bustine di zucchero sul marmo', w: 1600, h: 1600, provvisoria: true },
    { img: 'macchina-espresso', alt: 'Il caffè che scende dal gruppo della macchina dell’espresso nella tazzina', w: 1600, h: 2000, provvisoria: true },
    { img: 'listino', alt: 'Il listino a lettere bianche sul pannello verde dietro al banco', w: 1600, h: 2000, provvisoria: true }
  ],

  recensioni: {
    showReviews: false, // true SOLO con recensioni vere copiate dalla scheda Google
    voci: [] // { nome: 'Nome come appare su Google', stelle: 5, testo: '…', data: 'AAAA-MM' }
  },

  video: { // video in loop nell'hero: false finché non c'è il girato vero
    attivo: false,
    mp4: 'assets/video/hero.mp4',
    webm: 'assets/video/hero.webm',
    poster: 'assets/video/hero-poster.jpg'
  }
};
