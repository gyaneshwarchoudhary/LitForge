import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "LitForge - AI-Powered Personalized Reading",
  description:
    "Transform books into personal growth. LitForge uses AI to help you understand, personalize, and apply the wisdom from every book you read.",
  keywords: ["reading", "AI", "books", "learning", "personalized", "LitForge"],
  openGraph: {
    title: "LitForge - AI-Powered Personalized Reading",
    description: "Turn books into personal growth with AI-powered reading insights.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#0B0B0D] text-[#F5F5F0]">
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#161618",
              border: "1px solid #262626",
              color: "#F5F5F0",
              borderRadius: "12px",
              fontSize: "0.875rem",
            },
            classNames: {
              success: "!border-[#F59E0B]/40",
              error: "!border-red-500/40",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
