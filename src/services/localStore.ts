import AsyncStorage from "@react-native-async-storage/async-storage";

export async function readLocalCollection<T>(key: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

export async function writeLocalCollection<T>(key: string, items: T[]) {
  await AsyncStorage.setItem(key, JSON.stringify(items));
}

export async function appendLocalItem<T extends { id: string }>(
  key: string,
  item: T
) {
  const items = await readLocalCollection<T>(key);
  items.unshift(item);
  await writeLocalCollection(key, items);
  return item;
}

export async function updateLocalItem<T extends { id: string }>(
  key: string,
  id: string,
  patch: Partial<T>
) {
  const items = await readLocalCollection<T>(key);
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  items[index] = { ...items[index], ...patch };
  await writeLocalCollection(key, items);
  return items[index];
}

export async function getLocalItem<T extends { id: string }>(
  key: string,
  id: string
) {
  const items = await readLocalCollection<T>(key);
  return items.find((item) => item.id === id) || null;
}

export async function deleteLocalItem<T extends { id: string }>(
  key: string,
  id: string
) {
  const items = await readLocalCollection<T>(key);
  await writeLocalCollection(
    key,
    items.filter((item) => item.id !== id)
  );
}

export const LOCAL_KEYS = {
  sos: "LOCAL_SOS_INCIDENTS",
  reports: "LOCAL_INCIDENT_REPORTS",
  alerts: "LOCAL_COMMUNITY_ALERTS",
  missing: "LOCAL_MISSING_PERSONS",
  walks: "LOCAL_SAFE_WALKS",
  pendingReports: "LOCAL_PENDING_REPORT_SYNCS",
};
