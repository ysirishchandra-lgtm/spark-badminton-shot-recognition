import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import { ThemeProvider } from '@/components/ThemeProvider';

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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Anti-flash inline script ensuring immediate theme application before hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem('spark-theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = savedTheme ? savedTheme : (prefersDark ? 'dark' : 'light');
                  document.documentElement.classList.add(theme);
                  document.documentElement.setAttribute('data-theme', theme);
                  document.documentElement.style.colorScheme = theme;
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen court-grid-pattern flex flex-col antialiased">
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="w-full border-t border-[var(--border-subtle)] py-6 bg-[var(--header-bg)] text-center text-xs text-[var(--text-muted)] font-mono transition-colors duration-200">
            SPARK — AI-Powered Badminton Shot Recognition • Academic Research Project • Team: Sirish Chandra, Priyanshu, Ashwidha, Thakur Swetan Singh, Kaustub
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
