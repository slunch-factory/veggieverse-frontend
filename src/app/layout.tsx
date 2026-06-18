import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/providers/Providers";
import { LayoutShell } from "@/components/layout/LayoutShell";
import { GoogleAds } from "@/components/GoogleAds";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  metadataBase: new URL("https://slunch.co.kr"),
  title: "VeggieVerse - 슬런치 팩토리",
  description:
    "슬런치 팩토리의 비건 푸드 플랫폼. 건강한 식단, 레시피, 뉴스레터를 만나보세요.",
  keywords: "비건, 채식, 슬런치, 레시피, 건강식단",
  openGraph: {
    title: "VeggieVerse - 슬런치 팩토리",
    description: "슬런치 팩토리의 비건 푸드 플랫폼",
    type: "website",
    url: "https://slunch.co.kr/veggieverse",
    images: [{ url: `${basePath}/common/logo.png` }],
  },
  // 파비콘은 정사각 팩토리 마크 사용 — 와이드 워드마크(logo.png)는 탭에서 찌그러져서 교체.
  icons: {
    icon: `${basePath}/common/favicon-mark.png`,
    shortcut: `${basePath}/common/favicon-mark.png`,
    apple: `${basePath}/common/favicon-mark.png`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head />
      <body>
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
        <GoogleAds />
      </body>
    </html>
  );
}
