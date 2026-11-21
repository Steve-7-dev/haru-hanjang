import { Image } from 'expo-image';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useShallow } from 'zustand/react/shallow';

import { Avatar } from '@/components/Avatar';
import { Colors, Spacing } from '@/constants/theme';
import { useHaruStore } from '@/lib/store';

const COL = 3;
const GAP = 2;
const SIZE = (Dimensions.get('window').width - GAP * (COL - 1)) / COL;

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useHaruStore((s) => s.userById(id));
  const me = useHaruStore((s) => s.currentUserId);
  const canView = useHaruStore((s) => s.canViewUser(id));
  const posts = useHaruStore(useShallow((s) => s.postsByUser(id)));
  const followers = useHaruStore((s) => s.followerCount(id));
  const following = useHaruStore((s) => s.followingCount(id));
  const isFollowing = useHaruStore((s) => s.isFollowing(id));
  const follow = useHaruStore((s) => s.follow);
  const unfollow = useHaruStore((s) => s.unfollow);
  const startDm = useHaruStore((s) => s.startDm);

  if (!user) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: '프로필' }} />
        <Text style={styles.muted}>사용자를 찾을 수 없어요.</Text>
      </View>
    );
  }

  const isMe = me === user.id;

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: user.username }} />
      <FlatList
        data={canView ? posts : []}
        keyExtractor={(p) => p.id}
        numColumns={COL}
        columnWrapperStyle={{ gap: GAP }}
        contentContainerStyle={{ gap: GAP, paddingBottom: 40 }}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.row}>
              <Avatar uri={user.avatarUri} name={user.displayName} size={86} />
              <View style={styles.stats}>
                <Stat label="게시물" value={canView ? posts.length : 0} />
                <Stat label="팔로워" value={followers} />
                <Stat label="팔로잉" value={following} />
              </View>
            </View>
            <Text style={styles.displayName}>{user.displayName}</Text>
            {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
            {!isMe ? (
              <View style={styles.actions}>
                <Pressable
                  style={[styles.btn, isFollowing && styles.btnOutline]}
                  onPress={() => (isFollowing ? unfollow(user.id) : follow(user.id))}
                >
                  <Text style={[styles.btnText, isFollowing && styles.btnTextDark]}>
                    {isFollowing ? '팔로잉' : '팔로우'}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.btn, styles.btnOutline]}
                  onPress={() => router.push(`/messages/${startDm(user.id)}`)}
                >
                  <Text style={styles.btnTextDark}>메시지</Text>
                </Pressable>
              </View>
            ) : null}
            {!canView ? (
              <View style={styles.lock}>
                <Text style={styles.lockTitle}>비공개 계정입니다</Text>
                <Text style={styles.muted}>팔로우하면 사진을 볼 수 있어요.</Text>
              </View>
            ) : null}
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { color: Colors.textSecondary },
  header: { padding: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xl },
  stats: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statValue: { fontWeight: '700', fontSize: 16, color: Colors.text },
  statLabel: { color: Colors.text, fontSize: 13, marginTop: 2 },
  displayName: { marginTop: Spacing.md, fontWeight: '600', color: Colors.text },
  bio: { marginTop: 2, color: Colors.text },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  btn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  btnOutline: {
    backgroundColor: Colors.background,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  btnText: { color: Colors.textInverse, fontWeight: '700' },
  btnTextDark: { color: Colors.text, fontWeight: '700' },
  lock: { marginTop: Spacing.xl, alignItems: 'center', gap: 4 },
  lockTitle: { fontWeight: '700', color: Colors.text },
  tile: { width: SIZE, height: SIZE, backgroundColor: Colors.borderLight },
});
