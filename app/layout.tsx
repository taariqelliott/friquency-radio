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
  title: "fRIQuencyRADIO",
  description: "Live Audio Streaming & Chat",
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
        <MantineProvider>
          <Suspense fallback={null}>
            <Header />
            {children}
          </Suspense>
        </MantineProvider>
      </body>
    </html>
  );
}
