import { ThemeProvider } from "next-themes";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import type { Metadata } from "next";
import { Alexandria, JetBrains_Mono, VT323 } from "next/font/google";
import { Suspense } from "react";
import ConditionalHeader from "./components/ConditionalHeader";
import "./globals.css";
import { cn } from "@/lib/utils";

const alexandria = Alexandria({ subsets: ["latin"], variable: "--font-sans" });

const jetbrainsMono = JetBrains_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "fRIQuencyRADIO - Live Music, DJ Sets & Audio Streaming",
  description:
    "Join live DJ sets, music streaming, and real-time chat with a global community of music enthusiasts and creators.",
  keywords: [
    "live music", "DJ sets", "audio streaming", "music chat", "friquency",
    "friquency radio", "Taariq", "Taariq Elliott", "music producer",
    "FL Studio", "Ableton", "beats", "R&B", "hip-hop", "soul", "funk",
    "jazz", "gospel", "blues", "neo-soul", "house", "afrobeat", "trap",
    "dancehall", "reggae", "grime", "drill", "bounce", "go-go", "disco",
    "garage", "high-fidelity audio", "live music rooms", "custom music rooms",
    "realtime collaboration", "social listening", "music lovers",
    "music enthusiasts", "producers", "DJs", "audiophiles",
    "global music platform", "live events", "virtual concerts",
    "beat making sessions", "nextjs", "supabase", "postgres", "realtime",
    "collaboration",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(alexandria.variable, jetbrainsMono.variable, vt323.variable)}
      suppressHydrationWarning
    >
      <head>
        <ColorSchemeScript />
      </head>
      <body className="bg-background text-foreground font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <MantineProvider defaultColorScheme="dark">
            <Suspense fallback={null}>
              <ConditionalHeader />
              {children}
            </Suspense>
          </MantineProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
