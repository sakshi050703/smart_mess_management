import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import StudentDashboardClient from './StudentDashboardClient';

export const metadata = { title: 'Student Dashboard - Smart Mess' };

export default async function StudentPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'student') redirect('/login');

  return (
    <StudentDashboardClient
      userName={session.user.name}
      userEmail={session.user.email}
      studentId={session.user.studentId}
      role={session.user.role}
    />
  );
}
