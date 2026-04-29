/*
  # Add year field for archiving

  1. Changes
    - Add year column to posts table
    - Add year column to matches table
    - Add indices for efficient year-based querying
    - Update existing records with current year

  2. Security
    - Maintain existing RLS policies
*/

-- Add year column to posts
ALTER TABLE posts
ADD COLUMN year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Add year column to matches
ALTER TABLE matches
ADD COLUMN year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Create indices for year-based querying
CREATE INDEX posts_year_idx ON posts(year, publish_date DESC);
CREATE INDEX matches_year_idx ON matches(year, start_time DESC);

-- Update existing records with the year from their dates
UPDATE posts
SET year = EXTRACT(YEAR FROM publish_date);

UPDATE matches
SET year = EXTRACT(YEAR FROM start_time)
WHERE start_time IS NOT NULL;