import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'FirePal - Calculate Your Path to Financial Freedom',
  description: 'Speak your portfolio, see your FIRE date. AI-powered calculator shows exactly when you can retire early. Track your journey to financial independence.',
  keywords: ['FIRE calculator', 'financial independence', 'retire early', 'investment tracker', 'portfolio calculator', 'FIRE planning'],
  authors: [{ name: 'FirePal' }],
  creator: 'FirePal',
  publisher: 'FirePal',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://firepal.app',
    siteName: 'FirePal',
    title: 'FirePal - Calculate Your Path to Financial Freedom',
    description: 'Speak your portfolio, see your FIRE date. AI-powered calculator shows exactly when you can retire early.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FirePal - FIRE Calculator App',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FirePal - Calculate Your Path to Financial Freedom',
    description: 'Speak your portfolio, see your FIRE date. AI-powered calculator shows exactly when you can retire early.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#09090B',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}