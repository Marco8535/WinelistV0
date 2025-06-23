-- Script para verificar y corregir el Google Sheet ID inválido
-- Este script debe ejecutarse en Supabase SQL Editor

-- 1. Verificar qué restaurante tiene el ID inválido
SELECT 
    id,
    name,
    subdomain,
    google_sheet_id,
    created_at
FROM restaurants 
WHERE google_sheet_id = '1qpeqUJD7ObGbP3HYRJDPebp5bU0efS3GhjmhLPICYcQ';

-- 2. Actualizar el Google Sheet ID con uno válido (ejemplo)
-- Reemplaza 'TU_GOOGLE_SHEET_ID_VALIDO' con el ID real de tu Google Sheet
UPDATE restaurants 
SET 
    google_sheet_id = 'TU_GOOGLE_SHEET_ID_VALIDO',
    updated_at = NOW()
WHERE google_sheet_id = '1qpeqUJD7ObGbP3HYRJDPebp5bU0efS3GhjmhLPICYcQ';

-- 3. Alternativamente, si no tienes un Google Sheet válido, puedes limpiar el campo
-- UPDATE restaurants 
-- SET 
--     google_sheet_id = NULL,
--     updated_at = NOW()
-- WHERE google_sheet_id = '1qpeqUJD7ObGbP3HYRJDPebp5bU0efS3GhjmhLPICYcQ';

-- 4. Verificar que el cambio se aplicó correctamente
SELECT 
    id,
    name,
    subdomain,
    google_sheet_id,
    updated_at
FROM restaurants; 