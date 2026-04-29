/*
  # 相手チーム選手管理システム

  1. New Tables
    - `opponent_players`
      - `id` (uuid, primary key)
      - `name` (text)
      - `team_name` (text)
      - `usage_count` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for public read and authenticated write access

  3. Functions
    - Function to increment opponent player usage count
*/

-- Create opponent_players table
CREATE TABLE opponent_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  team_name text NOT NULL,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE opponent_players ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to opponent_players"
  ON opponent_players
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow insert on opponent_players"
  ON opponent_players
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow update on opponent_players"
  ON opponent_players
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete on opponent_players"
  ON opponent_players
  FOR DELETE
  TO public
  USING (true);

-- Create indices
CREATE INDEX opponent_players_usage_count_idx ON opponent_players (usage_count DESC, name);
CREATE INDEX opponent_players_team_name_idx ON opponent_players (team_name, name);

-- Create trigger for updated_at
CREATE TRIGGER update_opponent_players_updated_at
  BEFORE UPDATE ON opponent_players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to increment opponent player usage count
CREATE OR REPLACE FUNCTION increment_opponent_player_usage(player_name text, team_name text)
RETURNS void AS $$
BEGIN
  INSERT INTO opponent_players (name, team_name, usage_count)
  VALUES (player_name, team_name, 1)
  ON CONFLICT (name, team_name) 
  DO UPDATE SET 
    usage_count = opponent_players.usage_count + 1,
    updated_at = now();
EXCEPTION
  WHEN others THEN
    -- If there's no unique constraint, try to update existing record
    UPDATE opponent_players
    SET usage_count = usage_count + 1,
        updated_at = now()
    WHERE name = player_name AND team_name = team_name;
    
    -- If no record was updated, insert new one
    IF NOT FOUND THEN
      INSERT INTO opponent_players (name, team_name, usage_count)
      VALUES (player_name, team_name, 1);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Add unique constraint for name and team_name combination
ALTER TABLE opponent_players
ADD CONSTRAINT opponent_players_name_team_unique UNIQUE (name, team_name);