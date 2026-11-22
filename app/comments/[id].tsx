import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { useShallow } from 'zustand/react/shallow';

import { AppText } from '@/components/AppText';
import { AppTextInput } from '@/components/AppTextInput';
import { Avatar } from '@/components/Avatar';
import { PostCard } from '@/components/PostCard';
import { FontFamily } from '@/constants/fonts';
import { PopArt } from '@/constants/popArt';
import { Colors, Spacing } from '@/constants/theme';
import { formatKstRelative } from '@/lib/kst';
import { useHaruStore } from '@/lib/store';
import { MAX_COMMENT_LEN } from '@/lib/validation';

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
        <AppText style={styles.muted}>게시물을 찾을 수 없어요.</AppText>
      </View>
    );
  }

  const onSubmit = () => {
    const res = addComment(id, text);
    if (res.ok) setText('');
  };

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
                <AppText style={styles.commentBody}>
                  <AppText style={styles.username}>{author?.username} </AppText>
                  {item.text}
                </AppText>
                <AppText style={styles.time}>{formatKstRelative(item.createdAt)}</AppText>
              </View>
            </View>
          );
        }}
      />
      <View style={styles.composer}>
        <AppTextInput
          style={styles.input}
          placeholder="댓글 달기..."
          placeholderTextColor={Colors.textSecondary}
          value={text}
          onChangeText={setText}
          maxLength={MAX_COMMENT_LEN}
          accessibilityLabel="댓글 입력"
          onSubmitEditing={onSubmit}
          returnKeyType="send"
        />
        <Pressable
          onPress={onSubmit}
          accessibilityRole="button"
          accessibilityLabel="댓글 게시"
          disabled={!text.trim()}
        >
          <AppText style={[styles.postBtn, !text.trim() && { opacity: 0.4 }]}>게시</AppText>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { fontFamily: FontFamily.sans, color: Colors.textSecondary },
  comment: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  username: { fontFamily: FontFamily.sans, fontWeight: '600', color: Colors.text },
  commentBody: { fontFamily: FontFamily.sans, color: Colors.text, lineHeight: 18 },
  time: { fontFamily: FontFamily.sans, color: Colors.textSecondary, fontSize: 11, marginTop: 4 },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: PopArt.borderWidth,
    borderTopColor: PopArt.ink,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    backgroundColor: PopArt.panel,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.sans,
    paddingVertical: 10,
    paddingHorizontal: Spacing.sm,
    color: PopArt.ink,
    fontSize: 14,
    borderWidth: PopArt.borderWidth,
    borderColor: PopArt.ink,
    borderRadius: 0,
    backgroundColor: PopArt.panel,
  },
  postBtn: {
    fontFamily: FontFamily.sans,
    color: PopArt.ink,
    fontWeight: '700',
    paddingHorizontal: 8,
  },
});
