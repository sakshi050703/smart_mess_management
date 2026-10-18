import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import StudentNotificationsClient from './StudentNotificationsClient';

export const metadata = { title: 'Notifications - Smart Mess' };

export default async function StudentNotificationsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'student') redirect('/login');
  return <StudentNotificationsClient userName={session.user.name} role={session.user.role} />;
}
