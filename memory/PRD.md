# Makallakap — PRD

## Original Problem Statement
Build a complete, modern, fast, scalable Turkish-language mobile app based on the Makallakap proverb website. Import ALL ~3500 proverbs from an uploaded Word document ("KIRGIZ ATASÖZLERİ VE TÜRKÇE ANLAMLARI.docx" — Kyrgyz proverbs + Turkish meanings). Entire UI in TURKISH; proverb content preserved in original wording. Features across 5 phases: data/core, favorites/recent/random/proverb-of-day/dark mode/settings/share/TTS, quiz/achievements/streak, offline/notification/multilingual/community/widget architecture + performance. No payments/subscriptions/ads/AI API now.

## User Choices
- Theme: **Warm & traditional** (burgundy/gold earth tones), light + dark + system.
- TTS "Sesli Oku": reads **both** proverb + meaning (tr-TR voice).
- Notifications: **settings screen + architecture only** (no real scheduling now; ready for native build).
- Data/architecture: **Fully offline** — proverbs bundled in app, no backend, no auth.

## Architecture
- Frontend: Expo Router (file-based), React Native. NO backend used (offline).
- Data layer: `src/data/proverbs.json` (3512 records, ~900KB bundled) + `src/services/proverbs.ts` (Turkish-aware search, random, proverb-of-day, letters, categories).
- Services: `quiz.ts` (3 modes), `achievements.ts`, `notifications.ts` (stub/architecture).
- State: `ThemeContext` (mode/accent/font-size/font-family, persisted) + `UserDataContext` (favorites, recent, streak, quiz stats, achievements, notif settings — persisted via `@/src/utils/storage`).
- Theme tokens: `src/theme/tokens.ts`. Fonts: Cormorant Garamond (serif display) + Plus Jakarta Sans (sans UI) via expo-font. Turkish strings centralized in `src/i18n/tr.ts`.
- Navigation: bottom tabs — Ana Sayfa, Atasözleri, Kategoriler, Quiz, Favoriler; stack for detail/category/quiz-play/settings/recent/achievements.

## User Personas
- Turkish speakers learning/enjoying Kyrgyz proverbs and their Turkish meanings.
- Casual learners who want daily proverbs, quizzes, streaks and a personal favorites collection.

## Core Requirements (static)
- Turkish UI everywhere; original proverb content untouched.
- Fast browse/search over 3500+ records; A-Z (Turkish) browsing; categories.
- Detail page (Anlamı, Açıklaması + graceful hide of missing fields), favorite, share, TTS.
- Favorites, Recently Viewed, Random, Proverb of the Day (deterministic).
- Quiz (3 modes) with scoring; achievements; daily streak.
- Settings: theme, accent color, font size, font family, notification settings, language (TR).
- Offline-first; scalable to 10,000+.

## Implemented (2026-06-12)- Data import: 3513 found / **3512 imported** / 1 duplicate / 0 unreadable / 0 incomplete (see /app/DATA_IMPORT_REPORT.md). All searchable.
- Home with Günün Atasözü hero, stat pills, quick actions, quiz banner, Öne Çıkan, Kategoriler, Son Görüntülenenler, Favoriler summary.
- Atasözleri: fast search (full/partial/word/meaning), A-Z LetterRail jump, virtualized FlatList.
- Kategoriler: 22-category grid with real counts (heuristically derived, since source has no categories) → category list.
- Proverb detail: sections + category chips + related-by-category + sticky action bar (Sesli Oku / Paylaş / Favoriye Ekle).
- Favorites + Recently Viewed (with clear) — persisted.
- Quiz: Atasözünü Tamamla, Doğru Anlamı Seç, Kelime Tahmini; 10 questions; correct/wrong/score/percent results; stats.
- Achievements (8 badges w/ progress) + Daily Streak (current/longest).
- Settings: light/dark/system, 4 accent colors, 4 font sizes, serif/sans, notification toggle + time, Turkish language info — all persisted.
- Light/Dark themes, warm/traditional palette, Cormorant+Jakarta fonts, haptics, toasts.
- E2E tested (iteration_1.json): all flows PASS, no bugs.

## Iteration 2 (2026-06-12)
- **Quiz Zorluk + Süreli Mod**: Kolay/Orta/Zor difficulty (harder = more confusing distractors sharing first letter/similar length) + timed mode with per-question countdown, time bar, time-up handling, and points scoring (difficulty multiplier + time bonus). Results show %/correct/wrong/points.
- **Kelime Kartları (Flashcards)**: swipeable/paged flip cards (front proverb → back meaning+explanation) with Rastgele (30 random) or Favoriler deck, shuffle, prev/next, and per-card favorite toggle. Entry from Quiz hub.
- **Günlük Hatırlatma (Local Notifications)**: expo-notifications local daily scheduling at the user's chosen time with today's proverb; permission-aware Settings toggle; re-applied on launch; graceful no-op + info toast on web/Expo Go (fires only in a real build). No push server/keys.
- E2E tested (iteration_2.json): all 3 features PASS incl. timeout path + persistence; no bugs.

## Iteration 3 (2026-06-12)
- **Interface-only i18n**: 4 UI languages — Türkçe (default), English, Deutsch, Русский. Proper i18n layer: `src/i18n/{tr,en,de,ru}.ts` (typed `TrType` for compiler-enforced parity) + `src/i18n/index.ts` + `LanguageContext` (`useI18n()` → `t`, `language`, `setLanguage`, `catLabel`). Language selector added in Settings; selection persisted locally under `mk_lang`; default Türkçe.
- Every screen/label localized (home, tabs, browse/search, categories incl. localized category names, detail incl. Meaning/Explanation/Related + action bar, favorites, recent, quiz + flashcards, achievements, settings incl. font-size labels, toasts/notifications title).
- **Content untouched**: proverb text/meaning/explanation read straight from `proverbs.json` (3512 records, unchanged); i18n never touches proverb data; search still runs over original data.
- E2E tested (iteration_3.json): all 4 languages + persistence + content integrity PASS; no bugs.

## Backlog (prioritized)
- P1: Sesli Oku validation on real device (Kyrgyz phonetics limited by tr-TR voice); real local notifications (native build); home-screen widget (native build).
- P2: Cloud sync for favorites (Supabase/Firebase); multilingual content (Kırgızca/İngilizce/Rusça translations); community (comments, ratings, shared lists); AI helpers (explain/example/similar/story); premium tier.
- P2: Manual/curated category tagging to improve the 1953 uncategorized entries.

## Next Tasks
- Gather user feedback on quiz difficulty and category accuracy.
- Consider adding "Benzer/Zıt Atasözleri" once relationship data is provided.
