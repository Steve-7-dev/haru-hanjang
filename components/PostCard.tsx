import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useShallow } from 'zustand/react/shallow';

import { Colors, Spacing } from '@/constants/theme';
import { formatKstRelative } from '@/lib/kst';
import { useHaruStore } from '@/lib/store';
import type { Post } from '@/lib/types';

import { Avatar } from './Avatar';

const WIDTH = Dimensions.get('window').width;

type Props = { post: Post };

export function PostCard({ post }: Props) {
  const author = useHaruStore((s) => s.userById(post.authorId));
  const likesCount = useHaruStore((s) => s.likesCount(post.id));
  const liked = useHaruStore((s) => s.likedByMe(post.id));
  const comments = useHaruStore(useShallow((s) => s.commentsFor(post.id)));
  const toggleLike = useHaruStore((s) => s.toggleLike);
  const [heartBurst, setHeartBurst] = useState(false);

  if (!author) return null;

  const onDoubleTap = () => {
    if (!liked) toggleLike(post.id);
    setHeartBurst(true);
    setTimeout(() => setHeartBurst(false), 600);
  };

  return (
    <View style={styles.card}>
      <Pressable
        style={styles.header}
        onPress={() => router.push(`/user/${author.id}`)}
      >
        <Avatar uri={author.avatarUri} name={author.displayName} size={32} />
        <View style={styles.headerText}>
          <Text style={styles.username}>{author.username}</Text>
          <Text style={styles.meta}>{formatKstRelative(post.createdAt)}</Text>
        </View>
      </Pressable>

      <Pressable onPress={onDoubleTap}>
        <Image source={{ uri: post.imageUri }} style={styles.image} contentFit="cover" />
        {heartBurst ? (
          <View style={styles.burstWrap} pointerEvents="none">
            <Ionicons name="heart" size={88} color={Colors.textInverse} />
          </View>
        ) : null}
      </Pressable>

      <View style={styles.actions}>
        <Pressable
          onPress={() => toggleLike(post.id)}
          hitSlop={8}
          style={styles.actionBtn}
          accessibilityRole="button"
          accessibilityLabel={liked ? '좋아요 취소' : '좋아요'}
          accessibilityState={{ selected: liked }}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={26}
            color={liked ? Colors.heart : Colors.text}
          />
        </Pressable>
        <Pressable
          onPress={() => router.push(`/comments/${post.id}`)}
          hitSlop={8}
          style={styles.actionBtn}
          accessibilityRole="button"
          accessibilityLabel="댓글 보기"
        >
          <Ionicons name="chatbubble-outline" size={24} color={Colors.text} />
        </Pressable>
        <Pressable
          onPress={() => {
            const id = useHaruStore.getState().startDm(author.id);
            router.push(`/messages/${id}`);
          }}
          hitSlop={8}
          style={styles.actionBtn}
        >
          <Ionicons name="paper-plane-outline" size={24} color={Colors.text} />
        </Pressable>
      </View>

      {likesCount > 0 ? (
        <Text style={styles.likes}>좋아요 {likesCount.toLocaleString('ko-KR')}개</Text>
      ) : null}

      {post.caption ? (
        <Text style={styles.caption}>
          <Text style={styles.username}>{author.username} </Text>
          {post.caption}
        </Text>
      ) : null}

      {comments.length > 0 ? (
        <Link href={`/comments/${post.id}`} asChild>
          <Pressable>
            <Text style={styles.viewComments}>
              댓글 {comments.length}개 모두 보기
            </Text>
          </Pressable>
        </Link>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    marginBottom: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
    paddingBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  headerText: { flex: 1 },
  username: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  meta: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  image: {
    width: WIDTH,
    height: WIDTH,
    backgroundColor: Colors.borderLight,
  },
  burstWrap: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.sm,
    gap: 4,
  },
  actionBtn: { padding: Spacing.sm },
  likes: {
    paddingHorizontal: Spacing.md,
    fontWeight: '600',
    color: Colors.text,
    fontSize: 14,
    marginTop: 2,
  },
  caption: {
    paddingHorizontal: Spacing.md,
    marginTop: 4,
    color: Colors.text,
    fontSize: 14,
    lineHeight: 18,
  },
  viewComments: {
    paddingHorizontal: Spacing.md,
    marginTop: 6,
    color: Colors.textSecondary,
    fontSize: 13,
  },
});
