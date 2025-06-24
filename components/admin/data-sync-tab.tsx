"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, RefreshCw, Database, Clock, Link2 } from "lucide-react"
import { useWine } from "@/context/wine-context"
import { toast } from "@/hooks/use-toast"

export function DataSyncTab() {
  const { restaurant } = useWine()
  const [isLoading, setIsLoading] = useState(false);
  const [newSheetId, setNewSheetId] = useState("");
  const [currentSheetId, setCurrentSheetId] = useState(restaurant?.google_sheet_id || 'No configurado');
  const [lastSyncDate, setLastSyncDate] = useState<string | null>(restaurant?.last_synced_at || null);

  const handleUpdateAndSync = async () => {
    if (!newSheetId.trim()) {
        toast({ title: "Error", description: "Por favor ingresa un ID de Google Sheet válido", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    try {
        const response = await fetch('/api/settings/source', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newSheetId: newSheetId.trim() }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al actualizar y sincronizar');

        toast({ title: "Sincronización exitosa", description: data.message });
        setCurrentSheetId(newSheetId.trim());
        setNewSheetId("");
        setLastSyncDate(new Date().toISOString());
        setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        toast({ title: "Error de sincronización", description: errorMessage, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    try {
        return new Date(dateString).toLocaleString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return 'Fecha inválida'; }
  };

  const extractSheetIdFromUrl = (input: string) => {
    const urlMatch = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return urlMatch ? urlMatch[1] : input.trim();
  };

  if (!restaurant) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertDescription>
              No se pudo cargar la información del restaurante.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold">Sincronización de Datos</h2>
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader><CardTitle>Estado Actual</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>ID del Google Sheet Actual</Label>
                        <Input value={currentSheetId} readOnly className="font-mono"/>
                    </div>
                    <div>
                        <Label>Última Sincronización</Label>
                        <p>{formatDate(lastSyncDate)}</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Actualizar Fuente de Datos</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                     <div>
                         <Label htmlFor="new-sheet-id">Nuevo Google Sheet (URL o ID)</Label>
                         <Input id="new-sheet-id" value={newSheetId} onChange={(e) => setNewSheetId(extractSheetIdFromUrl(e.target.value))} />
                     </div>
                     <Button onClick={handleUpdateAndSync} disabled={isLoading || !newSheetId.trim()} className="w-full">
                         {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                         Actualizar y Sincronizar Ahora
                     </Button>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
