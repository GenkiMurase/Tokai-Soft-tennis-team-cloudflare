import React, { useState } from 'react';
import { useTeamsContext } from '../context/TeamsContext';
import { Pencil, Trash2, Plus, X, Link as LinkIcon, Upload } from 'lucide-react';
import { uploadImage } from '../utils/imageUpload';

function TeamManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [imageInputType, setImageInputType] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');

  const { 
    teams, 
    addTeam, 
    updateTeam, 
    deleteTeam,
    isLoading,
    error
  } = useTeamsContext();

  const resetForm = () => {
    setName('');
    setImage('');
    setImagePreview('');
    setImageUrl('');
    setImageInputType('upload');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const teamData = {
        name,
        image: imageInputType === 'url' ? imageUrl : image,
      };

      if (editingId) {
        await updateTeam(editingId, teamData);
      } else {
        await addTeam(teamData);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving:', error);
      alert('情報の保存に失敗しました。');
    }
  };

  const handleEdit = (team: any) => {
    setName(team.name);
    if (team.image?.startsWith('http')) {
      setImageInputType('url');
      setImageUrl(team.image);
      setImagePreview(team.image);
    } else {
      setImageInputType('upload');
      setImage(team.image || '');
      setImagePreview(team.image || '');
    }
    setEditingId(team.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('このチーム情報を削除してもよろしいですか？')) {
      try {
        await deleteTeam(id);
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

  if (isLoading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">チーム管理</h3>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          新規登録
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h4 className="text-lg font-bold mb-6">{editingId ? '情報編集' : '新規登録'}</h4>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">チーム名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">チーム画像</label>
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
                      id="team-image-upload"
                    />
                    <label
                      htmlFor="team-image-upload"
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
        <h4 className="text-lg font-bold mb-6">チーム一覧</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-white rounded-lg shadow p-4 flex items-start space-x-4"
            >
              <div className="w-24 h-24 flex-shrink-0">
                {team.image ? (
                  <img
                    src={team.image}
                    alt={team.name}
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
                    <h5 className="text-lg font-semibold">{team.name}</h5>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(team)}
                      className="text-blue-600 hover:text-blue-700 p-1"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(team.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {teams.length === 0 && (
            <p className="text-center text-gray-500">チームは登録されていません。</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeamManagement;