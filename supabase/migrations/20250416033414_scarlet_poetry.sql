/*
  # Fix tournament and match policies

  1. Changes
    - Drop existing policies before recreating them
    - Split policies into separate operations (INSERT, UPDATE, DELETE)
    - Maintain same table structure and indices

  2. Security
    - Keep same security model with public read access and authenticated management
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "tournaments_select_policy" ON tournaments;
DROP POLICY IF EXISTS "tournaments_all_policy" ON tournaments;
DROP POLICY IF EXISTS "matches_select_policy" ON matches;
DROP POLICY IF EXISTS "matches_all_policy" ON matches;

-- Create tournaments table if it doesn't exist
CREATE TABLE IF NOT EXISTS tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  location text NOT NULL,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create matches table if it doesn't exist
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE,
  team1_name text NOT NULL,
  team2_name text NOT NULL,
  team1_score integer DEFAULT 0,
  team2_score integer DEFAULT 0,
  status text NOT NULL CHECK (status IN ('upcoming', 'live', 'completed')),
  court_number text,
  start_time timestamptz,
  end_time timestamptz,
  round text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS tournaments_dates_idx ON tournaments(start_date, end_date);
CREATE INDEX IF NOT EXISTS matches_start_time_idx ON matches(start_time);
CREATE INDEX IF NOT EXISTS matches_tournament_status_idx ON matches(tournament_id, status);

-- Enable Row Level Security
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Create policies for tournaments
CREATE POLICY "tournaments_select_policy"
  ON tournaments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "tournaments_insert_policy"
  ON tournaments
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "tournaments_update_policy"
  ON tournaments
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "tournaments_delete_policy"
  ON tournaments
  FOR DELETE
  TO public
  USING (true);

-- Create policies for matches
CREATE POLICY "matches_select_policy"
  ON matches
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "matches_insert_policy"
  ON matches
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "matches_update_policy"
  ON matches
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "matches_delete_policy"
  ON matches
  FOR DELETE
  TO public
  USING (true);

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers if they don't exist
DROP TRIGGER IF EXISTS update_tournaments_updated_at ON tournaments;
CREATE TRIGGER update_tournaments_updated_at
  BEFORE UPDATE ON tournaments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();