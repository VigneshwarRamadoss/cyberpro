import type { Metadata } from 'next';
import { Providers } from '@/components/layout/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'ShieldSpeak - AI-Powered Cyberbullying Detection',
  description: 'NLP-powered cyberbullying detection and alert platform. Analyze text and voice communications, identify harmful content, and support safer digital spaces with intelligent moderation.',
  keywords: ['cyberbullying', 'detection', 'NLP', 'safety', 'moderation', 'AI'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
