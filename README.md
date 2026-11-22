# One Day One Shot

Instagram-homage SNS — **one photo a day (KST)**.

Repo / package folder remains `haru-hanjang`. Live private URL:
https://haru-hanjang.apps.grok.bot

## Web (published)

The published web app is **Next.js** with server APIs and one Cursor Postgres database.

```bash
npm install
npm run dev          # http://localhost:3000 (PGlite when DATABASE_URL unset)
npm run typecheck
npm run build        # next build + migrate (migrate no-ops without DATABASE_URL)
npm run start
```

### Security

- Email signup/login with **scrypt** password hashes on the server
- **httpOnly** session cookies (no password digests in localStorage)
- Posts, likes, comments, profile, and media require a valid session
- One post per user per KST day; users can only mutate their own today post
- Images stored in Postgres (`media` table), served via `/api/media/:id`

### Design

Keeps the PR #9 look: sunglasses brand mark, IG-like auth screens, Pretendard + system font stack.

## Native (Expo)

Previous Expo Router screens live under `native/app/` for a future mobile path:

```bash
npm run expo:start
```

## Typography

**Pretendard** (SIL OFL 1.1), self-hosted. License: `licenses/OFL-Pretendard.txt`.
