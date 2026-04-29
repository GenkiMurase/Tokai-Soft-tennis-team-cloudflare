/*
  # Update admission types for players

  1. Changes
    - Drop existing constraint first
    - Update existing data to match new admission types
    - Add new constraint with updated admission types

  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing constraint first
ALTER TABLE players
DROP CONSTRAINT IF EXISTS players_admission_type_check;

-- Update existing data to match new admission types
UPDATE players
SET admission_type = CASE
  WHEN admission_type = '総合型選抜（旧AO入試）' THEN '学科課題型'
  WHEN admission_type = '学校推薦型選抜' THEN '公募制学校推薦選抜'
  WHEN admission_type = '一般選抜' THEN '文系・理系学部統一選抜（前期・後期）'
  WHEN admission_type = '大学入学共通テスト利用選抜' THEN '文系・理系学部統一選抜（前期・後期）'
  WHEN admission_type = '編入学選抜' THEN ''
  WHEN admission_type = '医学部〔医学科〕特別選抜' THEN ''
  WHEN admission_type = '留学生入学試験' THEN ''
  WHEN admission_type = '付属推薦入試' THEN ''
  WHEN admission_type = '公募制学校推薦選抜' THEN '公募制学校推薦選抜'
  ELSE ''
END
WHERE admission_type IS NOT NULL;

-- Add new constraint with updated admission types
ALTER TABLE players
ADD CONSTRAINT players_admission_type_check
CHECK (admission_type IN (
  '',
  '学科課題型',
  '適性面接型',
  'スポーツ・音楽自己推薦型',
  '公募制学校推薦選抜',
  '文系・理系学部統一選抜（前期・後期）'
));