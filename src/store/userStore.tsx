import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';


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
  firstName: 'Wincel',
  lastName: 'Crusit',
  email: 'user@institution.gov.ph',
  role: 'Forensic Analyst',
  organization: 'PNP Crime Laboratory',
  avatarUri: null,
};

const KEY = 'wincel_pogi_key_user_profile';

const log = {
  info: (_tag: string, _message: string, _data?: any) => {},
  error: (tag: string, message: string, error?: any) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ${tag} | ❌ ${message}`, error ? { error: error.message, stack: error.stack } : '');
  },
  warn: (tag: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] ${tag} | ⚠️  ${message}`, data ? data : '');
  },
};

const UserContext = createContext<UserStore | null>(null);

function shallowEqualProfile(a: UserProfile, b: UserProfile) {
  const keys = Object.keys({ ...a, ...b }) as (keyof UserProfile)[];
  return keys.every((k) => a[k] === b[k]);
}

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<UserProfile>(DEFAULT_USER);

  const load = useCallback(async () => {
    const startTime = performance.now();
    try {
      log.info('UserStore', 'Starting load operation', { storageKey: KEY });

      if (!AsyncStorage) {
        throw new Error('AsyncStorage is null - native module not properly linked');
      }

      const raw = await AsyncStorage.getItem(KEY);
      const loadTime = (performance.now() - startTime).toFixed(2);

      log.info('UserStore', `Retrieved raw data from storage (${loadTime}ms)`, {
        rawLength: raw?.length,
        hasData: !!raw,
      });

      if (!raw) {
        log.info('UserStore', 'No stored profile found, using default user', { defaultUser: DEFAULT_USER });
        return;
      }

      try {
        const parsed = JSON.parse(raw);
        setUserState((prev) => {
          const next = { ...prev, ...parsed };
          if (shallowEqualProfile(prev, next)) {
            log.info('UserStore', 'Loaded profile identical to current state, skipping update');
            return prev;
          }
          log.info('UserStore', 'Updating user state', { previous: prev, next });
          return next;
        });
      } catch (parseError) {
        log.error('UserStore', 'Failed to parse stored JSON', parseError);
      }
    } catch (e) {
      const error = e as Error;
      log.error('UserStore', 'Failed to load user profile', error);
      log.warn('UserStore', 'Using default user as fallback');
    }
  }, []);

  const persist = useCallback(async (next: UserProfile) => {
    const startTime = performance.now();
    try {
      log.info('UserStore', 'Starting persist operation', { user: next });

      if (!AsyncStorage) {
        throw new Error('AsyncStorage is null - cannot persist data');
      }

      const jsonString = JSON.stringify(next);
      await AsyncStorage.setItem(KEY, jsonString);

      const persistTime = (performance.now() - startTime).toFixed(2);
      log.info('UserStore', `✓ Profile persisted successfully (${persistTime}ms)`, { dataSize: jsonString.length });
    } catch (e) {
      const error = e as Error;
      log.error('UserStore', 'Failed to persist user profile', error);
    }
  }, []);

 const copyImageToDocuments = useCallback(async (uri: string): Promise<string> => {
    const startTime = performance.now();
    log.info('UserStore:Image', 'Starting image copy operation', { sourceUri: uri });

    const documentsRoot = FileSystem.documentDirectory;

    if (!documentsRoot) {
      log.warn('UserStore:Image', 'Document directory not available - using original URI', { uri });
      return uri;
    }

    if (uri.startsWith(documentsRoot)) {
      log.info('UserStore:Image', 'Image already in documents, skipping copy', { uri });
      return uri;
    }

    const avatarDirectory = `${documentsRoot}avatars/`;
    const extension = getFileExtension(uri) || 'jpg';
    const fileName = `avatar-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
    const targetUri = `${avatarDirectory}${fileName}`;

    log.info('UserStore:Image', 'Prepared copy target', { avatarDirectory, fileName, targetUri });

    try {
      await FileSystem.makeDirectoryAsync(avatarDirectory, { intermediates: true });

      if (uri.startsWith('content://')) {
        log.info('UserStore:Image', 'Using downloadAsync for content:// URI (Android)');
        await FileSystem.downloadAsync(uri, targetUri);
      } else {
        log.info('UserStore:Image', 'Using copyAsync for file URI');
        await FileSystem.copyAsync({ from: uri, to: targetUri });
      }

      const copyTime = (performance.now() - startTime).toFixed(2);
      log.info('UserStore:Image', `✓ Image copied successfully (${copyTime}ms)`, { targetUri });
      return targetUri;
    } catch (e) {
      const error = e as Error;
      log.error('UserStore:Image', 'Failed to copy image', error);
      log.warn('UserStore:Image', 'Returning original URI as fallback');
      return uri;
    }
  }, []);

   const setUser = useCallback(
    async (u: Partial<UserProfile>) => {
      log.info('UserStore:SetUser', 'Setting user with partial data', { update: u });

      const normalizedAvatarUri = u.avatarUri ? await copyImageToDocuments(u.avatarUri) : u.avatarUri;

      // Functional update avoids a stale closure over `user`
      let nextRef: UserProfile | null = null;
      setUserState((prev) => {
        const next = { ...prev, ...u, avatarUri: normalizedAvatarUri ?? null } as UserProfile;
        nextRef = next;
        return next;
      });

      if (nextRef) {
        log.info('UserStore:SetUser', 'State updated, persisting to storage');
        await persist(nextRef);
      }
    },
    [copyImageToDocuments, persist],
  );

    useEffect(() => {
    log.info('UserProvider', '🚀 Provider mounted, checking AsyncStorage availability');

    if (!AsyncStorage) {
      log.error('UserProvider', 'AsyncStorage is not available - native module may not be linked');
      return;
    }

    log.info('UserProvider', '✓ AsyncStorage available, loading user profile');
    load();
  }, [load]);

    const value = useMemo<UserStore>(
    () => ({ user, setUser, load, copyImageToDocuments }),
    [user, setUser, load, copyImageToDocuments],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};



export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    log.error('UserStore:Hook', 'useUser called outside UserProvider');
    throw new Error('useUser must be used within UserProvider');
  }
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
