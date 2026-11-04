-- 🚦 UN LAVORO SOLO IN ATTESA PER OGNI RICHIESTA, E VINCE IL PIÙ RECENTE
--
-- Nicola, 4/11/2026: «togli tutti i lavori in coda doppi ed impedisci che si creano doppioni».
--
-- IL DIFETTO, letto dal vivo il 4/11 alle 21:40. In coda c'erano 200 lavori in attesa, ma solo 16
-- lavori diversi. Il server è fermo dal 25/9, e ogni mattina alle 9 il battito del Pannello rimette
-- in coda lo stesso giro e gli stessi playbook: 29 giri identici, 29 copie di ognuno dei cinque
-- playbook giornalieri, 5 copie di ognuno dei dieci settimanali. Alla riaccensione il server chiude
-- da solo come «scaduto» ogni lavoro in attesa da più di 48 ore, e ogni giro da più di 2
-- (cervello/worker.sh, scarta_lavori_scaduti): la coda era rumore, che copre il lavoro buono.
--
-- LA RADICE. Nella coda scrivono quattro mani (il Pannello, le cadenze, le sentinelle, il worker),
-- e ognuna aveva il SUO controllo contro i doppioni, ognuno diverso: le cadenze guardano il tipo, le
-- sentinelle una chiave nel testo, i playbook «già accodato OGGI», il giro del battito niente. Un
-- freno per mano si dimentica alla mano successiva. Qui il freno è uno, nel posto dove arrivano tutte.
--
-- LA REGOLA. È un doppione un lavoro con la stessa corsia (negozio_id), lo stesso tipo, la stessa
-- conversazione (gruppo_id) e lo stesso testo di uno che è GIÀ IN ATTESA. Ne resta uno, il più
-- recente; l'altro passa ad «annullato» con una nota che dice chi lo sostituisce. Annullato è
-- reversibile: niente si cancella.
--
-- PERCHÉ IL PIÙ RECENTE, e non il più vecchio (collaudo del 4/11). Tenendo il più vecchio, il freno
-- avrebbe rifiutato ogni copia nuova e lasciato in coda solo quella che invecchia: alla riaccensione
-- il server l'avrebbe chiusa come scaduta, e non sarebbe partito niente. Così invece in coda c'è
-- sempre una copia sola, ed è quella fresca. E nessuno riceve un errore: chi accoda, accoda.
--
-- LE DUE PORTE. ① Un lavoro NUOVO identico a uno in attesa: entra, e quello vecchio si annulla.
-- ② Un lavoro che esiste già e TORNA in attesa (il ritento del worker, il recupero degli orfani, il
-- pulsante «recupera» del Pannello) mentre il gemello aspetta già: il gemello è per forza più
-- recente, quindi si annulla quello che torna. Nessuna delle due porte dà un errore: un errore sul
-- ritorno lascerebbe un lavoro appeso «in corso».
--
-- LIMITI DICHIARATI (collaudo del 4/11). ① Il controllo guarda le righe che il chiamante vede: tutte
-- le mani scrivono col ruolo di servizio, che le vede tutte. ② Tutte scrivono in READ COMMITTED, che è
-- quello del servizio REST: in REPEATABLE READ due gemelli possono restare in attesa insieme, e chi
-- inserisce mentre il worker prende il vecchio può ricevere un errore di serializzazione. ③ Due
-- transazioni che inseriscono più lavori diversi in ordine opposto possono finire in un deadlock:
-- oggi nessuno inserisce più lavori nella stessa transazione. ④ Un UPDATE che cambia il TESTO di un
-- lavoro in attesa non è guardato: nessuno lo fa.
--
-- Si può rilanciare: la pulizia non trova più niente e il freno si ricrea uguale.
-- Prova: node --test cervello/test/coda-senza-doppioni.test.mjs (un Postgres vero, usa e getta).

-- ① Il freno. Nasce PRIMA della pulizia: chi accoda mentre la pulizia gira trova già il freno.
--    Una funzione, due momenti: DOPO un inserimento (porta ①) e PRIMA di un ritorno in attesa (porta ②).
--    L'annullo del vecchio sta DOPO l'inserimento e non prima: un inserimento che poi non entra
--    (un ON CONFLICT che finisce in DO NOTHING o in un aggiornamento) non deve annullare niente.
create or replace function public.lavori_un_solo_in_attesa()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  gemello uuid;
  quando  text := to_char(now() at time zone 'Europe/Rome', 'YYYY-MM-DD HH24:MI');
