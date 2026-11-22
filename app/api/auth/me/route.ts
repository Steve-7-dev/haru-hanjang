import { getSessionUser, publicUser } from '@/lib/server/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return Response.json({ user: null }, { headers: { 'cache-control': 'private, no-store' } });
  }
  return Response.json(
    { user: publicUser(user) },
    { headers: { 'cache-control': 'private, no-store' } },
  );
}
