import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MealBookingsClient from './MealBookingsClient';

export const metadata = { title: 'Meal Bookings - Smart Mess' };

export default async function MealBookingsPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) redirect('/login');
  return <MealBookingsClient userName={session.user.name} role={session.user.role} />;
}
