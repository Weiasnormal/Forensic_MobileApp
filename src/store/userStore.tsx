import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
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

const KEY = 'wincel_pogi_key_user_profile';

const UserContext = createContext<UserStore | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<UserProfile>(DEFAULT_USER);

  useEffect(() => {
    console.log('[UserStore] provider mounted - loading profile');
    load();
  }, []);

  const load = async () => {
    try {
      console.log('[UserStore] load:start');
      const raw = await AsyncStorage.getItem(KEY);
      console.log('[UserStore] load:raw', raw);
      if (raw) {
        const parsed = JSON.parse(raw);
        console.log('[UserStore] load:parsed', parsed);
        setUserState((s) => ({ ...s, ...parsed }));
      }
    } catch (e) {
      console.warn('[UserStore] load:failed', e);
    }
  };

  const persist = async (next: UserProfile) => {
    try {
      console.log('[UserStore] persist:start', next);
      await AsyncStorage.setItem(KEY, JSON.stringify(next));
      console.log('[UserStore] persist:success');
    } catch (e) {
      console.warn('[UserStore] persist:failed', e);
    }
  };

  const copyImageToDocuments = async (uri: string): Promise<string> => {
    console.log('[UserStore] copyImageToDocuments:start', { uri });
    const documentsRoot = (FileSystem as any).documentDirectory;

    if (!documentsRoot) {
      console.warn('[UserStore] copyImageToDocuments:noDocumentDirectory');
      return uri;
    }

    if (uri.startsWith(documentsRoot)) {
      console.log('[UserStore] copyImageToDocuments:alreadyStable', { uri });
      return uri;
    }

    const avatarDirectory = `${documentsRoot}avatars/`;
    const extension = getFileExtension(uri) || 'jpg';
    const fileName = `avatar-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
    const targetUri = `${avatarDirectory}${fileName}`;

    console.log('[UserStore] copyImageToDocuments:target', {
      avatarDirectory,
      targetUri,
    });

    try {
      await (FileSystem as any).makeDirectoryAsync(avatarDirectory, { intermediates: true });
      if (uri.startsWith('content://')) {
        console.log('[UserStore] copyImageToDocuments:using downloadAsync for content URI');
        await (FileSystem as any).downloadAsync(uri, targetUri);
      } else {
        await (FileSystem as any).copyAsync({ from: uri, to: targetUri });
      }
      console.log('[UserStore] copyImageToDocuments:success', { targetUri });
      return targetUri;
    } catch (e) {
      console.warn('[UserStore] copyImageToDocuments:failed', e);
      return uri;
    }
  };

  const setUser = async (u: Partial<UserProfile>) => {
    const normalizedAvatarUri = u.avatarUri ? await copyImageToDocuments(u.avatarUri) : u.avatarUri;
    const next = { ...user, ...u, avatarUri: normalizedAvatarUri ?? null } as UserProfile;
    console.log('[UserStore] setUser:next', {
      previousAvatarUri: user.avatarUri,
      incomingAvatarUri: u.avatarUri,
      normalizedAvatarUri,
      nextAvatarUri: next.avatarUri,
      next,
    });
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

function getFileExtension(uri: string) {
  const sanitizedUri = uri.split('?')[0].split('#')[0];
  const lastSegment = sanitizedUri.split('/').pop() || '';
  const dotIndex = lastSegment.lastIndexOf('.');
  if (dotIndex === -1) return '';
  return lastSegment.slice(dotIndex + 1).toLowerCase();
}
