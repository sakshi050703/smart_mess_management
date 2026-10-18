import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import StudentPaymentsClient from './StudentPaymentsClient';

export const metadata = { title: 'Payment Receipts - Smart Mess' };

export default async function StudentPaymentsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'student') redirect('/login');
  return <StudentPaymentsClient userName={session.user.name} role={session.user.role} />;
}
