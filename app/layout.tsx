import type React from "react"
import type { Metadata } from "next"
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
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${lato.variable} font-sans bg-[#F8F8F8] text-[#1A1A1A] prevent-overscroll`}>
        <WineProvider>
          {children}
          <Toaster />
        </WineProvider>
      </body>
    </html>
  )
}
