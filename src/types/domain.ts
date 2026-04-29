export type Position = '前衛' | '後衛';
export type Grade = 1 | 2 | 3 | 4;
export type AdmissionType =
  | '学科課題型'
  | '適性面接型'
  | 'スポーツ・音楽自己推薦型'
  | '公募制学校推薦選抜'
  | '文系・理系学部統一選抜（前期・後期）';

export type StaffPosition = 'マネージャー' | '監督' | 'コーチ';

export interface Post {
  id: string;
  title: string;
  content: string;
  publish_date: string;
  header_image?: string;
  images?: string[];
}

export interface Player {
  id: string;
  first_name: string;
  last_name: string;
  first_name_kana: string;
  last_name_kana: string;
  name: string;
  grade: Grade;
  position: Position;
  school: string;
  admission_type: AdmissionType | '';
  image?: string;
  usage_count?: number;
}

export interface Staff {
  id: string;
  first_name: string;
  last_name: string;
  first_name_kana?: string;
  last_name_kana?: string;
  name: string;
  position: StaffPosition;
  school: string;
  image?: string;
}

export interface Team {
  id: string;
  name: string;
  image?: string;
}

export interface Tournament {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  location: string;
  is_active: boolean;
}

export interface MatchGame {
  id: string;
  match_id: string;
  game_type: 'doubles' | 'singles';
  game_number: number;
  team1_player1: string;
  team1_player2?: string;
  team2_player1: string;
  team2_player2?: string;
  team1_score: number;
  team2_score: number;
  result?: 'win' | 'loss' | 'draw';
}

export interface Match {
  id: string;
  tournament_id: string;
  team1_id?: string;
  team2_id?: string;
  team1_name: string;
  team2_name: string;
  team1_score: number;
  team2_score: number;
  team1_image?: string;
  team2_image?: string;
  status: 'upcoming' | 'live' | 'completed';
  court_number?: string;
  start_time?: string;
  end_time?: string;
  round?: string;
  notes?: string;
  year: number;
  result?: 'win' | 'loss' | 'draw';
  games?: MatchGame[];
}

export interface AnnualSchedule {
  id: string;
  date: string;
  title: string;
  description?: string;
  tournament_id?: string;
}

export interface OpponentPlayer {
  id: string;
  name: string;
  team_name: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceSettings {
  id: string;
  is_maintenance_mode: boolean;
  maintenance_message: string;
  updated_at?: string;
  updated_by?: string;
}
