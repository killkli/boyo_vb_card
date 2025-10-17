import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { createProfile } from '../utils/db';
import { AVATAR_OPTIONS, THEME_COLORS } from '../constants/profileOptions';

export function ProfileCreator() {
  const navigate = useNavigate();
  const { setCurrentUser } = useUser();
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [selectedColor, setSelectedColor] = useState(THEME_COLORS[0]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    // Validation
    if (!name.trim()) {
      setError('請輸入名字');
      return;
    }

    if (name.trim().length > 10) {
      setError('名字不能超過 10 個字');
      return;
    }

    setError('');
    setIsCreating(true);

    try {
      const newProfile = await createProfile(
        name.trim(),
        selectedAvatar,
        selectedColor.value
      );
      setCurrentUser(newProfile);
      navigate('/');
    } catch (error) {
      console.error('創建檔案失敗:', error);
      setError('創建失敗，請重試');
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    navigate('/profile-select');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            ✨ 創建學習檔案
          </h1>
          <p className="text-lg text-gray-600">
            選擇你喜歡的頭像和顏色
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Preview */}
          <div className="text-center mb-8">
            <div
              className="inline-block p-8 rounded-2xl transition-all duration-300"
              style={{
                backgroundColor: `${selectedColor.value}15`,
                border: `3px solid ${selectedColor.value}`,
              }}
            >
              <div className="text-8xl mb-3 animate-bounce">
                {selectedAvatar}
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {name || '你的名字'}
              </div>
            </div>
          </div>

          {/* Name Input */}
          <div className="mb-8">
            <label className="block text-lg font-bold text-gray-700 mb-3">
              📝 你的名字
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="輸入你的名字（最多 10 個字）"
              maxLength={10}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 text-lg transition-all"
              autoFocus
            />
            {error && (
              <div className="mt-2 text-red-500 text-sm flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Avatar Selection */}
          <div className="mb-8">
            <label className="block text-lg font-bold text-gray-700 mb-3">
              🎭 選擇頭像
            </label>
            <div className="grid grid-cols-8 gap-2">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`text-4xl p-3 rounded-xl transition-all duration-200 transform hover:scale-110 focus:outline-none ${
                    selectedAvatar === avatar
                      ? 'bg-blue-100 ring-4 ring-blue-500 scale-110'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="mb-8">
            <label className="block text-lg font-bold text-gray-700 mb-3">
              🎨 選擇主題色
            </label>
            <div className="grid grid-cols-4 gap-3">
              {THEME_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color)}
                  className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none ${
                    selectedColor.value === color.value
                      ? 'ring-4 scale-105'
                      : 'hover:bg-gray-50'
                  }`}
                  style={{
                    ringColor: color.value,
                    backgroundColor:
                      selectedColor.value === color.value
                        ? `${color.value}20`
                        : 'transparent',
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                    style={{ backgroundColor: color.value }}
                  >
                    {selectedColor.value === color.value && (
                      <span className="text-white">✓</span>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-700 text-sm">
                      {color.name}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleCancel}
              className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-300"
              disabled={isCreating}
            >
              取消
            </button>
            <button
              onClick={handleCreate}
              disabled={isCreating || !name.trim()}
              className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-4 focus:ring-blue-500"
            >
              {isCreating ? '創建中...' : '開始學習 🚀'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
