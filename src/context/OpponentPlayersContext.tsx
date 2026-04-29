import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiGet, apiPost } from '../lib/api';
import type { OpponentPlayer } from '../types/domain';

interface OpponentPlayersContextType {
  opponentPlayers: OpponentPlayer[];
  isLoading: boolean;
  error: string | null;
  addOpponentPlayer: (player: Omit<OpponentPlayer, 'id' | 'created_at' | 'updated_at' | 'usage_count'>) => Promise<void>;
  incrementOpponentPlayerUsage: (playerName: string, teamName: string) => Promise<void>;
  getOpponentPlayersByTeam: (teamName: string) => OpponentPlayer[];
  refreshOpponentPlayers: () => Promise<void>;
}

const OpponentPlayersContext = createContext<OpponentPlayersContextType | undefined>(undefined);

export function OpponentPlayersProvider({ children }: { children: ReactNode }) {
  const [opponentPlayers, setOpponentPlayers] = useState<OpponentPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshOpponentPlayers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setOpponentPlayers(await apiGet<OpponentPlayer[]>('/api/opponent-players'));
    } catch (err) {
      console.error('Error fetching opponent players:', err);
      setError('相手チーム選手データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshOpponentPlayers();
  }, []);

  const addOpponentPlayer = async (player: Omit<OpponentPlayer, 'id' | 'created_at' | 'updated_at' | 'usage_count'>) => {
    try {
      await apiPost('/api/opponent-players', player);
      await refreshOpponentPlayers();
    } catch (err) {
      console.error('Error adding opponent player:', err);
      throw new Error('相手チーム選手の追加に失敗しました');
    }
  };

  const incrementOpponentPlayerUsage = async (playerName: string, teamName: string) => {
    try {
      await apiPost('/api/opponent-players/increment-usage', {
        playerName,
        teamName,
      });
      await refreshOpponentPlayers();
    } catch (err) {
      console.error('Error incrementing opponent player usage:', err);
      throw new Error('相手チーム選手の使用回数更新に失敗しました');
    }
  };

  const getOpponentPlayersByTeam = (teamName: string): OpponentPlayer[] => {
    return opponentPlayers
      .filter(player => player.team_name === teamName)
      .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0));
  };

  return (
    <OpponentPlayersContext.Provider value={{
      opponentPlayers,
      isLoading,
      error,
      addOpponentPlayer,
      incrementOpponentPlayerUsage,
      getOpponentPlayersByTeam,
      refreshOpponentPlayers
    }}>
      {children}
    </OpponentPlayersContext.Provider>
  );
}

export function useOpponentPlayersContext() {
  const context = useContext(OpponentPlayersContext);
  if (context === undefined) {
    throw new Error('useOpponentPlayersContext must be used within an OpponentPlayersProvider');
  }
  return context;
}
