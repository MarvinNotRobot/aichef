/*
  # Recipe Cost Analysis Schema

  1. New Tables
    - `recipes`
      - Core recipe information
      - Tracks versions and cost calculations
    - `ingredients`
      - Master list of ingredients
      - Base units and costs
    - `recipe_ingredients`
      - Links recipes to ingredients
      - Stores quantities and portion details
    - `units`
      - Measurement units
      - Conversion factors
    - `ingredient_prices`
      - Historical price tracking
      - Supplier information

  2. Security
    - Enable RLS on all tables
    - Policies for authenticated users to:
      - Read their own recipes
      - Manage their ingredients
      - View and update prices
*/

-- Units table for measurement standardization
CREATE TABLE IF NOT EXISTS units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  abbreviation text NOT NULL,
  base_unit text,
  conversion_factor decimal DEFAULT 1.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read units"
  ON units
  FOR SELECT
  TO authenticated
  USING (true);

-- Ingredients master list
CREATE TABLE IF NOT EXISTS ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  default_unit_id uuid REFERENCES units(id),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(name, created_by)
);

ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own ingredients"
  ON ingredients
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can insert own ingredients"
  ON ingredients
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Ingredient prices with history
CREATE TABLE IF NOT EXISTS ingredient_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id uuid REFERENCES ingredients(id) NOT NULL,
  unit_id uuid REFERENCES units(id) NOT NULL,
  price decimal NOT NULL,
  supplier text,
  notes text,
  effective_date timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ingredient_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own ingredient prices"
  ON ingredient_prices
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can insert own ingredient prices"
  ON ingredient_prices
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  is_active boolean DEFAULT true,
  is_taxable boolean DEFAULT false,
  serving_size integer,
  serving_unit text,
  price decimal,
  food_cost decimal,
  material_cost decimal,
  overhead_cost decimal,
  total_cost decimal,
  gross_profit decimal,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(name, version, created_by)
);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own recipes"
  ON recipes
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can insert own recipes"
  ON recipes
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Recipe ingredients junction table
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES recipes(id) NOT NULL,
  ingredient_id uuid REFERENCES ingredients(id) NOT NULL,
  quantity decimal NOT NULL,
  unit_id uuid REFERENCES units(id) NOT NULL,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own recipe ingredients"
  ON recipe_ingredients
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can insert own recipe ingredients"
  ON recipe_ingredients
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Insert default units
INSERT INTO units (name, abbreviation) VALUES
  ('Gram', 'g'),
  ('Kilogram', 'kg'),
  ('Ounce', 'oz'),
  ('Pound', 'lb'),
  ('Milliliter', 'ml'),
  ('Liter', 'l'),
  ('Cup', 'cup'),
  ('Tablespoon', 'tbsp'),
  ('Teaspoon', 'tsp'),
  ('Each', 'ea'),
  ('Piece', 'pc')
ON CONFLICT DO NOTHING;

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_units_updated_at
  BEFORE UPDATE ON units
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_ingredients_updated_at
  BEFORE UPDATE ON ingredients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_ingredient_prices_updated_at
  BEFORE UPDATE ON ingredient_prices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_recipe_ingredients_updated_at
  BEFORE UPDATE ON recipe_ingredients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();