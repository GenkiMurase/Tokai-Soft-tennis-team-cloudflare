/*
  # Fix opponent players table and functions

  1. Changes
    - Add missing function to increment opponent player usage
    - Fix potential issues with the existing function

  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS increment_opponent_player_usage(text, text);

-- Create improved function to increment opponent player usage count
CREATE OR REPLACE FUNCTION increment_opponent_player_usage(player_name text, team_name text)
RETURNS void AS $$
BEGIN
  -- Check if player exists
  IF EXISTS (SELECT 1 FROM opponent_players WHERE name = player_name AND team_name = team_name) THEN
    -- Update existing player
    UPDATE opponent_players
    SET 
      usage_count = usage_count + 1,
      updated_at = now()
    WHERE 
      name = player_name AND 
      team_name = team_name;
  ELSE
    -- Insert new player
    INSERT INTO opponent_players (name, team_name, usage_count)
    VALUES (player_name, team_name, 1);
  END IF;
END;
$$ LANGUAGE plpgsql;