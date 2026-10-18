import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import FeedbackClient from './FeedbackClient';

export const metadata = { title: 'Feedback Management - Smart Mess' };

export default async function FeedbackPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) redirect('/login');
  return <FeedbackClient userName={session.user.name} role={session.user.role} />;
}
