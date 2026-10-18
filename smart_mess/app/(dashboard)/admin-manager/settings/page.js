import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SettingsClient from './SettingsClient';

export const metadata = { title: 'Settings - Smart Mess' };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) redirect('/login');
  return <SettingsClient userName={session.user.name} role={session.user.role} />;
}
