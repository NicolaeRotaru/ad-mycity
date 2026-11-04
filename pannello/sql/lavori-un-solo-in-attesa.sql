-- 🚦 UN LAVORO SOLO IN ATTESA PER OGNI RICHIESTA
--
-- Nicola, 4/11/2026: «togli tutti i lavori in coda doppi ed impedisci che si creano doppioni».
--
-- IL DIFETTO, letto dal vivo il 4/11 alle 21:40. In coda c'erano 200 lavori in attesa, ma solo 16
-- lavori diversi. Il server è fermo dal 25/9, e ogni mattina alle 9 il battito del Pannello rimette
-- in coda lo stesso giro e gli stessi playbook: 29 giri identici, 29 copie di ognuno dei cinque
-- playbook giornalieri, 5 copie di ognuno dei dieci settimanali. Alla riaccensione il server li
-- avrebbe fatti tutti, uno dopo l'altro: lo stesso lavoro ventinove volte.
--
-- LA RADICE. Nella coda scrivono quattro mani (il Pannello, le cadenze, le sentinelle, il worker),
-- e ognuna aveva il SUO controllo contro i doppioni, ognuno diverso: le cadenze guardano il tipo, le
-- sentinelle una chiave nel testo, i playbook «già accodato OGGI», il giro del battito niente. Un
-- freno per mano si dimentica alla mano successiva. Qui il freno è uno, nel posto dove arrivano tutte.
--
-- LA REGOLA. È un doppione un lavoro con la stessa corsia (negozio_id), lo stesso tipo, la stessa
-- conversazione (gruppo_id) e lo stesso testo di uno che è GIÀ IN ATTESA. Si tiene il più vecchio,
-- perché dice da quanto la coda è ferma; gli altri passano ad «annullato», che è reversibile.
--
-- IL FRENO VALE SOLO SULL'INSERIMENTO. Rimettere in attesa un lavoro che esiste già (il ritento del
-- worker, il recupero degli orfani, il pulsante «recupera» del Pannello) non si blocca: un vincolo
-- unico avrebbe fatto fallire quei passaggi, e un lavoro sarebbe rimasto appeso «in corso».
--
-- Chi prova a inserire un doppione riceve l'errore 23505 «lavoro-gia-in-coda» (HTTP 409 dal REST),
-- col codice del lavoro che aspetta già nel campo `details`: il Pannello lo usa al posto di crearne
-- uno nuovo (pannello/src/lib/lavoro-gemello.ts).
--
-- Si può rilanciare: la pulizia non trova più niente e il freno si ricrea uguale.
-- Prova: node --test cervello/test/coda-senza-doppioni.test.mjs (un Postgres vero, usa e getta).

-- ① La pulizia: in ogni gruppo di gemelli resta il più vecchio, gli altri vanno ad «annullato».
with gemelli as (
  select id,
         first_value(id) over w as tenuto,
         row_number()    over w as posto
    from public.lavori
   where stato = 'in_attesa'
  window w as (partition by negozio_id, tipo, coalesce(gruppo_id, ''), md5(richiesta)
               order by created_at, id)
)
update public.lavori l
   set stato      = 'annullato',
       updated_at = now(),
       risultato  = concat_ws(E'\n', nullif(l.risultato, ''),
                      '[doppione] annullato il ' || to_char(now() at time zone 'Europe/Rome', 'YYYY-MM-DD HH24:MI')
                      || ': lo stesso lavoro aspettava già in coda come ' || g.tenuto)
  from gemelli g
 where l.id = g.id
   and g.posto > 1;

-- ② Il freno: prima di ogni inserimento in attesa, si guarda se il gemello c'è già.
create or replace function public.lavori_un_solo_in_attesa()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  gemello uuid;
begin
  if new.stato is distinct from 'in_attesa' then
    return new;
  end if;
  -- Due inserimenti identici nello stesso istante: senza questo lucchetto passerebbero entrambi il
  -- controllo qui sotto. Il lucchetto vale solo per i gemelli e si scioglie a fine transazione.
  perform pg_advisory_xact_lock(
    hashtextextended(concat_ws('|', new.negozio_id, new.tipo, coalesce(new.gruppo_id, ''), md5(new.richiesta)), 0));
  select id into gemello
    from public.lavori
   where stato = 'in_attesa'
     and negozio_id is not distinct from new.negozio_id
     and tipo = new.tipo
     and coalesce(gruppo_id, '') = coalesce(new.gruppo_id, '')
     and md5(richiesta) = md5(new.richiesta)
   order by created_at, id
   limit 1;
  if gemello is not null then
    raise exception 'lavoro-gia-in-coda'
      using errcode = '23505',
            detail  = gemello::text,
            hint    = 'Lo stesso lavoro aspetta già in coda: si usa quello, non se ne crea un altro.';
  end if;
  return new;
end
$$;

drop trigger if exists lavori_un_solo_in_attesa on public.lavori;
create trigger lavori_un_solo_in_attesa
  before insert on public.lavori
  for each row execute function public.lavori_un_solo_in_attesa();

-- ③ Il controllo del freno resta veloce anche con migliaia di righe: guarda solo quelle in attesa.
create index if not exists lavori_in_attesa_impronta_idx
  on public.lavori (tipo, md5(richiesta))
  where stato = 'in_attesa';

-- PER TORNARE INDIETRO (tutto reversibile):
--   drop trigger if exists lavori_un_solo_in_attesa on public.lavori;
--   drop function if exists public.lavori_un_solo_in_attesa();
--   drop index if exists public.lavori_in_attesa_impronta_idx;
-- e, per rimettere in attesa i doppioni annullati da questa pulizia (si riconoscono dalla nota):
--   update public.lavori set stato = 'in_attesa', updated_at = now()
--    where stato = 'annullato' and risultato like '%[doppione] annullato il %';
