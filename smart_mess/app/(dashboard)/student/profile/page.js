import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import StudentProfileClient from './StudentProfileClient';

export const metadata = { title: 'My Profile - Smart Mess' };

export default async function StudentProfilePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'student') redirect('/login');
  return <StudentProfileClient sessionUser={session.user} />;
}
