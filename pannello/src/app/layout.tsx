import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RegisterSW from "@/components/RegisterSW";
import ThemeInit from "@/components/ThemeInit";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "Pannello di Controllo · AD MyCity",
  description: "Il pannello di controllo dell'AD digitale di MyCity: azioni, attività, stato e piani a colpo d'occhio",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "AD MyCity", statusBarStyle: "default" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#C0492C",
};

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
