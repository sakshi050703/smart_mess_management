import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import BookingsClient from './BookingsClient';

export const metadata = { title: 'Meal Bookings - Smart Mess' };

export default async function StudentBookingsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'student') redirect('/login');
  return <BookingsClient userName={session.user.name} role={session.user.role} />;
}
