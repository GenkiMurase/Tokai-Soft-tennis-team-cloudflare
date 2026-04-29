import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiDelete, apiGet, apiPost, apiPut } from '../lib/api';
import type { AdmissionType, Grade, Player, Position } from '../types/domain';
export type { AdmissionType, Grade, Player, Position };

interface PlayersContextType {
  players: Player[];
  isLoading: boolean;
  error: string | null;
  addPlayer: (player: Omit<Player, 'id'>) => Promise<void>;
  editPlayer: (id: string, player: Partial<Player>) => Promise<void>;
  deletePlayer: (id: string) => Promise<void>;
  promoteAllGrades: () => Promise<void>;
  refreshPlayers: () => Promise<void>;
}

const PlayersContext = createContext<PlayersContextType | undefined>(undefined);

export function PlayersProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshPlayers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setPlayers(await apiGet<Player[]>('/api/players'));
    } catch (err) {
      console.error('Error fetching players:', err);
      setError('データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshPlayers();
  }, []);

  const addPlayer = async (player: Omit<Player, 'id'>) => {
    try {
      await apiPost('/api/players', player);
      await refreshPlayers();
    } catch (err) {
      console.error('Error adding player:', err);
      throw new Error('データの追加に失敗しました');
    }
  };

  const editPlayer = async (id: string, updatedPlayer: Partial<Player>) => {
    try {
      await apiPut(`/api/players/${id}`, updatedPlayer);
      await refreshPlayers();
    } catch (err) {
      console.error('Error updating player:', err);
      throw new Error('データの更新に失敗しました');
    }
  };

  const deletePlayer = async (id: string) => {
    try {
      await apiDelete(`/api/players/${id}`);
      await refreshPlayers();
    } catch (err) {
      console.error('Error deleting player:', err);
      throw new Error('データの削除に失敗しました');
    }
  };

  const promoteAllGrades = async () => {
    try {
      await apiPost('/api/players/promote-grades');
      await refreshPlayers();
    } catch (err) {
      console.error('Error promoting grades:', err);
      throw new Error('学年の繰り上げに失敗しました');
    }
  };

  return (
    <PlayersContext.Provider value={{
      players,
      isLoading,
      error,
      addPlayer,
      editPlayer,
      deletePlayer,
      promoteAllGrades,
      refreshPlayers
    }}>
      {children}
    </PlayersContext.Provider>
  );
}

export function usePlayersContext() {
  const context = useContext(PlayersContext);
  if (context === undefined) {
    throw new Error('usePlayersContext must be used within a PlayersProvider');
  }
  return context;
}
