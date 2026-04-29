/*
  # Integrate annual schedule with tournament information

  1. Changes
    - Add function to get matches for a tournament
    - Add function to get matches for a schedule date
    - Update annual_schedules table to better integrate with tournaments

  2. Security
    - Maintain existing RLS policies
*/

-- Function to get matches for a tournament
CREATE OR REPLACE FUNCTION get_tournament_matches(tournament_id uuid)
RETURNS SETOF matches AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM matches
  WHERE matches.tournament_id = tournament_id
  ORDER BY matches.start_time ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get matches for a specific date
CREATE OR REPLACE FUNCTION get_matches_by_date(match_date date)
RETURNS SETOF matches AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM matches
  WHERE DATE(matches.start_time) = match_date
  ORDER BY matches.start_time ASC;
END;
$$ LANGUAGE plpgsql;

-- Add view to combine annual schedules and tournaments
CREATE OR REPLACE VIEW combined_schedule AS
SELECT
  'schedule' as type,
  id,
  date,
  title,
  description,
  tournament_id,
  NULL::date as end_date,
  NULL::text as location,
  NULL::boolean as is_active,
  created_at,
  updated_at
FROM
  annual_schedules
UNION ALL
SELECT
  'tournament' as type,
  id,
  start_date as date,
  name as title,
  location as description,
  id as tournament_id,
  end_date,
  location,
  is_active,
  created_at,
  updated_at
FROM
  tournaments
ORDER BY
  date ASC;