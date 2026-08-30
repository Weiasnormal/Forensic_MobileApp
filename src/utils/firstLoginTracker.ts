import AsyncStorage from '@react-native-async-storage/async-storage';

const SEEN_USERS_KEY = 'avera_seen_user_ids';

async function getSeenUserIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(SEEN_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}


export async function isFirstLoginForUser(userId: string): Promise<boolean> {
  if (!userId) return false;
  const seen = await getSeenUserIds();
  return !seen.includes(userId);
}

export async function markUserAsSeen(userId: string): Promise<void> {
  if (!userId) return;
  const seen = await getSeenUserIds();
  if (seen.includes(userId)) return;

  try {
    await AsyncStorage.setItem(SEEN_USERS_KEY, JSON.stringify([...seen, userId]));
  } catch {
  }
}