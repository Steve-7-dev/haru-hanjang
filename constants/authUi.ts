import { Platform, type TextStyle } from 'react-native';

/** Instagram-homage auth chrome tokens (original brand, not IG assets). */
export const AuthUi = {
  bg: '#FAFAFA',
  panel: '#FFFFFF',
  ink: '#262626',
  muted: '#8E8E8E',
  border: '#DBDBDB',
  inputBg: '#FAFAFA',
  primary: '#0095F6',
  primaryDisabled: '#B2DFFC',
  danger: '#ED4956',
  radius: 6,
} as const;

/**
 * System / SF Pro first, Pretendard fallback (self-hosted).
 * Do not bundle SF Pro. On native, System ≈ SF on iOS.
 */
export const authFontFamily =
  Platform.OS === 'web'
    ? '-apple-system, "SF Pro Text", system-ui, Pretendard, sans-serif'
    : Platform.OS === 'ios'
      ? 'System'
      : 'sans-serif';

export const authTextBase: TextStyle = {
  fontFamily: authFontFamily,
  color: AuthUi.ink,
};
