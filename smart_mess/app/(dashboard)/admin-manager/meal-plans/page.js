import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MealPlansClient from './MealPlansClient';

export const metadata = { title: 'Meal Plans - Smart Mess' };

export default async function MealPlansPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) redirect('/login');
  return <MealPlansClient userName={session.user.name} role={session.user.role} />;
}
