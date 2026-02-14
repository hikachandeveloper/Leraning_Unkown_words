import AsyncStorage from "@react-native-async-storage/async-storage";
import { OfflineWord } from "../types/database";

const OFFLINE_WORDS_KEY = "offline_words";

export async function saveOfflineWord(word: OfflineWord): Promise<void> {
  const existing = await getOfflineWords();
  existing.push(word);
  await AsyncStorage.setItem(OFFLINE_WORDS_KEY, JSON.stringify(existing));
}

export async function getOfflineWords(): Promise<OfflineWord[]> {
  const data = await AsyncStorage.getItem(OFFLINE_WORDS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function clearOfflineWords(): Promise<void> {
  await AsyncStorage.removeItem(OFFLINE_WORDS_KEY);
}
