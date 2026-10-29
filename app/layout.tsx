import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '웹 보글보글',
  description: '고전 아케이드 게임 보글보글을 웹 브라우저에서 즐기세요!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_suit@1.0/DungGeunMo.woff2"
        />
        <style>{`
          @font-face {
            font-family: 'DungGeunMo';
            src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_suit@1.0/DungGeunMo.woff2') format('woff2');
            font-weight: normal;
            font-style: normal;
          }
          body {
            font-family: 'DungGeunMo', sans-serif;
          }
        `}</style>
      </head>
      <body className="bg-background text-white min-h-screen flex flex-col font-dunggeunmo antialiased">
        {children}
      </body>
    </html>
  )
}
