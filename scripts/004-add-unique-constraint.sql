-- Script para agregar la constraint única que falta en la tabla wines
-- Este script debe ejecutarse en Supabase SQL Editor

-- 1. Verificar la estructura actual de la tabla wines
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'wines' 
ORDER BY ordinal_position;

-- 2. Verificar constraints existentes
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'wines'::regclass;

-- 3. Agregar la constraint única para id_interno y restaurant_id
-- Esto permitirá el upsert basado en estos campos
ALTER TABLE wines 
ADD CONSTRAINT wines_id_interno_restaurant_id_unique 
UNIQUE (id_interno, restaurant_id);

-- 4. Verificar que la constraint se creó correctamente
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'wines'::regclass 
AND conname = 'wines_id_interno_restaurant_id_unique';

-- 5. Opcional: Verificar que no hay datos duplicados antes de crear la constraint
-- Si hay duplicados, este query los mostrará
SELECT 
    id_interno, 
    restaurant_id, 
    COUNT(*) as count
FROM wines 
WHERE id_interno IS NOT NULL 
GROUP BY id_interno, restaurant_id 
HAVING COUNT(*) > 1;

-- Si hay duplicados, puedes limpiarlos con:
-- DELETE FROM wines WHERE id IN (
--   SELECT id FROM (
--     SELECT id, ROW_NUMBER() OVER (PARTITION BY id_interno, restaurant_id ORDER BY created_at) as rn
--     FROM wines WHERE id_interno IS NOT NULL
--   ) t WHERE rn > 1
-- ); 