import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useShallow } from 'zustand/react/shallow';

import { Avatar } from '@/components/Avatar';
import { Colors, Spacing } from '@/constants/theme';
import { useHaruStore } from '@/lib/store';

const COL = 3;
const GAP = 2;
const SIZE = (Dimensions.get('window').width - GAP * (COL - 1)) / COL;
const EMPTY_POSTS: never[] = [];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const me = useHaruStore((s) => s.me());
  const posts = useHaruStore(
    useShallow((s) => (me ? s.postsByUser(me.id) : EMPTY_POSTS)),
  );
  const followers = useHaruStore((s) => (me ? s.followerCount(me.id) : 0));
  const following = useHaruStore((s) => (me ? s.followingCount(me.id) : 0));
  const today = useHaruStore((s) => (me ? s.todayPostFor(me.id) : undefined));

  if (!me) return null;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Text style={styles.username}>{me.username}</Text>
        <Pressable onPress={() => router.push('/settings')} hitSlop={8}>
          <Ionicons name="menu-outline" size={28} color={Colors.text} />
        </Pressable>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        numColumns={COL}
        columnWrapperStyle={{ gap: GAP }}
        contentContainerStyle={{ gap: GAP, paddingBottom: 40 }}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.row}>
              <Avatar uri={me.avatarUri} name={me.displayName} size={86} />
              <View style={styles.stats}>
                <Stat label="게시물" value={posts.length} />
                <Stat label="팔로워" value={followers} />
                <Stat label="팔로잉" value={following} />
              </View>
            </View>
            <Text style={styles.displayName}>{me.displayName}</Text>
            {me.bio ? <Text style={styles.bio}>{me.bio}</Text> : null}
            {me.isPrivate ? (
              <Text style={styles.private}>비공개 계정</Text>
            ) : null}
            <Text style={styles.today}>
              {today ? '오늘 한 장 ✓' : '아직 오늘의 한 장이 없어요'}
            </Text>
            <Pressable style={styles.edit} onPress={() => router.push('/settings')}>
              <Text style={styles.editText}>프로필 편집</Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>사진 없음</Text>
            <Text style={styles.emptyBody}>오늘의 소중한 하루를 남겨 보세요.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/comments/${item.id}`)}>
            <Image source={{ uri: item.imageUri }} style={styles.tile} contentFit="cover" />
          </Pressable>
        )}
      />
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  username: { fontSize: 20, fontWeight: '700', color: Colors.text },
  header: { padding: Spacing.md, paddingBottom: Spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xl },
  stats: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statValue: { fontWeight: '700', fontSize: 16, color: Colors.text },
  statLabel: { color: Colors.text, fontSize: 13, marginTop: 2 },
  displayName: { marginTop: Spacing.md, fontWeight: '600', color: Colors.text },
  bio: { marginTop: 2, color: Colors.text, lineHeight: 18 },
  private: { marginTop: 6, color: Colors.textSecondary, fontSize: 12 },
  today: { marginTop: Spacing.sm, color: Colors.primary, fontWeight: '600', fontSize: 13 },
  edit: {
    marginTop: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  editText: { fontWeight: '600', color: Colors.text },
  tile: { width: SIZE, height: SIZE, backgroundColor: Colors.borderLight },
  empty: { alignItems: 'center', padding: Spacing.xxl },
  emptyTitle: { fontWeight: '700', fontSize: 16, color: Colors.text },
  emptyBody: { color: Colors.textSecondary, marginTop: 4 },
});
