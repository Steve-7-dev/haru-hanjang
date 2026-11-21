import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

type Props = {
  uri?: string | null;
  name: string;
  size?: number;
};

export function Avatar({ uri, name, size = 36 }: Props) {
  const initial = (name || '?').slice(0, 1).toUpperCase();
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: Colors.borderLight }}
        contentFit="cover"
      />
    );
  }
  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.initial, { fontSize: size * 0.4 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  initial: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
