import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiDelete, apiGet, apiPost, apiPut } from '../lib/api';
import type { AnnualSchedule, Match, MatchGame, Tournament } from '../types/domain';

interface MatchesContextType {
  tournaments: Tournament[];
  matches: Match[];
  annualSchedules: AnnualSchedule[];
  isLoading: boolean;
  error: string | null;
  addTournament: (tournament: Omit<Tournament, 'id'>) => Promise<void>;
  updateTournament: (id: string, tournament: Partial<Tournament>) => Promise<void>;
  deleteTournament: (id: string) => Promise<void>;
  addMatch: (match: Omit<Match, 'id'>, games: Omit<MatchGame, 'id' | 'match_id'>[]) => Promise<void>;
  updateMatch: (id: string, match: Partial<Match>, games?: Omit<MatchGame, 'match_id'>[]) => Promise<void>;
  deleteMatch: (id: string) => Promise<void>;
  addAnnualSchedule: (schedule: Omit<AnnualSchedule, 'id'>) => Promise<void>;
  updateAnnualSchedule: (id: string, schedule: Partial<AnnualSchedule>) => Promise<void>;
  deleteAnnualSchedule: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const MatchesContext = createContext<MatchesContextType | undefined>(undefined);

export function MatchesProvider({ children }: { children: ReactNode }) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [annualSchedules, setAnnualSchedules] = useState<AnnualSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiGet<{
        tournaments: Tournament[];
        matches: Match[];
        annualSchedules: AnnualSchedule[];
      }>('/api/matches-data');
      setTournaments(data.tournaments);
      setMatches(data.matches);
      setAnnualSchedules(data.annualSchedules);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addTournament = async (tournament: Omit<Tournament, 'id'>) => {
    try {
      await apiPost('/api/tournaments', tournament);
      await refreshData();
    } catch (err) {
      console.error('Error adding tournament:', err);
      throw new Error('大会の追加に失敗しました');
    }
  };

  const updateTournament = async (id: string, tournament: Partial<Tournament>) => {
    try {
      await apiPut(`/api/tournaments/${id}`, tournament);
      await refreshData();
    } catch (err) {
      console.error('Error updating tournament:', err);
      throw new Error('大会の更新に失敗しました');
    }
  };

  const deleteTournament = async (id: string) => {
    try {
      await apiDelete(`/api/tournaments/${id}`);
      await refreshData();
    } catch (err) {
      console.error('Error deleting tournament:', err);
      throw new Error('大会の削除に失敗しました');
    }
  };

  const addMatch = async (match: Omit<Match, 'id'>, games: Omit<MatchGame, 'id' | 'match_id'>[]) => {
    try {
      await apiPost('/api/matches', { match, games });
      await refreshData();
    } catch (err) {
      console.error('Error adding match:', err);
      throw new Error('試合の追加に失敗しました');
    }
  };

  const updateMatch = async (id: string, match: Partial<Match>, games?: Omit<MatchGame, 'match_id'>[]) => {
    try {
      await apiPut(`/api/matches/${id}`, { match, games });
      await refreshData();
    } catch (err) {
      console.error('Error updating match:', err);
      throw new Error('試合の更新に失敗しました');
    }
  };

  const deleteMatch = async (id: string) => {
    try {
      await apiDelete(`/api/matches/${id}`);
      await refreshData();
    } catch (err) {
      console.error('Error deleting match:', err);
      throw new Error('試合の削除に失敗しました');
    }
  };

  const addAnnualSchedule = async (schedule: Omit<AnnualSchedule, 'id'>) => {
    try {
      await apiPost('/api/annual-schedules', schedule);
      await refreshData();
    } catch (err) {
      console.error('Error adding schedule:', err);
      throw new Error('年間予定の追加に失敗しました');
    }
  };

  const updateAnnualSchedule = async (id: string, schedule: Partial<AnnualSchedule>) => {
    try {
      await apiPut(`/api/annual-schedules/${id}`, schedule);
      await refreshData();
    } catch (err) {
      console.error('Error updating schedule:', err);
      throw new Error('年間予定の更新に失敗しました');
    }
  };

  const deleteAnnualSchedule = async (id: string) => {
    try {
      await apiDelete(`/api/annual-schedules/${id}`);
      await refreshData();
    } catch (err) {
      console.error('Error deleting schedule:', err);
      throw new Error('年間予定の削除に失敗しました');
    }
  };

  return (
    <MatchesContext.Provider value={{
      tournaments,
      matches,
      annualSchedules,
      isLoading,
      error,
      addTournament,
      updateTournament,
      deleteTournament,
      addMatch,
      updateMatch,
      deleteMatch,
      addAnnualSchedule,
      updateAnnualSchedule,
      deleteAnnualSchedule,
      refreshData,
    }}>
      {children}
    </MatchesContext.Provider>
  );
}

export function useMatchesContext() {
  const context = useContext(MatchesContext);
  if (context === undefined) {
    throw new Error('useMatchesContext must be used within a MatchesProvider');
  }
  return context;
}
