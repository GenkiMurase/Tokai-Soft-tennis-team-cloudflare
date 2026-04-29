import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePostsContext } from '../context/PostsContext';
import { Pencil, Trash2, Image as ImageIcon, Plus, X, Link as LinkIcon, Upload, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { uploadImage } from '../utils/imageUpload';
import PlayerManagement from '../components/PlayerManagement';
import MatchManagement from '../components/MatchManagement';
import AnnualScheduleManagement from '../components/AnnualScheduleManagement';
import TeamManagement from '../components/TeamManagement';
import { apiGet, apiPost, apiPut } from '../lib/api';

interface CompressionResult {
  error?: string;
  processedCount?: number;
  totalFiles?: number;
  details?: Array<{
    name: string;
    originalSize: number;
    compressedSize: number;
    reduction: number;
  }>;
}

function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'posts' | 'players' | 'matches' | 'schedule' | 'teams' | 'maintenance'>('posts');
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [totalImageSize, setTotalImageSize] = useState<number>(0);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('メンテナンス中です。しばらくお待ちください。');
  const [isSavingMaintenance, setIsSavingMaintenance] = useState(false);
  const [loadingImageSize, setLoadingImageSize] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [headerImage, setHeaderImage] = useState('');
  const [headerImagePreview, setHeaderImagePreview] = useState('');
  const [headerImageInputType, setHeaderImageInputType] = useState<'upload' | 'url'>('upload');
  const [headerImageUrl, setHeaderImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);
  const [imageInputType, setImageInputType] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [publishDate, setPublishDate] = useState<Date>(new Date());
  const [isUploading, setIsUploading] = useState(false);
  const { posts, addPost, editPost, deletePost } = usePostsContext();
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    void (async () => {
      try {
        const session = await apiGet<{ authenticated: boolean }>('/api/admin/session');
        setIsLoggedIn(session.authenticated);
        if (session.authenticated) {
          scrollToTop();
          await Promise.all([loadMaintenanceSettings(), loadTotalImageSize()]);
        }
      } catch (error) {
        console.error('Failed to restore admin session:', error);
      }
    })();
  }, []);

  const loadMaintenanceSettings = async () => {
    try {
      const data = await apiGet<{ is_maintenance_mode: boolean; maintenance_message: string }>('/api/maintenance-settings');
      setIsMaintenanceMode(Boolean(data.is_maintenance_mode));
      setMaintenanceMessage(data.maintenance_message);
    } catch (error) {
      console.error('Failed to load maintenance settings:', error);
    }
  };

  const loadTotalImageSize = async () => {
    setLoadingImageSize(true);
    try {
      const data = await apiGet<{ totalImageSize: number }>('/api/image-stats');
      setTotalImageSize(data.totalImageSize || 0);
    } catch (error) {
      console.error('Failed to load total image size:', error);
    } finally {
      setLoadingImageSize(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    try {
      const previews = acceptedFiles.map(file => URL.createObjectURL(file));
      setImagesPreviews(prev => [...prev, ...previews]);

      const uploadPromises = acceptedFiles.map(file => uploadImage(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter((url): url is string => url !== null);
      setImages(prev => [...prev, ...validUrls]);

      previews.forEach(url => URL.revokeObjectURL(url));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('画像のアップロードに失敗しました。');
    }
    setIsUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    }
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiPost('/api/admin/login', { username, password });
      setIsLoggedIn(true);
      scrollToTop();
      await Promise.all([loadMaintenanceSettings(), loadTotalImageSize()]);
    } catch (error) {
      console.error('Login failed:', error);
      alert('ログイン情報が正しくありません。');
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setHeaderImage('');
    setHeaderImagePreview('');
    setHeaderImageUrl('');
    setImages([]);
    setImagesPreviews([]);
    setImageUrl('');
    setEditingId(null);
    setShowPostForm(false);
    setPublishDate(new Date());
    setHeaderImageInputType('upload');
    setImageInputType('upload');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const postData = {
        title,
        content,
        publish_date: format(publishDate, "yyyy-MM-dd'T'HH:mm:ssXXX"),
        header_image: headerImageInputType === 'url' ? headerImageUrl : headerImage,
        images: images,
      };
      
      if (editingId) {
        await editPost(editingId, postData);
      } else {
        await addPost(postData);
      }
      
      resetForm();
      if (!editingId) {
        navigate('/posts');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      alert('投稿の保存に失敗しました。');
    }
  };

  const handleEdit = (post: any) => {
    setTitle(post.title);
    setContent(post.content);
    if (post.header_image?.startsWith('http')) {
      setHeaderImageInputType('url');
      setHeaderImageUrl(post.header_image);
      setHeaderImagePreview(post.header_image);
    } else {
      setHeaderImageInputType('upload');
      setHeaderImage(post.header_image || '');
      setHeaderImagePreview(post.header_image || '');
    }
    setImages(post.images || []);
    setImagesPreviews(post.images || []);
    setEditingId(post.id);
    setPublishDate(new Date(post.publish_date));
    setShowPostForm(true);
    scrollToTop();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('この投稿を削除してもよろしいですか？')) {
      try {
        await deletePost(id);
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('投稿の削除に失敗しました。');
      }
    }
  };

  const handleHeaderImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const previewUrl = URL.createObjectURL(file);
      setHeaderImagePreview(previewUrl);

      const url = await uploadImage(file);
      if (url) {
        setHeaderImage(url);
      }

      URL.revokeObjectURL(previewUrl);
    } catch (error) {
      console.error('Error uploading header image:', error);
      alert('ヘッダー画像のアップロードに失敗しました。');
    }
    setIsUploading(false);
  };

  const handleAddImageUrl = () => {
    if (imageUrl) {
      setImages(prev => [...prev, imageUrl]);
      setImagesPreviews(prev => [...prev, imageUrl]);
      setImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagesPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleLogout = async () => {
    try {
      await apiPost('/api/admin/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
  };

  const handleCompressImages = async () => {
    setIsCompressing(true);
    try {
      const result = await apiPost<{ error?: string }>('/api/images/compress-existing');
      setCompressionResult(result);
      alert(result.error || '一括画像圧縮は Cloudflare 移行版では停止しています。');
    } catch (error) {
      console.error('Compression error:', error);
      alert('圧縮処理中にエラーが発生しました');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSaveMaintenanceMode = async () => {
    setIsSavingMaintenance(true);
    try {
      await apiPut('/api/maintenance-settings', {
        is_maintenance_mode: isMaintenanceMode,
        maintenance_message: maintenanceMessage,
        updated_by: username || 'admin',
      });
      alert('メンテナンス設定を保存しました。');
    } catch (error) {
      console.error('Failed to save maintenance settings:', error);
      alert('メンテナンス設定の保存に失敗しました。');
    } finally {
      setIsSavingMaintenance(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center mb-8">管理者ログイン</h2>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
                <input
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">パスワード</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
              >
                ログイン
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-2 px-4 rounded-md transition duration-300 ${
                  activeTab === 'posts'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                投稿管理
              </button>
              <button
                onClick={() => setActiveTab('players')}
                className={`py-2 px-4 rounded-md transition duration-300 ${
                  activeTab === 'players'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                選手管理
              </button>
              <button
                onClick={() => setActiveTab('matches')}
                className={`py-2 px-4 rounded-md transition duration-300 ${
                  activeTab === 'matches'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                試合速報
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`py-2 px-4 rounded-md transition duration-300 ${
                  activeTab === 'schedule'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                年間予定
              </button>
              <button
                onClick={() => setActiveTab('teams')}
                className={`py-2 px-4 rounded-md transition duration-300 ${
                  activeTab === 'teams'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                チーム管理
              </button>
              <button
                onClick={() => setActiveTab('maintenance')}
                className={`py-2 px-4 rounded-md transition duration-300 ${
                  activeTab === 'maintenance'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                メンテナンス
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-300"
            >
              ログアウト
            </button>
          </div>

          {activeTab === 'posts' && (
            <>
              <div className="mb-8">
                <button
                  onClick={() => {
                    setShowPostForm(true);
                    scrollToTop();
                  }}
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  新規作成
                </button>
              </div>

              {showPostForm && (
                <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                  <h3 className="text-xl font-bold mb-6">{editingId ? '投稿編集' : '新規投稿'}</h3>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ヘッダー画像</label>
                      <div className="space-y-4">
                        <div className="flex space-x-4">
                          <button
                            type="button"
                            onClick={() => setHeaderImageInputType('upload')}
                            className={`px-4 py-2 rounded-md transition-all duration-300 ${
                              headerImageInputType === 'upload'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            <Upload className="w-4 h-4 inline-block mr-2" />
                            アップロード
                          </button>
                          <button
                            type="button"
                            onClick={() => setHeaderImageInputType('url')}
                            className={`px-4 py-2 rounded-md transition-all duration-300 ${
                              headerImageInputType === 'url'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            <LinkIcon className="w-4 h-4 inline-block mr-2" />
                            URL指定
                          </button>
                        </div>

                        {headerImageInputType === 'upload' ? (
                          <div className="flex items-center space-x-4">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleHeaderImageUpload(file);
                              }}
                              className="hidden"
                              id="header-image-upload"
                            />
                            <label
                              htmlFor="header-image-upload"
                              className="bg-blue-100 text-blue-600 px-4 py-2 rounded-md cursor-pointer hover:bg-blue-200 transition duration-300"
                            >
                              画像を選択
                            </label>
                          </div>
                        ) : (
                          <input
                            type="url"
                            value={headerImageUrl}
                            onChange={(e) => {
                              setHeaderImageUrl(e.target.value);
                              setHeaderImagePreview(e.target.value);
                            }}
                            placeholder="画像のURLを入力"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                          />
                        )}

                        {headerImagePreview && (
                          <div className="relative inline-block">
                            <img
                              src={headerImagePreview}
                              alt="ヘッダープレビュー"
                              className="w-32 h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setHeaderImage('');
                                setHeaderImagePreview('');
                                setHeaderImageUrl('');
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
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
                      <label className="block text-sm font-medium text-gray-700">公開日時</label>
                      <DatePicker
                        selected={publishDate}
                        onChange={(date: Date) => setPublishDate(date)}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="yyyy/MM/dd HH:mm"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                        locale={ja}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">内容</label>
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={6}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">画像一覧</label>
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
                          <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition duration-300 ${
                              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
                            }`}
                          >
                            <input {...getInputProps()} />
                            <p className="text-gray-600">
                              {isDragActive
                                ? 'ここにドロップしてアップロード'
                                : '画像をドラッグ＆ドロップまたはクリックしてアップロード'}
                            </p>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <input
                              type="url"
                              value={imageUrl}
                              onChange={(e) => setImageUrl(e.target.value)}
                              placeholder="画像のURLを入力"
                              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                            />
                            <button
                              type="button"
                              onClick={handleAddImageUrl}
                              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
                            >
                              追加
                            </button>
                          </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                          {images.map((url, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={url}
                                alt={`画像 ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
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
                        {isUploading ? '画像アップロード中...' : (editingId ? '更新' : '投稿')}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-xl font-bold mb-6">投稿一覧</h3>
                <div className="space-y-6">
                  {posts.map((item) => (
                    <div key={item.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                      {item.header_image && (
                        <img
                          src={item.header_image}
                          alt={item.title}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                      )}
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-lg font-semibold">{item.title}</h4>
                          <p className="text-sm text-gray-500">公開: {item.publish_date}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-700 p-1"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 whitespace-pre-wrap">{item.content}</p>
                      {item.images && item.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                          {item.images.map((url, index) => (
                            <img
                              key={index}
                              src={url}
                              alt={`画像 ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {posts.length === 0 && (
                    <p className="text-center text-gray-500">投稿はありません。</p>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'players' && <PlayerManagement />}
          {activeTab === 'matches' && <MatchManagement />}
          {activeTab === 'schedule' && <AnnualScheduleManagement />}
          {activeTab === 'teams' && <TeamManagement />}

          {activeTab === 'maintenance' && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold mb-8">メンテナンス</h3>

              <div className="space-y-6">
                <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
                  <h4 className="text-lg font-bold text-blue-900 mb-2">画像圧縮</h4>
                  <p className="text-gray-700 mb-4">
                    データベースに保存されている既存の画像を圧縮し、容量を削減します。処理中は時間がかかる場合があります。
                  </p>

                  <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">現在の使用容量</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {loadingImageSize ? '読み込み中...' : `${(totalImageSize / (1024 * 1024)).toFixed(2)} MB`}
                    </p>
                  </div>

                  <button
                    onClick={handleCompressImages}
                    disabled={isCompressing}
                    className="w-full sm:w-auto bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300 font-medium disabled:bg-gray-400"
                  >
                    {isCompressing ? '処理中...' : '既存画像を圧縮'}
                  </button>

                  {compressionResult && (
                    <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
                      <h5 className="font-bold text-gray-800 mb-3">処理結果</h5>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p>処理済みファイル数: <span className="font-bold text-blue-600">{compressionResult.processedCount}</span></p>
                        <p>全ファイル数: <span className="font-bold">{compressionResult.totalFiles}</span></p>
                        {compressionResult.details && compressionResult.details.length > 0 && (
                          <div className="mt-4">
                            <p className="font-bold mb-2">処理詳細:</p>
                            <div className="space-y-1 max-h-48 overflow-y-auto">
                              {compressionResult.details.map((file: any, index: number) => (
                                <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                                  {file.name}: {Math.round(file.originalSize / 1024)}KB → {Math.round(file.compressedSize / 1024)}KB ({file.reduction}%削減)
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-2 border-amber-200 rounded-lg p-6 bg-amber-50">
                  <div className="flex items-start mb-4">
                    <AlertCircle className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                    <h4 className="text-lg font-bold text-amber-900">サイトメンテナンスモード</h4>
                  </div>
                  <p className="text-gray-700 mb-6">
                    メンテナンスモードを有効にすると、訪問者に対してメンテナンス画面を表示します。
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isMaintenanceMode}
                          onChange={(e) => setIsMaintenanceMode(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className="ml-2 text-gray-700 font-medium">メンテナンスモードを有効にする</span>
                      </label>
                    </div>

                    {isMaintenanceMode && (
                      <div className="p-4 bg-white rounded-lg border border-amber-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">メンテナンスメッセージ</label>
                        <textarea
                          value={maintenanceMessage}
                          onChange={(e) => setMaintenanceMessage(e.target.value)}
                          rows={3}
                          className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-amber-500 focus:ring focus:ring-amber-200"
                        />
                      </div>
                    )}

                    <button
                      onClick={handleSaveMaintenanceMode}
                      disabled={isSavingMaintenance}
                      className="w-full sm:w-auto bg-amber-600 text-white py-3 px-6 rounded-lg hover:bg-amber-700 transition duration-300 font-medium disabled:bg-gray-400"
                    >
                      {isSavingMaintenance ? '保存中...' : '設定を保存'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;
