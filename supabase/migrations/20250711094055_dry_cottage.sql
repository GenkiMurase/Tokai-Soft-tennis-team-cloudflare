/*
  # Add player usage tracking

  1. Changes
    - Add usage_count column to players table to track selection frequency
    - Create index for efficient sorting by usage count

  2. Security
    - Maintain existing RLS policies
*/

-- Add usage_count column to players table
ALTER TABLE players
ADD COLUMN IF NOT EXISTS usage_count integer DEFAULT 0;

-- Create index for efficient sorting by usage count
CREATE INDEX IF NOT EXISTS players_usage_count_idx ON players (usage_count DESC, last_name, first_name);

-- Function to increment player usage count
CREATE OR REPLACE FUNCTION increment_player_usage(player_name text)
RETURNS void AS $$
BEGIN
  UPDATE players
  SET usage_count = usage_count + 1
  WHERE CONCAT(last_name, ' ', first_name) = player_name
     OR name = player_name;
END;
$$ LANGUAGE plpgsql;