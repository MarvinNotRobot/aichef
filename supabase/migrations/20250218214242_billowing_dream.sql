/*
  # Add unique constraint to units table

  1. Changes
    - Add unique constraint on name column in units table
    - This ensures we don't have duplicate unit names
    - Enables proper upsert functionality

  2. Security
    - Maintains data integrity by preventing duplicate units
*/

-- Add unique constraint to units table
ALTER TABLE units
ADD CONSTRAINT units_name_key UNIQUE (name);

-- Update units table to normalize unit names
UPDATE units
SET name = LOWER(TRIM(name)),
    abbreviation = LOWER(TRIM(abbreviation))
WHERE name != LOWER(TRIM(name))
   OR abbreviation != LOWER(TRIM(abbreviation));