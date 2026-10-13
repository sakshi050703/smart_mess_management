import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import StudentComplaintsClient from './StudentComplaintsClient';

export const metadata = { title: 'Lodge Complaint - Smart Mess' };

export default async function StudentComplaintsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'student') redirect('/login');
  return <StudentComplaintsClient userName={session.user.name} role={session.user.role} />;
}
