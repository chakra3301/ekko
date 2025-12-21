// Root layout component
// Defines the HTML structure and global styles for the application
import type { Metadata } from 'next';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { NavBar } from '@/components/layout/NavBar';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'EKKO MVP',
  description: 'EKKO MVP Application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <NavBar />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}

