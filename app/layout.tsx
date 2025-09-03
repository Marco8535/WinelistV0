import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { RestaurantProvider } from "@/components/restaurant-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LazySomm - Digital Wine List",
  description: "Professional digital wine list platform for restaurants",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <RestaurantProvider>{children}</RestaurantProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
