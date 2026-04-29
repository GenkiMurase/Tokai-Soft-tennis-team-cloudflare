/*
  # Add annual schedule table

  1. New Tables
    - `annual_schedules`
      - `id` (uuid, primary key)
      - `date` (date)
      - `title` (text)
      - `description` (text)
      - `tournament_id` (uuid, nullable, references tournaments)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for public read and authenticated write access
*/

CREATE TABLE annual_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  title text NOT NULL,
  description text,
  tournament_id uuid REFERENCES tournaments(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE annual_schedules ENABLE ROW LEVEL SECURITY;

-- Create index for ordering
CREATE INDEX annual_schedules_date_idx ON annual_schedules(date);

-- Create policies
CREATE POLICY "annual_schedules_select_policy"
  ON annual_schedules
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "annual_schedules_insert_policy"
  ON annual_schedules
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "annual_schedules_update_policy"
  ON annual_schedules
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "annual_schedules_delete_policy"
  ON annual_schedules
  FOR DELETE
  TO public
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_annual_schedules_updated_at
  BEFORE UPDATE ON annual_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();