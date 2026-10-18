import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminDashboardClient from './AdminDashboardClient';

export const metadata = {
  title: 'Dashboard',
};

export default async function AdminManagerPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'admin' && session.user.role !== 'manager') {
    redirect('/login');
  }

  return (
    <AdminDashboardClient
      userName={session.user.name}
      role={session.user.role}
    />
  );
}
