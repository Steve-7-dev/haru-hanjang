# One Day One Shot

Instagram-homage iOS SNS — **one photo a day (KST)**.

Repo / package folder remains `haru-hanjang`. Live private URL is unchanged:
https://haru-hanjang.apps.grok.bot

Too much content is the enemy — keep only the one moment that mattered today.

## MVP features

- Email sign-up / login (Google / Kakao / Apple are **intentionally disabled stubs** until keys are wired)
- Follow feed + public explore
- Instant follow, private accounts
- **One photo per post**, editable/deletable the same day
- Likes · comments · DM (1:1 + group)
- Push permission / token registration hook (needs EAS projectId)

## Run

```bash
cd haru-hanjang
npm install
npx expo start
```

- iOS: Expo Go or `npx expo run:ios` (Mac + Xcode)
- Web preview: `npx expo start --web` or `npm run build && npm run serve:web`

### Accounts

Seed personas are **sample content only** and have no login passwords.  
Use **Sign up** in the app to create an email account, then log in.  
Passwords are stored only as PBKDF2 digests in on-device SecureStore (web falls back to localStorage).

## Typography

UI uses **Pretendard** (SIL Open Font License 1.1), self-hosted under `assets/fonts/` and `web-public/fonts/`. License: `licenses/OFL-Pretendard.txt`. No third-party font CDNs.

## OAuth / push next steps

1. Connect [Expo Apple / Google auth](https://docs.expo.dev/) and Kakao SDK keys
2. Set `app.json` → `extra.eas.projectId`, then EAS Build
3. For multi-device sync, replace `lib/store` persistence with a server (API + DB)

## Stack

- Expo SDK 58 · Expo Router · TypeScript · Pretendard
- Zustand + AsyncStorage (profile/content) · SecureStore (credential digests; web localStorage fallback)
- Date rules: `lib/kst.ts` (Asia/Seoul)

## Security / remaining risks (local MVP)

- **Intentional stubs:** Social login (Google/Kakao/Apple) is disabled in UI with a notice only — no fake successful login.
- **Local-only auth:** No server session. Password digests stay on-device. On web, SecureStore is unavailable so digests use localStorage (exposed to same-origin XSS).
- **Seed images:** Local SVG data-URI placeholders instead of external hosts (e.g. Unsplash). Legacy cached external URLs are rewritten to placeholders on hydration.
- **Push tokens:** Kept in memory only; excluded from profile persist.
