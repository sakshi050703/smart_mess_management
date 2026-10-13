import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SubscriptionClient from './SubscriptionClient';

export const metadata = { title: 'My Subscription - Smart Mess' };

export default async function StudentSubscriptionPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'student') redirect('/login');
  return <SubscriptionClient userName={session.user.name} role={session.user.role} />;
}
