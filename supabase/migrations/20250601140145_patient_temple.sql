/*
  # Add furigana fields to players and staff tables

  1. Changes
    - Add first_name_kana and last_name_kana columns to players and staff tables
    - Create indices for efficient kana-based searching
    - Make new columns required with empty string default

  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns to players table
ALTER TABLE players
ADD COLUMN first_name_kana text DEFAULT '',
ADD COLUMN last_name_kana text DEFAULT '';

-- Add new columns to staff table
ALTER TABLE staff
ADD COLUMN first_name_kana text DEFAULT '',
ADD COLUMN last_name_kana text DEFAULT '';

-- Create indices for kana-based searching
CREATE INDEX players_kana_idx ON players (last_name_kana, first_name_kana);
CREATE INDEX staff_kana_idx ON staff (last_name_kana, first_name_kana);

-- Make new columns required after adding them
ALTER TABLE players
ALTER COLUMN first_name_kana SET NOT NULL,
ALTER COLUMN last_name_kana SET NOT NULL;

ALTER TABLE staff
ALTER COLUMN first_name_kana SET NOT NULL,
ALTER COLUMN last_name_kana SET NOT NULL;