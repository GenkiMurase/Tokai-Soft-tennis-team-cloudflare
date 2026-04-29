import React, { useState } from 'react';
import { usePlayersContext, type Position, type Grade, type AdmissionType } from '../context/PlayersContext';
import { useStaffContext, type StaffPosition } from '../context/StaffContext';
import { Pencil, Trash2, Plus, X, Link as LinkIcon, Upload, ArrowUp } from 'lucide-react';
import { uploadImage } from '../utils/imageUpload';

function PlayerManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstNameKana, setFirstNameKana] = useState('');
  const [lastNameKana, setLastNameKana] = useState('');
  const [grade, setGrade] = useState<Grade>(1);
  const [position, setPosition] = useState<Position | StaffPosition>('前衛');
  const [school, setSchool] = useState('');
  const [admissionType, setAdmissionType] = useState<AdmissionType | ''>('');
  const [image, setImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [imageInputType, setImageInputType] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [memberType, setMemberType] = useState<'player' | 'staff'>('player');

  const { 
    players, 
    addPlayer, 
    editPlayer, 
    deletePlayer,
    promoteAllGrades,
    isLoading: isLoadingPlayers,
    error: playersError
  } = usePlayersContext();

  const {
    staff,
    addStaff,
    editStaff,
    deleteStaff,
    isLoading: isLoadingStaff,
    error: staffError
  } = useStaffContext();

  const admissionTypeOptions: (AdmissionType | '')[] = [
    '',
    '学科課題型',
    '適性面接型',
    'スポーツ・音楽自己推薦型',
    '公募制学校推薦選抜',
    '文系・理系学部統一選抜（前期・後期）'
  ];

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setFirstNameKana('');
    setLastNameKana('');
    setGrade(1);
    setPosition('前衛');
    setSchool('');
    setAdmissionType('');
    setImage('');
    setImagePreview('');
    setImageUrl('');
    setImageInputType('upload');
    setEditingId(null);
    setShowForm(false);
    setMemberType('player');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const fullName = `${lastName} ${firstName}`;
      
      const commonData = {
        first_name: firstName,
        last_name: lastName,
        first_name_kana: firstNameKana,
        last_name_kana: lastNameKana,
        name: fullName,
        position,
        school,
        image: imageInputType === 'url' ? imageUrl : image,
      };

      if (memberType === 'player') {
        const playerData = {
          ...commonData,
          grade,
          admission_type: admissionType
        };
        
        if (editingId) {
          await editPlayer(editingId, playerData);
        } else {
          await addPlayer(playerData);
        }
      } else {
        if (editingId) {
          await editStaff(editingId, commonData);
        } else {
          await addStaff(commonData);
        }
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving:', error);
      alert('情報の保存に失敗しました。');
    }
  };

  const handleEdit = (member: any) => {
    setFirstName(member.first_name);
    setLastName(member.last_name);
    setFirstNameKana(member.first_name_kana || '');
    setLastNameKana(member.last_name_kana || '');
    setGrade(member.grade || 1);
    setPosition(member.position);
    setSchool(member.school);
    setAdmissionType(member.admission_type || '');
    setMemberType(['前衛', '後衛'].includes(member.position) ? 'player' : 'staff');
    if (member.image?.startsWith('http')) {
      setImageInputType('url');
      setImageUrl(member.image);
      setImagePreview(member.image);
    } else {
      setImageInputType('upload');
      setImage(member.image || '');
      setImagePreview(member.image || '');
    }
    setEditingId(member.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string, type: 'player' | 'staff') => {
    if (window.confirm('この情報を削除してもよろしいですか？')) {
      try {
        if (type === 'player') {
          await deletePlayer(id);
        } else {
          await deleteStaff(id);
        }
      } catch (error) {
        console.error('Error deleting:', error);
        alert('削除に失敗しました。');
      }
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      const url = await uploadImage(file);
      if (url) {
        setImage(url);
      }

      URL.revokeObjectURL(previewUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('画像のアップロードに失敗しました。');
    }
    setIsUploading(false);
  };

  const handlePromoteGrades = async () => {
    if (window.confirm('4年生は削除され、他の学年は1つ繰り上がります。この操作は取り消せません。続行しますか？')) {
      try {
        await promoteAllGrades();
      } catch (error) {
        console.error('Error promoting grades:', error);
        alert('学年の繰り上げに失敗しました。');
      }
    }
  };

  // 選手を学年ごとにグループ化
  const groupedPlayers = players.reduce((acc, player) => {
    if (!acc[player.grade]) {
      acc[player.grade] = [];
    }
    acc[player.grade].push(player);
    return acc;
  }, {} as Record<number, typeof players>);

  const grades = Object.keys(groupedPlayers)
    .map(Number)
    .sort((a, b) => b - a);

  if (isLoadingPlayers || isLoadingStaff) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  if (playersError || staffError) {
    return <div className="text-red-600 text-center py-8">{playersError || staffError}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">部員・スタッフ管理</h3>
        <div className="flex space-x-4">
          <button
            onClick={handlePromoteGrades}
            className="bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition duration-300 flex items-center"
          >
            <ArrowUp className="w-4 h-4 mr-2" />
            学年繰り上げ
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            新規登録
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h4 className="text-lg font-bold mb-6">{editingId ? '情報編集' : '新規登録'}</h4>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">区分</label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setMemberType('player');
                    setPosition('前衛');
                  }}
                  className={`px-4 py-2 rounded-md transition-all duration-300 ${
                    memberType === 'player'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  選手
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMemberType('staff');
                    setPosition('監督');
                  }}
                  className={`px-4 py-2 rounded-md transition-all duration-300 ${
                    memberType === 'staff'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  スタッフ
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">プロフィール画像</label>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setImageInputType('upload')}
                    className={`px-4 py-2 rounded-md transition-all duration-300 ${
                      imageInputType === 'upload'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Upload className="w-4 h-4 inline-block mr-2" />
                    アップロード
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputType('url')}
                    className={`px-4 py-2 rounded-md transition-all duration-300 ${
                      imageInputType === 'url'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <LinkIcon className="w-4 h-4 inline-block mr-2" />
                    URL指定
                  </button>
                </div>

                {imageInputType === 'upload' ? (
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                      className="hidden"
                      id="player-image-upload"
                    />
                    <label
                      htmlFor="player-image-upload"
                      className="bg-blue-100 text-blue-600 px-4 py-2 rounded-md cursor-pointer hover:bg-blue-200 transition duration-300"
                    >
                      画像を選択
                    </label>
                  </div>
                ) : (
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImagePreview(e.target.value);
                    }}
                    placeholder="画像のURLを入力"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  />
                )}

                {imagePreview && (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="プレビュー"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImage('');
                        setImagePreview('');
                        setImageUrl('');
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">姓</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">名</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">姓（ふりがな）</label>
                <input
                  type="text"
                  value={lastNameKana}
                  onChange={(e) => setLastNameKana(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  required
                  pattern="^[ぁ-んー]*$"
                  title="ひらがなで入力してください"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">名（ふりがな）</label>
                <input
                  type="text"
                  value={firstNameKana}
                  onChange={(e) => setFirstNameKana(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  required
                  pattern="^[ぁ-んー]*$"
                  title="ひらがなで入力してください"
                />
              </div>
            </div>

            {memberType === 'player' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">学年</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value) as Grade)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    required
                  >
                    {[1, 2, 3, 4].map((g) => (
                      <option key={g} value={g}>{g}年生</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">入試形態</label>
                  <select
                    value={admissionType}
                    onChange={(e) => setAdmissionType(e.target.value as AdmissionType | '')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  >
                    <option value="">選択してください</option>
                    {admissionTypeOptions.slice(1).map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">役職・ポジション</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as Position | StaffPosition)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                required
              >
                {memberType === 'player' ? (
                  <>
                    <option value="前衛">前衛</option>
                    <option value="後衛">後衛</option>
                  </>
                ) : (
                  <>
                    <option value="監督">監督</option>
                    <option value="コーチ">コーチ</option>
                    <option value="マネージャー">マネージャー</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">出身校</label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                required
              />
            </div>

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
                disabled={isUploading}
              >
                {isUploading ? '画像アップロード中...' : (editingId ? '更新' : '登録')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h4 className="text-lg font-bold mb-6">スタッフ一覧</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {staff.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-lg shadow p-4 flex items-start space-x-4"
            >
              <div className="w-24 h-24 flex-shrink-0">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-lg font-semibold">{member.last_name} {member.first_name}</h5>
                    <p className="text-sm text-gray-500">{member.last_name_kana} {member.first_name_kana}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {member.position} / {member.school}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(member)}
                      className="text-blue-600 hover:text-blue-700 p-1"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id, 'staff')}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <h4 className="text-lg font-bold mb-6">選手一覧</h4>
        <div className="space-y-8">
          {grades.map((grade) => (
            <div key={grade} className="space-y-4">
              <h5 className="text-lg font-semibold">{grade}年生</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedPlayers[grade].map((player) => (
                  <div
                    key={player.id}
                    className="bg-white rounded-lg shadow p-4 flex items-start space-x-4"
                  >
                    <div className="w-24 h-24 flex-shrink-0">
                      {player.image ? (
                        <img
                          src={player.image}
                          alt={player.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="text-lg font-semibold">{player.last_name} {player.first_name}</h5>
                          <p className="text-sm text-gray-500">{player.last_name_kana} {player.first_name_kana}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {player.position} / {player.school}
                          </p>
                          {player.admission_type && (
                            <p className="text-xs text-gray-500 mt-1">
                              {player.admission_type}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(player)}
                            className="text-blue-600 hover:text-blue-700 p-1"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(player.id, 'player')}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {players.length === 0 && (
            <p className="text-center text-gray-500">選手は登録されていません。</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlayerManagement;