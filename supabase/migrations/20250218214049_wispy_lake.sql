/*
  # Update ingredients table RLS policies

  1. Changes
    - Modify RLS policy on ingredients table to allow all authenticated users to read all ingredients
    - Keep insert/update restrictions to own ingredients only

  2. Security
    - Maintains data integrity while enabling ingredient sharing
    - Users can still only create/modify their own ingredients
    - All authenticated users can read any ingredient
*/

-- Drop existing select policy
DROP POLICY IF EXISTS "Users can read own ingredients" ON ingredients;

-- Create new more permissive select policy
CREATE POLICY "Users can read all ingredients"
  ON ingredients
  FOR SELECT
  TO authenticated
  USING (true);

-- Keep existing insert policy
DROP POLICY IF EXISTS "Users can insert own ingredients" ON ingredients;
CREATE POLICY "Users can insert own ingredients"
  ON ingredients
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Add update policy
CREATE POLICY "Users can update own ingredients"
  ON ingredients
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());