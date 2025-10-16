import { useState, useEffect } from 'react';
import { LevelSelector } from '../components/LevelSelector';
import { loadAllLevelsMetadata } from '../utils/dataLoader';
import type { LevelMetadata } from '../types/vocabulary';

export function Home() {
  const [levels, setLevels] = useState<LevelMetadata[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <LevelSelector levels={levels} loading={loading} />
    </div>
  );
}
