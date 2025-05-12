"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PasswordDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function PasswordDialog({ isOpen, onClose, onSuccess }: PasswordDialogProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "123") {
      setError(false)
      setPassword("")
      onSuccess()
    } else {
      setError(true)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ingrese contraseña</DialogTitle>
          <DialogDescription>Ingrese la contraseña para acceder a la configuración.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(false)
                }}
                className={error ? "border-red-500" : ""}
                placeholder="Ingrese la contraseña"
                autoComplete="off"
              />
              {error && <p className="text-sm text-red-500">Contraseña incorrecta</p>}
              <p className="text-xs text-muted-foreground mt-1">(123)</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Acceder</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
