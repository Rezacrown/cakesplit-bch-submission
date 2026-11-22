import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  JetBrains_Mono,
  Plus_Jakarta_Sans,
} from "next/font/google";
import { Providers } from "@/components/providers";
import { appConfig } from "@/lib/config/env";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.appUrl),
  title: `${appConfig.appName} — Split the Table, Pay in One Tap`,
  description:
    "Split group bills on Bitcoin Cash. Everyone pays their slice into one shared pot, and anyone at the table settles straight to the cashier.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${jakarta.variable} ${jetbrainsMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans selection:bg-[#18181B] selection:text-[#FAF9F6]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
