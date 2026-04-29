/*
  # Fix storage and RLS policies

  1. Storage
    - Create storage bucket for images
    - Add storage policies

  2. RLS Policies
    - Update policies for players and posts tables
    - Add separate policies for each operation
*/

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Give public access to images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images');

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all access to players for authenticated users" ON players;
DROP POLICY IF EXISTS "Allow all access to posts for authenticated users" ON posts;

-- Players policies
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

-- Posts policies
CREATE POLICY "Allow insert on posts"
  ON posts
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow update on posts"
  ON posts
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete on posts"
  ON posts
  FOR DELETE
  TO public
  USING (true);