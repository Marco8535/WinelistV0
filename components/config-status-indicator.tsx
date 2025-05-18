"use client"

import { useEffect, useState } from "react"
import { useWine } from "@/context/wine-context"
import { Clock } from "lucide-react"

export function ConfigStatusIndicator() {
  const { configLastUpdated } = useWine()
  const [formattedDate, setFormattedDate] = useState<string>("")

  useEffect(() => {
    if (configLastUpdated) {
      const date = new Date(configLastUpdated)
      setFormattedDate(
        date.toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      )
    }
  }, [configLastUpdated])

  if (!configLastUpdated) return null

  return (
    <div className="flex items-center text-xs text-gray-500 gap-1 mt-2">
      <Clock className="h-3 w-3" />
      <span>Última actualización: {formattedDate}</span>
    </div>
  )
}
