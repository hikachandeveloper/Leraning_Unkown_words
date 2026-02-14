import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { supabase } from "../lib/supabase";
import { Word, Category } from "../types/database";
import { getOfflineWords, clearOfflineWords } from "../lib/offline";
import NetInfo from "@react-native-community/netinfo";

export default function HomeScreen() {
  const router = useRouter();
  const [words, setWords] = useState<Word[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uncategorizedCount, setUncategorizedCount] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Sync offline words if online
      const netState = await NetInfo.fetch();
      if (netState.isConnected) {
        const offlineWords = await getOfflineWords();
        if (offlineWords.length > 0) {
          for (const word of offlineWords) {
            await supabase.from("words").insert({
              text: word.text,
              memo: word.memo,
            });
          }
          await clearOfflineWords();
        }
      }

      // Fetch words
      let query = supabase
        .from("words")
        .select("*")
        .order("created_at", { ascending: false });

      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }

      const { data: wordsData } = await query;
      setWords(wordsData || []);

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      setCategories(categoriesData || []);

      // Count uncategorized
      const { count } = await supabase
        .from("words")
        .select("*", { count: "exact", head: true })
        .is("category_id", null);
      setUncategorizedCount(count || 0);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleCategorize = () => {
    router.push("/categorize" as never);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-950">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-950">
      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="max-h-12 border-b border-gray-800"
      >
        <TouchableOpacity
          onPress={() => setSelectedCategory(null)}
          className={`px-4 py-3 ${!selectedCategory ? "border-b-2 border-indigo-500" : ""}`}
        >
          <Text
            className={`text-sm ${!selectedCategory ? "text-indigo-400 font-bold" : "text-gray-400"}`}
          >
            全て
          </Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setSelectedCategory(cat.id)}
            className={`px-4 py-3 ${selectedCategory === cat.id ? "border-b-2 border-indigo-500" : ""}`}
          >
            <Text
              className={`text-sm ${selectedCategory === cat.id ? "text-indigo-400 font-bold" : "text-gray-400"}`}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Categorize Button */}
      {uncategorizedCount > 0 && (
        <TouchableOpacity
          onPress={handleCategorize}
          className="mx-4 mt-3 rounded-lg bg-indigo-600 px-4 py-2"
        >
          <Text className="text-center text-sm font-medium text-white">
            未分類の単語をカテゴライズ（{uncategorizedCount}件）
          </Text>
        </TouchableOpacity>
      )}

      {/* Word Cards */}
      {words.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500 text-lg">
            単語がまだありません
          </Text>
          <Text className="text-gray-600 text-sm mt-2">
            右下の「＋」から登録しましょう
          </Text>
        </View>
      ) : (
        <FlatList
          data={words}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/word/${item.id}`)}
              className="mb-3 rounded-xl bg-gray-900 border border-gray-800 p-4"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-white">
                    {item.text}
                  </Text>
                  {item.memo && (
                    <Text className="mt-1 text-sm text-gray-400" numberOfLines={1}>
                      {item.memo}
                    </Text>
                  )}
                </View>
                <View className="ml-3 rounded-full bg-gray-800 px-3 py-1">
                  <Text className="text-xs text-gray-400">
                    {item.view_count}/5
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Add Button */}
      <TouchableOpacity
        onPress={() => router.push("/add")}
        className="absolute bottom-8 right-6 h-14 w-14 items-center justify-center rounded-full bg-indigo-600 shadow-lg"
      >
        <Text className="text-2xl text-white">＋</Text>
      </TouchableOpacity>
    </View>
  );
}
