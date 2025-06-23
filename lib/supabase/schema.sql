-- Enable Row Level Security (RLS)
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Restaurants table (tenants)
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  subdomain TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  logo_url TEXT,
  primary_color TEXT DEFAULT '#C11119',
  secondary_color TEXT DEFAULT '#F8F8F8',
  google_sheet_id TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on subdomain for fast lookups
CREATE INDEX idx_restaurants_subdomain ON restaurants(subdomain);

-- Wines table
CREATE TABLE wines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  id_interno TEXT, -- Internal ID within restaurant (idInterno)
  nombre TEXT NOT NULL,
  productor TEXT,
  region TEXT,
  pais TEXT,
  ano TEXT,
  uva TEXT,
  alcohol TEXT,
  enologo TEXT,
  precio DECIMAL(10,2),
  precio_copa DECIMAL(10,2),
  precio_copa_r1 TEXT,
  precio_copa_r2 TEXT,
  precio_copa_r3 TEXT,
  precio_usd TEXT,
  vista TEXT,
  nariz TEXT,
  boca TEXT,
  maridaje TEXT,
  otros TEXT,
  altitud TEXT,
  estilo TEXT,
  tipo TEXT,
  caracteristica TEXT,
  en_carta BOOLEAN DEFAULT true,
  orden INTEGER,
  -- Premium winery fields
  is_premium_winery BOOLEAN DEFAULT false,
  premium_content JSONB, -- Will store { text, imageUrl, websiteUrl }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_wines_restaurant_id ON wines(restaurant_id);
CREATE INDEX idx_wines_en_carta ON wines(en_carta);
CREATE INDEX idx_wines_orden ON wines(orden);
CREATE INDEX idx_wines_id_interno_restaurant ON wines(restaurant_id, id_interno);

-- App settings table (one per restaurant)
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL UNIQUE REFERENCES restaurants(id) ON DELETE CASCADE,
  -- Sommelier/Concierge settings
  sommelier_enabled BOOLEAN DEFAULT false,
  sommelier_phone TEXT,
  whatsapp_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT true,
  contact_email TEXT,
  -- Restaurant information
  restaurant_name TEXT,
  restaurant_address TEXT,
  currency_symbol TEXT DEFAULT '$',
  -- Interface settings
  app_title TEXT DEFAULT 'Carta de Vinos',
  show_prices BOOLEAN DEFAULT true,
  show_alcohol BOOLEAN DEFAULT true,
  compact_view BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on restaurant_id
CREATE INDEX idx_app_settings_restaurant_id ON app_settings(restaurant_id);

-- Categories settings table (for category order and visibility)
CREATE TABLE categories_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for categories
CREATE INDEX idx_categories_restaurant_id ON categories_settings(restaurant_id);
CREATE INDEX idx_categories_display_order ON categories_settings(restaurant_id, display_order);
CREATE UNIQUE INDEX idx_categories_name_restaurant ON categories_settings(restaurant_id, name);

-- Premium wineries table (for managing sponsoring wineries)
CREATE TABLE premium_wineries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  winery_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  contract_start_date DATE,
  contract_end_date DATE,
  is_active BOOLEAN DEFAULT true,
  promotional_content JSONB, -- Store promotional content
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for premium wineries
CREATE INDEX idx_premium_wineries_restaurant_id ON premium_wineries(restaurant_id);
CREATE INDEX idx_premium_wineries_active ON premium_wineries(is_active);

-- Row Level Security (RLS) Policies
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE wines ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_wineries ENABLE ROW LEVEL SECURITY;

-- Policies for restaurants (only authenticated users can read their own restaurant)
CREATE POLICY "Users can read their own restaurant" ON restaurants
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own restaurant" ON restaurants
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Policies for wines (scoped by restaurant)
CREATE POLICY "Users can read wines from their restaurant" ON wines
  FOR SELECT USING (
    restaurant_id IN (
      SELECT id FROM restaurants 
      WHERE auth.uid() IS NOT NULL
    )
  );

CREATE POLICY "Users can modify wines from their restaurant" ON wines
  FOR ALL USING (
    restaurant_id IN (
      SELECT id FROM restaurants 
      WHERE auth.uid() IS NOT NULL
    )
  );

-- Similar policies for app_settings
CREATE POLICY "Users can read their app settings" ON app_settings
  FOR SELECT USING (
    restaurant_id IN (
      SELECT id FROM restaurants 
      WHERE auth.uid() IS NOT NULL
    )
  );

CREATE POLICY "Users can modify their app settings" ON app_settings
  FOR ALL USING (
    restaurant_id IN (
      SELECT id FROM restaurants 
      WHERE auth.uid() IS NOT NULL
    )
  );

-- Similar policies for categories_settings
CREATE POLICY "Users can read their categories settings" ON categories_settings
  FOR SELECT USING (
    restaurant_id IN (
      SELECT id FROM restaurants 
      WHERE auth.uid() IS NOT NULL
    )
  );

CREATE POLICY "Users can modify their categories settings" ON categories_settings
  FOR ALL USING (
    restaurant_id IN (
      SELECT id FROM restaurants 
      WHERE auth.uid() IS NOT NULL
    )
  );

-- Similar policies for premium_wineries
CREATE POLICY "Users can read their premium wineries" ON premium_wineries
  FOR SELECT USING (
    restaurant_id IN (
      SELECT id FROM restaurants 
      WHERE auth.uid() IS NOT NULL
    )
  );

CREATE POLICY "Users can modify their premium wineries" ON premium_wineries
  FOR ALL USING (
    restaurant_id IN (
      SELECT id FROM restaurants 
      WHERE auth.uid() IS NOT NULL
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wines_updated_at BEFORE UPDATE ON wines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_settings_updated_at BEFORE UPDATE ON categories_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_premium_wineries_updated_at BEFORE UPDATE ON premium_wineries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default restaurant for testing (OPEN)
INSERT INTO restaurants (name, subdomain, google_sheet_id) 
VALUES ('Restaurant OPEN', 'open', '1example_sheet_id_here');

-- Insert default app settings for the test restaurant
INSERT INTO app_settings (restaurant_id, restaurant_name, app_title)
SELECT id, 'Restaurant OPEN', 'Carta de Vinos OPEN'
FROM restaurants WHERE subdomain = 'open';
