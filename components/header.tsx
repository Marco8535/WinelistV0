"use client"

import { Settings } from "lucide-react"
import Image from "next/image"

interface HeaderProps {
  onAdminClick: () => void
}

export function Header({ onAdminClick }: HeaderProps) {
  return (
    <header className="flex justify-center py-6 px-4 relative">
      <div className="w-40 h-auto">
        <Image src="/images/logo.png" alt="It's Open" width={400} height={200} priority className="w-full h-auto" />
      </div>
      <button
        onClick={onAdminClick}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full hover:bg-gray-100"
        aria-label="Administrar carta"
      >
        <Settings className="h-5 w-5 text-gray-500" />
      </button>
    </header>
  )
}
