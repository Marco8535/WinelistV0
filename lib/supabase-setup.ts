// This file contains SQL statements to set up your Supabase database tables
// You can run these in the Supabase SQL Editor

/*
-- Create wines table
CREATE TABLE IF NOT EXISTS wines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  productor TEXT,
  region TEXT,
  pais TEXT,
  ano TEXT,
  uva TEXT,
  alcohol TEXT,
  enologo TEXT,
  precio TEXT,
  precioCopa TEXT,
  precioCopaR1 TEXT,
  precioCopaR2 TEXT,
  precioCopaR3 TEXT,
  precioUSD TEXT,
  vista TEXT,
  nariz TEXT,
  boca TEXT,
  maridaje TEXT,
  otros TEXT,
  altitud TEXT,
  estilo TEXT,
  tipo TEXT,
  caracteristica TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  wine_id UUID NOT NULL REFERENCES wines(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, wine_id)
);

-- Create index for faster bookmark lookups
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_wine_id ON bookmarks(wine_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_wines_updated_at
BEFORE UPDATE ON wines
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
*/
