import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AttendanceClient from './AttendanceClient';

export const metadata = { title: 'Attendance Management - Smart Mess' };

export default async function AttendancePage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) redirect('/login');
  return <AttendanceClient userName={session.user.name} role={session.user.role} />;
}
