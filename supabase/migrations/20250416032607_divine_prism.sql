/*
  # Add matches and tournaments tables

  1. New Tables
    - `tournaments`
      - `id` (uuid, primary key)
      - `name` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `location` (text)
      - `is_active` (boolean)

    - `matches`
      - `id` (uuid, primary key)
      - `tournament_id` (uuid, foreign key)
      - `team1_name` (text)
      - `team2_name` (text)
      - `team1_score` (integer)
      - `team2_score` (integer)
      - `status` (text) - 'upcoming', 'live', 'completed'
      - `court_number` (text)
      - `start_time` (timestamptz)
      - `end_time` (timestamptz)
      - `round` (text)
      - `notes` (text)

  2. Security
    - Enable RLS
    - Add policies for public read and authenticated write access
*/

-- Create tournaments table
CREATE TABLE tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  location text NOT NULL,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create matches table
CREATE TABLE matches (
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

-- Enable RLS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Create indices
CREATE INDEX tournaments_dates_idx ON tournaments (start_date, end_date);
CREATE INDEX matches_tournament_status_idx ON matches (tournament_id, status);
CREATE INDEX matches_start_time_idx ON matches (start_time);

-- Tournaments policies
CREATE POLICY "Allow public read access to tournaments"
  ON tournaments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage tournaments"
  ON tournaments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Matches policies
CREATE POLICY "Allow public read access to matches"
  ON matches
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage matches"
  ON matches
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Update triggers
CREATE TRIGGER update_tournaments_updated_at
  BEFORE UPDATE ON tournaments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();