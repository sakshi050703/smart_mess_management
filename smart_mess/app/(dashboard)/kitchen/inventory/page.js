import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import KitchenInventoryClient from './KitchenInventoryClient';

export const metadata = { title: 'Kitchen Inventory - Smart Mess' };

export default async function KitchenInventoryPage() {
  const session = await auth();
  if (!session?.user || !['admin', 'manager', 'kitchen'].includes(session.user.role)) redirect('/login');
  return <KitchenInventoryClient userName={session.user.name} role={session.user.role} />;
}
