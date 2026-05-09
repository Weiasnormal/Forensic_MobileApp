import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type UserProfile = {
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  organization?: string;
  avatarUri?: string | null;
};

type UserStore = {
  user: UserProfile;
  setUser: (u: Partial<UserProfile>) => Promise<void>;
  load: () => Promise<void>;
  copyImageToDocuments: (uri: string) => Promise<string>;
};

const DEFAULT_USER: UserProfile = {
  firstName: 'Maria',
  lastName: 'Cruz',
  email: 'user@institution.gov.ph',
  role: 'Forensic Analyst',
  organization: 'PNP Crime Laboratory',
  avatarUri: null,
};

const KEY = 'app_user_profile_v1';

const UserContext = createContext<UserStore | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<UserProfile>(DEFAULT_USER);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setUserState((s) => ({ ...s, ...parsed }));
      }
    } catch (e) {
      // ignore
    }
  };

  const persist = async (next: UserProfile) => {
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(next));
    } catch (e) {
      // ignore
    }
  };

  const copyImageToDocuments = async (uri: string): Promise<string> => {
    // For now, just return the URI as-is
    // The image picker URI should be accessible while the app is running
    return uri;
  };

  const setUser = async (u: Partial<UserProfile>) => {
    const next = { ...user, ...u } as UserProfile;
    setUserState(next);
    await persist(next);
  };

  return (
    <UserContext.Provider value={{ user, setUser, load, copyImageToDocuments }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
};

export default UserProvider;
