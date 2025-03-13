/*
  # Add sample recipe data

  1. New Data
    - Sample recipe for Fettuccine Alfredo
    - Sample ingredients with prices
    - Recipe-ingredient relationships

  2. Changes
    - Adds initial data for testing
    - Sets up a complete recipe with ingredients and costs
*/

-- Insert sample ingredients
INSERT INTO ingredients (id, name, description, default_unit_id, created_by)
SELECT 
  gen_random_uuid(),
  'Fettuccine Pasta',
  'Dried pasta noodles',
  u.id,
  auth.uid()
FROM units u
WHERE u.abbreviation = 'lb'
ON CONFLICT DO NOTHING;

INSERT INTO ingredients (id, name, description, default_unit_id, created_by)
SELECT 
  gen_random_uuid(),
  'Alfredo Sauce',
  'Creamy white sauce',
  u.id,
  auth.uid()
FROM units u
WHERE u.abbreviation = 'g'
ON CONFLICT DO NOTHING;

-- Insert ingredient prices
INSERT INTO ingredient_prices (ingredient_id, unit_id, price, supplier, notes, created_by)
SELECT 
  i.id,
  u.id,
  9.99,
  'Local Supplier',
  '3lb package',
  auth.uid()
FROM ingredients i
CROSS JOIN units u
WHERE i.name = 'Fettuccine Pasta' AND u.abbreviation = 'lb'
ON CONFLICT DO NOTHING;

INSERT INTO ingredient_prices (ingredient_id, unit_id, price, supplier, notes, created_by)
SELECT 
  i.id,
  u.id,
  27.30,
  'Restaurant Depot',
  '500g container',
  auth.uid()
FROM ingredients i
CROSS JOIN units u
WHERE i.name = 'Alfredo Sauce' AND u.abbreviation = 'g'
ON CONFLICT DO NOTHING;

-- Insert sample recipe
INSERT INTO recipes (
  id,
  name,
  category,
  version,
  is_active,
  is_taxable,
  serving_size,
  serving_unit,
  price,
  food_cost,
  material_cost,
  overhead_cost,
  notes,
  created_by
)
VALUES (
  gen_random_uuid(),
  'Fettuccine Alfredo',
  'Lunch',
  1,
  true,
  false,
  1,
  'portion',
  15.00,
  3.186,
  0.200,
  0.965,
  'Classic creamy pasta dish',
  auth.uid()
)
ON CONFLICT DO NOTHING;

-- Insert recipe ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, notes, created_by)
SELECT 
  r.id,
  i.id,
  4.0,
  u.id,
  'Cooked al dente',
  auth.uid()
FROM recipes r
CROSS JOIN ingredients i
CROSS JOIN units u
WHERE r.name = 'Fettuccine Alfredo' 
  AND i.name = 'Fettuccine Pasta'
  AND u.abbreviation = 'oz'
ON CONFLICT DO NOTHING;

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, notes, created_by)
SELECT 
  r.id,
  i.id,
  100.0,
  u.id,
  'Heated and mixed with pasta',
  auth.uid()
FROM recipes r
CROSS JOIN ingredients i
CROSS JOIN units u
WHERE r.name = 'Fettuccine Alfredo' 
  AND i.name = 'Alfredo Sauce'
  AND u.abbreviation = 'g'
ON CONFLICT DO NOTHING;