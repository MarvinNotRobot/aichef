/*
  # Add unit cost to recipe ingredients

  1. Changes
    - Add unit_cost column to recipe_ingredients table
    - Set default value to 0
    - Update existing rows with latest price from ingredient_prices

  2. Notes
    - This allows storing the unit cost directly with each recipe ingredient
    - Helps with historical cost tracking and faster calculations
*/

-- Add unit_cost column to recipe_ingredients table
ALTER TABLE recipe_ingredients 
ADD COLUMN unit_cost decimal DEFAULT 0;

-- Update existing rows to set unit_cost from latest ingredient prices
UPDATE recipe_ingredients ri
SET unit_cost = (
  SELECT ip.price
  FROM ingredient_prices ip
  WHERE ip.ingredient_id = ri.ingredient_id
    AND ip.unit_id = ri.unit_id
  ORDER BY ip.effective_date DESC
  LIMIT 1
);