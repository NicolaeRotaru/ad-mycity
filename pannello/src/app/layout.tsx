import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RegisterSW from "@/components/RegisterSW";

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
    <html lang="it" className={inter.variable}>
      <body className="antialiased">
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
