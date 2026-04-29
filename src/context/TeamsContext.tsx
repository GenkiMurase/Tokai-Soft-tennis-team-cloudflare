import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiDelete, apiGet, apiPost, apiPut } from '../lib/api';
import type { Team } from '../types/domain';

interface TeamsContextType {
  teams: Team[];
  isLoading: boolean;
  error: string | null;
  addTeam: (team: Omit<Team, 'id'>) => Promise<void>;
  updateTeam: (id: string, team: Partial<Team>) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  refreshTeams: () => Promise<void>;
}

const TeamsContext = createContext<TeamsContextType | undefined>(undefined);

export function TeamsProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTeams = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setTeams(await apiGet<Team[]>('/api/teams'));
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError(err instanceof Error ? err.message : 'チームデータの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshTeams();
  }, []);

  const addTeam = async (team: Omit<Team, 'id'>) => {
    try {
      await apiPost('/api/teams', team);
      await refreshTeams();
    } catch (err) {
      console.error('Error adding team:', err);
      throw new Error(err instanceof Error ? err.message : 'チームの追加に失敗しました');
    }
  };

  const updateTeam = async (id: string, team: Partial<Team>) => {
    try {
      await apiPut(`/api/teams/${id}`, team);
      await refreshTeams();
    } catch (err) {
      console.error('Error updating team:', err);
      throw new Error(err instanceof Error ? err.message : 'チームの更新に失敗しました');
    }
  };

  const deleteTeam = async (id: string) => {
    try {
      await apiDelete(`/api/teams/${id}`);
      await refreshTeams();
    } catch (err) {
      console.error('Error deleting team:', err);
      throw new Error(err instanceof Error ? err.message : 'チームの削除に失敗しました');
    }
  };

  return (
    <TeamsContext.Provider value={{
      teams,
      isLoading,
      error,
      addTeam,
      updateTeam,
      deleteTeam,
      refreshTeams
    }}>
      {children}
    </TeamsContext.Provider>
  );
}

export function useTeamsContext() {
  const context = useContext(TeamsContext);
  if (context === undefined) {
    throw new Error('useTeamsContext must be used within a TeamsProvider');
  }
  return context;
}
