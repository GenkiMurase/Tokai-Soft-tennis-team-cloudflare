/*
  # Add team ID columns to matches table

  1. Changes
    - Add `team1_id` and `team2_id` columns to `matches` table
    - Add foreign key constraints to reference `teams` table
    - Add indexes for better query performance

  2. Security
    - No changes to RLS policies needed as existing policies cover the new columns
*/

-- Add team ID columns
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS team1_id uuid REFERENCES teams(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS team2_id uuid REFERENCES teams(id) ON DELETE SET NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS matches_team1_id_idx ON matches(team1_id);
CREATE INDEX IF NOT EXISTS matches_team2_id_idx ON matches(team2_id);