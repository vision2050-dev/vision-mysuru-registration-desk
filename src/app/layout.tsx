import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vision Mysuru 2050 | Registration Desk & Student E-Pass Platform',
  description:
    'Campus admission verification, scannable QR e-passes, automated email invitations, and live attendance tracking for the Vision Mysuru 2050 Summit.',
  icons: {
    icon: '/logo_final.png',
    apple: '/logo_final.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
