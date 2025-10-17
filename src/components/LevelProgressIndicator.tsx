import { useLevelProgress } from '../hooks/useLevelProgress';

interface LevelProgressIndicatorProps {
  level: number;
  compact?: boolean;
}

export function LevelProgressIndicator({ level, compact = false }: LevelProgressIndicatorProps) {
  const progress = useLevelProgress(level);

  if (progress.learnedWords === 0) {
    return null; // Don't show anything if no words learned yet
  }

  if (compact) {
    // Compact view for Home page cards
    return (
      <div className="mt-3 space-y-2">
        {/* Progress Bar */}
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
            style={{ width: `${progress.progressPercentage}%` }}
          />
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {progress.masteredCount > 0 && (
              <span className="flex items-center gap-1 text-purple-600">
                <span>⭐</span>
                <span className="font-medium">{progress.masteredCount}</span>
              </span>
            )}
            {progress.familiarCount > 0 && (
              <span className="flex items-center gap-1 text-green-600">
                <span>✓</span>
                <span className="font-medium">{progress.familiarCount}</span>
              </span>
            )}
            {progress.learningCount > 0 && (
              <span className="flex items-center gap-1 text-yellow-600">
                <span>📖</span>
                <span className="font-medium">{progress.learningCount}</span>
              </span>
            )}
          </div>
          <span className="text-gray-600 font-medium">
            {progress.learnedWords}/{progress.totalWords}
          </span>
        </div>
      </div>
    );
  }

  // Full view (could be used in Learn page or detailed stats)
  return (
    <div className="space-y-3">
      {/* Progress Bar with Percentage */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium text-gray-700">學習進度</span>
          <span className="text-indigo-600 font-bold">
            {progress.progressPercentage.toFixed(0)}%
          </span>
        </div>
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-400 to-indigo-600 transition-all duration-500"
            style={{ width: `${progress.progressPercentage}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 text-right">
          {progress.learnedWords} / {progress.totalWords} 個單字
        </div>
      </div>

      {/* Proficiency Breakdown */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-purple-50 rounded-lg px-3 py-2 text-center">
          <div className="text-lg">⭐</div>
          <div className="text-xs text-purple-600 font-medium mt-1">精通</div>
          <div className="text-sm font-bold text-purple-700">{progress.masteredCount}</div>
        </div>
        <div className="bg-green-50 rounded-lg px-3 py-2 text-center">
          <div className="text-lg">✓</div>
          <div className="text-xs text-green-600 font-medium mt-1">熟悉</div>
          <div className="text-sm font-bold text-green-700">{progress.familiarCount}</div>
        </div>
        <div className="bg-yellow-50 rounded-lg px-3 py-2 text-center">
          <div className="text-lg">📖</div>
          <div className="text-xs text-yellow-600 font-medium mt-1">學習中</div>
          <div className="text-sm font-bold text-yellow-700">{progress.learningCount}</div>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
          <div className="text-lg">🆕</div>
          <div className="text-xs text-gray-600 font-medium mt-1">新單字</div>
          <div className="text-sm font-bold text-gray-700">{progress.newCount}</div>
        </div>
      </div>
    </div>
  );
}
