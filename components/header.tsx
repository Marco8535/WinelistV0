"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function Header() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <header className="flex justify-center py-6 px-4">
        <div className="w-48 h-16"></div>
      </header>
    )
  }

  return (
    <header className="flex justify-center py-6 px-4">
      <div className="w-48 h-auto">
        <Image
          src="/images/logo.png"
          alt="It's Open Logo"
          width={240}
          height={120}
          priority
          className={`w-full h-auto ${theme === "dark" ? "filter invert" : ""}`}
        />
      </div>
    </header>
  )
}
