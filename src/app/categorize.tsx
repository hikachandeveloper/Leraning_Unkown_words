import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";
import { categorizeWords, CategorizeResult } from "../lib/gemini";
import { Word, Category } from "../types/database";

export default function CategorizeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CategorizeResult[]>([]);
  const [error, setError] = useState(false);
  const [done, setDone] = useState(false);

  const handleCategorize = async () => {
    setLoading(true);
    setError(false);
    try {
      // Fetch uncategorized words
      const { data: uncategorized } = await supabase
        .from("words")
        .select("*")
        .is("category_id", null);

      if (!uncategorized || uncategorized.length === 0) {
        Alert.alert("完了", "未分類の単語はありません");
        router.back();
        return;
      }

      // Fetch existing categories
      const { data: categories } = await supabase
        .from("categories")
        .select("*");
      const categoryNames = (categories || []).map((c: Category) => c.name);

      // Call Gemini for categorization
      const wordInputs = uncategorized.map((w: Word) => ({
        text: w.text,
        memo: w.memo,
      }));
      const categorizeResults = await categorizeWords(wordInputs, categoryNames);
      setResults(categorizeResults);

      // Apply categories
      for (const result of categorizeResults) {
        // Find or create category
        let categoryId: string;
        const existingCat = (categories || []).find(
          (c: Category) => c.name === result.category
        );

        if (existingCat) {
          categoryId = existingCat.id;
        } else {
          const { data: newCat } = await supabase
            .from("categories")
            .insert({ name: result.category })
            .select()
            .single();
          if (newCat) {
            categoryId = newCat.id;
            categories?.push(newCat);
          } else {
            continue;
          }
        }

        // Update word
        const matchingWord = uncategorized.find(
          (w: Word) => w.text === result.text
        );
        if (matchingWord) {
          await supabase
            .from("words")
            .update({ category_id: categoryId })
            .eq("id", matchingWord.id);
        }
      }

      setDone(true);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleCategorize();
  }, []);

  return (
    <ScrollView className="flex-1 bg-gray-950 p-6">
      <Text className="text-2xl font-bold text-white mb-6">カテゴライズ</Text>

      {loading && (
        <View className="items-center py-12">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="mt-4 text-gray-400">AIが分類中...</Text>
        </View>
      )}

      {error && (
        <View className="items-center py-12">
          <Text className="text-red-400 mb-4">
            カテゴライズに失敗しました
          </Text>
          <TouchableOpacity
            onPress={handleCategorize}
            className="rounded-lg bg-indigo-600 px-6 py-3"
          >
            <Text className="text-white font-medium">再試行</Text>
          </TouchableOpacity>
        </View>
      )}

      {done && results.length > 0 && (
        <View>
          <Text className="text-gray-400 mb-4">分類結果:</Text>
          {results.map((r, i) => (
            <View
              key={i}
              className="mb-3 rounded-lg bg-gray-900 border border-gray-800 p-4 flex-row justify-between items-center"
            >
              <Text className="text-white font-medium">{r.text}</Text>
              <View className="rounded-full bg-indigo-600/20 px-3 py-1">
                <Text className="text-indigo-400 text-sm">{r.category}</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 rounded-lg bg-indigo-600 px-4 py-4"
          >
            <Text className="text-center text-white font-semibold text-lg">
              完了
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
