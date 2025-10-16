import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile } from '../types/learning';
import {
  initDB,
  getProfile,
  updateLastActive,
  setLastActiveUser,
  getLastActiveUserId,
} from '../utils/db';

interface UserContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [currentUser, setCurrentUserState] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize database and load last active user on mount
  useEffect(() => {
    async function initialize() {
      try {
        // Initialize database
        await initDB();

        // Try to load last active user
        const lastUserId = await getLastActiveUserId();

        if (lastUserId) {
          const user = await getProfile(lastUserId);
          if (user) {
            setCurrentUserState(user);
            await updateLastActive(lastUserId);
          }
        }
      } catch (error) {
        console.error('Failed to initialize user context:', error);
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, []);

  const setCurrentUser = async (user: UserProfile | null) => {
    setCurrentUserState(user);

    if (user) {
      await setLastActiveUser(user.userId);
      await updateLastActive(user.userId);
    } else {
      await setLastActiveUser(null);
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
