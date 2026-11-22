import type { FontSource } from 'expo-font';

/** Self-hosted Pretendard (SIL OFL 1.1). See licenses/OFL-Pretendard.txt */
export const FontFamily = {
  sans: 'Pretendard',
} as const;

export const pretendardFontFaces: {
  fontFamily: string;
  fontDefinitions: { path: FontSource; weight: number }[];
}[] = [
  {
    fontFamily: FontFamily.sans,
    fontDefinitions: [
      { path: require('../assets/fonts/Pretendard-Regular.otf'), weight: 400 },
      { path: require('../assets/fonts/Pretendard-Medium.otf'), weight: 500 },
      { path: require('../assets/fonts/Pretendard-SemiBold.otf'), weight: 600 },
      { path: require('../assets/fonts/Pretendard-Bold.otf'), weight: 700 },
    ],
  },
];
