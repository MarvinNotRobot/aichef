-- Add DELETE policies for recipes table
CREATE POLICY "Users can delete own recipes"
  ON recipes
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Add DELETE policies for recipe_ingredients table
CREATE POLICY "Users can delete own recipe ingredients"
  ON recipe_ingredients
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Add DELETE policies for ingredient_prices table
CREATE POLICY "Users can delete own ingredient prices"
  ON ingredient_prices
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());