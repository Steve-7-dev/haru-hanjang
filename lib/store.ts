import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { clearAllCredentials, setEmailCredential, verifyEmailCredential } from './credentials';
import { createId } from './id';
import { kstDayKey } from './kst';
import { SEED } from './seed';
import type {
  AppData,
  Comment,
  Conversation,
  Message,
  NotificationItem,
  Post,
  User,
  UserId,
} from './types';
import {
  MAX_BIO_LEN,
  MAX_CAPTION_LEN,
  MAX_COMMENT_LEN,
  MAX_DISPLAY_NAME_LEN,
  MAX_GROUP_TITLE_LEN,
  MAX_MESSAGE_LEN,
  clampText,
  isValidEmail,
  normalizeEmail,
  normalizeUsername,
  validatePassword,
  validateUsername,
} from './validation';

type AuthResult = { ok: true } | { ok: false; error: string };

function stripSensitiveUser(u: User): User {
  const { pushToken: _pushToken, ...rest } = u;
  return rest;
}

interface HaruState extends AppData {
  currentUserId: UserId | null;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;

  me: () => User | null;
  userById: (id: UserId) => User | undefined;
  isFollowing: (targetId: UserId) => boolean;
  canViewUser: (targetId: UserId) => boolean;
  todayPostFor: (userId: UserId) => Post | undefined;

  homeFeed: () => Post[];
  exploreFeed: () => Post[];
  postsByUser: (userId: UserId) => Post[];
  likesCount: (postId: string) => number;
  likedByMe: (postId: string) => boolean;
  commentsFor: (postId: string) => Comment[];
  followerCount: (userId: UserId) => number;
  followingCount: (userId: UserId) => number;

  registerEmail: (input: {
    email: string;
    password: string;
    username: string;
    displayName: string;
  }) => Promise<AuthResult>;
  loginEmail: (email: string, password: string) => Promise<AuthResult>;
  /** OAuth providers are not wired — intentionally disabled for the private demo. */
  loginOAuthStub: (provider: 'google' | 'kakao' | 'apple') => AuthResult;
  logout: () => void;

  updateProfile: (patch: Partial<Pick<User, 'displayName' | 'bio' | 'avatarUri' | 'isPrivate' | 'username'>>) => AuthResult;
  follow: (targetId: UserId) => void;
  unfollow: (targetId: UserId) => void;

  createOrUpdateTodayPost: (imageUri: string, caption: string) => AuthResult;
  deleteTodayPost: () => AuthResult;

  toggleLike: (postId: string) => void;
  addComment: (postId: string, text: string) => AuthResult;

  myConversations: () => Conversation[];
  messagesFor: (conversationId: string) => Message[];
  startDm: (otherId: UserId) => string;
  createGroup: (title: string, memberIds: UserId[]) => AuthResult | { ok: true; conversationId: string };
  sendMessage: (conversationId: string, text: string) => AuthResult;

  notificationsForMe: () => NotificationItem[];
  markNotificationsRead: () => void;
  registerPushToken: (token: string) => void;

  resetDemo: () => void;
}

function notify(
  state: HaruState,
  partial: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>,
): NotificationItem[] {
  if (partial.userId === state.currentUserId) return state.notifications;
  const item: NotificationItem = {
    ...partial,
    id: createId('n'),
    read: false,
    createdAt: new Date().toISOString(),
  };
  return [item, ...state.notifications].slice(0, 200);
}

