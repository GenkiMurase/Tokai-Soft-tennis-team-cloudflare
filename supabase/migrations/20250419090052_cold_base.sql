/*
  # Update match system for 7 games

  1. Changes
    - Update match_format check constraint to include 'doubles3', 'doubles3singles', 'doubles5', 'doubles7'
    - Update game_number check constraint to allow up to 7 games
    - Add result column to match_games

  2. Security
    - Maintain existing RLS policies
*/

-- Update match_format check constraint
ALTER TABLE matches
DROP CONSTRAINT IF EXISTS matches_match_format_check;

ALTER TABLE matches
ADD CONSTRAINT matches_match_format_check
CHECK (match_format IN ('doubles3', 'doubles3singles', 'doubles5', 'doubles7'));

-- Update game_number check constraint
ALTER TABLE match_games
DROP CONSTRAINT IF EXISTS match_games_game_number_check;

ALTER TABLE match_games
ADD CONSTRAINT match_games_game_number_check
CHECK (game_number BETWEEN 1 AND 7);

-- Add result column to match_games
ALTER TABLE match_games
ADD COLUMN IF NOT EXISTS result text CHECK (result IN ('win', 'loss', 'draw'));