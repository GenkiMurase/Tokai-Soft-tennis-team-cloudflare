/*
  # Create posts table

  1. New Tables
    - `posts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `publish_date` (timestamptz)
      - `header_image` (text, nullable)
      - `images` (text[], nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `posts` table
    - Add policies for authenticated users to manage posts
*/

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  publish_date timestamptz NOT NULL,
  header_image text,
  images text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all posts
CREATE POLICY "Users can read posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert posts
CREATE POLICY "Users can insert posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update posts
CREATE POLICY "Users can update posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete posts
CREATE POLICY "Users can delete posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_posts_updated_at();