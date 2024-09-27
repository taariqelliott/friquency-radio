import type { Metadata } from "next";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "./globals.css";
import { Roboto_Mono } from "next/font/google";
import Header from "./components/Header";
import { Suspense } from "react";

const roboto = Roboto_Mono({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "fRIQuencyRADIO - Live Music, DJ Sets & Audio Streaming",
  description:
    "Join live DJ sets, music streaming, and real-time chat with a global community of music enthusiasts and creators.",
  keywords: [
    "live music",
    "DJ sets",
    "audio streaming",
    "music chat",
    "friquency",
    "friquency radio",
    "Taariq",
    "Taariq Elliott",
    "music producer",
    "FL Studio",
    "Ableton",
    "beats",
    "R&B",
    "hip-hop",
    "soul",
    "funk",
    "jazz",
    "gospel",
    "blues",
    "neo-soul",
    "house",
    "afrobeat",
    "trap",
    "dancehall",
    "reggae",
    "grime",
    "drill",
    "bounce",
    "go-go",
    "disco",
    "garage",
    "high-fidelity audio",
    "live music rooms",
    "custom music rooms",
    "realtime collaboration",
    "social listening",
    "music lovers",
    "music enthusiasts",
    "producers",
    "DJs",
    "audiophiles",
    "global music platform",
    "live events",
    "virtual concerts",
    "beat making sessions",
    "nextjs",
    "supabase",
    "postgres",
    "realtime",
    "collaboration",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body className={roboto.className}>
        <MantineProvider defaultColorScheme="dark">
          <Suspense fallback={null}>
            <Header />
            {children}
          </Suspense>
        </MantineProvider>
      </body>
    </html>
  );
}
