import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import KitchenDashboardClient from './KitchenDashboardClient';

export const metadata = { title: 'Kitchen Dashboard' };

export default async function KitchenPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (!['admin', 'manager', 'kitchen'].includes(session.user.role)) redirect('/login');
  return <KitchenDashboardClient userName={session.user.name} role={session.user.role} />;
}
