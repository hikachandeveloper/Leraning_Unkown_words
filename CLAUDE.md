# Word Learning App

知らない単語を登録してAIで学習するアプリ。

## Tech Stack
- **Frontend**: React Native (Expo SDK 54) + Expo Router
- **Styling**: NativeWind (Tailwind CSS)
- **Backend**: Supabase (PostgreSQL)
- **AI**: Gemini API (Flash, 無料枠)
- **Testing**: Jest + ts-jest (unit), Playwright (E2E)

## Project Structure
```
app/
├── src/
│   ├── app/          # Expo Router pages
│   │   ├── _layout.tsx
│   │   ├── index.tsx       # Home (card list)
│   │   ├── add.tsx         # Add word
│   │   ├── categorize.tsx  # AI categorization
│   │   └── word/[id].tsx   # Word detail
│   ├── lib/
│   │   ├── supabase.ts     # Supabase client
│   │   ├── gemini.ts       # Gemini API client
│   │   └── offline.ts      # Offline storage
│   ├── types/
│   │   └── database.ts     # TypeScript types
│   ├── components/         # Shared components
│   └── hooks/              # Custom hooks
├── __tests__/              # Jest tests
├── supabase/migrations/    # SQL migrations
└── .env                    # Environment variables (not committed)
```

## Commands
- `npm start` — Start Expo dev server
- `npm test` — Run Jest tests
- `npm run web` — Start web version

## Key Design Decisions
- 5回閲覧で単語を完全削除（アーカイブなし）
- AI説明はDB保存して2回目以降はAPI不要
- カテゴライズはユーザー主導（ボタン押下で一括）
- オフラインでは単語登録のみ可能（ローカル保存→復帰時同期）
- APIエラー時は再試行ボタンを表示
- 外部サービスはテスト時モックで代替
