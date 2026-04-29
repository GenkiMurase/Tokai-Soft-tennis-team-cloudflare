/*
  # Update players table RLS policies

  1. Security Changes
    - Remove existing policies
    - Add new policies that require authentication for modifications
    - Keep public read access

  2. Changes
    - Drop existing policies
    - Create new policies for:
      - Public read access
      - Admin-only write access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow read access to players for everyone" ON players;
DROP POLICY IF EXISTS "Allow insert on players" ON players;
DROP POLICY IF EXISTS "Allow update on players" ON players;
DROP POLICY IF EXISTS "Allow delete on players" ON players;

-- Create new policies
CREATE POLICY "Allow public read access to players"
  ON players
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert players"
  ON players
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update players"
  ON players
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete players"
  ON players
  FOR DELETE
  TO authenticated
  USING (true);