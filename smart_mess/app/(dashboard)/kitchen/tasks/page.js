import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import KitchenTasksClient from './KitchenTasksClient';

export const metadata = { title: 'Kitchen Tasks & Checklist - Smart Mess' };

export default async function KitchenTasksPage() {
  const session = await auth();
  if (!session?.user || !['admin', 'manager', 'kitchen'].includes(session.user.role)) redirect('/login');
  return <KitchenTasksClient userName={session.user.name} role={session.user.role} />;
}
