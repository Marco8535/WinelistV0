-- Agregar campos de último login y actualización a la tabla restaurants
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Actualizar registros existentes con el timestamp actual
UPDATE restaurants 
SET updated_at = NOW() 
WHERE updated_at IS NULL; 