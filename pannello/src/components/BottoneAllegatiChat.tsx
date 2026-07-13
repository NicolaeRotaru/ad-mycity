"use client";

import { Paperclip } from "lucide-react";

// 📎 Graffetta: input file DENTRO il bottone (label). Su iPhone Safari il click programmatico
// su un input nascosto fuori dalla finestra fluttuante spesso non apre il selettore file.
export default function BottoneAllegatiChat({
  disabled,
  iconSize,
  className,
  onScegli,
  etichetta,
}: {
  disabled: boolean;
  iconSize: number;
  className: string;
  onScegli: (lista: FileList | null) => void;
  etichetta?: string;
}) {
  return (
    <label
      className={`relative ${className} ${disabled ? "opacity-40 pointer-events-none" : "cursor-pointer"}`}
      aria-label="Allega foto o file"
      title="Allega foto o file (max 6)"
    >
      <input
        type="file"
        multiple
        accept="image/*,application/pdf,.txt,.csv,.md"
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => {
          onScegli(e.target.files);
          e.target.value = "";
        }}
      />
      <span className="pointer-events-none inline-flex items-center gap-1.5">
        <Paperclip size={iconSize} />
        {etichetta ? <span>{etichetta}</span> : null}
      </span>
    </label>
  );
}
