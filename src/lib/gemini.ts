const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY!;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

async function callGemini(prompt: string): Promise<string> {
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data: GeminiResponse = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini API returned empty response");
  }
  return text;
}

export async function generateSummary(
  text: string,
  memo: string | null
): Promise<string> {
  const prompt = `「${text}」について3〜5行で簡潔に説明してください。マークダウン記法は使わず、プレーンテキストで回答してください。${memo ? `\n補足情報: ${memo}` : ""}`;
  return callGemini(prompt);
}

export async function generateDetail(
  text: string,
  memo: string | null
): Promise<string> {
  const prompt = `「${text}」について以下の構成で詳しく説明してください。\n- 概要\n- 背景や文脈\n- 具体例\nマークダウン記法は使わず、プレーンテキストで回答してください。${memo ? `\n補足情報: ${memo}` : ""}`;
  return callGemini(prompt);
}

export interface CategorizeResult {
  text: string;
  category: string;
}

export async function categorizeWords(
  words: Array<{ text: string; memo: string | null }>,
  existingCategories: string[]
): Promise<CategorizeResult[]> {
  const wordList = words
    .map(
      (w, i) => `${i + 1}. ${w.text}${w.memo ? `（メモ: ${w.memo}）` : ""}`
    )
    .join("\n");

  const prompt = `以下の単語を既存カテゴリに分類してください。
どのカテゴリにも該当しない場合は、新しいカテゴリ名を1つ提案してください。

既存カテゴリ: [${existingCategories.join(", ")}]

分類対象の単語:
${wordList}

JSON形式で回答してください（JSONのみ、説明は不要）:
[
  { "text": "単語", "category": "カテゴリ名" }
]`;

  const response = await callGemini(prompt);

  // Handle markdown code blocks in response
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : response.trim();

  return JSON.parse(jsonStr);
}
