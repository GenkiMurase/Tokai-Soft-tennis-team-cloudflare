import React, { useState } from 'react';
import { useMatchesContext } from '../context/MatchesContext';
import { format, isToday, isBefore, isAfter } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronDown, ChevronRight, Calendar, Trophy, MapPin, Clock, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function AnnualSchedule() {
  const { annualSchedules, tournaments, matches, isLoading } = useMatchesContext();
  const [expandedTournaments, setExpandedTournaments] = useState<Set<string>>(new Set());
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const navigate = useNavigate();

  const getTournamentName = (tournamentId: string) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    return tournament ? tournament.name : '';
  };

  const getScoreColor = (match: any) => {
    if (match.result === 'win') return 'text-green-600';
    if (match.result === 'loss') return 'text-red-600';
    return 'text-gray-800';
  };

  const toggleTournament = (tournamentId: string) => {
    const newExpanded = new Set(expandedTournaments);
    if (newExpanded.has(tournamentId)) {
      newExpanded.delete(tournamentId);
    } else {
      newExpanded.add(tournamentId);
    }
    setExpandedTournaments(newExpanded);
  };

  const handleMatchClick = (match: any, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/matches?match=${match.id}`);
  };

  const handleCloseMatch = () => {
    setSelectedMatch(null);
  };

  const navigateToMatch = (matchId: string) => {
    navigate(`/matches?match=${matchId}`);
    setSelectedMatch(null);
  };

  // 大会ごとに試合をグループ化
  const getMatchesForTournament = (tournamentId: string) => {
    return matches
      .filter(match => match.tournament_id === tournamentId)
      .sort((a, b) => {
        if (!a.start_time || !b.start_time) return 0;
        return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
      });
  };

  // 年間予定と大会を統合してソート
  const combinedSchedule = [
    ...annualSchedules.map(schedule => ({
      ...schedule,
      type: 'schedule' as const,
      date: new Date(schedule.date)
    })),
    ...tournaments.map(tournament => ({
      ...tournament,
      type: 'tournament' as const,
      date: new Date(tournament.start_date),
      title: tournament.name,
      description: `${tournament.location}で開催`
    }))
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  // 月ごとにグループ化
  const schedulesByMonth = combinedSchedule.reduce((acc, item) => {
    const month = format(item.date, 'M');
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(item);
    return acc;
  }, {} as Record<string, typeof combinedSchedule>);

  const today = new Date();
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-8">年間予定・大会スケジュール</h2>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">読み込み中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-8">年間予定・大会スケジュール</h2>
      <div className="space-y-8">
        {Object.entries(schedulesByMonth)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([month, items]) => (
            <div key={month} className="relative">
              {/* 現在の月かどうかをチェック */}
              {parseInt(month) === today.getMonth() + 1 && (
                <div className="absolute left-0 right-0 top-12 z-10">
                  <div className="flex items-center">
                    <div className="w-12 h-0.5 bg-red-500"></div>
                    <div className="flex-1 h-0.5 bg-red-500 ml-6"></div>
                  </div>
                  <div className="ml-16 mt-2">
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium inline-flex items-center">
                      <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                      今日 ({format(today, 'M月d日', { locale: ja })})
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                  parseInt(month) === today.getMonth() + 1 
                    ? 'bg-red-500 ring-4 ring-red-200' 
                    : 'bg-blue-600'
                }`}>
                  {month}月
                </div>
                <div className="flex-1 ml-6 border-b border-gray-200"></div>
              </div>
              <div className="mt-6 space-y-4 relative">
                {items.map((item) => (
                  <div key={item.id} className="ml-16 relative">
                    <div className="absolute -left-4 top-1/2 w-2 h-2 bg-blue-600 rounded-full transform -translate-y-1/2"></div>
                    
                    {item.type === 'schedule' ? (
                      // 通常の年間予定
                      <div className={`rounded-lg p-4 ${
                        isToday(item.date) 
                          ? 'bg-red-50 border-2 border-red-200 shadow-lg' 
                          : isAfter(item.date, today)
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-gray-50'
                      }`}>
                        <div className="text-sm text-gray-600 mb-1">
                          {format(item.date, 'M月d日(E)', { locale: ja })}
                        </div>
                        <div className="font-medium">{item.title}</div>
                        {item.description && (
                          <div className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
                            {item.description}
                          </div>
                        )}
                        {item.tournament_id && (
                          <div className="text-sm text-blue-600 mt-2">
                            {getTournamentName(item.tournament_id)}
                          </div>
                        )}
                      </div>
                    ) : (
                      // 大会（クリックで試合一覧を表示）
                      <div className={`rounded-lg border ${
                        isToday(item.date) 
                          ? 'bg-red-50 border-2 border-red-300 shadow-lg' 
                          : isAfter(item.date, today)
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}>
                        <button
                          onClick={() => toggleTournament(item.id)}
                          className="w-full p-4 text-left hover:bg-blue-100 transition-colors rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-grow">
                              <div className="flex items-center text-sm text-blue-600 mb-1">
                                <Trophy className={`w-4 h-4 mr-1 ${
                                  isToday(item.date) 
                                    ? 'text-red-600' 
                                    : 'text-blue-600'
                                }`} />
                                <span>{format(item.date, 'M月d日(E)', { locale: ja })}</span>
                                {item.end_date && item.start_date !== item.end_date && (
                                  <span> - {format(new Date(item.end_date), 'M月d日(E)', { locale: ja })}</span>
                                )}
                              </div>
                              <div className="font-medium text-blue-800">{item.title}</div>
                              <div className="text-sm text-blue-600 mt-1 flex items-center">
                                <MapPin className={`w-4 h-4 mr-1 ${
                                  isToday(item.date) 
                                    ? 'text-red-600' 
                                    : 'text-blue-600'
                                }`} />
                                {item.description}
                              </div>
                              {isToday(item.date) && (
                                <div className="text-xs text-red-600 font-bold mt-2 animate-pulse">
                                  本日開催
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              {expandedTournaments.has(item.id) ? (
                                <ChevronDown className={`w-5 h-5 ${
                                  isToday(item.date) ? 'text-red-600' : 'text-blue-600'
                                }`} />
                              ) : (
                                <ChevronRight className={`w-5 h-5 ${
                                  isToday(item.date) ? 'text-red-600' : 'text-blue-600'
                                }`} />
                              )}
                            </div>
                          </div>
                        </button>
                        
                        {/* 展開された試合一覧 */}
                        {expandedTournaments.has(item.id) && (
                          <div className="border-t border-blue-200 p-4 bg-white rounded-b-lg">
                            {(() => {
                              const tournamentMatches = getMatchesForTournament(item.id);
                              
                              if (tournamentMatches.length === 0) {
                                return (
                                  <p className="text-gray-500 text-center py-4">
                                    この大会の試合予定はまだ登録されていません
                                  </p>
                                );
                              }

                              return (
                                <div className="space-y-3">
                                  <h4 className="font-medium text-gray-800 mb-3">試合予定・結果</h4>
                                  {tournamentMatches.map((match) => (
                                    <div
                                      key={match.id}
                                      className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                                      onClick={(e) => handleMatchClick(match, e)}
                                      style={{ cursor: 'pointer' }}
                                    >
                                      <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center space-x-4">
                                          <span className="font-medium text-gray-800">
                                            {match.team1_name} vs {match.team2_name}
                                          </span>
                                        </div>
                                        <div className="text-base font-bold">
                                          {match.status === 'upcoming' ? '0-0' : `${match.team1_score}-${match.team2_score}`}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            match.status === 'live' ? 'bg-green-100 text-green-800' :
                                            match.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                          }`}>
                                            {match.status === 'live' ? '試合中' :
                                             match.status === 'upcoming' ? '予定' : '終了'}
                                          </span>
                                          {match.result && (
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                              match.result === 'win' ? 'bg-green-100 text-green-800' :
                                              match.result === 'loss' ? 'bg-red-100 text-red-800' :
                                              'bg-gray-100 text-gray-800'
                                            }`}>
                                              {match.result === 'win' ? '勝' :
                                               match.result === 'loss' ? '敗' :
                                               '引分'}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-sm text-gray-600 flex flex-wrap gap-3">
                                        {match.round && <span>{match.round}</span>}
                                        {match.court_number && <span>コート: {match.court_number}</span>}
                                        {match.start_time && (
                                          <span className="flex items-center">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {format(new Date(match.start_time), 'M月d日 HH:mm', { locale: ja })}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        {combinedSchedule.length === 0 && (
          <p className="text-center text-gray-500">年間予定は登録されていません。</p>
        )}
      </div>
      
      {/* 試合詳細モーダル */}
    </div>
  );
}

export default AnnualSchedule;