"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

export function RestaurantLogo() {
  const [clickCount, setClickCount] = useState(0)

  // Resetear el contador después de 2 segundos sin clics
  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => {
        setClickCount(0)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [clickCount])

  const handleLogoClick = () => {
    const newCount = clickCount + 1

    setClickCount(newCount)

    // Activar el modo secreto después de 5 clics rápidos
    if (newCount >= 5) {
      // Log to console instead of using a callback
      console.log("Modo de configuración activado")
      // Use a custom event to communicate with other components
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("secretModeActivated"))
      }
      setClickCount(0)
    }
  }

  return (
    <div className="cursor-pointer flex justify-center" onClick={handleLogoClick} title="Cabaña Las Lilas">
      <div className="relative w-28 h-40">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AvQBkfvTgXxm77vIhPKUPCj6yFyCvB.png"
          alt="Cabaña Las Lilas Restaurant - Puerto Madero, Buenos Aires"
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  )
}
