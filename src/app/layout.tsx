import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { getAbout, isRasterImage } from "@/lib/content";
import { absoluteAssetUrl, absoluteUrl, SITE_URL } from "@/lib/site";
import "katex/dist/katex.min.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAbout();
  const photo = about.photo && isRasterImage(about.photo.src) ? [absoluteAssetUrl(about.photo.src)] : undefined;

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: about.name, template: `%s — ${about.name}` },
    description: about.description,
    authors: [{ name: about.name, url: absoluteUrl("/") }],
    alternates: { canonical: absoluteUrl("/") },
    openGraph: {
      type: "website",
      siteName: about.name,
      title: about.name,
      description: about.description,
      url: absoluteUrl("/"),
      images: photo,
    },
    twitter: { card: "summary", title: about.name, description: about.description },
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
