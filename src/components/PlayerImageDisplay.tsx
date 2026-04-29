import React, { useState } from 'react';
import { usePlayersContext } from '../context/PlayersContext';
import { X, User } from 'lucide-react';

interface PlayerImageDisplayProps {
  playerName: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

function PlayerImageDisplay({ 
  playerName = '', 
  className = '', 
  size = 'md',
  showName = false 
}: PlayerImageDisplayProps) {
  const { players } = usePlayersContext();
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);

  // 選手名から選手情報を検索
  const findPlayer = (name: string) => {
    if (!name) return null;
    return players.find(player => {
      const fullName = `${player.last_name} ${player.first_name}`;
      return fullName === name || player.name === name;
    });
  };

  const player = findPlayer(playerName);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const handlePlayerClick = () => {
    if (player) {
      setSelectedPlayer(player);
    }
  };

  const handleClosePlayer = () => {
    setSelectedPlayer(null);
  };

  if (!player) {
    return showName ? (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0`}>
          <User className="w-3 h-3 text-gray-400" />
        </div>
        <span className="text-sm">{playerName}</span>
      </div>
    ) : null;
  }

  return (
    <>
      <div 
        className={`flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity ${className}`}
        onClick={handlePlayerClick}
      >
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0 border-2 border-blue-200`}>
          {player.image ? (
            <img
              src={player.image}
              alt={playerName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-blue-600 font-bold">
              {player.first_name.charAt(0)}
            </span>
          )}
        </div>
        {showName && (
          <span className="text-sm font-medium">{playerName}</span>
        )}
      </div>

      {/* 選手詳細ポップアップ */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl w-full mx-4 max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col md:flex-row">
              {/* 画像部分 */}
              <div className="relative">
                <div className="aspect-square w-full md:w-80 md:h-80">
                  {selectedPlayer.image ? (
                    <img
                      src={selectedPlayer.image}
                      alt={selectedPlayer.name}
                      className="w-full h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-lg md:rounded-l-lg md:rounded-tr-none">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <button
                  onClick={handleClosePlayer}
                  className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10 md:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* 詳細情報部分 */}
              <div className="p-6 md:flex-1 relative">
                {/* デスクトップ用の閉じるボタン */}
                <button
                  onClick={handleClosePlayer}
                  className="hidden md:block absolute top-4 right-4 bg-gray-100 rounded-full p-2 hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-800 pr-12">
                      {selectedPlayer.last_name} {selectedPlayer.first_name}
                    </h3>
                    <p className="text-lg md:text-xl text-gray-500">
                      {selectedPlayer.last_name_kana} {selectedPlayer.first_name_kana}
                    </p>
                    <p className="text-lg md:text-xl text-gray-600 mt-2">{selectedPlayer.grade}年生</p>
                  </div>
                  <div className="space-y-4 md:space-y-6">
                    <div>
                      <p className="text-sm md:text-base text-gray-500">ポジション</p>
                      <p className="text-lg md:text-xl font-medium">{selectedPlayer.position}</p>
                    </div>
                    <div>
                      <p className="text-sm md:text-base text-gray-500">出身校</p>
                      <p className="text-lg md:text-xl font-medium">{selectedPlayer.school}</p>
                    </div>
                    {selectedPlayer.admission_type && (
                      <div>
                        <p className="text-sm md:text-base text-gray-500">入試形態</p>
                        <p className="text-base md:text-lg font-medium">{selectedPlayer.admission_type}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PlayerImageDisplay;