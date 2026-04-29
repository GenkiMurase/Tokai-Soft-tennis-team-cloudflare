import React, { useState } from 'react';
import { useMatchesContext } from '../context/MatchesContext';
import { Plus, X, Calendar, Pencil, Trash2, Trophy, MapPin } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

function AnnualScheduleManagement() {
  const { tournaments, annualSchedules, addAnnualSchedule, updateAnnualSchedule, deleteAnnualSchedule, addTournament, updateTournament, deleteTournament } = useMatchesContext();
  const [showForm, setShowForm] = useState(false);
  const [showTournamentForm, setShowTournamentForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTournamentId, setEditingTournamentId] = useState<string | null>(null);

  // 年間予定フォーム
  const [date, setDate] = useState(new Date());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('');

  // 大会フォーム
  const [tournamentName, setTournamentName] = useState('');
  const [tournamentStartDate, setTournamentStartDate] = useState(new Date());
  const [tournamentEndDate, setTournamentEndDate] = useState(new Date());
  const [tournamentLocation, setTournamentLocation] = useState('東海大学湘南キャンパス');
  const [isActive, setIsActive] = useState(false);

  const resetScheduleForm = () => {
    setDate(new Date());
    setTitle('');
    setDescription('');
    setSelectedTournamentId('');
    setEditingId(null);
    setShowForm(false);
  };

  const resetTournamentForm = () => {
    setTournamentName('');
    setTournamentStartDate(new Date());
    setTournamentEndDate(new Date());
    setTournamentLocation('');
    setIsActive(false);
    setEditingTournamentId(null);
    setShowTournamentForm(false);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const scheduleData = {
        date: format(date, "yyyy-MM-dd"),
        title,
        description,
        tournament_id: selectedTournamentId || null
      };

      if (editingId) {
        await updateAnnualSchedule(editingId, scheduleData);
      } else {
        await addAnnualSchedule(scheduleData);
      }
      resetScheduleForm();
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('予定の保存に失敗しました。');
    }
  };

  const handleTournamentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tournamentData = {
        name: tournamentName,
        start_date: format(tournamentStartDate, "yyyy-MM-dd"),
        end_date: format(tournamentEndDate, "yyyy-MM-dd"),
        location: tournamentLocation,
        is_active: isActive
      };

      if (editingTournamentId) {
        await updateTournament(editingTournamentId, tournamentData);
      } else {
        await addTournament(tournamentData);
      }
      resetTournamentForm();
    } catch (error) {
      console.error('Error saving tournament:', error);
      alert('大会の保存に失敗しました。');
    }
  };

  const handleEditSchedule = (schedule: any) => {
    setDate(new Date(schedule.date));
    setTitle(schedule.title);
    setDescription(schedule.description || '');
    setSelectedTournamentId(schedule.tournament_id || '');
    setEditingId(schedule.id);
    setShowForm(true);
  };

  const handleEditTournament = (tournament: any) => {
    setTournamentName(tournament.name);
    setTournamentStartDate(new Date(tournament.start_date));
    setTournamentEndDate(new Date(tournament.end_date));
    setTournamentLocation(tournament.location);
    setIsActive(tournament.is_active);
    setEditingTournamentId(tournament.id);
    setShowTournamentForm(true);
  };

  const handleDeleteSchedule = async (id: string) => {
    if (window.confirm('この予定を削除してもよろしいですか？')) {
      try {
        await deleteAnnualSchedule(id);
      } catch (error) {
        console.error('Error deleting schedule:', error);
        alert('予定の削除に失敗しました。');
      }
    }
  };

  const handleDeleteTournament = async (id: string) => {
    if (window.confirm('この大会を削除してもよろしいですか？関連する予定も削除されます。')) {
      try {
        await deleteTournament(id);
      } catch (error) {
        console.error('Error deleting tournament:', error);
        alert('大会の削除に失敗しました。');
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">年間予定管理</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            予定登録
          </button>
          <button
            onClick={() => setShowTournamentForm(true)}
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            大会登録
          </button>
        </div>
      </div>

      {showTournamentForm && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h4 className="text-lg font-bold mb-6">{editingTournamentId ? '大会編集' : '大会登録'}</h4>
          <form onSubmit={handleTournamentSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">大会名</label>
              <input
                type="text"
                value={tournamentName}
                onChange={(e) => setTournamentName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">開始日</label>
                <DatePicker
                  selected={tournamentStartDate}
                  onChange={(date: Date) => setTournamentStartDate(date)}
                  dateFormat="yyyy/MM/dd"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  locale={ja}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">終了日</label>
                <DatePicker
                  selected={tournamentEndDate}
                  onChange={(date: Date) => setTournamentEndDate(date)}
                  dateFormat="yyyy/MM/dd"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  locale={ja}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">開催場所</label>
              <input
                type="text"
                value={tournamentLocation}
                onChange={(e) => setTournamentLocation(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                現在進行中の大会
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={resetTournamentForm}
                className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-300"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
              >
                {editingTournamentId ? '更新' : '登録'}
              </button>
            </div>
          </form>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h4 className="text-lg font-bold mb-6">{editingId ? '予定編集' : '予定登録'}</h4>
          <form onSubmit={handleScheduleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">日付</label>
              <DatePicker
                selected={date}
                onChange={(date: Date) => setDate(date)}
                dateFormat="yyyy/MM/dd"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                locale={ja}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">タイトル</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">説明</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">関連する大会</label>
              <select
                value={selectedTournamentId}
                onChange={(e) => setSelectedTournamentId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              >
                <option value="">選択してください</option>
                {tournaments.map((tournament) => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={resetScheduleForm}
                className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-300"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
              >
                {editingId ? '更新' : '登録'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h4 className="text-lg font-bold mb-6 flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-green-600" />
          大会一覧
        </h4>
        <div className="space-y-4">
          {tournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{tournament.name}</div>
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                      {format(new Date(tournament.start_date), 'yyyy/MM/dd')} - 
                      {format(new Date(tournament.end_date), 'yyyy/MM/dd')}
                    </div>
                    <div className="flex items-center mt-1">
                      <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                      {tournament.location}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {tournament.is_active && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      進行中
                    </span>
                  )}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditTournament(tournament)}
                      className="text-blue-600 hover:text-blue-700 p-1"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTournament(tournament.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {tournaments.length === 0 && (
            <p className="text-center text-gray-500">大会は登録されていません</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h4 className="text-lg font-bold mb-6 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-600" />
          年間予定一覧
        </h4>
        <div className="space-y-4">
          {annualSchedules
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((schedule) => (
              <div
                key={schedule.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {format(new Date(schedule.date), 'yyyy/MM/dd')}
                      </span>
                      {schedule.tournament_id && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          大会関連
                        </span>
                      )}
                    </div>
                    <div className="font-medium mt-1">{schedule.title}</div>
                    {schedule.description && (
                      <div className="text-sm text-gray-600 mt-1">{schedule.description}</div>
                    )}
                    {schedule.tournament_id && (
                      <div className="text-sm text-blue-600 mt-1">
                        {tournaments.find(t => t.id === schedule.tournament_id)?.name}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditSchedule(schedule)}
                      className="text-blue-600 hover:text-blue-700 p-1"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          {annualSchedules.length === 0 && (
            <p className="text-center text-gray-500">予定は登録されていません</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnnualScheduleManagement;