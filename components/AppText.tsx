import { Text, type TextProps } from 'react-native';

import { FontFamily } from '@/constants/fonts';

/** Text that always paints with self-hosted Pretendard (incl. Hangul). */
export function AppText({ style, ...rest }: TextProps) {
  return <Text {...rest} style={[{ fontFamily: FontFamily.sans }, style]} />;
}
