import type React from "react"
import type { Metadata, Viewport } from "next"
import { Lato } from "next/font/google"
import "./globals.css"
import { WineProvider } from "@/context/wine-context"
import { Toaster } from "@/components/ui/toaster"

const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  variable: "--font-lato",
})

export const metadata: Metadata = {
  title: "Wine List | It's Open",
  description: "Digital wine list for fine dining",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Wine List",
  },
  applicationName: "Wine List",
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${lato.variable} font-sans bg-[#F8F8F8] text-[#1A1A1A] prevent-overscroll`}>
        <WineProvider>
          {children}
          <Toaster />
        </WineProvider>
      </body>
    </html>
  )
}
