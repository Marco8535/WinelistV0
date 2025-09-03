-- Insert default categories for the 'open' restaurant
INSERT INTO categories_settings (restaurant_id, name, display_order, visible) 
SELECT 
  r.id,
  category_name,
  category_order,
  true
FROM restaurants r
CROSS JOIN (
  VALUES 
    ('Tintos', 1),
    ('Blancos', 2),
    ('Rosados', 3),
    ('Espumantes', 4),
    ('Dulces', 5),
    ('Otros Vinos', 6)
) AS categories(category_name, category_order)
WHERE r.subdomain = 'open'
ON CONFLICT (restaurant_id, name) DO NOTHING;

-- Verify the insertion
SELECT 
  r.name as restaurant_name,
  cs.name as category_name,
  cs.display_order,
  cs.visible
FROM categories_settings cs
JOIN restaurants r ON r.id = cs.restaurant_id
WHERE r.subdomain = 'open'
ORDER BY cs.display_order;
