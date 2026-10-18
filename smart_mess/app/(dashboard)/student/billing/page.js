import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import StudentBillingClient from './StudentBillingClient';

export const metadata = { title: 'My Bills - Smart Mess' };

export default async function StudentBillingPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'student') redirect('/login');
  return <StudentBillingClient userName={session.user.name} role={session.user.role} />;
}
