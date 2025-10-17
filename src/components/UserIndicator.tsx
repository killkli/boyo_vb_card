import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useLearningStats } from '../hooks/useLearningStats';
import { getAllProfiles, updateLastActive } from '../utils/db';
import type { UserProfile } from '../types/learning';

export function UserIndicator() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useUser();
  const { stats, refresh } = useLearningStats();
  const [isOpen, setIsOpen] = useState(false);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadProfiles();
      refresh(); // Refresh stats when dropdown opens
    }
  }, [isOpen, refresh]);

  const loadProfiles = async () => {
    try {
      const allProfiles = await getAllProfiles();
      setProfiles(allProfiles);
    } catch (error) {
      console.error('載入用戶檔案失敗:', error);
    }
  };

  const handleSwitchUser = async (profile: UserProfile) => {
    try {
      await updateLastActive(profile.userId);
      setCurrentUser(profile);
      setIsOpen(false);
    } catch (error) {
      console.error('切換用戶失敗:', error);
    }
  };

  const handleManageProfiles = () => {
    setIsOpen(false);
    navigate('/profile-select');
  };

  const handleCreateNew = () => {
    setIsOpen(false);
    navigate('/profile-create');
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500"
        style={{
          borderLeft: `4px solid ${currentUser.themeColor}`,
        }}
      >
        <div className="text-2xl">{currentUser.avatar}</div>
        <div className="text-left">
          <div className="font-bold text-gray-800 text-sm">{currentUser.name}</div>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span>📚 {currentUser.totalWordsLearned}</span>
            <span>🔥 {currentUser.currentStreak}</span>
          </div>
        </div>
        <div className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-fade-in">
          {/* Current User Section */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-4xl">{currentUser.avatar}</div>
              <div className="flex-1">
                <div className="font-bold text-gray-800">{currentUser.name}</div>
                <div className="text-sm text-gray-600">當前使用者</div>
              </div>
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: currentUser.themeColor }}
              />
            </div>

            {/* Learning Stats */}
            {stats.totalWords > 0 && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/70 rounded-lg px-2 py-1.5">
                  <div className="text-gray-500">總單字</div>
                  <div className="font-bold text-gray-800">{stats.totalWords}</div>
                </div>
                <div className="bg-white/70 rounded-lg px-2 py-1.5">
                  <div className="text-gray-500">正確率</div>
                  <div className="font-bold text-green-600">{stats.averageAccuracy.toFixed(0)}%</div>
                </div>
                <div className="bg-green-50 rounded-lg px-2 py-1.5">
                  <div className="text-green-600">✓ 熟悉</div>
                  <div className="font-bold text-green-700">{stats.familiar + stats.mastered}</div>
                </div>
                <div className="bg-yellow-50 rounded-lg px-2 py-1.5">
                  <div className="text-yellow-600">📖 學習中</div>
                  <div className="font-bold text-yellow-700">{stats.learning + stats.new}</div>
                </div>
              </div>
            )}
          </div>

          {/* Other Profiles */}
          {profiles.filter((p) => p.userId !== currentUser.userId).length > 0 && (
            <div className="border-b border-gray-200">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                切換用戶
              </div>
              <div className="max-h-48 overflow-y-auto">
                {profiles
                  .filter((p) => p.userId !== currentUser.userId)
                  .map((profile) => (
                    <button
                      key={profile.userId}
                      onClick={() => handleSwitchUser(profile)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-2xl">{profile.avatar}</div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-800 text-sm">
                          {profile.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          📚 {profile.totalWordsLearned} 單字
                        </div>
                      </div>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: profile.themeColor }}
                      />
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="p-2">
            <button
              onClick={handleCreateNew}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors text-blue-600 font-medium"
            >
              <span className="text-xl">➕</span>
              <span>創建新檔案</span>
            </button>
            <button
              onClick={handleManageProfiles}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
            >
              <span className="text-xl">⚙️</span>
              <span>管理檔案</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
