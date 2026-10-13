import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import InventoryClient from './InventoryClient';

export const metadata = { title: 'Inventory Management' };

export default async function InventoryPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) redirect('/login');
  return <InventoryClient role={session.user.role} userName={session.user.name} />;
}
