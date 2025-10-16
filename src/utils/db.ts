import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { VBCardsDB, UserProfile, AppSettings } from '../types/learning';

const DB_NAME = 'VBCardsLearning';
const DB_VERSION = 2;

// IndexedDB Schema definition
interface VBCardsDBSchema extends DBSchema {
  userProfiles: {
    key: string;
    value: UserProfile;
    indexes: { 'by-lastActive': Date };
  };
  wordProgress: {
    key: string;
    value: VBCardsDB['wordProgress'];
    indexes: { 'by-userId': string; 'by-userId-level': [string, number] };
  };
  learningHistory: {
    key: string;
    value: VBCardsDB['learningHistory'];
    indexes: { 'by-userId': string; 'by-userId-date': [string, Date] };
  };
  dailyStats: {
    key: string;
    value: VBCardsDB['dailyStats'];
    indexes: { 'by-userId': string };
  };
  userSettings: {
    key: string;
    value: VBCardsDB['userSettings'];
  };
  appSettings: {
    key: string;
    value: AppSettings;
  };
}

let dbInstance: IDBPDatabase<VBCardsDBSchema> | null = null;

/**
 * Initialize and open the IndexedDB database
 */
export async function initDB(): Promise<IDBPDatabase<VBCardsDBSchema>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<VBCardsDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`);

      // Create userProfiles store
      if (!db.objectStoreNames.contains('userProfiles')) {
        const userStore = db.createObjectStore('userProfiles', { keyPath: 'userId' });
        userStore.createIndex('by-lastActive', 'lastActiveAt');
      }

      // Create wordProgress store
      if (!db.objectStoreNames.contains('wordProgress')) {
        const wordStore = db.createObjectStore('wordProgress', { keyPath: 'id' });
        wordStore.createIndex('by-userId', 'userId');
        wordStore.createIndex('by-userId-level', ['userId', 'level']);
      }

      // Create learningHistory store
      if (!db.objectStoreNames.contains('learningHistory')) {
        const historyStore = db.createObjectStore('learningHistory', { keyPath: 'id' });
        historyStore.createIndex('by-userId', 'userId');
        historyStore.createIndex('by-userId-date', ['userId', 'timestamp']);
      }

      // Create dailyStats store
      if (!db.objectStoreNames.contains('dailyStats')) {
        const statsStore = db.createObjectStore('dailyStats', { keyPath: 'id' });
        statsStore.createIndex('by-userId', 'userId');
      }

      // Create userSettings store
      if (!db.objectStoreNames.contains('userSettings')) {
        db.createObjectStore('userSettings', { keyPath: 'userId' });
      }

      // Create appSettings store
      if (!db.objectStoreNames.contains('appSettings')) {
        db.createObjectStore('appSettings', { keyPath: 'id' });
      }
    },
  });

  return dbInstance;
}

/**
 * Get the database instance
 */
export async function getDB(): Promise<IDBPDatabase<VBCardsDBSchema>> {
  if (!dbInstance) {
    return await initDB();
  }
  return dbInstance;
}

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ==================== User Profile Operations ====================

/**
 * Get all user profiles, sorted by last active date
 */
export async function getAllProfiles(): Promise<UserProfile[]> {
  const db = await getDB();
  const profiles = await db.getAllFromIndex('userProfiles', 'by-lastActive');
  return profiles.reverse(); // Most recent first
}

/**
 * Get a specific user profile by ID
 */
export async function getProfile(userId: string): Promise<UserProfile | undefined> {
  const db = await getDB();
  return await db.get('userProfiles', userId);
}

/**
 * Create a new user profile
 */
export async function createProfile(
  name: string,
  avatar: string,
  themeColor: string
): Promise<UserProfile> {
  const db = await getDB();

  const newProfile: UserProfile = {
    userId: generateUUID(),
    name: name.trim(),
    avatar,
    themeColor,
    createdAt: new Date(),
    lastActiveAt: new Date(),
    totalWordsLearned: 0,
    currentStreak: 0,
    longestStreak: 0,
  };

  await db.put('userProfiles', newProfile);

  // Create default user settings
  const defaultSettings: VBCardsDB['userSettings'] = {
    userId: newProfile.userId,
    startDate: new Date(),
    currentStreak: 0,
    longestStreak: 0,
    totalStudyTime: 0,
    enableReminders: true,
    dailyGoal: 10,
  };

  await db.put('userSettings', defaultSettings);

  return newProfile;
}

/**
 * Update a user profile
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'userId' | 'createdAt'>>
): Promise<void> {
  const db = await getDB();
  const profile = await db.get('userProfiles', userId);

  if (!profile) {
    throw new Error(`Profile not found: ${userId}`);
  }

  const updatedProfile: UserProfile = {
    ...profile,
    ...updates,
  };

  await db.put('userProfiles', updatedProfile);
}

/**
 * Update profile's last active time
 */
export async function updateLastActive(userId: string): Promise<void> {
  await updateProfile(userId, { lastActiveAt: new Date() });
}

/**
 * Delete a user profile and all associated data
 */
export async function deleteProfile(userId: string): Promise<void> {
  const db = await getDB();

  // Delete profile
  await db.delete('userProfiles', userId);

  // Delete all wordProgress for this user
  const wordProgressKeys = await db.getAllKeysFromIndex('wordProgress', 'by-userId', userId);
  for (const key of wordProgressKeys) {
    await db.delete('wordProgress', key);
  }

  // Delete all learningHistory for this user
  const historyKeys = await db.getAllKeysFromIndex('learningHistory', 'by-userId', userId);
  for (const key of historyKeys) {
    await db.delete('learningHistory', key);
  }

  // Delete all dailyStats for this user
  const statsKeys = await db.getAllKeysFromIndex('dailyStats', 'by-userId', userId);
  for (const key of statsKeys) {
    await db.delete('dailyStats', key);
  }

  // Delete userSettings
  await db.delete('userSettings', userId);
}

// ==================== App Settings Operations ====================

/**
 * Get app settings
 */
export async function getAppSettings(): Promise<AppSettings> {
  const db = await getDB();
  let settings = await db.get('appSettings', 'app');

  if (!settings) {
    // Create default settings
    settings = {
      id: 'app',
      lastActiveUserId: null,
      showProfileSelector: true,
      version: DB_VERSION,
    };
    await db.put('appSettings', settings);
  }

  return settings;
}

/**
 * Update app settings
 */
export async function updateAppSettings(
  updates: Partial<Omit<AppSettings, 'id'>>
): Promise<void> {
  const db = await getDB();
  const settings = await getAppSettings();

  const updatedSettings: AppSettings = {
    ...settings,
    ...updates,
  };

  await db.put('appSettings', updatedSettings);
}

/**
 * Set the last active user
 */
export async function setLastActiveUser(userId: string | null): Promise<void> {
  await updateAppSettings({ lastActiveUserId: userId });
}

/**
 * Get the last active user ID
 */
export async function getLastActiveUserId(): Promise<string | null> {
  const settings = await getAppSettings();
  return settings.lastActiveUserId;
}
