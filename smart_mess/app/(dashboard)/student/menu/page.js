import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MenuClient from './MenuClient';

export const metadata = { title: 'Mess Menu - Smart Mess' };

export default async function StudentMenuPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'student') redirect('/login');
  return <MenuClient userName={session.user.name} role={session.user.role} />;
}
