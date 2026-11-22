import { PLACEHOLDER } from './placeholders';
import type { AppData } from './types';

const now = Date.now();
const iso = (minsAgo: number) => new Date(now - minsAgo * 60_000).toISOString();

/**
 * Sample personas + content for first launch.
 * Seed users have no on-device credentials — register a new account to sign in.
 */
export const SEED: AppData = {
  users: [
    {
      id: 'u_mina',
      email: 'mina@sample.local',
      username: 'mina',
      displayName: '미나',
      bio: '오늘의 한 장만.',
      avatarUri: PLACEHOLDER.avatarMina,
      isPrivate: false,
      createdAt: iso(60 * 24 * 30),
      authProvider: 'email',
    },
    {
      id: 'u_jun',
      email: 'jun@sample.local',
      username: 'jun.park',
      displayName: '준',
      bio: '하루 한 장으로 기록 중',
      avatarUri: PLACEHOLDER.avatarJun,
      isPrivate: false,
      createdAt: iso(60 * 24 * 20),
      authProvider: 'email',
    },
    {
      id: 'u_soo',
      email: 'soo@sample.local',
      username: 'soo.kim',
      displayName: '수진',
      bio: '비공개로 친구만',
      avatarUri: PLACEHOLDER.avatarSoo,
      isPrivate: true,
      createdAt: iso(60 * 24 * 10),
      authProvider: 'email',
    },
  ],
  posts: [
    {
      id: 'p_mina_1',
      authorId: 'u_mina',
      dayKey: '2026-11-20',
      imageUri: PLACEHOLDER.postCoffee,
      caption: '아침 커피. 오늘은 이 한 장이면 충분해.',
      createdAt: iso(60 * 18),
      updatedAt: iso(60 * 18),
    },
    {
      id: 'p_jun_1',
      authorId: 'u_jun',
      dayKey: '2026-11-20',
      imageUri: PLACEHOLDER.postSunset,
      caption: '한강 노을.',
      createdAt: iso(60 * 8),
      updatedAt: iso(60 * 8),
    },
    {
      id: 'p_soo_1',
      authorId: 'u_soo',
      dayKey: '2026-11-19',
      imageUri: PLACEHOLDER.postDinner,
      caption: '친구들이랑 저녁.',
      createdAt: iso(60 * 30),
      updatedAt: iso(60 * 30),
    },
  ],
  likes: [
    { postId: 'p_mina_1', userId: 'u_jun', createdAt: iso(60 * 10) },
    { postId: 'p_jun_1', userId: 'u_mina', createdAt: iso(60 * 5) },
  ],
  comments: [
    {
      id: 'c1',
      postId: 'p_mina_1',
      authorId: 'u_jun',
      text: '색감 좋다',
      createdAt: iso(60 * 9),
    },
  ],
  follows: [
    { followerId: 'u_mina', followingId: 'u_jun', createdAt: iso(60 * 24 * 5) },
    { followerId: 'u_jun', followingId: 'u_mina', createdAt: iso(60 * 24 * 5) },
    { followerId: 'u_mina', followingId: 'u_soo', createdAt: iso(60 * 24 * 2) },
    { followerId: 'u_jun', followingId: 'u_soo', createdAt: iso(60 * 24 * 2) },
  ],
  conversations: [
    {
      id: 'cv_1',
      title: null,
      isGroup: false,
      memberIds: ['u_mina', 'u_jun'],
      createdAt: iso(60 * 24),
      updatedAt: iso(60 * 2),
    },
    {
      id: 'cv_group',
      title: '하루한장 친구들',
      isGroup: true,
      memberIds: ['u_mina', 'u_jun', 'u_soo'],
      createdAt: iso(60 * 48),
      updatedAt: iso(60 * 3),
    },
  ],
  messages: [
    {
      id: 'm1',
      conversationId: 'cv_1',
      senderId: 'u_jun',
      text: '오늘 사진 올렸어?',
      createdAt: iso(60 * 3),
    },
    {
      id: 'm2',
      conversationId: 'cv_1',
      senderId: 'u_mina',
      text: '응, 커피로 골랐어.',
      createdAt: iso(60 * 2),
    },
    {
      id: 'm3',
      conversationId: 'cv_group',
      senderId: 'u_soo',
      text: '오늘도 하루 한 장 잊지 마!',
      createdAt: iso(60 * 4),
    },
  ],
  notifications: [],
};
