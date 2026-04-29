/*
  # Update teams table policies

  1. Changes
    - Drop existing policies if they exist
    - Recreate policies with proper authentication checks
    - Add IF NOT EXISTS clauses to avoid conflicts

  2. Security
    - Maintain public read access
    - Require authentication for write operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to teams" ON teams;
DROP POLICY IF EXISTS "Allow authenticated users to insert teams" ON teams;
DROP POLICY IF EXISTS "Allow authenticated users to update teams" ON teams;
DROP POLICY IF EXISTS "Allow authenticated users to delete teams" ON teams;

-- Create or update teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on team name for faster lookups
CREATE INDEX IF NOT EXISTS teams_name_idx ON teams (name);

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "teams_select_policy_v2"
  ON teams
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "teams_insert_policy_v2"
  ON teams
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "teams_update_policy_v2"
  ON teams
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "teams_delete_policy_v2"
  ON teams
  FOR DELETE
  TO authenticated
  USING (true);

-- Create or update trigger for updating the updated_at timestamp
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();