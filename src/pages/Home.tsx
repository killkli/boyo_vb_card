import { useState, useEffect } from 'react';
import { LevelSelector } from '../components/LevelSelector';
import { loadAllLevelsMetadata } from '../utils/dataLoader';
import { useUser } from '../contexts/UserContext';
import { createProfile, getAllProfiles } from '../utils/db';
import type { LevelMetadata } from '../types/vocabulary';

export function Home() {
  const [levels, setLevels] = useState<LevelMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, setCurrentUser } = useUser();
  const [profileCount, setProfileCount] = useState(0);

  useEffect(() => {
    loadAllLevelsMetadata()
      .then((data) => {
        setLevels(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load levels:', error);
        setLoading(false);
      });

    // Load profile count for testing
    getAllProfiles().then((profiles) => {
      setProfileCount(profiles.length);
    });
  }, []);

  // Test function to create a profile
  const handleCreateTestProfile = async () => {
    try {
      const profile = await createProfile('測試用戶', '🦁', '#3B82F6');
      setCurrentUser(profile);
      const profiles = await getAllProfiles();
      setProfileCount(profiles.length);
      alert(`創建成功！用戶 ID: ${profile.userId}`);
    } catch (error) {
      console.error('Failed to create profile:', error);
      alert('創建失敗，請查看控制台');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Test Panel - 測試 IndexedDB 功能 */}
      <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-50">
        <h3 className="font-bold text-lg mb-2">🧪 IndexedDB 測試面板</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>當前用戶:</span>
            <span className="font-semibold">
              {currentUser ? `${currentUser.avatar} ${currentUser.name}` : '無'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>用戶檔案數:</span>
            <span className="font-semibold">{profileCount}</span>
          </div>
          <div className="flex justify-between">
            <span>資料庫狀態:</span>
            <span className="font-semibold text-green-600">✓ 已初始化</span>
          </div>
          <button
            onClick={handleCreateTestProfile}
            className="w-full mt-3 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            ➕ 創建測試用戶
          </button>
          {currentUser && (
            <div className="mt-2 p-2 bg-indigo-50 rounded text-xs">
              <div>ID: {currentUser.userId.slice(0, 8)}...</div>
              <div>主題色: <span style={{ color: currentUser.themeColor }}>●</span> {currentUser.themeColor}</div>
            </div>
          )}
        </div>
      </div>

      <LevelSelector levels={levels} loading={loading} />
    </div>
  );
}
