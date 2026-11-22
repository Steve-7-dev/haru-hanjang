# 하루한장

Instagram 오마주 iOS SNS — **한국시간(KST) 기준 하루 한 장**.

너무 많은 콘텐츠 대신, 하루의 가장 소중한 순간 하나만 남깁니다.

## MVP 기능

- 이메일 가입/로그인 (Google / 카카오 / Apple는 **의도적으로 비활성 스텁** — 키 연결 전)
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
- 웹 미리보기: `npx expo start --web` 또는 `npm run build && npm run serve:web`

### 계정

시드 페르소나는 **샘플 콘텐츠용**이며 로그인 비밀번호가 없습니다.  
앱에서 **가입하기**로 새 이메일 계정을 만든 뒤 로그인하세요.  
비밀번호는 기기 내 SecureStore에 PBKDF2 다이제스트로만 저장됩니다.

## OAuth / 푸시 다음 단계

1. [Expo Apple / Google auth](https://docs.expo.dev/) 및 카카오 SDK 키를 연결
2. `app.json` → `extra.eas.projectId` 설정 후 EAS Build
3. 멀티 디바이스 동기화가 필요하면 서버(API + DB)로 `lib/store` persistence를 교체

## 기술

- Expo SDK 58 · Expo Router · TypeScript
- Zustand + AsyncStorage (프로필/콘텐츠) · SecureStore (자격 증명 다이제스트; 웹은 localStorage 폴백)
- 날짜 규칙: `lib/kst.ts` (Asia/Seoul)

## 보안 / 남은 리스크 (로컬 MVP)

- **의도된 스텁:** 소셜 로그인(Google/카카오/Apple)은 UI에서 비활성·안내만 표시. 가짜 성공 로그인 없음.
- **로컬 전용 인증:** 서버 세션 없음. 비밀번호 다이제스트는 기기 저장소에만 둠. 웹에서는 SecureStore 미지원이라 localStorage 폴백(동일 출처 XSS 시 노출 가능).
- **시드 이미지:** 외부 호스트(Unsplash 등) 대신 로컬 SVG data-URI 플레이스홀더 사용. 예전 로컬 캐시에 외부 URL이 있으면 하이드레이션 시 플레이스홀더로 교체.
- **푸시 토큰:** 메모리에만 두고 프로필 persist에서 제외.
