import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NepLoom",
  description:
    "NepLoom is an Ed-tech social blogging platform where creators craft gamified blogs called Looms. Learn smarter with interactive tools like quizzes, flashcards, and AI-powered features. Make education free, fun, and accessible for everyone.",
  keywords: [
    "education",
    "e-learning",
    "blogging platform",
    "gamified learning",
    "interactive education",
    "NepLoom",
    "Looms",
    "NepLers",
    "educational technology",
    "social learning",
    "quiz",
    "flashcards",
    "AI education",
    "text-to-speech",
    "mindmaps",
    "online learning",
    "educational content",
    "learning platform",
  ],
  authors: [{ name: "Sambhav Aryal", url: "https://github.com/Echoinbyte" }],
  creator: "Sambhav Aryal (Echoinbyte)",
  publisher: "NepLoom",
  applicationName: "NepLoom",
  category: "Education",
  classification: "Educational Technology Platform",
  openGraph: {
    type: "website",
    siteName: "NepLoom",
    title: "NepLoom — Curiosity Unleashed",
    description:
      "Reimagine how you learn, share, and grow with gamified educational content. Join NepLers creating interactive Looms that make learning addictive in a good way.",
    url: process.env.NEXT_PUBLIC_API_BASE_URL_PROD || "https://neploom.tech",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NepLoom - Where curiosity begins and spreads",
        type: "image/png",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@neploom",
    creator: "@echoinbyte",
    title: "NepLoom — Curiosity Unleashed",
    description:
      "Learn smarter with gamified educational content. Interactive quizzes, flashcards, AI summaries, and more. Making education free, fun, and accessible.",
    images: ["/twitter-card.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ef4444" },
    { media: "(prefers-color-scheme: dark)", color: "#ef4444" },
  ],
  colorScheme: "light dark",
  viewport: "width=device-width, initial-scale=1",
  verification: {
    // google: "your-google-site-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-site-verification-code",
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_API_BASE_URL_PROD || "https://neploom.tech",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_API_BASE_URL_PROD || "https://neploom.tech"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
