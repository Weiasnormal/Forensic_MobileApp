import {
    fetchCurrentUser,
    getProfilePictureUrl,
} from "@/services/authApi";
import type { SignatureAnalysisViewMode } from "@/services/signatureAnalysis";
import { normalizePersonName } from "@/utils/validation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useAuthStore } from "./authStore";

type UserProfile = {
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  organization?: string;
  dailyCaseLimit?: number | null;
  avatarUri?: string | null;
  defaultResultView?: SignatureAnalysisViewMode;
};

type UserStore = {
  user: UserProfile;
  setUser: (u: Partial<UserProfile>) => Promise<void>;
  load: () => Promise<void>;
  copyImageToDocuments: (uri: string) => Promise<string>;
};

const DEFAULT_USER: UserProfile = {
  firstName: "",
  lastName: "",
  email: "",
  role: "",
  organization: "",
  avatarUri: null,
};

const KEY = "avera_user_profile_metadata";

function getStorageKey(userId?: string, email?: string) {
  const identity = userId?.trim() || email?.trim().toLowerCase();
  return identity ? `${KEY}:${identity}` : KEY;
}

const log = {
  info: (_tag: string, _message: string, _data?: any) => {},
  error: (tag: string, message: string, error?: any) => {
    const timestamp = new Date().toISOString();
    console.error(
      `[${timestamp}] ${tag} | ❌ ${message}`,
      error ? { error: error.message, stack: error.stack } : "",
    );
  },
  warn: (tag: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] ${tag} | ⚠️  ${message}`, data ? data : "");
  },
};

const UserContext = createContext<UserStore | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<UserProfile>(DEFAULT_USER);
  const userRef = useRef<UserProfile>(DEFAULT_USER);
  const previousAuthUserId = useRef<string | null>(null);
  const authUserId = useAuthStore((state) => state.user?.userId);
  const authEmail = useAuthStore((state) => state.user?.email);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isTokenExpired = useAuthStore((state) => state.isTokenExpired);

  const load = useCallback(async () => {
    const startTime = performance.now();
    const loadUserId = authUserId?.trim();
    const loadEmail = authEmail?.trim().toLowerCase();
    try {
      const storageKey = getStorageKey(loadUserId, loadEmail);
      log.info("UserStore", "Starting load operation", { storageKey });

      if (!AsyncStorage) {
        throw new Error(
          "AsyncStorage is null - native module not properly linked",
        );
      }

      const raw = await AsyncStorage.getItem(storageKey);
      const loadTime = (performance.now() - startTime).toFixed(2);

      log.info("UserStore", `Retrieved raw data from storage (${loadTime}ms)`, {
        rawLength: raw?.length,
        hasData: !!raw,
      });

      let localProfile: Partial<UserProfile> = {};
      if (raw) {
        try {
          localProfile = JSON.parse(raw) as Partial<UserProfile>;
        } catch (parseError) {
          log.error(
            "UserStore",
            "Failed to parse stored profile metadata",
            parseError,
          );
        }
      }

      if (!accessToken || isTokenExpired()) {
        const currentAuthUser = useAuthStore.getState().user;
        if (
          currentAuthUser?.userId?.trim() !== loadUserId ||
          currentAuthUser?.email?.trim().toLowerCase() !== loadEmail
        ) {
          return;
        }
        const nextUser = {
          ...DEFAULT_USER,
          ...localProfile,
          firstName: normalizePersonName(localProfile.firstName ?? ""),
          lastName: normalizePersonName(localProfile.lastName ?? ""),
          avatarUri: localProfile.avatarUri ?? null,
        };
        userRef.current = nextUser;
        setUserState(nextUser);
        return;
      }

      const remoteProfile = await fetchCurrentUser(accessToken);
      const currentAuthUser = useAuthStore.getState().user;
      if (
        currentAuthUser?.userId?.trim() !== loadUserId ||
        currentAuthUser?.email?.trim().toLowerCase() !== loadEmail
      ) {
        return;
      }
      let remoteAvatarUri = remoteProfile.avatarUri ?? null;
      if (!localProfile.avatarUri && !remoteAvatarUri) {
        const avatarUri = `${FileSystem.documentDirectory}avatars/avatar-current`;
        try {
          await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}avatars/`, {
            intermediates: true,
          });
          const download = await FileSystem.downloadAsync(
            getProfilePictureUrl(),
            avatarUri,
            { headers: { Authorization: `Bearer ${accessToken}` } },
          );
          remoteAvatarUri = download.uri;
        } catch {
          remoteAvatarUri = null;
        }
      }

      const nextUser = {
        firstName: normalizePersonName(
          remoteProfile.firstName?.trim() ||
            localProfile.firstName?.trim() ||
            "",
        ),
        lastName: normalizePersonName(
          remoteProfile.lastName?.trim() || localProfile.lastName?.trim() || "",
        ),
        email: remoteProfile.email?.trim() || authEmail || "",
        role: remoteProfile.role?.trim() || localProfile.role?.trim() || "",
        organization:
          remoteProfile.organization?.trim() ||
          localProfile.organization?.trim() ||
          "",
        dailyCaseLimit: remoteProfile.dailyCaseLimit ?? null,
        avatarUri: localProfile.avatarUri ?? remoteAvatarUri,
        defaultResultView: localProfile.defaultResultView,
      };
      userRef.current = nextUser;
      setUserState(nextUser);
    } catch (e) {
      const error = e as Error;
      log.error("UserStore", "Failed to load user profile", error);
      const currentAuthUser = useAuthStore.getState().user;
      if (
        currentAuthUser?.userId?.trim() !== loadUserId ||
        currentAuthUser?.email?.trim().toLowerCase() !== loadEmail
      ) {
        return;
      }
      // Keep the last usable profile when a refresh is temporarily unavailable.
      setUserState((prev) => {
        userRef.current = prev;
        return prev;
      });
    }
  }, [accessToken, authEmail, authUserId, isTokenExpired]);

  const persist = useCallback(
    async (next: UserProfile) => {
      const startTime = performance.now();
      try {
        log.info("UserStore", "Starting persist operation", { user: next });

        if (!AsyncStorage) {
          throw new Error("AsyncStorage is null - cannot persist data");
        }

        const jsonString = JSON.stringify(next);
        await AsyncStorage.setItem(
          getStorageKey(authUserId, next.email || authEmail),
          jsonString,
        );

        const persistTime = (performance.now() - startTime).toFixed(2);
        log.info(
          "UserStore",
          `✓ Profile persisted successfully (${persistTime}ms)`,
          { dataSize: jsonString.length },
        );
      } catch (e) {
        const error = e as Error;
        log.error("UserStore", "Failed to persist user profile", error);
      }
    },
    [authEmail, authUserId],
  );

  useEffect(() => {
    const nextAuthUserId = authUserId?.trim() || null;

    if (!nextAuthUserId) {
      previousAuthUserId.current = null;
      userRef.current = DEFAULT_USER;
      setUserState(DEFAULT_USER);
      return;
    }

    if (previousAuthUserId.current !== nextAuthUserId) {
      previousAuthUserId.current = nextAuthUserId;
      const nextUser = { ...DEFAULT_USER, email: authEmail || "" };
      userRef.current = nextUser;
      setUserState(nextUser);
    }
  }, [authEmail, authUserId]);

  const copyImageToDocuments = useCallback(
    async (uri: string): Promise<string> => {
      const startTime = performance.now();
      log.info("UserStore:Image", "Starting image copy operation", {
        sourceUri: uri,
      });

      const documentsRoot = FileSystem.documentDirectory;

      if (!documentsRoot) {
        log.warn(
          "UserStore:Image",
          "Document directory not available - using original URI",
          { uri },
        );
        return uri;
      }

      if (uri.startsWith(documentsRoot)) {
        log.info(
          "UserStore:Image",
          "Image already in documents, skipping copy",
          { uri },
        );
        return uri;
      }

      const avatarDirectory = `${documentsRoot}avatars/`;
      const extension = getFileExtension(uri) || "jpg";
      const fileName = `avatar-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
      const targetUri = `${avatarDirectory}${fileName}`;

      log.info("UserStore:Image", "Prepared copy target", {
        avatarDirectory,
        fileName,
        targetUri,
      });

      try {
        await FileSystem.makeDirectoryAsync(avatarDirectory, {
          intermediates: true,
        });

        if (uri.startsWith("content://")) {
          log.info(
            "UserStore:Image",
            "Using downloadAsync for content:// URI (Android)",
          );
          await FileSystem.downloadAsync(uri, targetUri);
        } else {
          log.info("UserStore:Image", "Using copyAsync for file URI");
          await FileSystem.copyAsync({ from: uri, to: targetUri });
        }

        const copyTime = (performance.now() - startTime).toFixed(2);
        log.info(
          "UserStore:Image",
          `✓ Image copied successfully (${copyTime}ms)`,
          { targetUri },
        );
        return targetUri;
      } catch (e) {
        const error = e as Error;
        log.error("UserStore:Image", "Failed to copy image", error);
        log.warn("UserStore:Image", "Returning original URI as fallback");
        return uri;
      }
    },
    [],
  );

  const setUser = useCallback(
    async (u: Partial<UserProfile>) => {
      log.info("UserStore:SetUser", "Setting user with partial data", {
        update: u,
      });

      const normalizedAvatarUri =
        u.avatarUri === undefined
          ? userRef.current.avatarUri
          : u.avatarUri
            ? await copyImageToDocuments(u.avatarUri)
            : null;
      const next = {
        ...userRef.current,
        ...u,
        firstName:
          u.firstName === undefined
            ? userRef.current.firstName
            : normalizePersonName(u.firstName),
        lastName:
          u.lastName === undefined
            ? userRef.current.lastName
            : normalizePersonName(u.lastName),
        avatarUri: normalizedAvatarUri ?? null,
      } as UserProfile;
      userRef.current = next;
      setUserState(next);
      log.info("UserStore:SetUser", "State updated, persisting to storage");
      await persist(next);
    },
    [copyImageToDocuments, persist],
  );

  useEffect(() => {
    log.info(
      "UserProvider",
      "🚀 Provider mounted, checking AsyncStorage availability",
    );

    if (!AsyncStorage) {
      log.error(
        "UserProvider",
        "AsyncStorage is not available - native module may not be linked",
      );
      return;
    }

    log.info("UserProvider", "✓ AsyncStorage available, loading user profile");
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
    log.error("UserStore:Hook", "useUser called outside UserProvider");
    throw new Error("useUser must be used within UserProvider");
  }
  return ctx;
};

export default UserProvider;

function getFileExtension(uri: string) {
  const sanitizedUri = uri.split("?")[0].split("#")[0];
  const lastSegment = sanitizedUri.split("/").pop() || "";
  const dotIndex = lastSegment.lastIndexOf(".");
  if (dotIndex === -1) return "";
  return lastSegment.slice(dotIndex + 1).toLowerCase();
}
