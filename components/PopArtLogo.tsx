import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { FontFamily } from '@/constants/fonts';
import { PopArt } from '@/constants/popArt';

type Props = { size?: 'md' | 'lg' };

/**
 * Heavy black Pretendard title with offset primary-color underprint
 * (silkscreen-style misregistration). Original treatment only.
 */
export function PopArtLogo({ size = 'lg' }: Props) {
  const fontSize = size === 'lg' ? 34 : 26;
  const offset = size === 'lg' ? 4 : 3;
  const lineHeight = fontSize * 1.05;

  return (
    <View style={styles.wrap} accessibilityRole="header">
      <AppText
        style={[
          styles.shadow,
          {
            fontSize,
            lineHeight,
            left: offset,
            top: offset,
            color: PopArt.titleShadow,
          },
        ]}
        importantForAccessibility="no"
      >
        One Day One Shot
      </AppText>
      <AppText style={[styles.ink, { fontSize, lineHeight }]}>One Day One Shot</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    alignSelf: 'stretch',
    marginBottom: 4,
    paddingRight: 6,
    paddingBottom: 6,
  },
  shadow: {
    position: 'absolute',
    fontFamily: FontFamily.sans,
    fontWeight: '700',
    letterSpacing: -1.2,
    textAlign: 'center',
    width: '100%',
  },
  ink: {
    fontFamily: FontFamily.sans,
    fontWeight: '700',
    color: PopArt.ink,
    letterSpacing: -1.2,
    textAlign: 'center',
  },
});
