import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PreparationClient from './PreparationClient';

export const metadata = { title: 'Meal Preparation - Smart Mess Kitchen' };

export default async function PreparationPage() {
  const session = await auth();
  if (!session?.user || !['admin', 'manager', 'kitchen'].includes(session.user.role)) redirect('/login');
  return <PreparationClient userName={session.user.name} role={session.user.role} />;
}
