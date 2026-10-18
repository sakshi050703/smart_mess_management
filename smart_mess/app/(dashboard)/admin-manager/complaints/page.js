import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ComplaintsClient from './ComplaintsClient';

export const metadata = { title: 'Complaints Management - Smart Mess' };

export default async function ComplaintsPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) redirect('/login');
  return <ComplaintsClient userName={session.user.name} role={session.user.role} />;
}
