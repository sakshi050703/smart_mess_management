import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AnnouncementsClient from './AnnouncementsClient';

export const metadata = { title: 'Announcements - Smart Mess' };

export default async function AnnouncementsPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) redirect('/login');
  return <AnnouncementsClient userName={session.user.name} role={session.user.role} />;
}
