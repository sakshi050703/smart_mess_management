import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SubscriptionsClient from './SubscriptionsClient';

export const metadata = { title: 'Subscriptions - Smart Mess' };

export default async function SubscriptionsPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) redirect('/login');
  return <SubscriptionsClient userName={session.user.name} role={session.user.role} />;
}
