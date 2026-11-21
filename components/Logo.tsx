import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

type Props = { size?: 'sm' | 'md' | 'lg' };

export function Logo({ size = 'md' }: Props) {
  const fontSize = size === 'lg' ? 42 : size === 'sm' ? 22 : 28;
  return (
    <View>
      <Text style={[styles.logo, { fontSize }]}>하루한장</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -1,
    fontStyle: 'italic',
  },
});
