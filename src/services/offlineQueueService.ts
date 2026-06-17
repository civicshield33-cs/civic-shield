import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import { createSosIncident, getCurrentLocation } from "./sosService";
import { getCurrentUserId } from "./authService";
import { getStoredUser } from "../utils/auth";

const QUEUE_KEY = "OFFLINE_SOS_QUEUE";

export type QueuedSOS = {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  queuedAt: string;
  synced: boolean;
};

async function readQueue(): Promise<QueuedSOS[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeQueue(items: QueuedSOS[]) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

export async function queueOfflineSOS() {
  const [user, userId] = await Promise.all([getStoredUser(), getCurrentUserId()]);
  const entry: QueuedSOS = {
    id: `${Date.now()}`,
    userId,
    userName: user?.fullName || "Civic Shield User",
    userPhone: user?.phone || "",
    queuedAt: new Date().toISOString(),
    synced: false,
  };

  const queue = await readQueue();
  queue.unshift(entry);
  await writeQueue(queue);
  return entry;
}

export async function syncOfflineQueue() {
  if (!isOnline()) return { synced: 0 };

  const queue = await readQueue();
  let synced = 0;

  for (const item of queue) {
    if (item.synced) continue;

    const location = await getCurrentLocation();
    await createSosIncident({
      userId: item.userId,
      userName: item.userName,
      userPhone: item.userPhone,
      location,
    });
    item.synced = true;
    synced += 1;
  }

  await writeQueue(queue.filter((q) => !q.synced));
  return { synced };
}

export async function getPendingQueueCount() {
  const queue = await readQueue();
  return queue.filter((q) => !q.synced).length;
}

function isOnline() {
  if (Platform.OS === "web" && typeof navigator !== "undefined") {
    return navigator.onLine;
  }
  return true;
}
