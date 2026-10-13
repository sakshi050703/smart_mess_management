import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MenusClient from './MenusClient';

export const metadata = { title: 'Menu Management' };

export default async function MenusPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) redirect('/login');
  return <MenusClient role={session.user.role} userName={session.user.name} />;
}
