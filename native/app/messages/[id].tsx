import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useShallow } from 'zustand/react/shallow';

import { Colors, Spacing } from '@/constants/theme';
import { formatKstRelative } from '@/lib/kst';
import { useHaruStore } from '@/lib/store';
import { MAX_MESSAGE_LEN } from '@/lib/validation';

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const me = useHaruStore((s) => s.currentUserId);
  const conv = useHaruStore((s) => s.conversations.find((c) => c.id === id));
  const messages = useHaruStore(useShallow((s) => s.messagesFor(id)));
  const userById = useHaruStore((s) => s.userById);
  const sendMessage = useHaruStore((s) => s.sendMessage);
  const [text, setText] = useState('');

  if (!conv) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>대화를 찾을 수 없어요.</Text>
      </View>
    );
  }

  const title =
    conv.title ||
    conv.memberIds
      .filter((uid) => uid !== me)
      .map((uid) => userById(uid)?.username ?? '?')
      .join(', ');

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={88}
    >
      <Stack.Screen options={{ title }} />
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: Spacing.md, gap: Spacing.sm }}
        renderItem={({ item }) => {
          const mine = item.senderId === me;
          const sender = userById(item.senderId);
          return (
            <View style={[styles.bubbleWrap, mine && styles.mineWrap]}>
              {conv.isGroup && !mine ? (
                <Text style={styles.sender}>{sender?.username}</Text>
              ) : null}
              <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                <Text style={[styles.body, mine && styles.mineText]}>{item.text}</Text>
              </View>
              <Text style={styles.time}>{formatKstRelative(item.createdAt)}</Text>
            </View>
          );
        }}
      />
      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="메시지 보내기..."
          placeholderTextColor={Colors.textSecondary}
          value={text}
          onChangeText={setText}
          maxLength={MAX_MESSAGE_LEN}
        />
        <Pressable
          onPress={() => {
            const res = sendMessage(id, text);
            if (res.ok) setText('');
          }}
        >
          <Text style={[styles.send, !text.trim() && { opacity: 0.4 }]}>보내기</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { color: Colors.textSecondary },
  bubbleWrap: { alignItems: 'flex-start', maxWidth: '80%' },
  mineWrap: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  sender: { fontSize: 11, color: Colors.textSecondary, marginBottom: 2, marginLeft: 4 },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  theirs: {
    backgroundColor: Colors.backgroundMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  mine: { backgroundColor: Colors.primary },
  body: { color: Colors.text, fontSize: 15, lineHeight: 20 },
  mineText: { color: Colors.textInverse },
  time: { fontSize: 10, color: Colors.textSecondary, marginTop: 2, marginHorizontal: 4 },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: Colors.text,
  },
  send: { color: Colors.primary, fontWeight: '700' },
});
