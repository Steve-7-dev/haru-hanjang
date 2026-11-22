import { StyleSheet, View } from 'react-native';

import { PopArt } from '@/constants/popArt';

/** Full-bleed 3×3 flat color grid — geometric only, no imagery. */
export function PopArtBackdrop() {
  return (
    <View style={styles.root} pointerEvents="none" accessibilityElementsHidden>
      {PopArt.grid.map((color, i) => (
        <View key={i} style={[styles.cell, { backgroundColor: color }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '33.333%',
    height: '33.333%',
  },
});
