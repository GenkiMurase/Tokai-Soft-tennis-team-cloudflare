/*
  # Update players table for staff positions

  1. Changes
    - Make grade column nullable
    - Update position check constraint to include staff positions
    - Add index on position for better query performance

  2. Security
    - Maintain existing RLS policies
*/

-- Make grade column nullable
ALTER TABLE players
ALTER COLUMN grade DROP NOT NULL;

-- Update position check constraint
ALTER TABLE players
DROP CONSTRAINT IF EXISTS players_position_check;

ALTER TABLE players
ADD CONSTRAINT players_position_check
CHECK (position IN ('前衛', '後衛', 'マネージャー', '監督', 'コーチ'));

-- Add index on position
CREATE INDEX IF NOT EXISTS players_position_idx ON players (position);