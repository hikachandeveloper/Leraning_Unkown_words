import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";
import { saveOfflineWord } from "../lib/offline";
import NetInfo from "@react-native-community/netinfo";

export default function AddScreen() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [memo, setMemo] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      Alert.alert("エラー", "単語を入力してください");
      return;
    }

    setSaving(true);
    try {
      const netState = await NetInfo.fetch();

      if (netState.isConnected) {
        const { error } = await supabase.from("words").insert({
          text: trimmedText,
          memo: memo.trim() || null,
        });
        if (error) throw error;
      } else {
        await saveOfflineWord({
          text: trimmedText,
          memo: memo.trim() || null,
          created_at: new Date().toISOString(),
        });
      }

      router.back();
    } catch (error) {
      Alert.alert("エラー", "保存に失敗しました。もう一度お試しください。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-950"
    >
      <View className="flex-1 p-6">
        <Text className="mb-2 text-sm font-medium text-gray-300">
          単語 / フレーズ
        </Text>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="例: RDS、参議院選挙、量子コンピュータ"
          placeholderTextColor="#6b7280"
          className="mb-6 rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white"
          autoFocus
        />

        <Text className="mb-2 text-sm font-medium text-gray-300">
          メモ（任意）
        </Text>
        <TextInput
          value={memo}
          onChangeText={setMemo}
          placeholder="例: AWSの授業で出てきた"
          placeholderTextColor="#6b7280"
          className="mb-8 rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className={`rounded-lg py-4 ${saving ? "bg-gray-700" : "bg-indigo-600"}`}
        >
          <Text className="text-center text-lg font-semibold text-white">
            {saving ? "保存中..." : "保存"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
