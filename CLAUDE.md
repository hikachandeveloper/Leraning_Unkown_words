# Word Learning App

知らない単語を登録し、AIで説明を生成して学習するアプリ。5回閲覧で自動削除。

## Tech Stack

- **Framework**: React Native (Expo SDK 54) + Expo Router (file-based routing)
- **Styling**: NativeWind v4 (Tailwind CSS)
- **DB/Auth**: Supabase (PostgreSQL, RLS anon access)
- **AI**: Gemini 2.5 Flash API (無料枠)
- **Testing**: Jest + ts-jest (unit)
- **Deploy**: Vercel (static, `dist/`)

## Project Structure

```
src/app/           — Expo Router pages (_layout, index, add, categorize, word/[id])
src/lib/           — supabase.ts, gemini.ts, offline.ts
src/types/         — database.ts (Word, Category, OfflineWord)
src/components/    — Shared components
src/hooks/         — Custom hooks
__tests__/         — Jest tests (gemini.test.ts, offline.test.ts)
supabase/migrations/ — SQL migrations
```

## Commands

```bash
npm start          # Expo dev server
npm run web        # Web version
npm test           # Jest tests
npm run test:watch # Jest watch mode
npx expo export --platform web  # Build for Vercel (output: dist/)
```

## Key Design Rules

- 5回閲覧で完全削除（アーカイブなし）
- AI説明はDB保存 → 2回目以降はAPIスキップ
- カテゴライズはユーザー主導（ボタン押下で未分類を一括分類）
- オフライン時は AsyncStorage にローカル保存 → 復帰時 Supabase に同期
- APIエラー時は再試行ボタン表示
- 外部サービス（Supabase, Gemini, AsyncStorage）はテスト時モック

## Architecture Notes

- 環境変数は `EXPO_PUBLIC_` prefix（ビルド時埋め込み）
- `.env` は gitignore 済み。Vercel にも同じ変数を設定済み
- Supabase RLS は anon ロールで全操作許可（個人利用前提）
- Gemini API はレスポンスが markdown code block で返る場合があるため JSON パース前に除去
- SPA ルーティング: `dist/vercel.json` で rewrites 設定

## DB Schema

- **categories**: id (UUID), name (VARCHAR unique), created_at
- **words**: id (UUID), text, memo, summary, detail, category_id (FK → categories), view_count (default 0), created_at

## Coding Style

- TypeScript strict
- NativeWind className でスタイリング（StyleSheet 不使用）
- Supabase クエリは各画面で直接呼び出し（薄い lib 層）
- async/await + try-catch でエラーハンドリング
