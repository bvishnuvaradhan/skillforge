import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SkillForge — Learn, Build, Get Hired",
  description:
    "An AI-powered skill development ecosystem that guides learners from beginners to industry-ready software engineers with adaptive learning worlds, memory science, and mock interviews.",
  openGraph: {
    title: "SkillForge — Learn, Build, Get Hired",
    description:
      "AI-powered programmer growth ecosystem with diagnostic learning twins, gamified roadmaps, and career readiness tools.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillForge — Learn, Build, Get Hired",
    description:
      "AI-powered programmer growth ecosystem with diagnostic learning twins, gamified roadmaps, and career readiness tools.",
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
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased font-body bg-bg-primary text-text-primary min-h-screen">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#111827",
              color: "#F1F5F9",
              border: "1px solid #1E2B45",
            },
          }}
        />
      </body>
    </html>
  );
}
