// Storage Access Framework (SAF) helpers — lets the dev-scan screens write into
// a user-picked folder tree under the real Android Downloads directory
// (Avera/mlkit_dataset/<case>/...) instead of the app-private sandbox that
// localScanStorage.ts writes to.
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { StorageAccessFramework } = FileSystem;

const ROOT_URI_KEY = 'devscan:safRootUri';
const LAST_CASE_FOLDER_KEY = 'devscan:lastCaseFolder';

const APP_FOLDER = 'Avera';
const DATASET_FOLDER = 'mlkit_dataset';
const FLAGGED_FOLDER = 'flagged_signatures';

function displayNameFromUri(uri: string): string {
  const decoded = decodeURIComponent(uri);
  const lastSlash = decoded.lastIndexOf('/');
  return lastSlash >= 0 ? decoded.substring(lastSlash + 1) : decoded;
}

async function findChildUri(parentUri: string, name: string): Promise<string | null> {
  const children = await StorageAccessFramework.readDirectoryAsync(parentUri);
  for (const uri of children) {
    if (displayNameFromUri(uri) === name) return uri;
  }
  return null;
}

async function ensureDirectory(parentUri: string, name: string): Promise<string> {
  const existing = await findChildUri(parentUri, name);
  if (existing) return existing;
  return StorageAccessFramework.makeDirectoryAsync(parentUri, name);
}

/** Prompts the user (once) to pick a root folder — they should choose "Download". Persisted after grant. */
export async function getRootDirectoryUri(forcePrompt = false): Promise<string> {
  if (!forcePrompt) {
    const stored = await AsyncStorage.getItem(ROOT_URI_KEY);
    if (stored) return stored;
  }
  const result = await StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!result.granted) {
    throw new Error('Folder access was not granted.');
  }
  await AsyncStorage.setItem(ROOT_URI_KEY, result.directoryUri);
  return result.directoryUri;
}

export async function hasStoredRootDirectory(): Promise<boolean> {
  const stored = await AsyncStorage.getItem(ROOT_URI_KEY);
  return !!stored;
}

export async function resetRootDirectory(): Promise<void> {
  await AsyncStorage.removeItem(ROOT_URI_KEY);
}

export async function getLastCaseFolder(): Promise<string | null> {
  return AsyncStorage.getItem(LAST_CASE_FOLDER_KEY);
}

async function rememberCaseFolder(name: string): Promise<void> {
  await AsyncStorage.setItem(LAST_CASE_FOLDER_KEY, name);
}

export interface CaseFolders {
  caseFolderUri: string;
  flaggedFolderUri: string;
  displayPath: string;
}

/**
 * Ensures Avera/mlkit_dataset/<caseFolder> and Avera/mlkit_dataset/flagged_signatures
 * exist under the user-chosen root, reusing existing folders by name instead of
 * letting SAF auto-suffix duplicates (e.g. "P001 (1)").
 */
export async function ensureCaseFolders(caseFolder: string): Promise<CaseFolders> {
  const rootUri = await getRootDirectoryUri();
  const appUri = await ensureDirectory(rootUri, APP_FOLDER);
  const datasetUri = await ensureDirectory(appUri, DATASET_FOLDER);
  const caseFolderUri = await ensureDirectory(datasetUri, caseFolder);
  const flaggedFolderUri = await ensureDirectory(datasetUri, FLAGGED_FOLDER);
  await rememberCaseFolder(caseFolder);
  return {
    caseFolderUri,
    flaggedFolderUri,
    displayPath: `Download/${APP_FOLDER}/${DATASET_FOLDER}/${caseFolder}`,
  };
}

export async function writeImageToFolder(
  sourceUri: string,
  folderUri: string,
  filename: string,
): Promise<string> {
  const existing = await findChildUri(folderUri, filename);
  if (existing) {
    await StorageAccessFramework.deleteAsync(existing);
  }

  const base64 = await FileSystem.readAsStringAsync(sourceUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const mimeType = filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
  const targetUri = await StorageAccessFramework.createFileAsync(folderUri, filename, mimeType);
  await FileSystem.writeAsStringAsync(targetUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return targetUri;
}