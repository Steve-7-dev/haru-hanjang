import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { Colors, Spacing } from '@/constants/theme';
import { useHaruStore } from '@/lib/store';

const COL = 3;
const GAP = 2;
const SIZE = (Dimensions.get('window').width - GAP * (COL - 1)) / COL;

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const posts = useHaruStore((s) => s.exploreFeed());
  const users = useHaruStore((s) => s.users);
  const me = useHaruStore((s) => s.currentUserId);
  const isFollowing = useHaruStore((s) => s.isFollowing);
  const follow = useHaruStore((s) => s.follow);
  const unfollow = useHaruStore((s) => s.unfollow);

  const filteredUsers = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return users.filter((u) => u.id !== me).slice(0, 8);
    return users.filter(
      (u) =>
        u.id !== me &&
        (u.username.includes(query) || u.displayName.toLowerCase().includes(query)),
    );
  }, [q, users, me]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder="검색"
          placeholderTextColor={Colors.textSecondary}
          value={q}
          onChangeText={setQ}
          autoCapitalize="none"
        />
      </View>

      {q.trim() ? (
        <FlatList
          data={filteredUsers}
          keyExtractor={(u) => u.id}
          contentContainerStyle={{ padding: Spacing.md }}
          ListEmptyComponent={
            <Text style={styles.empty}>사용자를 찾을 수 없어요.</Text>
          }
          renderItem={({ item }) => {
            const following = isFollowing(item.id);
            return (
              <Pressable
                style={styles.userRow}
                onPress={() => router.push(`/user/${item.id}`)}
              >
                <Avatar uri={item.avatarUri} name={item.displayName} size={44} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.username}>{item.username}</Text>
                  <Text style={styles.name}>{item.displayName}</Text>
                </View>
                <Pressable
                  style={[styles.followBtn, following && styles.followingBtn]}
                  onPress={() => (following ? unfollow(item.id) : follow(item.id))}
                >
                  <Text style={[styles.followText, following && styles.followingText]}>
                    {following ? '팔로잉' : '팔로우'}
                  </Text>
                </Pressable>
              </Pressable>
            );
          }}
        />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(p) => p.id}
          numColumns={COL}
          columnWrapperStyle={{ gap: GAP }}
          contentContainerStyle={{ gap: GAP }}
          ListHeaderComponent={
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>전체 · 최신</Text>
              <Text style={styles.sectionSub}>공개 계정의 하루 한 장</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push(`/comments/${item.id}`)}>
              <Image source={{ uri: item.imageUri }} style={styles.tile} contentFit="cover" />
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  searchWrap: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  search: {
    backgroundColor: Colors.backgroundMuted,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
  },
  section: { padding: Spacing.md, paddingBottom: Spacing.sm },
  sectionTitle: { fontWeight: '700', fontSize: 16, color: Colors.text },
  sectionSub: { color: Colors.textSecondary, marginTop: 2, fontSize: 12 },
  tile: { width: SIZE, height: SIZE, backgroundColor: Colors.borderLight },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  username: { fontWeight: '600', color: Colors.text },
  name: { color: Colors.textSecondary, fontSize: 13 },
  followBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  followingBtn: {
    backgroundColor: Colors.background,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  followText: { color: Colors.textInverse, fontWeight: '700', fontSize: 13 },
  followingText: { color: Colors.text },
  empty: { color: Colors.textSecondary, textAlign: 'center', marginTop: 40 },
});
