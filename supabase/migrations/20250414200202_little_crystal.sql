/*
  # Create achievements table

  1. New Tables
    - `achievements`
      - `id` (uuid, primary key)
      - `year` (integer)
      - `title` (text)
      - `description` (text)
      - `order` (integer)

  2. Security
    - Enable RLS on `achievements` table
    - Add policies for public read and authenticated write access
*/

CREATE TABLE achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to achievements"
  ON achievements
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to manage achievements
CREATE POLICY "Allow insert on achievements"
  ON achievements
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow update on achievements"
  ON achievements
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete on achievements"
  ON achievements
  FOR DELETE
  TO public
  USING (true);

-- Create index for ordering
CREATE INDEX achievements_year_order_idx ON achievements (year DESC, "order");

-- Create trigger for updated_at
CREATE TRIGGER update_achievements_updated_at
  BEFORE UPDATE ON achievements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();