begin
  if new.stato is distinct from 'in_attesa' then
    return case when tg_when = 'AFTER' then null else new end;
  end if;
  if tg_op = 'UPDATE' and old.stato is not distinct from 'in_attesa' then
    return new;
  end if;
  -- Due scritture gemelle nello stesso istante: senza questo lucchetto si vedrebbero a vicenda
  -- vuote e resterebbero in attesa tutte e due. È un lucchetto di TRANSAZIONE: con uno di sessione,
  -- una connessione che resta aperta (come quelle del servizio REST) bloccherebbe i gemelli dopo.
  perform pg_advisory_xact_lock(
    hashtextextended(concat_ws('|', new.negozio_id, new.tipo, coalesce(new.gruppo_id, ''), md5(new.richiesta)), 0));

  if tg_op = 'INSERT' then
    -- Porta ①: il nuovo è entrato, si annulla il vecchio. Il filtro sullo stato si rilegge dopo il
    -- lucchetto della riga: se il worker l'ha appena preso, non è più in attesa e non si tocca.
    update public.lavori
       set stato      = 'annullato',
           updated_at = now(),
           risultato  = concat_ws(E'\n', nullif(risultato, ''),
                          '[doppione] annullato il ' || quando
                          || ': sostituito da un lavoro identico più recente, ' || new.id)
     where stato = 'in_attesa'
       and id is distinct from new.id
       and negozio_id is not distinct from new.negozio_id
       and tipo = new.tipo
       and coalesce(gruppo_id, '') = coalesce(new.gruppo_id, '')
       and md5(richiesta) = md5(new.richiesta);
    return null;
  end if;

  -- Porta ②: chi torna in attesa trova il gemello già lì, e il gemello è più recente.
  select id into gemello
    from public.lavori
   where stato = 'in_attesa'
     and id is distinct from new.id
     and negozio_id is not distinct from new.negozio_id
     and tipo = new.tipo
     and coalesce(gruppo_id, '') = coalesce(new.gruppo_id, '')
     and md5(richiesta) = md5(new.richiesta)
   limit 1;
  if gemello is not null then
    new.stato     := 'annullato';
    new.risultato := concat_ws(E'\n', nullif(new.risultato, ''),
                       '[doppione] annullato il ' || quando
                       || ': tornava in attesa, ma lo stesso lavoro aspettava già come ' || gemello);
  end if;
  return new;
end
$$;

drop trigger if exists lavori_un_solo_in_attesa on public.lavori;
drop trigger if exists lavori_un_solo_in_attesa_dopo on public.lavori;
create trigger lavori_un_solo_in_attesa
  before update of stato on public.lavori
  for each row execute function public.lavori_un_solo_in_attesa();
create trigger lavori_un_solo_in_attesa_dopo
  after insert on public.lavori
  for each row execute function public.lavori_un_solo_in_attesa();

-- ② Il controllo del freno resta veloce anche con migliaia di righe: guarda solo quelle in attesa.
create index if not exists lavori_in_attesa_impronta_idx
  on public.lavori (tipo, md5(richiesta))
  where stato = 'in_attesa';

-- ③ La pulizia: in ogni gruppo di gemelli resta il più recente, gli altri vanno ad «annullato».
--    Passare da in attesa ad annullato non tocca il freno, che guarda solo chi entra in attesa.
with gemelli as (
  select id,
         first_value(id) over w as tenuto,
         row_number()    over w as posto
    from public.lavori
   where stato = 'in_attesa'
  window w as (partition by negozio_id, tipo, coalesce(gruppo_id, ''), md5(richiesta)
               order by created_at desc, id desc)
)
update public.lavori l
   set stato      = 'annullato',
       updated_at = now(),
       risultato  = concat_ws(E'\n', nullif(l.risultato, ''),
                      '[doppione] annullato il ' || to_char(now() at time zone 'Europe/Rome', 'YYYY-MM-DD HH24:MI')
                      || ': sostituito da un lavoro identico più recente, ' || g.tenuto)
  from gemelli g
 where l.id = g.id
   and g.posto > 1;

-- PER TORNARE INDIETRO (tutto reversibile):
--   drop trigger if exists lavori_un_solo_in_attesa on public.lavori;
--   drop trigger if exists lavori_un_solo_in_attesa_dopo on public.lavori;
--   drop function if exists public.lavori_un_solo_in_attesa();
--   drop index if exists public.lavori_in_attesa_impronta_idx;
-- e SOLO DOPO aver tolto il freno (se no tornerebbero subito annullati), per rimettere in attesa i
-- doppioni annullati (si riconoscono dalla nota):
--   update public.lavori set stato = 'in_attesa', updated_at = now()
--    where stato = 'annullato' and risultato like '%[doppione] annullato il %';
