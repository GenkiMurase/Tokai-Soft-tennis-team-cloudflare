import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiDelete, apiGet, apiPost, apiPut } from '../lib/api';
import type { Staff, StaffPosition } from '../types/domain';
export type { StaffPosition, Staff };

interface StaffContextType {
  staff: Staff[];
  isLoading: boolean;
  error: string | null;
  addStaff: (staff: Omit<Staff, 'id' | 'name'>) => Promise<void>;
  editStaff: (id: string, staff: Partial<Omit<Staff, 'name'>>) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  refreshStaff: () => Promise<void>;
}

const StaffContext = createContext<StaffContextType | undefined>(undefined);

export function StaffProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStaff = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setStaff(await apiGet<Staff[]>('/api/staff'));
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError('データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshStaff();
  }, []);

  const addStaff = async (staffMember: Omit<Staff, 'id' | 'name'>) => {
    try {
      await apiPost('/api/staff', staffMember);
      await refreshStaff();
    } catch (err) {
      console.error('Error adding staff:', err);
      throw new Error('データの追加に失敗しました');
    }
  };

  const editStaff = async (id: string, updatedStaff: Partial<Omit<Staff, 'name'>>) => {
    try {
      await apiPut(`/api/staff/${id}`, updatedStaff);
      await refreshStaff();
    } catch (err) {
      console.error('Error updating staff:', err);
      throw new Error('データの更新に失敗しました');
    }
  };

  const deleteStaff = async (id: string) => {
    try {
      await apiDelete(`/api/staff/${id}`);
      await refreshStaff();
    } catch (err) {
      console.error('Error deleting staff:', err);
      throw new Error('データの削除に失敗しました');
    }
  };

  return (
    <StaffContext.Provider value={{
      staff,
      isLoading,
      error,
      addStaff,
      editStaff,
      deleteStaff,
      refreshStaff
    }}>
      {children}
    </StaffContext.Provider>
  );
}

export function useStaffContext() {
  const context = useContext(StaffContext);
  if (context === undefined) {
    throw new Error('useStaffContext must be used within a StaffProvider');
  }
  return context;
}
