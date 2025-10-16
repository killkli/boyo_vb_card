import type { LevelManifest, LevelMetadata, FlashCardData } from '../types/vocabulary';

/**
 * Load manifest file for a specific level
 * @param level Level number (1-18)
 * @returns Promise<LevelManifest>
 */
export async function loadLevelManifest(level: number): Promise<LevelManifest> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/level_${level}_manifest.json`);
    if (!response.ok) {
      throw new Error(`Failed to load manifest for level ${level}`);
    }
    const manifest: LevelManifest = await response.json();
    return manifest;
  } catch (error) {
    console.error(`Error loading level ${level} manifest:`, error);
    throw error;
  }
}

/**
 * Load metadata for all 18 levels (without full word lists)
 * @returns Promise<LevelMetadata[]>
 */
export async function loadAllLevelsMetadata(): Promise<LevelMetadata[]> {
  const levels: LevelMetadata[] = [];

  for (let i = 1; i <= 18; i++) {
    try {
      const manifest = await loadLevelManifest(i);
      levels.push({
        level: manifest.level,
        levelName: manifest.levelName,
        totalWords: manifest.totalWords,
      });
    } catch (error) {
      console.error(`Failed to load metadata for level ${i}:`, error);
    }
  }

  return levels;
}

/**
 * Convert vocabulary word to flashcard data format
 * @param word VocabularyWord from manifest
 * @returns FlashCardData
 */
export function toFlashCardData(word: any): FlashCardData {
  return {
    word: word.word,
    meaning: word.meaning,
    imagePath: `${import.meta.env.BASE_URL}data/level_${word.level}/${word.filename}`,
    level: word.level,
    id: word.id,
  };
}

/**
 * Load flashcards for a specific level
 * @param level Level number (1-18)
 * @returns Promise<FlashCardData[]>
 */
export async function loadLevelFlashCards(level: number): Promise<FlashCardData[]> {
  const manifest = await loadLevelManifest(level);
  return manifest.results.map(toFlashCardData);
}
