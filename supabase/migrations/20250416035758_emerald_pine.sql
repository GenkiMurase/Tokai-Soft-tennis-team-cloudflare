/*
  # Add detailed match information

  1. New Tables
    - `match_games`
      - `id` (uuid, primary key)
      - `match_id` (uuid, references matches)
      - `game_type` (text, 'doubles' or 'singles')
      - `game_number` (integer)
      - `team1_player1` (text)
      - `team1_player2` (text, nullable for singles)
      - `team2_player1` (text)
      - `team2_player2` (text, nullable for singles)
      - `team1_score` (integer)
      - `team2_score` (integer)

  2. Changes
    - Add `match_format` to matches table ('doubles5' or 'doubles3singles2')
*/

-- Add match_format to matches table
ALTER TABLE matches ADD COLUMN IF NOT EXISTS match_format text CHECK (match_format IN ('doubles5', 'doubles3singles2'));

-- Create match_games table
CREATE TABLE match_games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id) ON DELETE CASCADE,
  game_type text NOT NULL CHECK (game_type IN ('doubles', 'singles')),
  game_number integer NOT NULL CHECK (game_number BETWEEN 1 AND 5),
  team1_player1 text NOT NULL,
  team1_player2 text,
  team2_player1 text NOT NULL,
  team2_player2 text,
  team1_score integer DEFAULT 0,
  team2_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for match_games
CREATE INDEX match_games_match_id_idx ON match_games(match_id);

-- Enable RLS
ALTER TABLE match_games ENABLE ROW LEVEL SECURITY;

-- Create policies for match_games
CREATE POLICY "match_games_select_policy"
  ON match_games
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "match_games_insert_policy"
  ON match_games
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "match_games_update_policy"
  ON match_games
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "match_games_delete_policy"
  ON match_games
  FOR DELETE
  TO public
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_match_games_updated_at
  BEFORE UPDATE ON match_games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();