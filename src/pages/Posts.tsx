import React, { useState, useEffect } from 'react';
import { usePostsContext } from '../context/PostsContext';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';
import AnimationWrapper from '../components/AnimationWrapper';
import { useLocation, useNavigate } from 'react-router-dom';
import AdBanner from '../components/AdBanner';

function Posts() {
  const { posts, isLoading, error } = usePostsContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const postsPerPage = 10;
  const currentDate = new Date();
  const location = useLocation();
  const navigate = useNavigate();

  const publishedPosts = posts
    .filter(item => new Date(item.publish_date) <= currentDate)
    .sort((a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime());

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = publishedPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(publishedPosts.length / postsPerPage);

  // Handle URL parameters for post selection and pagination
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const postId = urlParams.get('post');
    const page = urlParams.get('page');

    if (postId) {
      const post = publishedPosts.find(p => p.id === postId);
      if (post) {
        setSelectedPost(post);
      }
    }

    if (page) {
      const pageNumber = parseInt(page, 10);
      if (pageNumber >= 1 && pageNumber <= totalPages) {
        setCurrentPage(pageNumber);
      }
    }
  }, [location.search, publishedPosts, totalPages]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('page', pageNumber.toString());
    navigate(`/posts?${urlParams.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePostSelect = (post: any) => {
    setSelectedPost(post);
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('post', post.id);
    navigate(`/posts?${urlParams.toString()}`);
  };

  const handleClosePost = () => {
    setSelectedPost(null);
    const urlParams = new URLSearchParams(location.search);
    urlParams.delete('post');
    const newSearch = urlParams.toString();
    navigate(`/posts${newSearch ? `?${newSearch}` : ''}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="container mx-auto px-4 py-20">
          <div className="text-red-600 text-center">{error}</div>
        </div>
      </div>
    );
  }

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="container mx-auto px-4 py-12 sm:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative">
                {selectedPost.header_image && (
                  <div className="relative pb-[60%] sm:pb-[50%] overflow-hidden bg-gray-100">
                    <img
                      src={selectedPost.header_image}
                      alt={selectedPost.title}
                      className="absolute inset-0 w-full h-full object-contain bg-gray-100"
                    />
                  </div>
                )}
                <button
                  onClick={handleClosePost}
                  className="absolute top-4 right-4 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors z-10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 sm:p-8">
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight">{selectedPost.title}</h2>
                  <p className="text-gray-500 mt-3">
                    {new Date(selectedPost.publish_date).toLocaleDateString('ja-JP')}
                  </p>
                </div>
                <div className="prose max-w-none mb-6 sm:mb-8">
                  <p className="text-base sm:text-lg text-gray-600 whitespace-pre-wrap leading-relaxed">{selectedPost.content}</p>
                </div>

                {selectedPost.images && selectedPost.images.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">画像一覧</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {selectedPost.images.map((url: string, index: number) => (
                        <div key={index} className="relative pb-[75%] rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                          <img
                            src={url}
                            alt={`画像 ${index + 1}`}
                            className="absolute inset-0 w-full h-full object-contain bg-gray-100"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <section className="py-20">
        <div className="container mx-auto px-4">
          <AnimationWrapper className="text-3xl font-bold text-center mb-16 text-gray-800 animate-fadeIn">
            <h2 className="text-2xl sm:text-3xl">投稿一覧</h2>
          </AnimationWrapper>
          <div className="max-w-6xl mx-auto space-y-8">
            {currentPosts.map((post, index) => (
              <AnimationWrapper
                key={post.id}
                className="bg-white rounded-lg shadow-md overflow-hidden animate-fadeIn flex flex-col md:flex-row cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="w-full md:w-1/3 relative pb-[60%] md:pb-0 md:h-auto min-h-[200px] md:min-h-[250px] overflow-hidden">
                  {post.header_image ? (
                    <img
                      src={post.header_image}
                      alt={post.title}
                      className="absolute inset-0 w-full h-full object-contain md:object-cover bg-gray-100"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                </div>
                <div className="w-full md:w-2/3 p-6 sm:p-8 flex flex-col">
                  <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 line-clamp-2">{post.title}</h3>
                      <span className="text-sm text-gray-500 flex-shrink-0">
                        {new Date(post.publish_date).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 line-clamp-3 mb-4">{post.content}</p>
                  </div>
                  <button
                    onClick={() => handlePostSelect(post)}
                    className="self-end inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors font-medium"
                  >
                    <span>詳細を見る</span>
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </AnimationWrapper>
            ))}

            {publishedPosts.length === 0 && (
              <p className="text-center text-gray-500">現在、投稿はありません。</p>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-1 sm:space-x-2 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-3 rounded-lg ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={`w-12 h-12 rounded-lg transition-colors font-medium ${
                      currentPage === index + 1
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-blue-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-3 rounded-lg ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
            
            {/* 広告配置 - 投稿一覧ページ下部 */}
            {publishedPosts.length > 0 && (
              <AdBanner className="mt-12" />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Posts;