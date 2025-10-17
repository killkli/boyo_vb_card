import { useLearningStats } from '../hooks/useLearningStats';

export function OverallProgressStats() {
  const { stats, loading } = useLearningStats();

  if (loading || stats.totalWords === 0) {
    return null;
  }

  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg px-6 py-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-6 flex-wrap">
        {/* Total Words */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{stats.totalWords}</div>
            <div className="text-xs text-gray-500">學習單字</div>
          </div>
        </div>

        {/* Accuracy */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{stats.averageAccuracy.toFixed(0)}%</div>
            <div className="text-xs text-gray-500">正確率</div>
          </div>
        </div>

        {/* Proficiency Breakdown */}
        <div className="flex items-center gap-4">
          {stats.mastered > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-2xl">⭐</span>
              <div>
                <div className="text-lg font-bold text-purple-600">{stats.mastered}</div>
                <div className="text-xs text-gray-500">精通</div>
              </div>
            </div>
          )}

          {stats.familiar > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-2xl">✓</span>
              <div>
                <div className="text-lg font-bold text-green-600">{stats.familiar}</div>
                <div className="text-xs text-gray-500">熟悉</div>
              </div>
            </div>
          )}

          {stats.learning > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-2xl">📖</span>
              <div>
                <div className="text-lg font-bold text-yellow-600">{stats.learning}</div>
                <div className="text-xs text-gray-500">學習中</div>
              </div>
            </div>
          )}

          {stats.new > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-2xl">🆕</span>
              <div>
                <div className="text-lg font-bold text-gray-600">{stats.new}</div>
                <div className="text-xs text-gray-500">新單字</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
