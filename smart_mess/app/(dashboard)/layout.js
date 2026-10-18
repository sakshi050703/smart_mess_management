import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import Sidebar from '@/components/layout/Sidebar';

export default async function DashboardLayout({ children }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar role={session.user.role} userName={session.user.name} />

        {/* Main content area */}
        <main className="main-content flex-1 flex flex-col min-w-0">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
