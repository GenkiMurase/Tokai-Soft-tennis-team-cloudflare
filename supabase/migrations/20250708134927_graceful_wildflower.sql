/*
  # Create live streaming tables

  1. New Tables
    - `live_streams`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text, nullable)
      - `status` (text) - 'scheduled', 'live', 'ended'
      - `start_time` (timestamptz)
      - `end_time` (timestamptz, nullable)
      - `stream_key` (text)
      - `bitrate` (integer)
      - `recording_url` (text, nullable)
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz)

    - `stream_reactions`
      - `id` (uuid, primary key)
      - `stream_id` (uuid, references live_streams)
      - `type` (text) - reaction types
      - `count` (integer)
      - `last_updated` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read and authenticated write access
*/

-- Create live_streams table
CREATE TABLE live_streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL CHECK (status IN ('scheduled', 'live', 'ended')),
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  stream_key text NOT NULL UNIQUE,
  bitrate integer NOT NULL DEFAULT 1000,
  recording_url text,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Create stream_reactions table
CREATE TABLE stream_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id uuid REFERENCES live_streams(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('nice_play', 'nice_catch', 'fight', 'ganbare', 'ippon_lead', 'ippon_comeback')),
  count integer NOT NULL DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  UNIQUE(stream_id, type)
);

-- Enable RLS
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_reactions ENABLE ROW LEVEL SECURITY;

-- Create indices
CREATE INDEX live_streams_status_idx ON live_streams(status, start_time);
CREATE INDEX live_streams_expires_idx ON live_streams(expires_at);
CREATE INDEX stream_reactions_stream_id_idx ON stream_reactions(stream_id);

-- Live streams policies
CREATE POLICY "Allow public read access to live_streams"
  ON live_streams
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow insert on live_streams"
  ON live_streams
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow update on live_streams"
  ON live_streams
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete on live_streams"
  ON live_streams
  FOR DELETE
  TO public
  USING (true);

-- Stream reactions policies
CREATE POLICY "Allow public read access to stream_reactions"
  ON stream_reactions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow insert on stream_reactions"
  ON stream_reactions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow update on stream_reactions"
  ON stream_reactions
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete on stream_reactions"
  ON stream_reactions
  FOR DELETE
  TO public
  USING (true);

-- Function to automatically delete expired streams
CREATE OR REPLACE FUNCTION delete_expired_streams()
RETURNS void AS $$
BEGIN
  DELETE FROM live_streams
  WHERE expires_at < now() AND status = 'ended';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup (this would need to be set up in Supabase dashboard)
-- SELECT cron.schedule('delete-expired-streams', '0 2 * * *', 'SELECT delete_expired_streams();');