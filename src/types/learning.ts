// IndexedDB types for learning progress tracking with multi-user support

export type ProficiencyLevel = 'new' | 'learning' | 'familiar' | 'mastered';
export type InputMethod = 'speech' | 'keyboard';

// User Profile
export interface UserProfile {
  userId: string;          // Primary Key: UUID v4
  name: string;            // 用戶暱稱
  avatar: string;          // Emoji 頭像
  themeColor: string;      // 主題顏色 (hex)
  createdAt: Date;         // 建立時間
  lastActiveAt: Date;      // 最後活躍時間

  // 統計快照（用於選擇畫面顯示）
  totalWordsLearned: number;
  currentStreak: number;
  longestStreak: number;
}

// Word Progress (per user)
export interface WordProgress {
  id: string;              // Primary Key: "userId_level_wordId"
  userId: string;          // 關聯用戶 (indexed)
  wordId: string;          // "level_wordId" (e.g., "3_25")
  word: string;            // 英文單字
  level: number;           // 級數
  totalAttempts: number;   // 總嘗試次數
  correctCount: number;    // 正確次數
  incorrectCount: number;  // 錯誤次數
  proficiencyLevel: ProficiencyLevel;
  firstLearnedAt: Date;    // 首次學習時間
  lastReviewedAt: Date;    // 最後複習時間
  nextReviewAt: Date;      // 建議下次複習時間
  correctStreak: number;   // 連續答對次數
  inputMethods: {          // 各種輸入方式的統計
    speech: { correct: number; incorrect: number };
    keyboard: { correct: number; incorrect: number };
  };
}

// Learning History (per user)
export interface LearningHistory {
  id: string;              // Primary Key: "userId_timestamp_wordId"
  userId: string;          // 關聯用戶 (indexed)
  wordId: string;          // 關聯到 wordProgress
  word: string;
  level: number;
  timestamp: Date;
  isCorrect: boolean;
  inputMethod: InputMethod;
  responseTime?: number;   // 反應時間（可選）
}

// Daily Stats (per user)
export interface DailyStats {
  id: string;              // Primary Key: "userId_YYYY-MM-DD"
  userId: string;          // 關聯用戶 (indexed)
  date: string;            // "YYYY-MM-DD"
  totalWords: number;      // 當日學習單字數
  newWords: number;        // 新學單字數
  reviewWords: number;     // 複習單字數
  correctCount: number;
  incorrectCount: number;
  studyTime: number;       // 學習時長（秒）
  levels: number[];        // 學習了哪些級數
}

// User Settings (per user)
export interface UserSettings {
  userId: string;          // Primary Key: userId
  startDate: Date;         // 開始使用日期
  currentStreak: number;   // 當前連續天數
  longestStreak: number;   // 最長連續天數
  totalStudyTime: number;  // 總學習時長
  enableReminders: boolean; // 是否啟用複習提醒
  dailyGoal: number;       // 每日學習目標
}

// App Settings (global)
export interface AppSettings {
  id: 'app';               // Primary Key (single record)
  lastActiveUserId: string | null; // 最後使用的用戶 ID
  showProfileSelector: boolean;    // 啟動時是否顯示選擇畫面
  version: number;         // Schema 版本
}

// Database Schema
export interface VBCardsDB {
  userProfiles: UserProfile;
  wordProgress: WordProgress;
  learningHistory: LearningHistory;
  dailyStats: DailyStats;
  userSettings: UserSettings;
  appSettings: AppSettings;
}
