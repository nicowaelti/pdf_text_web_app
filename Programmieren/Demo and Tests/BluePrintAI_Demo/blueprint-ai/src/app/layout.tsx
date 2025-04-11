import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SideNav } from '@/components/nav/side-nav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BlueprintAI - AI-Powered Requirements & Design Assistant',
  description: 'Transform your project description into comprehensive software requirements and design artifacts using AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`min-h-full ${inter.className}`}>
        <div className="flex h-full">
          <SideNav />
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
