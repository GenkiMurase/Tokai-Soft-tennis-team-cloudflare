/*
  # Add admission type field to players table

  1. Changes
    - Add admission_type column to players table
    - Add check constraint for valid admission types
    - Set default value to empty string

  2. Security
    - Maintain existing RLS policies
*/

-- Add admission_type column to players table
ALTER TABLE players
ADD COLUMN admission_type text DEFAULT '';

-- Add check constraint for valid admission types
ALTER TABLE players
ADD CONSTRAINT players_admission_type_check
CHECK (admission_type IN (
  '',
  '総合型選抜（旧AO入試）',
  '学校推薦型選抜',
  '一般選抜',
  '大学入学共通テスト利用選抜',
  '編入学選抜',
  '医学部〔医学科〕特別選抜',
  '留学生入学試験',
  '付属推薦入試'
));

-- Make the column required after adding it
ALTER TABLE players
ALTER COLUMN admission_type SET NOT NULL;