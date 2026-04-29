import React, { useState, useEffect } from 'react';
import { useMatchesContext } from '../context/MatchesContext';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import AnimationWrapper from '../components/AnimationWrapper';
import AnnualSchedule from '../components/AnnualSchedule';
import { Trophy, MapPin, Clock, Users, X, AlertTriangle, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import PlayerImageDisplay from '../components/PlayerImageDisplay';

function Matches() {
  const { matches, tournaments, isLoading, error } = useMatchesContext();
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const matchId = urlParams.get('match');
    
    if (matchId) {
      const match = matches.find(m => m.id === matchId);
      if (match) {
        setSelectedMatch(match);
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location.search, matches]);

  const handleMatchSelect = (match: any) => {
    setSelectedMatch(match);
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('match', match.id);
    navigate(`/matches?${urlParams.toString()}`);
  };

  const handleCloseMatch = () => {
    setSelectedMatch(null);
    const urlParams = new URLSearchParams(location.search);
    urlParams.delete('match');
    const newSearch = urlParams.toString();
    navigate(`/matches${newSearch ? `?${newSearch}` : ''}`);
  };

  const getTournamentName = (tournamentId: string) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    return tournament ? tournament.name : '';
  };

  const getScoreColor = (match: any) => {
    if (match.result === 'win') return 'text-green-600';
    if (match.result === 'loss') return 'text-red-600';
    return 'text-gray-800';
  };

  const TeamDisplay = ({ name, image }: { name: string, image?: string }) => (
    <div className="flex items-center space-x-2 sm:space-x-4">
      <span className="text-xl sm:text-3xl font-bold">{name}</span>
    </div>
  );

  const CompactTeamDisplay = ({ name, image }: { name: string, image?: string }) => (
    <div className="flex items-center space-x-2 min-w-0 flex-1">
      <span className="text-base sm:text-base font-bold line-clamp-1">{name}</span>
    </div>
  );

  const MatchDetails = ({ match }: { match: any }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-16 sm:pt-20 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto">
        {/* Header with close button */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg flex justify-between items-center p-4">
          <h3 className="text-xl font-bold">{getTournamentName(match.tournament_id)}</h3>
          <button
            onClick={handleCloseMatch}
            className="bg-white/20 rounded-full p-2 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main match display */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-6">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
            {/* Match info bar */}
            <div className="flex flex-wrap justify-between items-center mb-4 text-sm text-gray-600 gap-2">
              <div className="flex items-center space-x-4">
                {match.round && (
                  <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    <Trophy className="w-4 h-4 mr-1" />
                    <span className="font-medium">{match.round}</span>
                  </div>
                )}
                {match.court_number && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{match.court_number}コート</span>
                  </div>
                )}
              </div>
              <div className="flex items-center text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                <span>{format(new Date(match.start_time), 'M月d日 HH:mm', { locale: ja })}</span>
              </div>
            </div>

            {/* Team vs Team display */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1 text-center">
                <div className="text-2xl font-bold text-gray-800 mb-2">{match.team1_name}</div>
              </div>
              <div className="flex-1 text-center px-2 sm:px-4">
                <div className={`text-6xl font-bold mb-2 ${getScoreColor(match)}`}>
                  {match.status === 'upcoming' ? '0-0' : `${match.team1_score}-${match.team2_score}`}
                </div>
                {match.status === 'live' && (
                  <div className="flex items-center justify-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
                    <span className="text-sm text-red-600 font-medium">LIVE</span>
                  </div>
                )}
                {match.result && (
                  <div className="mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      match.result === 'win' ? 'bg-green-100 text-green-800' :
                      match.result === 'loss' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {match.result === 'win' ? '勝利' : 
                       match.result === 'loss' ? '敗北' : 
                       '引分'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 text-center">
                <div className="text-2xl font-bold text-gray-800 mb-2">{match.team2_name}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {match.games && match.games.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-blue-600 mr-3" />
                <h4 className="text-xl font-bold text-gray-800">試合詳細</h4>
              </div>
              
              {/* Games list in sports broadcast style */}
              <div className="space-y-3">
                {match.games.map((game: any, index: number) => (
                  <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                    {/* Game header */}
                    <div className="bg-gray-600 text-white px-4 py-2 flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <span className="bg-white text-gray-800 px-2 py-1 rounded text-sm font-bold">
                          {game.game_type === 'doubles' ? 'D' : 'S'}{game.game_number}
                        </span>
                        <span className="text-sm">
                          {game.game_type === 'doubles' ? 'ダブルス' : 'シングルス'}
                        </span>
                      </div>
                      {game.result && (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          game.result === 'win' ? 'bg-green-500 text-white' :
                          game.result === 'loss' ? 'bg-red-500 text-white' :
                          'bg-gray-400 text-white'
                        }`}>
                          {game.result === 'win' ? '勝' : game.result === 'loss' ? '敗' : '分'}
                        </span>
                      )}
                    </div>
                    
                    {/* Game content */}
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex-1 text-left">
                          <div className="text-blue-600 font-medium text-sm mb-1">
                            <PlayerImageDisplay 
                              playerName={game.team1_player1 || ''}
                              size="sm"
                              showName={true}
                              className="mb-1"
                            />
                            {game.team1_player2 && (
                              <PlayerImageDisplay 
                                playerName={game.team1_player2 || ''}
                                size="sm"
                                showName={true}
                                className="mt-1"
                              />
                            )}
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0 mx-6">
                          <div className={`text-3xl font-bold ${
                            game.result === 'win' ? 'text-green-600' :
                            game.result === 'loss' ? 'text-red-600' :
                            'text-gray-800'
                          }`}>
                            {game.team1_score} - {game.team2_score}
                          </div>
                        </div>
                        
                        <div className="flex-1 text-right">
                          <div className="text-gray-600 font-medium text-sm mb-1 flex flex-col items-end space-y-1">
                            <div className="flex items-center space-x-2">
                              <span>{game.team2_player1}</span>
                              <User className="w-4 h-4 text-gray-400" />
                            </div>
                            {game.team2_player2 && (
                              <div className="flex items-center space-x-2">
                                <span>{game.team2_player2}</span>
                                <User className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              試合詳細はまだ登録されていません
            </div>
          )}

          {match.notes && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="font-medium text-yellow-800 mb-1">備考</h5>
                  <p className="text-sm text-yellow-700">{match.notes}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-center mt-6">
            <button
              onClick={handleCloseMatch}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pt-16 sm:pt-24">
        <div className="container mx-auto px-4 py-12 sm:py-20">
          <div className="text-center">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white pt-16 sm:pt-24">
        <div className="container mx-auto px-4 py-12 sm:py-20">
          <div className="text-red-600 text-center">{error}</div>
        </div>
      </div>
    );
  }

  const liveMatches = matches.filter(match => match.status === 'live');
  const upcomingMatches = matches.filter(match => match.status === 'upcoming')
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  const completedMatches = matches.filter(match => match.status === 'completed')
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

  return (
    <div className="min-h-screen bg-white pt-16 sm:pt-24">
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <AnimationWrapper className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12 sm:mb-16 px-4">試合予定・結果</h2>

            {liveMatches.length > 0 && (
              <div className="mb-12 sm:mb-16">
                <h3 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 flex items-center px-4">
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  試合中
                </h3>
                <div className="grid gap-4 sm:gap-6">
                  {liveMatches.map(match => (
                    <div
                      key={match.id}
                      onClick={() => handleMatchSelect(match)}
                      className="bg-white rounded-lg shadow-lg p-6 sm:p-6 border-2 border-green-500 cursor-pointer hover:shadow-xl transition-shadow"
                    >
                      <div className="text-sm sm:text-sm text-gray-600 mb-3">{getTournamentName(match.tournament_id)}</div>
                      <div className="flex justify-between items-center">
                        <CompactTeamDisplay name={match.team1_name} />
                        <div className={`text-3xl sm:text-3xl font-bold mx-6 sm:mx-8 ${getScoreColor(match)}`}>
                          {match.team1_score}-{match.team2_score}
                        </div>
                        <CompactTeamDisplay name={match.team2_name} />
                      </div>
                      <div className="mt-4 sm:mt-4 text-sm sm:text-sm text-gray-600 flex flex-wrap gap-3 sm:gap-4">
                        {match.round && <span>{match.round}</span>}
                        {match.court_number && <span>コート: {match.court_number}</span>}
                        <span>{format(new Date(match.start_time), 'HH:mm')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-12 sm:mb-16">
              <h3 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 px-4">試合予定</h3>
              <div className="grid gap-4">
                {upcomingMatches.map(match => (
                  <div
                    key={match.id}
                    onClick={() => handleMatchSelect(match)}
                    className="bg-white rounded-lg shadow-md p-6 sm:p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <div className="text-sm sm:text-sm text-gray-600 mb-3">{getTournamentName(match.tournament_id)}</div>
                    <div className="flex justify-between items-center">
                      <CompactTeamDisplay name={match.team1_name} />
                      <div className="text-2xl sm:text-2xl font-bold mx-4 sm:mx-6">0-0</div>
                      <CompactTeamDisplay name={match.team2_name} />
                    </div>
                    <div className="mt-4 sm:mt-4 text-sm sm:text-sm text-gray-600 flex flex-wrap gap-3 sm:gap-4">
                      {match.round && <span>{match.round}</span>}
                      {match.court_number && <span>コート: {match.court_number}</span>}
                      <span>{format(new Date(match.start_time), 'M月d日 HH:mm', { locale: ja })}</span>
                    </div>
                  </div>
                ))}
                {upcomingMatches.length === 0 && (
                  <p className="text-center text-gray-500 py-8">予定されている試合はありません</p>
                )}
              </div>
            </div>


            <div className="mt-12 sm:mt-16">
              <AnnualSchedule />
            </div>
            
          </AnimationWrapper>
          
          {/* 広告配置 - 試合予定・結果ページ下部 */}
          <AdBanner className="mt-12 sm:mt-16" />
        </div>
      </section>

      {selectedMatch && <MatchDetails match={selectedMatch} />}
    </div>
  );
}

export default Matches;