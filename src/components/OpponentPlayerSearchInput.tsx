import React, { useState, useEffect, useRef } from 'react';
import { useOpponentPlayersContext } from '../context/OpponentPlayersContext';
import { Search, X, User } from 'lucide-react';

interface OpponentPlayerSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  teamName: string;
  placeholder?: string;
  className?: string;
  onPlayerSelect?: (player: any) => void;
}

function OpponentPlayerSearchInput({ 
  value, 
  onChange, 
  teamName,
  placeholder = "相手選手名を入力", 
  className = "",
  onPlayerSelect 
}: OpponentPlayerSearchInputProps) {
  const { getOpponentPlayersByTeam, incrementOpponentPlayerUsage } = useOpponentPlayersContext();
  const [isOpen, setIsOpen] = useState(false);
  const [filteredPlayers, setFilteredPlayers] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // チーム別の相手選手を取得
  const teamPlayers = getOpponentPlayersByTeam(teamName);

  useEffect(() => {
    if (value.trim() === '') {
      setFilteredPlayers(teamPlayers.slice(0, 10)); // 上位10名を表示
    } else if (value.trim().length > 0) {
      const filtered = teamPlayers.filter(player => {
        const searchTerm = value.toLowerCase();
        return player.name.toLowerCase().includes(searchTerm);
      });
      setFilteredPlayers(filtered.slice(0, 20)); // 最大20件表示
    }
  }, [value, teamPlayers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePlayerClick = async (player: any) => {
    onChange(player.name);
    setIsOpen(false);
    onPlayerSelect?.(player);
    
    // 使用回数を増やす
    try {
      await incrementOpponentPlayerUsage(player.name, teamName);
    } catch (error) {
      console.error('Error incrementing opponent player usage:', error);
    }
  };

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    
    // 入力が完了したときに使用回数を増やすように変更
    // フォーカスが外れたときに処理するように修正
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && filteredPlayers.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {value.trim() === '' && (
            <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b">
              よく使用される相手選手 ({teamName})
            </div>
          )}
          {filteredPlayers.map((player) => (
            <button
              key={player.id}
              onClick={() => handlePlayerClick(player)}
              className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {player.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {player.team_name}
                    </div>
                  </div>
                </div>
                {player.usage_count > 0 && (
                  <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    {player.usage_count}回
                  </div>
                )}
              </div>
            </button>
          ))}
          {filteredPlayers.length === 0 && value.trim() !== '' && (
            <div className="px-3 py-2 text-gray-500 text-center">
              該当する選手が見つかりません
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OpponentPlayerSearchInput;