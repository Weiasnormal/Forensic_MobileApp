import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';

const DEV_SCAN_DIRECTORY = `${FileSystem.documentDirectory ?? ''}dev-scans/`;

async function ensureDevScanDirectory() {
  await FileSystem.makeDirectoryAsync(DEV_SCAN_DIRECTORY, { intermediates: true }).catch(() => {});
}

export function sanitizeFilename(rawName: string): string {
  const withoutExt = rawName.trim().replace(/\.png$/i, '') || 'scan';
  const safe = withoutExt.replace(/[^a-zA-Z0-9_\-]/g, '_');
  return `${safe}.png`;
}

export async function saveScanLocally(sourceUri: string, filename: string): Promise<string> {
  await ensureDevScanDirectory();

  const pngResult = await ImageManipulator.manipulateAsync(sourceUri, [], {
    format: ImageManipulator.SaveFormat.PNG,
  });

  const targetUri = `${DEV_SCAN_DIRECTORY}${sanitizeFilename(filename)}`;
  await FileSystem.copyAsync({ from: pngResult.uri, to: targetUri });
  return targetUri;
}

export function getDevScanDirectory() {
  return DEV_SCAN_DIRECTORY;
}