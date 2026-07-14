/** Kit da campo per acquisizione botteghe — link fissi in Home. */
export type KitCampoDoc = {
  file: string;
  titolo: string;
  sottotitolo: string;
  emoji: string;
};

export const KIT_CAMPO_BOTTEGHE: KitCampoDoc[] = [
  {
    file: "vendite/2026-07-14-stampa-tascabile-13-botteghe.md",
    titolo: "Scheda tascabile",
    sottotitolo: "13 botteghe · pitch e obiezioni da visita",
    emoji: "🎴",
  },
  {
    file: "vendite/2026-07-14-checklist-operativa-13-botteghe.md",
    titolo: "Checklist operativa",
    sottotitolo: "Dopo il sì · onboarding 20 min",
    emoji: "☑️",
  },
];
