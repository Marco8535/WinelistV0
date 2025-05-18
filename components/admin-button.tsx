"use client"

import { Settings } from "lucide-react"

interface AdminButtonProps {
  onClick: () => void
}

export function AdminButton({ onClick }: AdminButtonProps) {
  return (
    <button onClick={onClick} className="p-2 rounded-full hover:bg-gray-100 ml-2" aria-label="Administrar carta">
      <Settings className="h-5 w-5" />
    </button>
  )
}
