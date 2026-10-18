import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ReportsClient from './ReportsClient';

export const metadata = { title: 'Reports & Analytics - Smart Mess' };

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) redirect('/login');
  return <ReportsClient userName={session.user.name} role={session.user.role} />;
}
