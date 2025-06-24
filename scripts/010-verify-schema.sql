-- Script para verificar que todas las columnas necesarias existen en la tabla restaurants
-- Este script debe ejecutarse en Supabase SQL Editor

-- Verificar estructura actual de la tabla restaurants
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'restaurants' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar específicamente las columnas que necesitamos
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'restaurants' 
            AND column_name = 'google_sheet_id'
        ) THEN 'google_sheet_id: ✅ EXISTE'
        ELSE 'google_sheet_id: ❌ NO EXISTE'
    END as google_sheet_id_status,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'restaurants' 
            AND column_name = 'last_synced_at'
        ) THEN 'last_synced_at: ✅ EXISTE'
        ELSE 'last_synced_at: ❌ NO EXISTE'
    END as last_synced_at_status,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'restaurants' 
            AND column_name = 'logo_url'
        ) THEN 'logo_url: ✅ EXISTE'
        ELSE 'logo_url: ❌ NO EXISTE'
    END as logo_url_status,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'restaurants' 
            AND column_name = 'primary_color'
        ) THEN 'primary_color: ✅ EXISTE'
        ELSE 'primary_color: ❌ NO EXISTE'
    END as primary_color_status,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'restaurants' 
            AND column_name = 'secondary_color'
        ) THEN 'secondary_color: ✅ EXISTE'
        ELSE 'secondary_color: ❌ NO EXISTE'
    END as secondary_color_status;

-- Mostrar datos actuales de un restaurante de ejemplo
SELECT 
    id,
    name,
    subdomain,
    google_sheet_id,
    last_synced_at,
    logo_url,
    primary_color,
    secondary_color,
    created_at,
    updated_at
FROM restaurants 
LIMIT 3; 