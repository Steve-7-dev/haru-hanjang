import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/Logo';
import { PostCard } from '@/components/PostCard';
import { Colors, Spacing } from '@/constants/theme';
import { useHaruStore } from '@/lib/store';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const posts = useHaruStore((s) => s.homeFeed());
  const unread = useHaruStore(
    (s) => s.notificationsForMe().filter((n) => !n.read).length,
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Logo />
        <View style={styles.headerActions}>
          <Pressable onPress={() => router.push('/notifications')} hitSlop={8} style={styles.iconBtn}>
            <Ionicons name="heart-outline" size={26} color={Colors.text} />
            {unread > 0 ? <View style={styles.badge} /> : null}
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/messages')} hitSlop={8} style={styles.iconBtn}>
            <Ionicons name="paper-plane-outline" size={24} color={Colors.text} />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        contentContainerStyle={posts.length === 0 ? styles.emptyWrap : undefined}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>아직 피드가 비어 있어요</Text>
            <Text style={styles.emptyBody}>
              친구를 팔로우하거나, 오늘의 한 장을 올려 보세요.
            </Text>
            <Pressable style={styles.cta} onPress={() => router.push('/(tabs)/explore')}>
              <Text style={styles.ctaText}>사람 찾아보기</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconBtn: { padding: 6 },
  badge: {
    position: 'absolute',
    top: 6,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.heart,
  },
  emptyWrap: { flexGrow: 1, justifyContent: 'center' },
  empty: { alignItems: 'center', padding: Spacing.xxl, gap: Spacing.sm },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  emptyBody: { textAlign: 'center', color: Colors.textSecondary, lineHeight: 20 },
  cta: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 10,
    borderRadius: 8,
  },
  ctaText: { color: Colors.textInverse, fontWeight: '700' },
});
