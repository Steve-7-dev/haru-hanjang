/** Instagram-homage visual tokens for 하루한장 */
export const Colors = {
  background: '#FFFFFF',
  backgroundMuted: '#FAFAFA',
  text: '#262626',
  textSecondary: '#8E8E8E',
  textInverse: '#FFFFFF',
  border: '#DBDBDB',
  borderLight: '#EFEFEF',
  heart: '#ED4956',
  link: '#00376B',
  primary: '#0095F6',
  primaryDisabled: '#B2DFFC',
  overlay: 'rgba(0,0,0,0.45)',
  tabInactive: '#262626',
  tabActive: '#262626',
  inputBg: '#FAFAFA',
  danger: '#ED4956',
  success: '#58C322',
  kakao: '#FEE500',
  kakaoText: '#191919',
  apple: '#000000',
  googleBorder: '#DBDBDB',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Typography = {
  logo: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  username: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
  },
  button: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
} as const;
