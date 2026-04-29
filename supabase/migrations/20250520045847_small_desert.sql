/*
  # Add team image support for matches

  1. Changes
    - Add views to join team images with matches
    - Update match sorting to use start_time DESC

  2. Security
    - Maintain existing RLS policies
*/

-- Create a view to get team images with matches
CREATE OR REPLACE VIEW matches_with_teams AS
SELECT 
  m.*,
  t1.image as team1_image,
  t2.image as team2_image
FROM matches m
LEFT JOIN teams t1 ON m.team1_id = t1.id
LEFT JOIN teams t2 ON m.team2_id = t2.id;

-- Drop existing indexes
DROP INDEX IF EXISTS matches_start_time_idx;

-- Create new index for better sorting
CREATE INDEX matches_start_time_desc_idx ON matches(start_time DESC NULLS LAST);