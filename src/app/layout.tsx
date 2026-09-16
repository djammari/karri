import type { Metadata } from "next";
import { Barlow, Karla } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const barlow = Barlow({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-barlow",
});

const karla = Karla({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-karla",
});

export const metadata: Metadata = {
  title: "Óstöðvandi — sjúkraskrá",
  description:
    "Innra kerfi Óstöðvandi fyrir sjúkraþjálfun og endurhæfingu hunda. Garðatorg 3, Garðabær.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="is"
      className={`dark ${barlow.variable} ${karla.variable} h-full antialiased`}
    >
      <body
        className={`${barlow.className} flex min-h-full flex-col bg-background font-sans text-foreground`}
      >
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
