import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { getAllProfiles, updateLastActive } from '../utils/db';
import type { UserProfile } from '../types/learning';

export function ProfileSelector() {
  const navigate = useNavigate();
  const { setCurrentUser } = useUser();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfiles() {
      try {
        const allProfiles = await getAllProfiles();
        setProfiles(allProfiles);
      } catch (error) {
        console.error('載入用戶檔案失敗:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProfiles();
  }, []);

  const handleSelectProfile = async (profile: UserProfile) => {
    try {
      await updateLastActive(profile.userId);
      setCurrentUser(profile);
      navigate('/');
    } catch (error) {
      console.error('選擇用戶失敗:', error);
    }
  };

  const handleCreateNew = () => {
    navigate('/profile-create');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            👋 歡迎回來！
          </h1>
          <p className="text-lg text-gray-600">
            選擇你的學習檔案，或創建一個新的
          </p>
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {profiles.map((profile) => (
            <button
              key={profile.userId}
              onClick={() => handleSelectProfile(profile)}
              className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2"
              style={{
                borderTop: `4px solid ${profile.themeColor}`,
                '--theme-color': profile.themeColor,
              } as React.CSSProperties & { '--theme-color': string }}
            >
              {/* Avatar */}
              <div className="text-6xl mb-3 transform group-hover:scale-110 transition-transform">
                {profile.avatar}
              </div>

              {/* Name */}
              <div className="font-bold text-gray-800 text-lg mb-2 truncate">
                {profile.name}
              </div>

              {/* Stats */}
              <div className="text-sm text-gray-500 space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <span>📚</span>
                  <span>{profile.totalWordsLearned} 單字</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <span>🔥</span>
                  <span>{profile.currentStreak} 天連續</span>
                </div>
              </div>

              {/* Hover Effect */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
                style={{ backgroundColor: profile.themeColor }}
              />
            </button>
          ))}

          {/* Create New Button */}
          <button
            onClick={handleCreateNew}
            className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-dashed border-gray-300 hover:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2"
          >
            <div className="text-6xl mb-3 transform group-hover:scale-110 transition-transform">
              ➕
            </div>
            <div className="font-bold text-gray-600 text-lg mb-2">
              創建新檔案
            </div>
            <div className="text-sm text-gray-400">
              開始你的學習旅程
            </div>
          </button>
        </div>

        {/* Empty State */}
        {profiles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎓</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              還沒有學習檔案
            </h2>
            <p className="text-gray-500 mb-6">
              創建你的第一個學習檔案，開始背單字吧！
            </p>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span>✨</span>
              <span>立即創建</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
