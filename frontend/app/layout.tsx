import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'SPARK — AI-Powered Badminton Shot Recognition',
  description:
    'Analyze badminton match videos and recognize badminton shot types using deep learning and temporal video analysis.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#080C14] text-slate-100 antialiased court-grid-pattern flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="w-full border-t border-white/5 py-6 bg-[#0B1120]/60 text-center text-xs text-slate-500 font-mono">
          SPARK Research Project • Day 18 Application Foundation • Team: Sirish Chandra, Priyanshu, Ashwidha, Thakur Swetan Singh, Kaustub
        </footer>
      </body>
    </html>
  );
}
