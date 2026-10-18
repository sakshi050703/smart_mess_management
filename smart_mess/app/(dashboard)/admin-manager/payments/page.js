import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PaymentsClient from './PaymentsClient';

export const metadata = { title: 'Payments History - Smart Mess' };

export default async function PaymentsPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) redirect('/login');
  return <PaymentsClient userName={session.user.name} role={session.user.role} />;
}
