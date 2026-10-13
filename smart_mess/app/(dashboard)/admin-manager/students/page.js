import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import StudentsClient from './StudentsClient';

export const metadata = { title: 'Students' };

export default async function StudentsPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) redirect('/login');
  return <StudentsClient role={session.user.role} userName={session.user.name} />;
}
