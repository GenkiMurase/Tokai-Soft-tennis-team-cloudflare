/*
  # Add manager position to players table

  1. Changes
    - Update position check constraint to include 'マネージャー'

  2. Security
    - No changes to RLS policies required
*/

ALTER TABLE players
DROP CONSTRAINT IF EXISTS players_position_check;

ALTER TABLE players
ADD CONSTRAINT players_position_check
CHECK (position IN ('前衛', '後衛', 'マネージャー'));