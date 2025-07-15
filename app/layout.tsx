import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Script from "next/script"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "QR Code Generator | Create QR Codes Instantly",
  description:
    "Free online QR code generator. Create QR codes for text, URLs, WiFi, contacts, and more. No installation required.",
  keywords: "QR code generator, create QR code, QR code maker, generate QR code, QR code creator online",
  authors: [{ name: "QR Code Generator" }],
  openGraph: {
    title: "QR Code Generator | Create QR Codes Instantly",
    description:
      "Free online QR code generator that allows you to create QR codes for text, URLs, WiFi, contacts, and more. No installation required.",
    url: "https://qr-code-generator.vercel.app",
    siteName: "QR Code Generator",
    images: [
      {
        url: "https://qr-code-generator.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "QR Code Generator Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QR Code Generator | Create QR Codes Instantly",
    description:
      "Free online QR code generator that allows you to create QR codes for text, URLs, WiFi, contacts, and more. No installation required.",
    images: ["https://qr-code-generator.vercel.app/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "https://assets.vercel.com/image/upload/front/favicon/vercel/favicon.ico" }],
    apple: { url: "https://assets.vercel.com/image/upload/front/favicon/vercel/apple-touch-icon.png" },
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
        <link rel="canonical" href="https://qr-code-generator.vercel.app" />
        <link rel="icon" href="https://assets.vercel.com/image/upload/front/favicon/vercel/favicon.ico" />
        <link
          rel="apple-touch-icon"
          href="https://assets.vercel.com/image/upload/front/favicon/vercel/apple-touch-icon.png"
        />
        <meta name="google-adsense-account" content="ca-pub-3460143338187515" />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
        <Analytics />
        <Script id="schema-org" type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "QR Code Generator",
              "description": "Free online QR code generator that allows you to create QR codes for text, URLs, WiFi, contacts, and more.",
              "url": "https://qr-code-generator.vercel.app",
              "applicationCategory": "UtilityApplication",
              "operatingSystem": "All",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            }
          `}
        </Script>
      </body>
    </html>
  )
}
