import React, { useState, useEffect } from 'react';
import { usePlayersContext } from '../context/PlayersContext';
import { useStaffContext } from '../context/StaffContext';
import { X } from 'lucide-react';
import AnimationWrapper from '../components/AnimationWrapper';
import { useLocation, useNavigate } from 'react-router-dom';
import AdBanner from '../components/AdBanner';

function Players() {
  const { players, isLoading: isLoadingPlayers, error: playersError } = usePlayersContext();
  const { staff, isLoading: isLoadingStaff, error: staffError } = useStaffContext();
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle URL parameters for member selection
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const memberId = urlParams.get('member');
    const memberType = urlParams.get('type');
    
    if (memberId && memberType) {
      let member;
      if (memberType === 'player') {
        member = players.find(p => p.id === memberId);
      } else if (memberType === 'staff') {
        member = staff.find(s => s.id === memberId);
      }
      
      if (member) {
        setSelectedMember(member);
      }
    }
  }, [location.search, players, staff]);

  const handleMemberSelect = (member: any, type: 'player' | 'staff') => {
    setSelectedMember(member);
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('member', member.id);
    urlParams.set('type', type);
    navigate(`/players?${urlParams.toString()}`);
  };

  const handleCloseMember = () => {
    setSelectedMember(null);
    const urlParams = new URLSearchParams(location.search);
    urlParams.delete('member');
    urlParams.delete('type');
    const newSearch = urlParams.toString();
    navigate(`/players${newSearch ? `?${newSearch}` : ''}`);
  };

  const sortedStaff = [...staff].sort((a, b) => {
    const positionOrder = { '監督': 1, 'コーチ': 2, 'マネージャー': 3 };
    return positionOrder[a.position as keyof typeof positionOrder] - positionOrder[b.position as keyof typeof positionOrder];
  });
  
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
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (playersError || staffError) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="container mx-auto px-4 py-20">
          <div className="text-red-600 text-center">{playersError || staffError}</div>
        </div>
      </div>
    );
  }

  const MemberCard = ({ member, type }: { member: any, type: 'player' | 'staff' }) => (
    <AnimationWrapper className="bg-white rounded-lg shadow-md overflow-hidden animate-fadeIn hover:shadow-lg transition-shadow duration-300 cursor-pointer">
      <div className="aspect-w-1 aspect-h-1 relative">
        {member.image ? (
          <img
            src={member.image}
            alt={member.name}
            className="w-full h-64 sm:h-full object-cover"
          />
        ) : (
          <div className="w-full h-64 sm:h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
      </div>
      <div className="p-4 sm:p-6">
        <div className="mb-4">
          <h4 className="text-lg sm:text-xl font-semibold text-gray-800">{member.last_name} {member.first_name}</h4>
          <p className="text-sm text-gray-500 mb-2">{member.last_name_kana} {member.first_name_kana}</p>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            <span className="font-medium">ポジション:</span> {member.position}
          </p>
          {member.grade && (
            <p className="text-sm sm:text-base text-gray-600">
              <span className="font-medium">学年:</span> {member.grade}年生
            </p>
          )}
          <p className="text-sm sm:text-base text-gray-600">
            <span className="font-medium">出身校:</span> {member.school}
          </p>
          {member.admission_type && (
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              <span className="font-medium">入試形態:</span> {member.admission_type}
            </p>
          )}
        </div>
        <button
          onClick={() => handleMemberSelect(member, type)}
          className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          詳細を見る
        </button>
      </div>
    </AnimationWrapper>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <section className="py-20">
        <div className="container mx-auto px-4">
          <AnimationWrapper className="text-3xl font-bold text-center mb-16 text-gray-800 animate-fadeIn">
            <h2 className="text-2xl sm:text-3xl">スタッフ・選手一覧</h2>
          </AnimationWrapper>
          
          <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">
            {staff.length > 0 && (
              <div className="space-y-6 sm:space-y-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 border-b pb-4">スタッフ</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {sortedStaff.map((member) => (
                    <MemberCard key={member.id} member={member} type="staff" />
                  ))}
                </div>
              </div>
            )}

            {grades.map((grade) => (
              <div key={grade} className="space-y-6 sm:space-y-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 border-b pb-4">{grade}年生</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {groupedPlayers[grade].map((player) => (
                    <MemberCard key={player.id} member={player} type="player" />
                  ))}
                </div>
              </div>
            ))}

            {staff.length === 0 && players.length === 0 && (
              <p className="text-center text-gray-500">部員情報はまだ登録されていません。</p>
            )}
            
            {/* 広告配置 - 選手一覧ページ下部 */}
            {(staff.length > 0 || players.length > 0) && (
              <AdBanner className="mt-12 sm:mt-16" />
            )}
          </div>
        </div>
      </section>

      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2">
                <div className="aspect-w-1 aspect-h-1">
                  {selectedMember.image ? (
                    <img
                      src={selectedMember.image}
                      alt={selectedMember.name}
                      className="w-full h-80 md:h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-80 md:h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="md:w-1/2 p-6 sm:p-8 relative">
                <button
                  onClick={handleCloseMember}
                  className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 pr-12">{selectedMember.last_name} {selectedMember.first_name}</h3>
                    <p className="text-base sm:text-lg text-gray-500">{selectedMember.last_name_kana} {selectedMember.first_name_kana}</p>
                    {selectedMember.grade && (
                      <p className="text-base sm:text-lg text-gray-600 mt-2">{selectedMember.grade}年生</p>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">ポジション</p>
                      <p className="text-lg sm:text-xl font-medium">{selectedMember.position}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">出身校</p>
                      <p className="text-lg sm:text-xl font-medium">{selectedMember.school}</p>
                    </div>
                    {selectedMember.admission_type && (
                      <div>
                        <p className="text-sm text-gray-500">入試形態</p>
                        <p className="text-base sm:text-lg font-medium">{selectedMember.admission_type}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Players;