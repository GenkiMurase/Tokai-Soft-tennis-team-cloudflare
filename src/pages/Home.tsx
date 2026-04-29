import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { usePostsContext } from '../context/PostsContext';
import { useMatchesContext } from '../context/MatchesContext';
import { Trophy, Users, Calendar, ChevronRight, ChevronLeft, GraduationCap } from 'lucide-react';
import AdBanner from '../components/AdBanner';
import PlayerImageDisplay from '../components/PlayerImageDisplay';

function Home() {
  const { posts, isLoading } = usePostsContext();
  const { matches, tournaments } = useMatchesContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  
  const recentPosts = posts
    .filter(item => new Date(item.publish_date) <= new Date())
    .sort((a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime());

  // Handle URL parameters for post selection
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const postId = urlParams.get('post');
    
    if (postId) {
      const postIndex = recentPosts.findIndex(p => p.id === postId);
      if (postIndex !== -1) {
        setCurrentIndex(postIndex);
      }
    }
  }, [location.search, recentPosts]);

  const handleSlide = (direction: 'prev' | 'next') => {
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex === 0 ? recentPosts.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex === recentPosts.length - 1 ? 0 : currentIndex + 1;
    }
    setCurrentIndex(newIndex);
    
    // Update URL with current post
    if (recentPosts[newIndex]) {
      const urlParams = new URLSearchParams(location.search);
      urlParams.set('post', recentPosts[newIndex].id);
      navigate(`/?${urlParams.toString()}`, { replace: true });
    }
  };

  const handlePostClick = (post: any) => {
    navigate(`/posts?post=${post.id}`);
  };

  const handlePostLinkClick = (post: any) => {
    navigate(`/posts?post=${post.id}`);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleSlide('next');
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pt-16 sm:pt-24">
        <div className="container mx-auto px-4 py-12 sm:py-20">
          <div className="text-center">読み込み中...</div>
        </div>
      </div>
    );
  }

  const getTournamentName = (tournamentId: string) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    return tournament ? tournament.name : '';
  };

  const getScoreColor = (match: any) => {
    if (match.result === 'win') return 'text-green-600';
    if (match.result === 'loss') return 'text-red-600';
    return 'text-blue-600';
  };

  const TeamDisplay = ({ name, image }: { name: string, image?: string }) => (
    <div className="flex items-center space-x-2">
      <span className="font-medium text-sm sm:text-base">{name}</span>
    </div>
  );

  const recentMatches = matches
    .filter(match => match.start_time) // 開始時間が設定されている試合のみ
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 sm:py-20">
        {recentPosts.length > 0 && (
          <div className="max-w-6xl mx-auto mb-12 sm:mb-20">
            <div className="relative">
              <div className="overflow-hidden rounded-lg sm:rounded-2xl">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                  {recentPosts.map((post) => (
                    <div 
                      key={post.id}
                      onClick={() => handlePostClick(post)}
                      className="w-full flex-shrink-0 relative cursor-pointer group"
                    >
                      <div className="relative pb-[60%] sm:pb-[56.25%] overflow-hidden rounded-lg sm:rounded-2xl">
                        {post.header_image ? (
                          <>
                            <img 
                              src={post.header_image}
                              alt={post.title}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                          </>
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <span className="text-gray-400">No Image</span>
                          </div>
                        )}
                        <div className="absolute bottom-3 sm:bottom-6 left-3 right-3 sm:left-6 sm:right-6 text-center sm:text-right">
                          <p className="text-white text-base sm:text-xl font-medium tracking-wider mb-1 sm:mb-2 line-clamp-2 drop-shadow-lg">
                            {post.title}
                          </p>
                          <p className="text-white/90 text-xs sm:text-base drop-shadow-md">
                            {new Date(post.publish_date).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {recentPosts.length > 1 && (
                <>
                  <button
                    onClick={() => handleSlide('prev')}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-3 sm:p-2 shadow-lg hover:bg-white transition-colors"
                    aria-label="前へ"
                  >
                    <ChevronLeft className="w-6 h-6 sm:w-6 sm:h-6" />
                  </button>
                  <button
                    onClick={() => handleSlide('next')}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-3 sm:p-2 shadow-lg hover:bg-white transition-colors"
                    aria-label="次へ"
                  >
                    <ChevronRight className="w-6 h-6 sm:w-6 sm:h-6" />
                  </button>

                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex space-x-3">
                    {recentPosts.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentIndex 
                            ? 'bg-blue-600 scale-125' 
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`スライド ${index + 1} に移動`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto mt-12 sm:mt-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            <Link 
              to="/about"
              className="bg-white rounded-xl shadow-lg p-6 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
            >
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mb-4 sm:mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl sm:text-xl font-semibold mb-3">部活動紹介</h3>
              <p className="text-base sm:text-base text-gray-600 mb-4">全日本学生選手権大会出場の実績を持つ伝統ある部活動です。</p>
              <div className="mt-4 sm:mt-4 flex items-center text-blue-600">
                <span className="text-base font-medium">詳しく見る</span>
                <ChevronRight className="w-5 h-5 ml-2" />
              </div>
            </Link>

            <Link 
              to="/players"
              className="bg-white rounded-xl shadow-lg p-6 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
            >
              <Users className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mb-4 sm:mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl sm:text-xl font-semibold mb-3">選手紹介</h3>
              <p className="text-base sm:text-base text-gray-600 mb-4">熱意ある部員たちが日々練習に励んでいます。</p>
              <div className="mt-4 sm:mt-4 flex items-center text-blue-600">
                <span className="text-base font-medium">選手一覧を見る</span>
                <ChevronRight className="w-5 h-5 ml-2" />
              </div>
            </Link>

            <Link 
              to="/contact"
              className="bg-white rounded-xl shadow-lg p-6 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
            >
              <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mb-4 sm:mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl sm:text-xl font-semibold mb-3">お問い合わせ</h3>
              <p className="text-base sm:text-base text-gray-600 mb-4">入部やその他のお問い合わせはこちらから。</p>
              <div className="mt-4 sm:mt-4 flex items-center text-blue-600">
                <span className="text-base font-medium">問い合わせる</span>
                <ChevronRight className="w-5 h-5 ml-2" />
              </div>
            </Link>
          </div>
        </div>

        {recentMatches.length > 0 && (
          <div className="max-w-6xl mx-auto mt-12 sm:mt-20">
            <h2 className="text-2xl sm:text-2xl font-bold mb-8 sm:mb-8">試合速報</h2>
            <div className="space-y-4 sm:space-y-6">
              {recentMatches.map((match) => (
                <Link
                  key={match.id}
                  to={`/matches?match=${match.id}`}
                  className="block bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                >
                  <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">{getTournamentName(match.tournament_id)}</div>
                  <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <TeamDisplay name={match.team1_name} image={match.team1_image} />
                    <div className={`text-xl sm:text-2xl font-bold mx-4 sm:mx-8 ${getScoreColor(match)}`}>
                      {match.status === 'upcoming' ? '0-0' : `${match.team1_score}-${match.team2_score}`}
                    </div>
                    <TeamDisplay name={match.team2_name} image={match.team2_image} />
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 flex flex-wrap gap-2 sm:gap-4">
                    {match.round && <span>{match.round}</span>}
                    {match.court_number && <span>コート: {match.court_number}</span>}
                    <span>{new Date(match.start_time).toLocaleString('ja-JP', {
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 入試情報の落ち着いたバナー */}
        <div className="max-w-6xl mx-auto mt-12 sm:mt-20">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl shadow-lg border border-gray-200 p-10 sm:p-12 text-center hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-center justify-center mb-8 sm:mb-8">
              <div className="bg-blue-100 rounded-full p-4 sm:p-4 mb-6 sm:mb-0 sm:mr-6">
                <GraduationCap className="w-16 h-16 sm:w-16 sm:h-16 text-blue-600" />
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-4xl sm:text-4xl font-bold mb-3 text-gray-800">
                  入部希望者必見！
                </h2>
                <p className="text-xl sm:text-xl text-gray-600">
                  入試に関する情報
                </p>
              </div>
            </div>
            <Link
              to="/admission"
              className="group inline-flex items-center bg-blue-600 text-white px-10 sm:px-12 py-5 sm:py-6 rounded-xl text-xl sm:text-2xl font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 mr-4 sm:mr-4" />
              <span>入試情報を見る</span>
              <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8 ml-4 sm:ml-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>

        {recentPosts.length > 0 && (
          <div className="max-w-6xl mx-auto mt-12 sm:mt-20">
            <h2 className="text-2xl sm:text-2xl font-bold mb-8 sm:mb-8">最新のお知らせ</h2>
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              {recentPosts.slice(0, 5).map((post) => (
                <button
                  key={post.id}
                  onClick={() => handlePostLinkClick(post)}
                  className="block w-full text-left py-3 sm:py-4 border-b last:border-b-0 hover:bg-gray-50 transition-all duration-300 rounded-lg px-2 sm:px-3 group"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4">
                    <h3 className="text-base sm:text-lg font-medium line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 flex-grow">{post.title}</h3>
                    <span className="text-xs sm:text-sm text-gray-500 flex-shrink-0 mt-1 sm:mt-0">
                      {new Date(post.publish_date).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* 広告配置 - ホームページ下部（最も効果的な位置） */}
        <div className="max-w-6xl mx-auto mt-12 sm:mt-20">
          <AdBanner />
        </div>
      </div>
    </div>
  );
}

export default Home;