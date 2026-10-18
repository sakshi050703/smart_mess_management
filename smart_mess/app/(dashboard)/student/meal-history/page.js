import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MealHistoryClient from './MealHistoryClient';

export const metadata = { title: 'Meal History & Attendance - Smart Mess' };

export default async function StudentMealHistoryPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'student') redirect('/login');
  return <MealHistoryClient userName={session.user.name} role={session.user.role} />;
}
