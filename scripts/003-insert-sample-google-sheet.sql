-- Script para insertar un Google Sheet de ejemplo válido
-- Este script debe ejecutarse en Supabase SQL Editor

-- 1. Crear un Google Sheet de ejemplo y publicarlo como CSV
-- Ve a: https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
-- Este es un Google Sheet público de ejemplo de Google

-- 2. Actualizar el restaurante 'open' con el Google Sheet de ejemplo
UPDATE restaurants 
SET 
    google_sheet_id = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    updated_at = NOW()
WHERE subdomain = 'open';

-- 3. Verificar que se actualizó correctamente
SELECT 
    id,
    name,
    subdomain,
    google_sheet_id,
    updated_at
FROM restaurants 
WHERE subdomain = 'open';

-- 4. Si quieres usar tu propio Google Sheet:
-- a) Crea un nuevo Google Sheet
-- b) Añade datos de vinos con columnas como: nombre, productor, region, pais, ano, uva, precio, etc.
-- c) Ve a File > Share > Publish to web
-- d) Selecciona "Entire Document" y "CSV" format
-- e) Copia el ID del URL (la parte entre /d/ y /edit)
-- f) Reemplaza el ID en el UPDATE de arriba 