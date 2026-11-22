import { StyleSheet, Text, View } from 'react-native';

import { FontFamily } from '@/constants/fonts';
import { Colors } from '@/constants/theme';

type Props = { size?: 'sm' | 'md' | 'lg' };

export function Logo({ size = 'md' }: Props) {
  const fontSize = size === 'lg' ? 36 : size === 'sm' ? 18 : 24;
  return (
    <View>
      <Text style={[styles.logo, { fontSize }]}>One Day One Shot</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    fontFamily: FontFamily.sans,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
});
