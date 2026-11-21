import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { Colors, Spacing } from '@/constants/theme';
import { formatKstRelative } from '@/lib/kst';
import { useHaruStore } from '@/lib/store';

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const me = useHaruStore((s) => s.currentUserId);
  const conversations = useHaruStore((s) => s.myConversations());
  const userById = useHaruStore((s) => s.userById);
  const messagesFor = useHaruStore((s) => s.messagesFor);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>메시지</Text>
        <Pressable onPress={() => router.push('/messages/new-group')}>
          <Text style={styles.newGroup}>새 그룹</Text>
        </Pressable>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(c) => c.id}
        contentContainerStyle={conversations.length === 0 ? styles.emptyWrap : undefined}
        ListEmptyComponent={
          <Text style={styles.empty}>아직 대화가 없어요.</Text>
        }
        renderItem={({ item }) => {
          const others = item.memberIds.filter((id) => id !== me);
          const title =
            item.title ||
            others.map((id) => userById(id)?.username ?? 'unknown').join(', ');
          const avatarUser = userById(others[0] ?? item.memberIds[0]);
          const last = messagesFor(item.id).at(-1);
          return (
            <Pressable
              style={styles.row}
              onPress={() => router.push(`/messages/${item.id}`)}
            >
              <Avatar
                uri={item.isGroup ? null : avatarUser?.avatarUri}
                name={title}
                size={52}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>
                  {title}
                  {item.isGroup ? ' · 그룹' : ''}
                </Text>
                <Text style={styles.preview} numberOfLines={1}>
                  {last?.text ?? '대화를 시작해 보세요'}
                </Text>
              </View>
              {last ? (
                <Text style={styles.time}>{formatKstRelative(last.createdAt)}</Text>
              ) : null}
            </Pressable>
          );
        }}
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
  title: { fontSize: 22, fontWeight: '700', color: Colors.text },
  newGroup: { color: Colors.primary, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  name: { fontWeight: '600', color: Colors.text, fontSize: 15 },
  preview: { color: Colors.textSecondary, marginTop: 2, fontSize: 13 },
  time: { color: Colors.textSecondary, fontSize: 11 },
  emptyWrap: { flexGrow: 1, justifyContent: 'center' },
  empty: { textAlign: 'center', color: Colors.textSecondary },
});
