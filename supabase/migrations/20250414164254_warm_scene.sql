/*
  # Create players table

  1. New Tables
    - `players`
      - `id` (uuid, primary key)
      - `name` (text)
      - `grade` (integer)
      - `position` (text)
      - `school` (text)
      - `image` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `players` table
    - Add policies for authenticated users to manage players
*/

CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  grade integer NOT NULL CHECK (grade BETWEEN 1 AND 4),
  position text NOT NULL CHECK (position IN ('前衛', '後衛')),
  school text NOT NULL,
  image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all players
CREATE POLICY "Users can read players"
  ON players
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert players
CREATE POLICY "Users can insert players"
  ON players
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update players
CREATE POLICY "Users can update players"
  ON players
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete players
CREATE POLICY "Users can delete players"
  ON players
  FOR DELETE
  TO authenticated
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to promote all players' grades
CREATE OR REPLACE FUNCTION promote_all_players()
RETURNS void AS $$
BEGIN
  -- Delete players in grade 4
  DELETE FROM players WHERE grade = 4;
  
  -- Promote remaining players
  UPDATE players
  SET grade = grade + 1
  WHERE grade < 4;
END;
$$ LANGUAGE plpgsql;