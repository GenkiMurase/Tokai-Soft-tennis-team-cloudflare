/*
  # Fix tournament and match policies

  1. Changes
    - Drop existing policies before recreating them
    - Maintain same table structure and indices
    - Update policy definitions to avoid conflicts

  2. Security
    - Keep same security model with public read access and authenticated management
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to tournaments" ON tournaments;
DROP POLICY IF EXISTS "Allow authenticated users to manage tournaments" ON tournaments;
DROP POLICY IF EXISTS "Allow public read access to matches" ON matches;
DROP POLICY IF EXISTS "Allow authenticated users to manage matches" ON matches;

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

-- Create new policies for tournaments
CREATE POLICY "tournaments_select_policy"
  ON tournaments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "tournaments_all_policy"
  ON tournaments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create new policies for matches
CREATE POLICY "matches_select_policy"
  ON matches
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "matches_all_policy"
  ON matches
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

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