import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Colors, Spacing } from '@/constants/theme';
import { useHaruStore } from '@/lib/store';

export default function NewGroupScreen() {
  const me = useHaruStore((s) => s.currentUserId);
  const users = useHaruStore((s) => s.users);
  const createGroup = useHaruStore((s) => s.createGroup);
  const [title, setTitle] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const candidates = useMemo(
    () => users.filter((u) => u.id !== me),
    [users, me],
  );

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const onCreate = () => {
    const res = createGroup(title, selected);
    if (!res.ok) {
      Alert.alert('그룹 만들기 실패', res.error);
      return;
    }
    if ('conversationId' in res) {
      router.replace(`/messages/${res.conversationId}`);
    }
  };

  return (
    <View style={styles.root}>
      <TextInput
        style={styles.input}
        placeholder="그룹 이름"
        placeholderTextColor={Colors.textSecondary}
        value={title}
        onChangeText={setTitle}
      />
      <Text style={styles.hint}>멤버 선택 (나 포함 3명 이상)</Text>
      <FlatList
        data={candidates}
        keyExtractor={(u) => u.id}
        renderItem={({ item }) => {
          const on = selected.includes(item.id);
          return (
            <Pressable style={styles.row} onPress={() => toggle(item.id)}>
              <Avatar uri={item.avatarUri} name={item.displayName} size={44} />
              <View style={{ flex: 1 }}>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.name}>{item.displayName}</Text>
              </View>
              <View style={[styles.check, on && styles.checkOn]} />
            </Pressable>
          );
        }}
      />
      <Pressable style={styles.primary} onPress={onCreate}>
        <Text style={styles.primaryText}>그룹 만들기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background, padding: Spacing.md },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  hint: { color: Colors.textSecondary, marginBottom: Spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  username: { fontWeight: '600', color: Colors.text },
  name: { color: Colors.textSecondary, fontSize: 13 },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  checkOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  primary: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  primaryText: { color: Colors.textInverse, fontWeight: '700' },
});
