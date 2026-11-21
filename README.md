# 하루한장

Instagram 오마주 iOS SNS — **한국시간(KST) 기준 하루 한 장**.

너무 많은 콘텐츠 대신, 하루의 가장 소중한 순간 하나만 남깁니다.

## MVP 기능

- 이메일 가입/로그인 (+ Google / 카카오 / Apple **스텁** — 키 연결 전)
- 팔로우 피드 + 전체(공개) 탐색
- 팔로우 즉시 적용, 비공개 계정
- 게시물당 **사진 1장**, 같은 날 수정/삭제 가능
- 좋아요 · 댓글 · DM(1:1 + 그룹)
- 푸시 권한/토큰 등록 훅 (EAS projectId 필요)

## 실행

```bash
cd haru-hanjang
npm install
npx expo start
```

- iOS: Expo Go 또는 `npx expo run:ios` (Mac + Xcode)
- 웹 미리보기: `npx expo start --web`

### 데모 계정

| 이메일 | 비밀번호 |
|--------|----------|
| mina@haru.app | haru1234 |
| jun@haru.app | haru1234 |
| soo@haru.app | haru1234 (비공개 계정) |

## OAuth / 푸시 다음 단계

1. [Expo Apple / Google auth](https://docs.expo.dev/) 및 카카오 SDK 키를 연결
2. `app.json` → `extra.eas.projectId` 설정 후 EAS Build
3. 멀티 디바이스 동기화가 필요하면 서버(API + DB)로 `lib/store` persistence를 교체

## 기술

- Expo SDK 58 · Expo Router · TypeScript
- Zustand + AsyncStorage (로컬 MVP 저장)
- 날짜 규칙: `lib/kst.ts` (Asia/Seoul)
