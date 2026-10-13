import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import KitchenAttendanceClient from './KitchenAttendanceClient';

export const metadata = { title: 'Kitchen Attendance Counter - Smart Mess' };

export default async function KitchenAttendancePage() {
  const session = await auth();
  if (!session?.user || !['admin', 'manager', 'kitchen'].includes(session.user.role)) redirect('/login');
  return <KitchenAttendanceClient userName={session.user.name} role={session.user.role} />;
}
