import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RegisterSW from "@/components/RegisterSW";
import ThemeInit from "@/components/ThemeInit";
import { VIEWPORT_PANNELLO } from "@/lib/pagina-stato";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "Pannello di Controllo · AD MyCity",
  description: "Il pannello di controllo dell'AD digitale di MyCity: azioni, attività, stato e piani a colpo d'occhio",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "AD MyCity", statusBarStyle: "default" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

// AR-417 — la dichiarazione arriva dal modulo puro: `viewportFit: "cover"` è la riga che accende
// su iPhone le quattro protezioni `env(safe-area-inset-bottom)` già scritte nel Pannello, e che
// senza di lei valevano zero. Il valore sta in `lib/pagina-stato.ts` perché una decisione dentro il
// componente non la può interrogare nessuno (né un test, né io fra sei mesi).
export const viewport: Viewport = VIEWPORT_PANNELLO;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("mycity_theme");var d=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})();`,
          }}
        />
        <ThemeInit />
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
