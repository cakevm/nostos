import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nostos - The Journey Home for Lost Items",
  description: "Blockchain-powered lost and found platform inspired by the Greek odyssey. Reunite with your belongings through secure QR codes and smart contracts.",
  icons: {
    icon: [
      { url: '/nostos-icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: '/nostos-icon.svg',
  },
  keywords: ['lost and found', 'blockchain', 'ethereum', 'nostos', 'QR code', 'smart contract'],
  authors: [{ name: 'Nostos' }],
  manifest: '/manifest.json',
  openGraph: {
    title: 'Nostos - The Journey Home for Lost Items',
    description: 'Every lost item deserves its odyssey home. Blockchain-secured rewards for honest finders.',
    type: 'website',
    images: ['/nostos-icon.svg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-stone-50 dark:bg-slate-950 text-slate-800 dark:text-stone-200`} suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'dark';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch {}
            `,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
