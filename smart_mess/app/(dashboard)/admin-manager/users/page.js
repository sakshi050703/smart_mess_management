import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import UsersClient from './UsersClient';

export const metadata = { title: 'Staff & User Management - Smart Mess' };

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') redirect('/admin-manager');
  return <UsersClient userName={session.user.name} role={session.user.role} />;
}
