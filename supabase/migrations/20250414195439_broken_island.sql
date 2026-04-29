/*
  # Add images array to posts table

  1. Changes
    - Add images column to posts table to store multiple image URLs
    - Keep header_image column for the main post image
    - Update existing policies to include new column

  2. Security
    - Maintain existing RLS policies
*/

-- Add images array column to posts table
ALTER TABLE posts
ADD COLUMN images text[];

-- Drop existing policies
DROP POLICY IF EXISTS "Allow read access to posts for everyone" ON posts;
DROP POLICY IF EXISTS "Allow insert on posts" ON posts;
DROP POLICY IF EXISTS "Allow update on posts" ON posts;
DROP POLICY IF EXISTS "Allow delete on posts" ON posts;

-- Recreate policies with new column
CREATE POLICY "Allow read access to posts for everyone"
  ON posts
  FOR SELECT
  TO public
  USING (true);

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