import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: {
    template: '%s | Smart Mess Management',
    default: 'Smart Mess Management System',
  },
  description: 'Manage mess operations, student subscriptions, food menus, meal bookings, attendance, billing, and inventory with the Smart Mess Management System.',
  keywords: ['mess management', 'hostel mess', 'meal booking', 'student mess', 'food management'],
  authors: [{ name: 'Smart Mess' }],
  robots: 'noindex, nofollow', // private system
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body className="animated-bg">{children}</body>
    </html>
  );
}
