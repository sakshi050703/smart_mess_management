import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import StudentFeedbackClient from './StudentFeedbackClient';

export const metadata = { title: 'Mess Feedback - Smart Mess' };

export default async function StudentFeedbackPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'student') redirect('/login');
  return <StudentFeedbackClient userName={session.user.name} role={session.user.role} />;
}
