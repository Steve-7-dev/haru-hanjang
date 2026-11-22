import { Platform, Text, TextInput, type TextStyle } from 'react-native';

import { FontFamily } from '@/constants/fonts';
import { PRETENDARD_WEB_CSS } from '@/constants/pretendardWebCss';

const base: TextStyle = { fontFamily: FontFamily.sans };

type WithDefaultProps = { defaultProps?: { style?: TextStyle | TextStyle[] } };

/**
 * Best-effort defaults for Text / TextInput, plus a web CSS injection that
 * overrides React Native Web’s system stack (needed for Hangul + placeholders).
 */
export function applyDefaultFont() {
  const TextAny = Text as unknown as WithDefaultProps;
  const InputAny = TextInput as unknown as WithDefaultProps;

  const prevText = TextAny.defaultProps?.style;
  TextAny.defaultProps = {
    ...TextAny.defaultProps,
    style: prevText ? [base, prevText].flat() : base,
  };

  const prevInput = InputAny.defaultProps?.style;
  InputAny.defaultProps = {
    ...InputAny.defaultProps,
    style: prevInput ? [base, prevInput].flat() : base,
  };

  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const id = 'pretendard-global-css';
    if (!document.getElementById(id)) {
      const style = document.createElement('style');
      style.id = id;
      style.textContent = PRETENDARD_WEB_CSS;
      document.head.appendChild(style);
    }
  }
}
