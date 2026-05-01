import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar/Navbar';

export const metadata: Metadata = {
  title: 'Life Reflection — บันทึกเส้นทางชีวิต',
  description: 'บันทึกประสบการณ์ชีวิต สะท้อนตัวตน มีไทม์ไลน์ แท็ก และรูปภาพ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Lora:ital,wght@0,400;0,500;1,400;1,500&family=Noto+Sans+Thai:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Navbar />
        <main style={{ paddingTop: '64px', minHeight: '100vh' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
