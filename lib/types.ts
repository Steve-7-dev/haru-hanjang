export type UserId = string;
export type PostId = string;
export type CommentId = string;
export type ConversationId = string;
export type MessageId = string;

export interface User {
  id: UserId;
  email: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUri: string | null;
  isPrivate: boolean;
  createdAt: string;
  authProvider: 'email' | 'google' | 'kakao' | 'apple';
  /** Push tokens are kept in memory only — not persisted with profile data. */
  pushToken?: string | null;
}

export interface Post {
  id: PostId;
  authorId: UserId;
  /** KST calendar day key: YYYY-MM-DD */
  dayKey: string;
  imageUri: string;
  caption: string;
  createdAt: string;
  updatedAt: string;
}

export interface Like {
  postId: PostId;
  userId: UserId;
  createdAt: string;
}

export interface Comment {
  id: CommentId;
  postId: PostId;
  authorId: UserId;
  text: string;
  createdAt: string;
}

export interface Follow {
  followerId: UserId;
  followingId: UserId;
  createdAt: string;
}

export interface Conversation {
  id: ConversationId;
  /** null for 1:1, string for group */
  title: string | null;
  isGroup: boolean;
  memberIds: UserId[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: MessageId;
  conversationId: ConversationId;
  senderId: UserId;
  text: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: UserId;
  type: 'like' | 'comment' | 'follow' | 'message';
  actorId: UserId;
  postId?: PostId;
  conversationId?: ConversationId;
  text: string;
  read: boolean;
  createdAt: string;
}

export interface AppData {
  users: User[];
  posts: Post[];
  likes: Like[];
  comments: Comment[];
  follows: Follow[];
  conversations: Conversation[];
  messages: Message[];
  notifications: NotificationItem[];
}
