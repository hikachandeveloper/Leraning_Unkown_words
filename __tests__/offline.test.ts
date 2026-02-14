import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  saveOfflineWord,
  getOfflineWords,
  clearOfflineWords,
} from "../src/lib/offline";

describe("Offline Storage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should save a word offline", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    await saveOfflineWord({
      text: "RDS",
      memo: "AWSの授業で出てきた",
      created_at: "2026-02-14T00:00:00Z",
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "offline_words",
      expect.stringContaining("RDS")
    );
  });

  it("should append to existing offline words", async () => {
    const existing = [{ text: "EC2", memo: null, created_at: "2026-02-14T00:00:00Z" }];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(existing)
    );

    await saveOfflineWord({
      text: "RDS",
      memo: null,
      created_at: "2026-02-14T00:00:00Z",
    });

    const savedArg = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
    const saved = JSON.parse(savedArg);
    expect(saved).toHaveLength(2);
    expect(saved[0].text).toBe("EC2");
    expect(saved[1].text).toBe("RDS");
  });

  it("should return empty array when no offline words", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    const words = await getOfflineWords();
    expect(words).toEqual([]);
  });

  it("should clear offline words", async () => {
    await clearOfflineWords();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith("offline_words");
  });
});
