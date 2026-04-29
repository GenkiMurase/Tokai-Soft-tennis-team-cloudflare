import React, { useState, useEffect } from 'react';
import { useMatchesContext } from '../context/MatchesContext';
import { format } from 'date-fns';

function MatchSchedule() {
  const { matches, tournaments } = useMatchesContext();
  const [isVisible, setIsVisible] = useState(true);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);

  const getTournamentName = (tournamentId: string) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    return tournament ? tournament.name : '';
  };

  const upcomingMatches = matches
    .filter(match => match.status === 'upcoming')
    .filter(match => match.start_time) // 開始時間が設定されている試合のみ
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 5);

  // 5秒後に自動で非表示
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isHeaderHovered) {
        setIsVisible(false);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isHeaderHovered]);

  // ヘッダーホバー時の表示制御
  useEffect(() => {
    const header = document.querySelector('.site-header');
    
    const handleMouseEnter = () => {
      setIsHeaderHovered(true);
      setIsVisible(true);
    };
    
    const handleMouseLeave = () => {
      setIsHeaderHovered(false);
      // 少し遅延を入れてから非表示にする
      setTimeout(() => {
        setIsVisible(false);
      }, 1000);
    };

    if (header) {
      header.addEventListener('mouseenter', handleMouseEnter);
      header.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (header) {
        header.removeEventListener('mouseenter', handleMouseEnter);
        header.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  if (upcomingMatches.length === 0) {
    return null;
  }

  return (
    <div 
      className={`bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 transition-all duration-500 ease-in-out transform ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
      style={{
        position: 'fixed', 
        top: '64px',
        left: 0, 
        right: 0,
        zIndex: 40,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
      onMouseEnter={() => {
        setIsHeaderHovered(true);
        setIsVisible(true);
      }}
      onMouseLeave={() => {
        setIsHeaderHovered(false);
        setTimeout(() => {
          setIsVisible(false);
        }, 1000);
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center overflow-x-auto whitespace-nowrap">
          <span className="text-sm font-semibold mr-4 flex-shrink-0">試合予定:</span>
          {upcomingMatches.map((match, index) => (
            <React.Fragment key={match.id}>
              {index > 0 && <span className="mx-4 text-blue-300">|</span>}
              <div className="text-sm flex-shrink-0">
                <span className="text-blue-100">{format(new Date(match.start_time), 'HH:mm')}</span>
                <span className="mx-2">{match.team1_name} vs {match.team2_name}</span>
                <span className="text-blue-100">({getTournamentName(match.tournament_id)})</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MatchSchedule;