import type { Metadata } from "next";
import { Outfit, Space_Grotesk } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Creato — Regional Indian Influencer Marketplace",
  description: "Connecting regional and vernacular content creators in India with leading brands using the Audience Trust Index (ATI).",
};

import { LanguageProvider } from "@/components/LanguageProvider";
import AestheticParticles from "@/components/AestheticParticles";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-slate-900 font-sans relative">
        <LanguageProvider>
          <AestheticParticles />
          <div className="relative z-10 flex-1 flex flex-col min-h-screen">
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
