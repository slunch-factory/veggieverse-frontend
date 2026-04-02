import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/providers/Providers";
import { LayoutShell } from "@/components/LayoutShell";

export const metadata: Metadata = {
  title: "VeggieVerse - 슬런치 팩토리",
  description:
    "슬런치 팩토리의 비건 푸드 플랫폼. 건강한 식단, 레시피, 뉴스레터를 만나보세요.",
  keywords: "비건, 채식, 슬런치, 레시피, 건강식단",
  openGraph: {
    title: "VeggieVerse - 슬런치 팩토리",
    description: "슬런치 팩토리의 비건 푸드 플랫폼",
    type: "website",
    url: "https://slunch.co.kr/veggieverse",
    images: [{ url: "/common/logo.png" }],
  },
  icons: {
    icon: "/common/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  );
}
