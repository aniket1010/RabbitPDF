import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css"
import "../styles/markdown.css"
import "../styles/html-content.css";
import Providers from "@/components/Providers";
import AppShell from "@/components/AppShell";

const manrope = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RabbitPDF",
  description: "Chat with your PDF documents using AI",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
       <body className={`${manrope.className} antialiased h-full`}>
        <Providers>
          <AppShell>
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}
