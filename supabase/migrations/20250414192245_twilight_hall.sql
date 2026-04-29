/*
  # Separate players and staff tables

  1. New Tables
    - `players`
      - `id` (uuid, primary key)
      - `name` (text)
      - `grade` (integer, 1-4)
      - `position` (text, '前衛' or '後衛')
      - `school` (text)
      - `image` (text, nullable)

    - `staff`
      - `id` (uuid, primary key)
      - `name` (text)
      - `position` (text, 'マネージャー', '監督', or 'コーチ')
      - `school` (text)
      - `image` (text, nullable)

  2. Security
    - Enable RLS on both tables
    - Add public read access
    - Add insert/update/delete policies
*/

-- Drop existing table
DROP TABLE IF EXISTS players CASCADE;

-- Create players table
CREATE TABLE players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  grade integer NOT NULL CHECK (grade BETWEEN 1 AND 4),
  position text NOT NULL CHECK (position IN ('前衛', '後衛')),
  school text NOT NULL,
  image text
);

-- Create staff table
CREATE TABLE staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  position text NOT NULL CHECK (position IN ('マネージャー', '監督', 'コーチ')),
  school text NOT NULL,
  image text
);

-- Enable RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Create indices
CREATE INDEX players_grade_idx ON players (grade, position, name);
CREATE INDEX staff_position_idx ON staff (position, name);

-- Players policies
CREATE POLICY "Allow public read access to players"
  ON players
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow insert on players"
  ON players
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow update on players"
  ON players
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete on players"
  ON players
  FOR DELETE
  TO public
  USING (true);

-- Staff policies
CREATE POLICY "Allow public read access to staff"
  ON staff
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow insert on staff"
  ON staff
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow update on staff"
  ON staff
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete on staff"
  ON staff
  FOR DELETE
  TO public
  USING (true);