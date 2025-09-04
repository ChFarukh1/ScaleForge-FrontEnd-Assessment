import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ApolloWrapper } from '@/graphql/apollo-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { LayoutContent } from '@/components/layout-content';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ScaleForge - Frontend',
  description: 'ScaleForge Frontend Application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ApolloWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <LayoutContent>
              {children}
            </LayoutContent>
          </ThemeProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
