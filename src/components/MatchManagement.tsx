import React, { useState, useEffect } from 'react';
import { useMatchesContext } from '../context/MatchesContext';
import { useTeamsContext } from '../context/TeamsContext';
import { usePlayersContext } from '../context/PlayersContext';
import { useOpponentPlayersContext } from '../context/OpponentPlayersContext';
import { Plus, X, Calendar, Pencil, Trash2, Copy } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import PlayerSearchInput from './PlayerSearchInput';
import OpponentPlayerSearchInput from './OpponentPlayerSearchInput';
import PlayerImageDisplay from './PlayerImageDisplay';
import { apiPost } from '../lib/api';

interface MatchGame {
  id?: string;
  match_id?: string;
  game_type: 'doubles' | 'singles';
  game_number: number;
  team1_player1: string;
  team1_player2?: string;
  team2_player1: string;
  team2_player2?: string;
  team1_score: number;
  team2_score: number;
  result?: 'win' | 'loss' | 'draw';
}

const MatchManagement: React.FC = () => {
  const { tournaments, matches, addMatch, updateMatch, deleteMatch, isLoading, error } = useMatchesContext();
  const { teams } = useTeamsContext();
  const { players } = usePlayersContext();
  const { incrementOpponentPlayerUsage } = useOpponentPlayersContext();
  const [showForm, setShowForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState<any>(null);
  const [tournamentId, setTournamentId] = useState('');
  const [team1Id, setTeam1Id] = useState('');
  const [team2Id, setTeam2Id] = useState('');
  const [team1Name, setTeam1Name] = useState('東海大学');
  const [team2Name, setTeam2Name] = useState('');
  const [courtNumber, setCourtNumber] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [round, setRound] = useState('');
  const [notes, setNotes] = useState('');
  const [matchGames, setMatchGames] = useState<MatchGame[]>([]);
  const [matchStatus, setMatchStatus] = useState<'upcoming' | 'live' | 'completed'>('upcoming');
  const [matchResult, setMatchResult] = useState<'win' | 'loss' | 'draw' | ''>('');
  const [xPostContent, setXPostContent] = useState('');

  // 試合終了後のテンプレート生成
  const generatePostMatchTemplate = () => {
    if (matchStatus !== 'completed' || !matchGames.length) {
      alert('試合が終了していないか、試合詳細が登録されていません。');
      return;
    }

    // 試合結果の集計
    const { team1Score, team2Score } = calculateMatchScore(matchGames);
    const result = team1Score > team2Score ? 'win' : team1Score < team2Score ? 'loss' : 'draw';
    const resultText = result === 'win' ? '勝ちました' : result === 'loss' ? '負けました' : '引き分けました';

    // 各試合の結果を整形
    let gamesText = '';
    matchGames.forEach((game, index) => {
      const team1Players = game.team1_player2 ? 
        `${game.team1_player1}・${game.team1_player2}` : 
        game.team1_player1;
      
      const team2Players = game.team2_player2 ? 
        `${game.team2_player1}・${game.team2_player2}` : 
        game.team2_player1;

      // 勝敗を表す記号（勝った方の数字に丸をつける）
      let team1Score, team2Score;
      
      if (game.result === 'win') {
        // 東海大学が勝った場合
        switch(game.team1_score) {
          case 0: team1Score = '⓪'; break;
          case 1: team1Score = '①'; break;
          case 2: team1Score = '②'; break;
          case 3: team1Score = '③'; break;
          case 4: team1Score = '④'; break;
          case 5: team1Score = '⑤'; break;
          default: team1Score = `${game.team1_score}`;
        }
        team2Score = `${game.team2_score}`;
      } else if (game.result === 'loss') {
        // 相手チームが勝った場合
        team1Score = `${game.team1_score}`;
        switch(game.team2_score) {
          case 0: team2Score = '⓪'; break;
          case 1: team2Score = '①'; break;
          case 2: team2Score = '②'; break;
          case 3: team2Score = '③'; break;
          case 4: team2Score = '④'; break;
          case 5: team2Score = '⑤'; break;
          default: team2Score = `${game.team2_score}`;
        }
      } else {
        // 引き分けの場合
        team1Score = `${game.team1_score}`;
        team2Score = `${game.team2_score}`;
      }

      gamesText += `${index + 1},${team1Players}${team1Score}-${team2Score}${team2Players}\n`;
    });

    // 最終的なテンプレート
    // 最終スコアにも丸をつける
    let finalScore;
    if (result === 'win') {
      // 東海大学が勝った場合
      switch(team1Score) {
        case 0: finalScore = '⓪-' + team2Score; break;
        case 1: finalScore = '①-' + team2Score; break;
        case 2: finalScore = '②-' + team2Score; break;
        case 3: finalScore = '③-' + team2Score; break;
        case 4: finalScore = '④-' + team2Score; break;
        case 5: finalScore = '⑤-' + team2Score; break;
        default: finalScore = `${team1Score}-${team2Score}`;
      }
    } else if (result === 'loss') {
      // 相手チームが勝った場合
      switch(team2Score) {
        case 0: finalScore = team1Score + '-⓪'; break;
        case 1: finalScore = team1Score + '-①'; break;
        case 2: finalScore = team1Score + '-②'; break;
        case 3: finalScore = team1Score + '-③'; break;
        case 4: finalScore = team1Score + '-④'; break;
        case 5: finalScore = team1Score + '-⑤'; break;
        default: finalScore = `${team1Score}-${team2Score}`;
      }
    } else {
      finalScore = `${team1Score}-${team2Score}`;
    }
    
    const template = `${round} vs ${team2Name}\n\n${gamesText}\n${finalScore}で${team2Name}に${resultText}。次戦は${nextOpponent}との対戦になります。引き続き応援よろしくお願いします。`;
    
    setXPostContent(template);
  };

  // 次の対戦相手（仮の実装）
  const [nextOpponent, setNextOpponent] = useState('次の対戦相手');

  // 選手名の使用回数を増やす関数
  const incrementPlayerUsage = async (playerName: string) => {
    try {
      await apiPost('/api/players/increment-usage', {
        playerName,
      });
    } catch (error) {
      console.error('Error incrementing player usage:', error);
    }
  };

  useEffect(() => {
    if (editingMatch) {
      setTournamentId(editingMatch.tournament_id || '');
      setTeam1Id(editingMatch.team1_id || '');
      setTeam2Id(editingMatch.team2_id || '');
      setTeam1Name(editingMatch.team1_name);
      setTeam2Name(editingMatch.team2_name);
      setCourtNumber(editingMatch.court_number || '');
      setStartTime(new Date(editingMatch.start_time) || new Date());
      setRound(editingMatch.round || '');
      setNotes(editingMatch.notes || '');
      setMatchGames(editingMatch.games || []);
      setMatchStatus(editingMatch.status || 'upcoming');
      setMatchResult(editingMatch.result || '');
    } else {
      resetForm();
    }
  }, [editingMatch]);

  useEffect(() => {
    if (matchStatus === 'upcoming') {
      setMatchResult('');
    }
  }, [matchStatus]);

  useEffect(() => {
    if (team1Id) {
      const team = teams.find(t => t.id === team1Id);
      if (team) setTeam1Name(team.name);
    }
    if (team2Id) {
      const team = teams.find(t => t.id === team2Id);
      if (team) setTeam2Name(team.name);
    }
  }, [team1Id, team2Id, teams]);

  const resetForm = () => {
    setTournamentId('');
    setTeam1Id('');
    setTeam2Id('');
    setTeam1Name('東海大学');
    setTeam2Name('');
    setCourtNumber('');
    setStartTime(new Date());
    setRound('');
    setNotes('');
    setMatchGames([]);
    setMatchStatus('upcoming');
    setMatchResult('');
    setEditingMatch(null);
    setShowForm(false);
  };

  const calculateMatchScore = (games: MatchGame[]) => {
    let team1Score = 0;
    let team2Score = 0;

    games.forEach(game => {
      if (game.result === 'win') {
        team1Score++;
      } else if (game.result === 'loss') {
        team2Score++;
      }
    });

    return { team1Score, team2Score };
  };

  const generateXPost = () => {
    let post = `${round} vs ${team2Name}\n\n`;
    
    if (matchStatus === 'completed') {
      // 試合終了後のテンプレート
      generatePostMatchTemplate();
    } else {
      // 試合前・試合中のテンプレート
      matchGames.forEach((game, index) => {
        const team1Players = game.team1_player2 ? 
          `${game.team1_player1} ${game.team1_player2}` : 
          game.team1_player1;
        
        const team2Players = game.team2_player2 ? 
          `${game.team2_player1} ${game.team2_player2}` : 
          game.team2_player1;

        post += `${index + 1}, ${team1Players}-${team2Players}\n`;
      });

      post += "\n応援よろしくお願いします。";
      setXPostContent(post);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { team1Score, team2Score } = calculateMatchScore(matchGames);
      
      const finalResult = matchStatus === 'completed' ? matchResult : null;
      
      const matchData = {
        tournament_id: tournamentId,
        team1_id: team1Id || null,
        team2_id: team2Id || null,
        team1_name: team1Name,
        team2_name: team2Name,
        court_number: courtNumber,
        start_time: startTime.toISOString(),
        round,
        notes,
        status: matchStatus,
        team1_score: team1Score,
        team2_score: team2Score,
        result: finalResult
      };

      if (editingMatch) {
        await updateMatch(editingMatch.id, matchData, matchGames);
      } else {
        await addMatch(matchData, matchGames);
      }

      // 選手の使用回数を増やす
      matchGames.forEach(game => {
        if (game.team1_player1) incrementPlayerUsage(game.team1_player1);
        if (game.team1_player2) incrementPlayerUsage(game.team1_player2);
        if (game.team2_player1) incrementOpponentPlayerUsage(game.team2_player1, team2Name);
        if (game.team2_player2) incrementOpponentPlayerUsage(game.team2_player2, team2Name);
      });

      resetForm();
    } catch (error) {
      console.error('Error saving match:', error);
      alert('試合の保存に失敗しました。');
    }
  };

  const handleGameUpdate = (index: number, field: keyof MatchGame, value: any) => {
    const updatedGames = [...matchGames];
    // Ensure the game exists at this index
    if (!updatedGames[index]) {
      console.error(`Game at index ${index} does not exist`);
      return;
    }
    
    updatedGames[index] = {
      ...updatedGames[index],
      [field]: value
    };

    if (field === 'team1_score' || field === 'team2_score') {
      const game = updatedGames[index];
      if (game.team1_score > game.team2_score) {
        game.result = 'win';
      } else if (game.team1_score < game.team2_score) {
        game.result = 'loss';
      } else if (game.team1_score === game.team2_score) {
        game.result = 'draw';
      }
    }

    setMatchGames(updatedGames);
  };

  const addDoublesGame = () => {
    const gameNumber = matchGames.length + 1;
    const newGame: MatchGame = {
      game_type: 'doubles',
      game_number: gameNumber,
      team1_player1: '',
      team1_player2: '',
      team2_player1: '',
      team2_player2: '',
      team1_score: 0,
      team2_score: 0
    };
    setMatchGames([...matchGames, newGame]);
  };

  const addSinglesGame = () => {
    const gameNumber = matchGames.length + 1;
    const newGame: MatchGame = {
      game_type: 'singles',
      game_number: gameNumber,
      team1_player1: '',
      team2_player1: '',
      team1_score: 0,
      team2_score: 0
    };
    setMatchGames([...matchGames, newGame]);
  };

  const removeGame = (index: number) => {
    const updatedGames = matchGames.filter((_, i) => i !== index);
    updatedGames.forEach((game, i) => {
      game.game_number = i + 1;
    });
    setMatchGames(updatedGames);
  };

  const handleEdit = (match: any) => {
    setEditingMatch(match);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('この試合を削除してもよろしいですか？')) {
      try {
        await deleteMatch(id);
      } catch (error) {
        console.error('Error deleting match:', error);
        alert('試合の削除に失敗しました。');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center py-8">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-red-600 text-center py-8">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">試合管理</h3>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          新規作成
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h4 className="text-lg font-bold mb-6">{editingMatch ? '試合編集' : '新規試合'}</h4>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">大会</label>
              <select
                value={tournamentId}
                onChange={(e) => setTournamentId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                required
              >
                <option value="">選択してください</option>
                {tournaments.map((tournament) => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">チーム1</label>
                <select
                  value={team1Id}
                  onChange={(e) => setTeam1Id(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                >
                  <option value="">選択してください</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
                {!team1Id && (
                  <input
                    type="text"
                    value={team1Name}
                    onChange={(e) => setTeam1Name(e.target.value)}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    placeholder="チーム名を入力"
                    required
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">チーム2</label>
                <select
                  value={team2Id}
                  onChange={(e) => setTeam2Id(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                >
                  <option value="">選択してください</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
                {!team2Id && (
                  <input
                    type="text"
                    value={team2Name}
                    onChange={(e) => setTeam2Name(e.target.value)}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    placeholder="チーム名を入力"
                    required
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">試合状況</label>
                <select
                  value={matchStatus}
                  onChange={(e) => setMatchStatus(e.target.value as 'upcoming' | 'live' | 'completed')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  required
                >
                  <option value="upcoming">予定</option>
                  <option value="live">試合中</option>
                  <option value="completed">終了</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">試合結果</label>
                <select
                  value={matchResult}
                  onChange={(e) => setMatchResult(e.target.value as 'win' | 'loss' | 'draw' | '')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  disabled={matchStatus !== 'completed'}
                >
                  <option value="">未設定</option>
                  <option value="win">勝ち</option>
                  <option value="loss">負け</option>
                  <option value="draw">引き分け</option>
                </select>
                {matchStatus !== 'completed' && (
                  <p className="mt-1 text-sm text-gray-500">試合結果は試合終了後に設定できます</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">コート番号</label>
                <input
                  type="text"
                  value={courtNumber}
                  onChange={(e) => setCourtNumber(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">開始時間</label>
                <DatePicker
                  selected={startTime}
                  onChange={(date: Date) => setStartTime(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="yyyy/MM/dd HH:mm"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  locale={ja}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">ラウンド</label>
              <input
                type="text"
                value={round}
                onChange={(e) => setRound(e.target.value)}
                placeholder="例: 1回戦"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">備考</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>

            {matchStatus !== 'upcoming' && (
              <div>
                <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                  <h5 className="text-lg font-semibold mb-4 md:mb-0">試合詳細</h5>
                  <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                    <button
                      type="button"
                      onClick={addDoublesGame}
                      className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      ダブルスを追加
                    </button>
                    <button
                      type="button"
                      onClick={addSinglesGame}
                      className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300 flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      シングルスを追加
                    </button>
                    {matchStatus === 'live' && (
                      <button
                        type="button"
                        onClick={generateXPost}
                        className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 flex items-center justify-center"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        X用投稿
                      </button>
                    )}
                    {matchStatus === 'completed' && (
                      <button
                        type="button"
                        onClick={generatePostMatchTemplate}
                        className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-300 flex items-center justify-center"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        試合結果投稿
                      </button>
                    )}
                  </div>
                </div>

                {xPostContent && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h6 className="font-medium">{matchStatus === 'completed' ? '試合結果投稿内容' : 'X用投稿内容'}</h6>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(xPostContent);
                          alert('コピーしました！');
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap text-sm">{xPostContent}</pre>
                  </div>
                )}
                
                {matchStatus === 'completed' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">次の対戦相手</label>
                    <input
                      type="text"
                      value={nextOpponent}
                      onChange={(e) => setNextOpponent(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                      placeholder="次の対戦相手を入力"
                    />
                    <p className="mt-1 text-xs text-gray-500">※ 試合結果投稿に使用されます</p>
                  </div>
                )}

                <div className="space-y-6">
                  {matchGames.map((game, index) => (
                    <div key={index} className="border rounded-lg p-4 relative">
                      <button
                        type="button"
                        onClick={() => removeGame(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="flex justify-between items-center mb-4">
                        <h6 className="font-medium">
                          第{index + 1}試合 ({game.game_type === 'doubles' ? 'ダブルス' : 'シングルス'})
                        </h6>
                        {game.result && (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            game.result === 'win' ? 'bg-green-100 text-green-800' :
                            game.result === 'loss' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {game.result === 'win' ? '勝' : 
                             game.result === 'loss' ? '敗' : 
                             '引分'}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                          <label className="block text-sm font-medium text-gray-700">チーム1 選手1</label>
                          <PlayerSearchInput
                            value={game.team1_player1}
                            onChange={(value) => handleGameUpdate(index, 'team1_player1', value || '')}
                            placeholder="選手名を入力"
                            className="mt-1"
                          />
                          {game.team1_player1 && (
                            <div className="mt-2">
                              <PlayerImageDisplay 
                                playerName={game.team1_player1}
                                size="md"
                                showName={false}
                              />
                            </div>
                          )}
                          {game.game_type === 'doubles' && (
                            <>
                              <label className="block text-sm font-medium text-gray-700 mt-2">チーム1 選手2</label>
                              <PlayerSearchInput
                                value={game.team1_player2 || ''}
                                onChange={(value) => handleGameUpdate(index, 'team1_player2', value || '')}
                                placeholder="選手名を入力"
                                className="mt-1"
                              />
                              {game.team1_player2 && (
                                <div className="mt-2">
                                  <PlayerImageDisplay 
                                    playerName={game.team1_player2}
                                    size="md"
                                    showName={false}
                                  />
                                </div>
                              )}
                            </>
                          )}
                          <label className="block text-sm font-medium text-gray-700 mt-2">スコア</label>
                          <input
                            type="number"
                            value={game.team1_score}
                            onChange={(e) => handleGameUpdate(index, 'team1_score', parseInt(e.target.value))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                            min="0"
                          />
                        </div>
                        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                          <label className="block text-sm font-medium text-gray-700">チーム2 選手1</label>
                          <OpponentPlayerSearchInput
                            value={game.team2_player1}
                            onChange={(value) => handleGameUpdate(index, 'team2_player1', value || '')}
                            teamName={team2Name}
                            placeholder="選手名を入力"
                            className="mt-1"
                          />
                          {game.game_type === 'doubles' && (
                            <>
                              <label className="block text-sm font-medium text-gray-700 mt-2">チーム2 選手2</label>
                              <OpponentPlayerSearchInput
                                value={game.team2_player2 || ''}
                                onChange={(value) => handleGameUpdate(index, 'team2_player2', value || '')}
                                teamName={team2Name}
                                placeholder="選手名を入力"
                                className="mt-1"
                              />
                            </>
                          )}
                          <label className="block text-sm font-medium text-gray-700 mt-2">スコア</label>
                          <input
                            type="number"
                            value={game.team2_score}
                            onChange={(e) => handleGameUpdate(index, 'team2_score', parseInt(e.target.value))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-300"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
              >
                {editingMatch ? '更新' : '登録'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h4 className="text-lg font-bold mb-6">試合一覧</h4>
        <div className="space-y-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex-grow">
                  <div className="text-sm text-gray-500">
                    {match.start_time ? format(new Date(match.start_time), 'yyyy/MM/dd HH:mm', { locale: ja }) : '日時未設定'}
                  </div>
                  <div className="font-medium">
                    {match.team1_name} vs {match.team2_name}
                  </div>
                  {match.round && (
                    <div className="text-sm text-gray-600">{match.round}</div>
                  )}
                  {match.court_number && (
                    <div className="text-sm text-gray-600">コート: {match.court_number}</div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                    match.status === 'live' ? 'bg-green-100 text-green-800' :
                    match.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {match.status === 'live' ? '試合中' :
                     match.status === 'upcoming' ? '予定' : '終了'}
                  </span>
                  {match.result && (
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      match.result === 'win' ? 'bg-green-100 text-green-800' :
                      match.result === 'loss' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {match.result === 'win' ? '勝' :
                       match.result === 'loss' ? '敗' :
                       '引分'}
                    </span>
                  )}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(match)}
                      className="text-blue-600 hover:text-blue-700 p-1"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(match.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {matches.length === 0 && (
            <p className="text-center text-gray-500">試合は登録されていません</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchManagement;
