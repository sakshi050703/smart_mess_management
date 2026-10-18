import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AuditLogsClient from './AuditLogsClient';

export const metadata = { title: 'Audit Trail - Smart Mess' };

export default async function AuditLogsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') redirect('/admin-manager');
  return <AuditLogsClient userName={session.user.name} role={session.user.role} />;
}
