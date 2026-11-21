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

import { Avatar } from '@/components/Avatar';
import { PostCard } from '@/components/PostCard';
import { Colors, Spacing } from '@/constants/theme';
import { formatKstRelative } from '@/lib/kst';
import { useHaruStore } from '@/lib/store';

export default function CommentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const post = useHaruStore((s) => s.posts.find((p) => p.id === id));
  const comments = useHaruStore(useShallow((s) => s.commentsFor(id)));
  const userById = useHaruStore((s) => s.userById);
  const addComment = useHaruStore((s) => s.addComment);
  const [text, setText] = useState('');

  if (!post) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: '댓글' }} />
        <Text style={styles.muted}>게시물을 찾을 수 없어요.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={88}
    >
      <Stack.Screen options={{ title: '댓글' }} />
      <FlatList
        data={comments}
        keyExtractor={(c) => c.id}
        ListHeaderComponent={<PostCard post={post} />}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }) => {
          const author = userById(item.authorId);
          return (
            <View style={styles.comment}>
              <Avatar uri={author?.avatarUri} name={author?.displayName ?? '?'} size={32} />
              <View style={{ flex: 1 }}>
                <Text style={styles.commentBody}>
                  <Text style={styles.username}>{author?.username} </Text>
                  {item.text}
                </Text>
                <Text style={styles.time}>{formatKstRelative(item.createdAt)}</Text>
              </View>
            </View>
          );
        }}
      />
      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="댓글 달기..."
          placeholderTextColor={Colors.textSecondary}
          value={text}
          onChangeText={setText}
        />
        <Pressable
          onPress={() => {
            const res = addComment(id, text);
            if (res.ok) setText('');
          }}
        >
          <Text style={[styles.postBtn, !text.trim() && { opacity: 0.4 }]}>게시</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { color: Colors.textSecondary },
  comment: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  username: { fontWeight: '600', color: Colors.text },
  commentBody: { color: Colors.text, lineHeight: 18 },
  time: { color: Colors.textSecondary, fontSize: 11, marginTop: 4 },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  input: { flex: 1, paddingVertical: 10, color: Colors.text, fontSize: 14 },
  postBtn: { color: Colors.primary, fontWeight: '700' },
});
