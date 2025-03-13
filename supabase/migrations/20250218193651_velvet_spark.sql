/*
  # Clean up all recipe data

  This migration removes all recipe-related data while preserving the table structure.
  This allows for fresh testing without affecting the schema.

  1. Cleanup
    - Removes all recipe ingredients
    - Removes all ingredient prices
    - Removes all ingredients
    - Removes all recipes
    - Removes all messages
*/

-- Disable RLS temporarily to allow cleanup
ALTER TABLE recipe_ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_prices DISABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE recipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Delete data in the correct order to respect foreign key constraints
TRUNCATE TABLE recipe_ingredients CASCADE;
TRUNCATE TABLE ingredient_prices CASCADE;
TRUNCATE TABLE ingredients CASCADE;
TRUNCATE TABLE recipes CASCADE;
TRUNCATE TABLE messages CASCADE;

-- Re-enable RLS
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;