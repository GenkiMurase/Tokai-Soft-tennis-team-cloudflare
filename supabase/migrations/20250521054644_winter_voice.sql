/*
  # Split names into first and last name

  1. Changes
    - Add first_name and last_name columns to players and staff tables
    - Split existing names into first and last names
    - Create indices for efficient name-based searching

  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns to players table
ALTER TABLE players
ADD COLUMN first_name text DEFAULT '',
ADD COLUMN last_name text DEFAULT '';

-- Add new columns to staff table
ALTER TABLE staff
ADD COLUMN first_name text DEFAULT '',
ADD COLUMN last_name text DEFAULT '';

-- Update existing data in players table
UPDATE players
SET
  last_name = COALESCE(split_part(name, ' ', 1), name),
  first_name = COALESCE(NULLIF(split_part(name, ' ', 2), ''), '')
WHERE name IS NOT NULL;

-- Update existing data in staff table
UPDATE staff
SET
  last_name = COALESCE(split_part(name, ' ', 1), name),
  first_name = COALESCE(NULLIF(split_part(name, ' ', 2), ''), '')
WHERE name IS NOT NULL;

-- Create indices for name-based searching
CREATE INDEX players_names_idx ON players (last_name, first_name);
CREATE INDEX staff_names_idx ON staff (last_name, first_name);

-- Make new columns required after data migration
ALTER TABLE players
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL;

ALTER TABLE staff
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL;