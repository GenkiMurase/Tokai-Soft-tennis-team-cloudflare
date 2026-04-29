/*
  # Update players table for staff management

  1. Changes
    - Make grade column nullable to support staff without grades
    - Update position check constraint to include staff roles
    - Add ordering index for better query performance
    - Update RLS policies for proper access control

  2. Security
    - Maintain RLS policies for authenticated users
    - Keep public read access
*/

-- Drop existing indices
DROP INDEX IF EXISTS players_position_idx;

-- Drop existing constraint
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_position_check;

-- Update grade column to be nullable
ALTER TABLE players ALTER COLUMN grade DROP NOT NULL;

-- Add new position check constraint including staff roles
ALTER TABLE players ADD CONSTRAINT players_position_check
  CHECK (position IN ('前衛', '後衛', 'マネージャー', '監督', 'コーチ'));

-- Add composite index for efficient ordering
CREATE INDEX players_position_grade_idx ON players (position, grade NULLS LAST, name);

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to players" ON players;
DROP POLICY IF EXISTS "Allow authenticated users to insert players" ON players;
DROP POLICY IF EXISTS "Allow authenticated users to update players" ON players;
DROP POLICY IF EXISTS "Allow authenticated users to delete players" ON players;

-- Create updated policies
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