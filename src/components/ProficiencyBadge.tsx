import type { ProficiencyLevel } from '../types/learning';

interface ProficiencyBadgeProps {
  level: ProficiencyLevel;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const PROFICIENCY_CONFIG = {
  new: {
    label: '新單字',
    emoji: '🆕',
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    gradient: 'from-gray-100 to-gray-200',
  },
  learning: {
    label: '學習中',
    emoji: '📖',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    gradient: 'from-yellow-100 to-yellow-200',
  },
  familiar: {
    label: '熟悉',
    emoji: '✓',
    color: 'bg-green-100 text-green-700 border-green-300',
    gradient: 'from-green-100 to-green-200',
  },
  mastered: {
    label: '精通',
    emoji: '⭐',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    gradient: 'from-purple-100 to-purple-200',
  },
};

const SIZE_CONFIG = {
  small: {
    container: 'px-2 py-1 text-xs',
    emoji: 'text-sm',
  },
  medium: {
    container: 'px-3 py-1.5 text-sm',
    emoji: 'text-base',
  },
  large: {
    container: 'px-4 py-2 text-base',
    emoji: 'text-lg',
  },
};

export function ProficiencyBadge({
  level,
  size = 'medium',
  showLabel = true
}: ProficiencyBadgeProps) {
  const config = PROFICIENCY_CONFIG[level];
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border-2 font-semibold bg-gradient-to-r ${config.color} ${config.gradient} ${sizeConfig.container} shadow-sm`}
    >
      <span className={sizeConfig.emoji}>{config.emoji}</span>
      {showLabel && <span>{config.label}</span>}
    </div>
  );
}

interface ProficiencyProgressProps {
  correctCount: number;
  incorrectCount: number;
  currentLevel: ProficiencyLevel;
}

export function ProficiencyProgress({
  correctCount,
  incorrectCount,
  currentLevel
}: ProficiencyProgressProps) {
  const total = correctCount + incorrectCount;
  const accuracy = total > 0 ? (correctCount / total) * 100 : 0;

  // Determine next milestone
  let nextMilestone = '';
  let progress = 0;

  if (currentLevel === 'new') {
    nextMilestone = '需要 2 次嘗試進入學習中';
    progress = Math.min((total / 2) * 100, 100);
  } else if (currentLevel === 'learning') {
    nextMilestone = '需要 75% 正確率和 6 次嘗試達到熟悉';
    const accuracyProgress = Math.min((accuracy / 75) * 50, 50);
    const attemptsProgress = Math.min((total / 6) * 50, 50);
    progress = accuracyProgress + attemptsProgress;
  } else if (currentLevel === 'familiar') {
    nextMilestone = '需要 90% 正確率和 10 次嘗試達到精通';
    const accuracyProgress = Math.min((accuracy / 90) * 50, 50);
    const attemptsProgress = Math.min((total / 10) * 50, 50);
    progress = accuracyProgress + attemptsProgress;
  } else {
    nextMilestone = '已精通！繼續保持！';
    progress = 100;
  }

  const config = PROFICIENCY_CONFIG[currentLevel];

  return (
    <div className="space-y-2">
      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${config.gradient} transition-all duration-500`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <span className="text-green-600">✓ {correctCount}</span>
          <span className="text-gray-400">/</span>
          <span className="text-red-600">✗ {incorrectCount}</span>
        </span>
        <span className="font-medium">{accuracy.toFixed(0)}% 正確</span>
      </div>

      {/* Next Milestone */}
      {currentLevel !== 'mastered' && (
        <div className="text-xs text-gray-500 italic">
          {nextMilestone}
        </div>
      )}
    </div>
  );
}