export const useHaruStore = create<HaruState>()(
  persist(
    (set, get) => ({
      ...SEED,
      currentUserId: null,
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),

      me: () => {
        const { currentUserId, users } = get();
        return users.find((u) => u.id === currentUserId) ?? null;
      },
      userById: (id) => get().users.find((u) => u.id === id),
      isFollowing: (targetId) => {
        const me = get().currentUserId;
        if (!me) return false;
        return get().follows.some((f) => f.followerId === me && f.followingId === targetId);
      },
      canViewUser: (targetId) => {
        const me = get().currentUserId;
        const user = get().userById(targetId);
        if (!user) return false;
        if (!user.isPrivate) return true;
        if (me === targetId) return true;
        return get().isFollowing(targetId);
      },
      todayPostFor: (userId) => {
        const day = kstDayKey();
        return get().posts.find((p) => p.authorId === userId && p.dayKey === day);
      },

      homeFeed: () => {
        const me = get().currentUserId;
        if (!me) return [];
        const following = new Set(
          get()
            .follows.filter((f) => f.followerId === me)
            .map((f) => f.followingId),
        );
        following.add(me);
        return get()
          .posts.filter((p) => following.has(p.authorId) && get().canViewUser(p.authorId))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      },
      exploreFeed: () =>
        get()
          .posts.filter((p) => {
            const author = get().userById(p.authorId);
            return author && !author.isPrivate;
          })
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      postsByUser: (userId) =>
        get()
          .posts.filter((p) => p.authorId === userId)
          .sort((a, b) => b.dayKey.localeCompare(a.dayKey)),
      likesCount: (postId) => get().likes.filter((l) => l.postId === postId).length,
      likedByMe: (postId) => {
        const me = get().currentUserId;
        if (!me) return false;
        return get().likes.some((l) => l.postId === postId && l.userId === me);
      },
      commentsFor: (postId) =>
        get()
          .comments.filter((c) => c.postId === postId)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
      followerCount: (userId) => get().follows.filter((f) => f.followingId === userId).length,
      followingCount: (userId) => get().follows.filter((f) => f.followerId === userId).length,

      registerEmail: async ({ email, password, username, displayName }) => {
        const e = normalizeEmail(email);
        if (!isValidEmail(e)) return { ok: false, error: '올바른 이메일을 입력해 주세요.' };
        const pwdErr = validatePassword(password);
        if (pwdErr) return { ok: false, error: pwdErr };
        const uErr = validateUsername(username);
        if (uErr) return { ok: false, error: uErr };
        const u = normalizeUsername(username);
        if (get().users.some((x) => x.email === e)) {
          return { ok: false, error: '이미 가입된 이메일이에요.' };
        }
        if (get().users.some((x) => x.username === u)) {
          return { ok: false, error: '이미 쓰는 유저네임이에요.' };
        }
        const name = clampText(displayName || u, MAX_DISPLAY_NAME_LEN) || u;
        try {
          await setEmailCredential(e, password);
        } catch {
          return { ok: false, error: '비밀번호를 안전하게 저장하지 못했어요. 다시 시도해 주세요.' };
        }
        const user: User = {
          id: createId('u'),
          email: e,
          username: u,
          displayName: name,
          bio: '',
          avatarUri: null,
          isPrivate: false,
          createdAt: new Date().toISOString(),
          authProvider: 'email',
        };
        set((s) => ({ users: [...s.users, user], currentUserId: user.id }));
        return { ok: true };
      },

      loginEmail: async (email, password) => {
        const e = normalizeEmail(email);
        if (!isValidEmail(e) || !password) {
          return { ok: false, error: '이메일 또는 비밀번호가 올바르지 않아요.' };
        }
        const user = get().users.find((x) => x.email === e);
        if (!user) {
          return { ok: false, error: '이메일 또는 비밀번호가 올바르지 않아요.' };
        }
        let ok = false;
        try {
          ok = await verifyEmailCredential(e, password);
        } catch {
          return { ok: false, error: '로그인 검증에 실패했어요. 다시 시도해 주세요.' };
        }
        if (!ok) {
          return { ok: false, error: '이메일 또는 비밀번호가 올바르지 않아요.' };
        }
        set({ currentUserId: user.id });
        return { ok: true };
      },

      loginOAuthStub: (_provider) => ({
        ok: false,
        error:
          '소셜 로그인은 아직 연결되지 않았어요. 이메일로 가입·로그인해 주세요. (의도된 스텁)',
      }),

      logout: () => set({ currentUserId: null }),

      updateProfile: (patch) => {
        const me = get().currentUserId;
        if (!me) return { ok: false, error: '로그인이 필요해요.' };
        if (patch.username) {
          const uErr = validateUsername(patch.username);
          if (uErr) return { ok: false, error: uErr };
          const u = normalizeUsername(patch.username);
          if (get().users.some((x) => x.username === u && x.id !== me)) {
            return { ok: false, error: '이미 쓰는 유저네임이에요.' };
          }
          patch = { ...patch, username: u };
        }
        if (patch.displayName != null) {
          patch = { ...patch, displayName: clampText(patch.displayName, MAX_DISPLAY_NAME_LEN) };
        }
        if (patch.bio != null) {
          patch = { ...patch, bio: clampText(patch.bio, MAX_BIO_LEN) };
        }
        set((s) => ({
          users: s.users.map((x) => (x.id === me ? { ...x, ...patch } : x)),
        }));
        return { ok: true };
      },

      follow: (targetId) => {
        const me = get().currentUserId;
        if (!me || me === targetId || get().isFollowing(targetId)) return;
        const target = get().userById(targetId);
        set((s) => ({
          follows: [
            ...s.follows,
            { followerId: me, followingId: targetId, createdAt: new Date().toISOString() },
          ],
          notifications: target
            ? notify(s, {
                userId: targetId,
                type: 'follow',
                actorId: me,
                text: '회원님을 팔로우하기 시작했습니다.',
              })
            : s.notifications,
        }));
      },

      unfollow: (targetId) => {
        const me = get().currentUserId;
        if (!me) return;
        set((s) => ({
          follows: s.follows.filter((f) => !(f.followerId === me && f.followingId === targetId)),
        }));
      },

      createOrUpdateTodayPost: (imageUri, caption) => {
        const me = get().currentUserId;
        if (!me) return { ok: false, error: '로그인이 필요해요.' };
        if (!imageUri || typeof imageUri !== 'string') {
          return { ok: false, error: '사진을 선택해 주세요.' };
        }
        if (imageUri.startsWith('javascript:') || imageUri.startsWith('data:text/html')) {
          return { ok: false, error: '지원하지 않는 이미지예요.' };
        }
        const dayKey = kstDayKey();
        const existing = get().todayPostFor(me);
        const now = new Date().toISOString();
        const safeCaption = clampText(caption, MAX_CAPTION_LEN);
        if (existing) {
          set((s) => ({
            posts: s.posts.map((p) =>
              p.id === existing.id
                ? { ...p, imageUri, caption: safeCaption, updatedAt: now }
                : p,
            ),
          }));
          return { ok: true };
        }
        const post: Post = {
          id: createId('p'),
          authorId: me,
          dayKey,
          imageUri,
          caption: safeCaption,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ posts: [post, ...s.posts] }));
        return { ok: true };
      },

      deleteTodayPost: () => {
        const me = get().currentUserId;
        if (!me) return { ok: false, error: '로그인이 필요해요.' };
        const existing = get().todayPostFor(me);
        if (!existing) return { ok: false, error: '오늘 올린 사진이 없어요.' };
        set((s) => ({
          posts: s.posts.filter((p) => p.id !== existing.id),
          likes: s.likes.filter((l) => l.postId !== existing.id),
          comments: s.comments.filter((c) => c.postId !== existing.id),
        }));
        return { ok: true };
      },

      toggleLike: (postId) => {
        const me = get().currentUserId;
        if (!me) return;
        const liked = get().likedByMe(postId);
        const post = get().posts.find((p) => p.id === postId);
        if (liked) {
          set((s) => ({
            likes: s.likes.filter((l) => !(l.postId === postId && l.userId === me)),
          }));
        } else {
          set((s) => ({
            likes: [
              ...s.likes,
              { postId, userId: me, createdAt: new Date().toISOString() },
            ],
            notifications:
              post && post.authorId !== me
                ? notify(s, {
                    userId: post.authorId,
                    type: 'like',
                    actorId: me,
                    postId,
                    text: '회원님의 사진을 좋아합니다.',
                  })
                : s.notifications,
          }));
        }
      },

      addComment: (postId, text) => {
        const me = get().currentUserId;
        if (!me) return { ok: false, error: '로그인이 필요해요.' };
        const t = clampText(text, MAX_COMMENT_LEN);
        if (!t) return { ok: false, error: '댓글을 입력해 주세요.' };
        const post = get().posts.find((p) => p.id === postId);
        const comment: Comment = {
          id: createId('c'),
          postId,
          authorId: me,
          text: t,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          comments: [...s.comments, comment],
          notifications:
            post && post.authorId !== me
              ? notify(s, {
                  userId: post.authorId,
                  type: 'comment',
                  actorId: me,
                  postId,
                  text: `댓글: ${t.slice(0, 40)}`,
                })
              : s.notifications,
        }));
        return { ok: true };
      },

      myConversations: () => {
        const me = get().currentUserId;
        if (!me) return [];
        return get()
          .conversations.filter((c) => c.memberIds.includes(me))
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      },
      messagesFor: (conversationId) =>
        get()
          .messages.filter((m) => m.conversationId === conversationId)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),

      startDm: (otherId) => {
        const me = get().currentUserId!;
        const existing = get().conversations.find(
          (c) =>
            !c.isGroup &&
            c.memberIds.length === 2 &&
            c.memberIds.includes(me) &&
            c.memberIds.includes(otherId),
        );
        if (existing) return existing.id;
        const id = createId('cv');
        const now = new Date().toISOString();
        set((s) => ({
          conversations: [
            {
              id,
              title: null,
              isGroup: false,
              memberIds: [me, otherId],
              createdAt: now,
              updatedAt: now,
            },
            ...s.conversations,
          ],
        }));
        return id;
      },

      createGroup: (title, memberIds) => {
        const me = get().currentUserId;
        if (!me) return { ok: false, error: '로그인이 필요해요.' };
        const name = clampText(title, MAX_GROUP_TITLE_LEN);
        if (!name) return { ok: false, error: '그룹 이름이 필요해요.' };
        const members = Array.from(new Set([me, ...memberIds.filter((id) => typeof id === 'string')]));
        if (members.length < 3) return { ok: false, error: '그룹은 나 포함 3명 이상이어야 해요.' };
        const id = createId('cv');
        const now = new Date().toISOString();
        set((s) => ({
          conversations: [
            {
              id,
              title: name,
              isGroup: true,
              memberIds: members,
              createdAt: now,
              updatedAt: now,
            },
            ...s.conversations,
          ],
        }));
        return { ok: true, conversationId: id };
      },

      sendMessage: (conversationId, text) => {
        const me = get().currentUserId;
        if (!me) return { ok: false, error: '로그인이 필요해요.' };
        const t = clampText(text, MAX_MESSAGE_LEN);
        if (!t) return { ok: false, error: '메시지를 입력해 주세요.' };
        const conv = get().conversations.find((c) => c.id === conversationId);
        if (!conv || !conv.memberIds.includes(me)) {
          return { ok: false, error: '대화를 찾을 수 없어요.' };
        }
        const now = new Date().toISOString();
        const msg: Message = {
          id: createId('m'),
          conversationId,
          senderId: me,
          text: t,
          createdAt: now,
        };
        set((s) => {
          let notifications = s.notifications;
          for (const uid of conv.memberIds) {
            if (uid === me) continue;
            notifications = notify(
              { ...s, notifications },
              {
                userId: uid,
                type: 'message',
                actorId: me,
                conversationId,
                text: t.slice(0, 60),
              },
            );
          }
          return {
            messages: [...s.messages, msg],
            conversations: s.conversations.map((c) =>
              c.id === conversationId ? { ...c, updatedAt: now } : c,
            ),
            notifications,
          };
        });
        return { ok: true };
      },

      notificationsForMe: () => {
        const me = get().currentUserId;
        if (!me) return [];
        return get()
          .notifications.filter((n) => n.userId === me)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      },
      markNotificationsRead: () => {
        const me = get().currentUserId;
        if (!me) return;
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.userId === me ? { ...n, read: true } : n,
          ),
        }));
      },
      registerPushToken: (token) => {
        const me = get().currentUserId;
        if (!me || typeof token !== 'string' || token.length > 4096) return;
        // Kept in memory only; stripped from persisted profile snapshots.
        set((s) => ({
          users: s.users.map((u) => (u.id === me ? { ...u, pushToken: token } : u)),
        }));
      },

      resetDemo: () => {
        void clearAllCredentials();
        set({ ...SEED, currentUserId: null });
      },
    }),
    {
      name: 'haru-hanjang-v2',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state, error) => {
        if (state?.users) {
          state.users = state.users.map((u) => {
            const cleaned = stripSensitiveUser(u as User & { passwordHash?: string });
            // Drop legacy passwordHash if present in old snapshots.
            const { passwordHash: _legacy, ...rest } = cleaned as User & { passwordHash?: string };
            return rest;
          });
        }
        state?.setHydrated(true);
        if (error) state?.setHydrated(true);
      },
      partialize: (s) => ({
        users: s.users.map(stripSensitiveUser),
        posts: s.posts,
        likes: s.likes,
        comments: s.comments,
        follows: s.follows,
        conversations: s.conversations,
        messages: s.messages,
        notifications: s.notifications,
        currentUserId: s.currentUserId,
      }),
    },
  ),
);
