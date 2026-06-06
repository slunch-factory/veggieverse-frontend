import Script from "next/script";

// Google Ads 전환 추적 태그 (gtag.js)
// ID는 .env.local 의 NEXT_PUBLIC_GOOGLE_ADS_ID 에 설정한다 (예: AW-18173746369).
// Google "연결 테스트" 크롤러가 모든 페이지에서 찾을 수 있어야 매장 광고가 재개되므로,
// 배포 환경에 반드시 이 환경변수를 설정해야 한다.
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

export function GoogleAds() {
  if (!GOOGLE_ADS_ID) return null;

  return (
    <>
      <Script
        id="gtag-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GOOGLE_ADS_ID}');
        `}
      </Script>
    </>
  );
}
