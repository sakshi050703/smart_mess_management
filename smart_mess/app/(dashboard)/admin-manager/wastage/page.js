import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import WastageClient from './WastageClient';

export const metadata = { title: 'Food Wastage - Smart Mess' };

export default async function WastagePage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) redirect('/login');
  return <WastageClient userName={session.user.name} role={session.user.role} />;
}
