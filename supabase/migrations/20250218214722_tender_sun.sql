/*
  # Fix ingredient duplicate handling

  1. Changes
    - Add unique constraint on ingredient name and created_by
    - Update ingredient handling policies
    - Ensure proper conflict resolution

  2. Security
    - Maintains RLS policies
    - Preserves data integrity
*/

-- Add ON CONFLICT handling for ingredient_prices
ALTER TABLE ingredient_prices
DROP CONSTRAINT IF EXISTS ingredient_prices_ingredient_unit_key;

ALTER TABLE ingredient_prices
ADD CONSTRAINT ingredient_prices_ingredient_unit_key 
UNIQUE (ingredient_id, unit_id, created_by);

-- Update recipe_ingredients policies
DROP POLICY IF EXISTS "Users can insert own recipe ingredients" ON recipe_ingredients;

CREATE POLICY "Users can insert own recipe ingredients"
  ON recipe_ingredients
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Add unique constraint for recipe ingredients
ALTER TABLE recipe_ingredients
DROP CONSTRAINT IF EXISTS recipe_ingredients_recipe_ingredient_key;

ALTER TABLE recipe_ingredients
ADD CONSTRAINT recipe_ingredients_recipe_ingredient_key 
UNIQUE (recipe_id, ingredient_id, unit_id);