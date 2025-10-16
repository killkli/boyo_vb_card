// TypeScript interfaces for vocabulary data

export interface VocabularyWord {
  word: string;
  meaning: string;
  level: number;
  boyo_id: number;
  id: number;
  filename: string;
  filepath: string;
  success: boolean;
}

export interface LevelManifest {
  level: number;
  levelName: string;
  totalWords: number;
  successCount: number;
  errorCount: number;
  outputDir: string;
  results: VocabularyWord[];
}

export interface LevelMetadata {
  level: number;
  levelName: string;
  totalWords: number;
}

export interface FlashCardData {
  word: string;
  meaning: string;
  imagePath: string;
  level: number;
  id: number;
}
