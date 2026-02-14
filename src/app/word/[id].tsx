import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { generateSummary, generateDetail } from "../../lib/gemini";
import { Word } from "../../types/database";
import NetInfo from "@react-native-community/netinfo";

export default function WordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [word, setWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(false);
  const [detailError, setDetailError] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    fetchWordAndIncrementView();
  }, [id]);

  const fetchWordAndIncrementView = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("words")
        .select("*")
        .eq("id", id)
        .single();

      if (!data) {
        router.back();
        return;
      }

      const newViewCount = data.view_count + 1;

      // Auto-delete at 5 views
      if (newViewCount >= 5) {
        await supabase.from("words").delete().eq("id", id);
        Alert.alert("習得済み", `「${data.text}」を5回閲覧しました。リストから削除されます。`, [
          { text: "OK", onPress: () => router.back() },
        ]);
        return;
      }

      // Increment view count
      await supabase
        .from("words")
        .update({ view_count: newViewCount })
        .eq("id", id);

      const updatedWord = { ...data, view_count: newViewCount };
      setWord(updatedWord);

      // Generate summary if not exists
      if (!updatedWord.summary) {
        await fetchSummary(updatedWord);
      }
    } catch (error) {
      console.error("Failed to fetch word:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async (w: Word) => {
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      setSummaryError(true);
      return;
    }

    setSummaryLoading(true);
    setSummaryError(false);
    try {
      const summary = await generateSummary(w.text, w.memo);
      await supabase.from("words").update({ summary }).eq("id", w.id);
      setWord((prev) => (prev ? { ...prev, summary } : null));
    } catch (error) {
      setSummaryError(true);
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchDetail = async () => {
    if (!word) return;

    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      setDetailError(true);
      return;
    }

    setDetailLoading(true);
    setDetailError(false);
    try {
      const detail = await generateDetail(word.text, word.memo);
      await supabase.from("words").update({ detail }).eq("id", word.id);
      setWord((prev) => (prev ? { ...prev, detail } : null));
      setShowDetail(true);
    } catch (error) {
      setDetailError(true);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("削除確認", `「${word?.text}」を削除しますか？`, [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          await supabase.from("words").delete().eq("id", id);
          router.back();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-950">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!word) return null;

  return (
    <ScrollView className="flex-1 bg-gray-950 p-6">
      {/* Word Title */}
      <Text className="text-3xl font-bold text-white mb-2">{word.text}</Text>

      {/* View Count */}
      <View className="flex-row items-center mb-6">
        <View className="rounded-full bg-gray-800 px-3 py-1">
          <Text className="text-sm text-gray-400">
            閲覧 {word.view_count}/5
          </Text>
        </View>
      </View>

      {/* Memo */}
      {word.memo && (
        <View className="mb-6 rounded-lg bg-gray-900 border border-gray-800 p-4">
          <Text className="text-xs text-gray-500 mb-1">メモ</Text>
          <Text className="text-gray-300">{word.memo}</Text>
        </View>
      )}

      {/* Summary */}
      <View className="mb-6 rounded-lg bg-gray-900 border border-gray-800 p-4">
        <Text className="text-xs text-gray-500 mb-2">説明</Text>
        {summaryLoading ? (
          <ActivityIndicator size="small" color="#6366f1" />
        ) : summaryError ? (
          <View>
            <Text className="text-red-400 mb-2">
              説明を取得できませんでした
            </Text>
            <TouchableOpacity
              onPress={() => fetchSummary(word)}
              className="rounded-lg bg-indigo-600 px-4 py-2"
            >
              <Text className="text-center text-white text-sm">再試行</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text className="text-gray-200 leading-6">
            {word.summary || "読み込み中..."}
          </Text>
        )}
      </View>

      {/* Detail Section */}
      {word.detail && showDetail ? (
        <View className="mb-6 rounded-lg bg-gray-900 border border-gray-800 p-4">
          <Text className="text-xs text-gray-500 mb-2">詳細</Text>
          <Text className="text-gray-200 leading-6">{word.detail}</Text>
        </View>
      ) : detailError ? (
        <View className="mb-6">
          <Text className="text-red-400 mb-2">
            詳細を取得できませんでした
          </Text>
          <TouchableOpacity
            onPress={fetchDetail}
            className="rounded-lg bg-indigo-600 px-4 py-2"
          >
            <Text className="text-center text-white text-sm">再試行</Text>
          </TouchableOpacity>
        </View>
      ) : word.detail ? (
        <TouchableOpacity
          onPress={() => setShowDetail(true)}
          className="mb-6 rounded-lg border border-indigo-600 px-4 py-3"
        >
          <Text className="text-center text-indigo-400 font-medium">
            もっと詳しく
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={fetchDetail}
          disabled={detailLoading}
          className="mb-6 rounded-lg border border-indigo-600 px-4 py-3"
        >
          {detailLoading ? (
            <ActivityIndicator size="small" color="#6366f1" />
          ) : (
            <Text className="text-center text-indigo-400 font-medium">
              もっと詳しく
            </Text>
          )}
        </TouchableOpacity>
      )}

      {/* Delete Button */}
      <TouchableOpacity
        onPress={handleDelete}
        className="mb-12 rounded-lg border border-red-800 px-4 py-3"
      >
        <Text className="text-center text-red-400 font-medium">削除</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
