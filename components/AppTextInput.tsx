import { TextInput, type TextInputProps } from 'react-native';

import { FontFamily } from '@/constants/fonts';

/** TextInput that always paints with self-hosted Pretendard (value + placeholder). */
export function AppTextInput({ style, ...rest }: TextInputProps) {
  return <TextInput {...rest} style={[{ fontFamily: FontFamily.sans }, style]} />;
}
