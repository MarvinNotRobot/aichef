/*
  # Clean up recipe data

  This migration removes all recipe-related data while preserving the table structure.
  This allows for fresh testing without affecting the schema.

  1. Cleanup
    - Removes all recipe ingredients
    - Removes all ingredient prices
    - Removes all ingredients
    - Removes all recipes
*/

-- Delete data in the correct order to respect foreign key constraints
DELETE FROM recipe_ingredients;
DELETE FROM ingredient_prices;
DELETE FROM ingredients;
DELETE FROM recipes;