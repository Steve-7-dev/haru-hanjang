import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Colors, Spacing } from '@/constants/theme';
import { formatKstRelative } from '@/lib/kst';
import { useHaruStore } from '@/lib/store';

export default function NotificationsScreen() {
  const items = useHaruStore((s) => s.notificationsForMe());
  const userById = useHaruStore((s) => s.userById);
  const markNotificationsRead = useHaruStore((s) => s.markNotificationsRead);

  useFocusEffect(
    useCallback(() => {
      markNotificationsRead();
    }, [markNotificationsRead]),
  );

  return (
    <FlatList
      style={styles.root}
      data={items}
      keyExtractor={(n) => n.id}
      contentContainerStyle={items.length === 0 ? styles.emptyWrap : { padding: Spacing.md }}
      ListEmptyComponent={
        <Text style={styles.empty}>새 알림이 없어요.</Text>
      }
      renderItem={({ item }) => {
        const actor = userById(item.actorId);
        return (
          <View style={[styles.row, !item.read && styles.unread]}>
            <Avatar uri={actor?.avatarUri} name={actor?.displayName ?? '?'} size={44} />
            <View style={{ flex: 1 }}>
              <Text style={styles.body}>
                <Text style={styles.username}>{actor?.username} </Text>
                {item.text}
              </Text>
              <Text style={styles.time}>{formatKstRelative(item.createdAt)}</Text>
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  emptyWrap: { flexGrow: 1, justifyContent: 'center' },
  empty: { textAlign: 'center', color: Colors.textSecondary },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  unread: { backgroundColor: '#F0F8FF' },
  username: { fontWeight: '700', color: Colors.text },
  body: { color: Colors.text, lineHeight: 18 },
  time: { color: Colors.textSecondary, fontSize: 11, marginTop: 4 },
});
