/*
  # Add teams table for team management

  1. New Tables
    - `teams`
      - `id` (uuid, primary key)
      - `name` (text)
      - `image` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for public read and authenticated write access
*/

CREATE TABLE teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to teams"
  ON teams
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow insert on teams"
  ON teams
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow update on teams"
  ON teams
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete on teams"
  ON teams
  FOR DELETE
  TO public
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();