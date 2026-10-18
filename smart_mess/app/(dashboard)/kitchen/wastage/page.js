import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import KitchenWastageClient from './KitchenWastageClient';

export const metadata = { title: 'Food Wastage Log - Smart Mess Kitchen' };

export default async function KitchenWastagePage() {
  const session = await auth();
  if (!session?.user || !['admin', 'manager', 'kitchen'].includes(session.user.role)) redirect('/login');
  return <KitchenWastageClient userName={session.user.name} role={session.user.role} />;
}
