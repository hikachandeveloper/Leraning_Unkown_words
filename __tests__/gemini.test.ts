import {
  generateSummary,
  generateDetail,
  categorizeWords,
} from "../src/lib/gemini";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

describe("Gemini API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockGeminiResponse = (text: string) => ({
    ok: true,
    json: () =>
      Promise.resolve({
        candidates: [{ content: { parts: [{ text }] } }],
      }),
  });

  describe("generateSummary", () => {
    it("should generate a summary for a word", async () => {
      mockFetch.mockResolvedValueOnce(
        mockGeminiResponse("RDSはAWSのリレーショナルデータベースサービスです。")
      );

      const result = await generateSummary("RDS", "AWSの授業で出てきた");
      expect(result).toBe("RDSはAWSのリレーショナルデータベースサービスです。");
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should work without memo", async () => {
      mockFetch.mockResolvedValueOnce(
        mockGeminiResponse("量子コンピュータの説明")
      );

      const result = await generateSummary("量子コンピュータ", null);
      expect(result).toBe("量子コンピュータの説明");
    });

    it("should throw on API error", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 429 });

      await expect(generateSummary("test", null)).rejects.toThrow(
        "Gemini API error: 429"
      );
    });

    it("should throw on empty response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ candidates: [] }),
      });

      await expect(generateSummary("test", null)).rejects.toThrow(
        "Gemini API returned empty response"
      );
    });
  });

  describe("generateDetail", () => {
    it("should generate detailed explanation", async () => {
      mockFetch.mockResolvedValueOnce(
        mockGeminiResponse("## 概要\nRDSは...")
      );

      const result = await generateDetail("RDS", null);
      expect(result).toContain("概要");
    });
  });

  describe("categorizeWords", () => {
    it("should categorize words into existing categories", async () => {
      const responseJson = JSON.stringify([
        { text: "RDS", category: "IT" },
        { text: "参議院選挙", category: "政治" },
      ]);
      mockFetch.mockResolvedValueOnce(mockGeminiResponse(responseJson));

      const result = await categorizeWords(
        [
          { text: "RDS", memo: "AWS" },
          { text: "参議院選挙", memo: null },
        ],
        ["IT", "政治", "ビジネス"]
      );

      expect(result).toHaveLength(2);
      expect(result[0].category).toBe("IT");
      expect(result[1].category).toBe("政治");
    });

    it("should handle markdown code blocks in response", async () => {
      const responseJson = '```json\n[{"text":"RDS","category":"IT"}]\n```';
      mockFetch.mockResolvedValueOnce(mockGeminiResponse(responseJson));

      const result = await categorizeWords(
        [{ text: "RDS", memo: null }],
        ["IT"]
      );

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe("IT");
    });
  });
});
