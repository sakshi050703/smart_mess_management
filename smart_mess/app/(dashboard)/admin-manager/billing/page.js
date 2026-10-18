import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import BillingClient from './BillingClient';

export const metadata = { title: 'Billing' };

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) redirect('/login');
  return <BillingClient role={session.user.role} userName={session.user.name} />;
}
