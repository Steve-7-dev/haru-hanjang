import { Text, TextInput, type TextStyle } from 'react-native';

import { FontFamily } from '@/constants/fonts';

const base: TextStyle = { fontFamily: FontFamily.sans };

type WithDefaultProps = { defaultProps?: { style?: TextStyle | TextStyle[] } };

/**
 * Apply Pretendard as the default face for Text / TextInput app-wide.
 * Safe to call once at module load after fonts are registered / for style defaults.
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
}
