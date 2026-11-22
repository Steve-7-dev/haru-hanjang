export type ApiUser = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio: string;
  isPrivate: boolean;
  createdAt: string;
  avatarUri: string | null;
  authProvider: 'email';
};

export type ApiPost = {
  id: string;
  authorId: string;
  dayKey: string;
  imageUri: string;
  caption: string;
  createdAt: string;
  updatedAt: string;
  author?: { id: string; username: string; displayName: string };
  likeCount?: number;
  commentCount?: number;
  likedByMe?: boolean;
};

async function parse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || '요청에 실패했어요.');
  }
  return data as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: 'include', cache: 'no-store' });
  return parse<T>(res);
}

export async function apiPostJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parse<T>(res);
}

export async function apiPatchJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parse<T>(res);
}

export async function apiPostForm<T>(path: string, form: FormData): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  return parse<T>(res);
}
