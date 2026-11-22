import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

type Props = { size?: number };

/**
 * Original One Day One Shot mark: rounded square, six diagonal color bands,
 * large bold sunglasses + small top-right shutter accent. Not an Instagram logo/glyph copy.
 */
export function BrandMark({ size = 72 }: Props) {
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size * 0.22 }]}>
      <Image
        source={require('../assets/images/brand-mark.png')}
        style={{ width: size, height: size }}
        contentFit="cover"
        accessibilityLabel="One Day One Shot"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
});
