/*
  # Simplified Schema for Players and Posts

  1. New Tables
    - `players`
      - `id` (uuid, primary key)
      - `name` (text)
      - `grade` (integer, 1-4)
      - `position` (text, '前衛' or '後衛')
      - `school` (text)
      - `image` (text, nullable)

    - `posts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `publish_date` (timestamptz)
      - `header_image` (text, nullable)

  2. Security
    - Enable RLS on both tables
    - Add basic policies for authenticated users
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS posts CASCADE;

-- Create players table
CREATE TABLE players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  grade integer NOT NULL CHECK (grade BETWEEN 1 AND 4),
  position text NOT NULL CHECK (position IN ('前衛', '後衛')),
  school text NOT NULL,
  image text
);

-- Create posts table
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  publish_date timestamptz NOT NULL,
  header_image text
);

-- Enable RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policies for players
CREATE POLICY "Allow read access to players for everyone"
  ON players
  FOR SELECT
  USING (true);

CREATE POLICY "Allow all access to players for authenticated users"
  ON players
  USING (auth.role() = 'authenticated');

-- Policies for posts
CREATE POLICY "Allow read access to posts for everyone"
  ON posts
  FOR SELECT
  USING (true);

CREATE POLICY "Allow all access to posts for authenticated users"
  ON posts
  USING (auth.role() = 'authenticated');