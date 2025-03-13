/*
  # Update units table RLS policies

  1. Changes
    - Drop existing RLS policy for units table
    - Create new policies for all CRUD operations
    - Allow all authenticated users to read and insert units
    - Maintain data consistency across users

  2. Security
    - Ensures proper access control while allowing necessary operations
    - Maintains data integrity with shared units across users
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Anyone can read units" ON units;

-- Create comprehensive policies for units table
CREATE POLICY "Anyone can read units"
  ON units
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert units"
  ON units
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update units"
  ON units
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);