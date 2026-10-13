import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminNotificationsClient from './AdminNotificationsClient';

export const metadata = { title: 'Notifications - Smart Mess' };

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) redirect('/login');
  return <AdminNotificationsClient userName={session.user.name} role={session.user.role} />;
}
