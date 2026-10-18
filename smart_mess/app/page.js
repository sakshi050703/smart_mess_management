import Link from 'next/link';

export const metadata = {
  title: 'Smart Mess Management System',
  description: 'A complete digital solution for managing hostel mess operations — menus, bookings, billing, and more.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen animated-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800/60 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">M</span>
            </div>
            <span className="text-white font-bold text-lg">SmartMess</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="btn-primary btn-sm">Sign In</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            Digital Mess Management
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Smart Mess{' '}
            <span className="gradient-text">Management</span>
            <br />System
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Streamline your hostel mess operations with our comprehensive digital platform.
            Manage menus, bookings, billing, inventory, and more — all in one place.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/login" className="btn-primary px-8 py-3 text-base">
              Get Started
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-center text-white mb-4">Everything you need</h2>
          <p className="text-slate-400 text-center mb-12">Powerful tools for admins, kitchen staff, and students</p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '👨‍💼',
                title: 'Admin Dashboard',
                desc: 'Full control over users, menus, subscriptions, billing, inventory, and reports.',
                color: 'from-indigo-500/20 to-purple-500/10',
                border: 'border-indigo-500/20',
              },
              {
                icon: '👨‍🍳',
                title: 'Kitchen Dashboard',
                desc: 'View daily menus, meal counts, preparation quantities, and record food wastage.',
                color: 'from-emerald-500/20 to-teal-500/10',
                border: 'border-emerald-500/20',
              },
              {
                icon: '🎓',
                title: 'Student Dashboard',
                desc: 'Book or skip meals, view subscriptions, pay bills, and submit feedback.',
                color: 'from-amber-500/20 to-orange-500/10',
                border: 'border-amber-500/20',
              },
            ].map((f) => (
              <div
                key={f.title}
                className={`glass p-6 bg-gradient-to-br ${f.color} border ${f.border} rounded-2xl`}
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="glass rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Meal Types', value: '4' },
              { label: 'Dashboard Roles', value: '3' },
              { label: 'Payment Modes', value: '3' },
              { label: 'Report Types', value: '6+' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-8 text-center">
        <p className="text-slate-500 text-sm">
          © 2026 SmartMess — Smart Mess Management System
        </p>
      </footer>
    </div>
  );
}
