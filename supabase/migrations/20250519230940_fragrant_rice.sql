/*
  # Update match system for tournament organization

  1. Changes
    - Add result column to matches table
    - Update match_format options
    - Update game constraints
    - Add year column with default value
    - Add year-based index

  2. Security
    - Maintain existing RLS policies
*/

-- Add result column to matches
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS result text CHECK (result IN ('win', 'loss', 'draw'));

-- Add year column to matches if not exists
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Create index for year-based querying if not exists
CREATE INDEX IF NOT EXISTS matches_year_idx ON matches(year, start_time DESC);

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

-- Add result column to match_games if not exists
ALTER TABLE match_games
ADD COLUMN IF NOT EXISTS result text CHECK (result IN ('win', 'loss', 'draw'));

-- Update existing matches to 2025 year
UPDATE matches
SET year = 2025
WHERE year IS NULL OR year != 2025;