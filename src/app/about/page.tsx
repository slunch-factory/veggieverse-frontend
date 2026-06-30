import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, Clock, ExternalLink, Mail, Award } from "lucide-react";
import { AboutSectionNav } from "./_components/AboutSectionNav";
import { Reveal } from "./_components/Reveal";
import { AboutPlaceholder } from "./_components/AboutPlaceholder";

export const metadata: Metadata = {
  title: "브랜드 스토리 - 슬런치 팩토리",
  description:
    "2019년 부천에서 시작한 슬런치 팩토리. 천천히, 제대로 만든 식물성 한 끼. 비건이라 맛있는 게 아니라, 맛있는데 비건입니다.",
  openGraph: {
    title: "브랜드 스토리 - 슬런치 팩토리",
    description: "천천히, 제대로 만든 식물성 한 끼. Slow & Lunch.",
  },
};

/** 섹션이 sticky 내비/헤더에 가리지 않도록 하는 스크롤 오프셋 */
const SECTION_OFFSET = { scrollMarginTop: "calc(var(--header-area-h) + 52px)" } as const;
const LABEL = "text-[11px] text-[var(--warm-gray)] uppercase tracking-[0.1em] mb-3";

/**
 * /about — 브랜드 싱글 롱스크롤.
 * Hero → Origin → Philosophy → What we make → Craft → Stores → B2B.
 * 스크롤 진입 페이드업(Reveal) + 호버 모션으로 동적 연출.
 * ※ 1차 골격: 이미지는 placeholder, 카피는 기존 about 콘텐츠 재사용. 디자이너 협업으로 보강 예정(#67).
 */
export default function AboutPage() {
  return (
    <div className="bg-[var(--cream)] min-h-screen">
      <AboutSectionNav />

      {/* 1. HERO */}
      <section className="border-b border-black">
        <div
          className="relative h-[58vh] min-h-[360px] max-h-[620px] flex items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(135deg, #ECE8E2 0%, #D4CFC7 55%, #BCB5A9 100%)" }}
        >
          <Reveal className="absolute inset-0 flex flex-col items-center justify-center text-center px-6" y={32}>
            <p className="text-[11px] text-[var(--warm-gray)] uppercase tracking-[0.2em] mb-4">
              Since 2019
            </p>
            <h1 className="text-[28px] md:text-[44px] leading-[1.25] text-[var(--charcoal)]">
              Slow &amp; Lunch
              <br />
              천천히, 제대로 만든 한 끼
            </h1>
          </Reveal>
        </div>
      </section>

      {/* 2. ORIGIN */}
      <section id="story" style={SECTION_OFFSET} className="grid grid-cols-1 md:grid-cols-2 border-b border-black">
        <AboutPlaceholder label="브랜드 이미지" className="aspect-[4/3] md:border-r border-black" />
        <div className="p-10 md:p-16 flex flex-col justify-center">
          <Reveal>
            <p className={LABEL}>Origin</p>
            <h2 className="text-[26px] md:text-[32px] leading-[1.3] mb-6">이름의 시작</h2>
            <p className="text-[15px] leading-[1.8] text-[var(--charcoal)]">
              슬런치팩토리는 2019년 부천에서 시작했어요. &apos;천천히, 제대로 만든 점심 한 끼&apos;라는
              생각으로 Slow와 Lunch를 합쳐 슬런치라는 이름을 지었어요.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 3. PHILOSOPHY */}
      <section className="grid grid-cols-1 md:grid-cols-3 border-b border-black">
        {[
          { label: "Philosophy", text: "고기 없이도 맛있을 수 있다는 걸 보여주고 싶었어요. \"비건이라서 맛있는 게 아니라, 맛있는데 비건인 거\" 그게 저희가 생각하는 방향이에요." },
          { label: "Production", text: "홍대와 더현대에서 직접 만든 음식을 팔고 있어요. 공장도 직접 운영하고, 온라인으로도 보내드려요." },
          { label: "Vision", text: "식물성이라고 해서 특별하거나 불편하지 않았으면 해요. 그냥 맛있는 음식. 속 편한 한 끼. 그게 슬런치가 만들고 싶은 거예요." },
        ].map((item, idx) => (
          <Reveal key={item.label} delay={idx * 0.1} className={`py-12 px-8 ${idx < 2 ? "md:border-r border-black" : ""}`}>
            <p className={LABEL}>{item.label}</p>
            <p className="text-[15px] leading-[1.8] text-[var(--charcoal)]">{item.text}</p>
          </Reveal>
        ))}
      </section>

      {/* 4. WHAT WE MAKE */}
      <section id="make" style={SECTION_OFFSET} className="border-b border-black">
        <Reveal className="px-8 pt-12 pb-2">
          <p className={LABEL}>What we make</p>
          <h2 className="text-[26px] md:text-[32px] leading-[1.3]">델리부터 디저트까지</h2>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4">
          {[
            { name: "델리", desc: "바로 먹는 식물성 한 끼" },
            { name: "소스", desc: "직접 만든 드레싱·소스" },
            { name: "베이커리", desc: "버터·우유 없이 구운 빵" },
            { name: "디저트", desc: "속 편한 비건 디저트" },
          ].map((cat, idx) => (
            <Reveal
              key={cat.name}
              delay={idx * 0.08}
              className={`border-t border-black ${idx < 3 ? "md:border-r" : ""} ${idx % 2 === 0 ? "border-r md:border-r" : ""}`}
            >
              <Link href="/store" className="group block h-full">
                <div className="aspect-square overflow-hidden">
                  <AboutPlaceholder
                    label={`${cat.name} 제품컷`}
                    className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="px-6 py-5">
                  <p className="text-[15px] mb-1 text-[var(--charcoal)] group-hover:underline">{cat.name}</p>
                  <p className="text-[13px] text-[var(--warm-gray)] leading-[1.6]">{cat.desc}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 5. CRAFT / FACTORY */}
      <section id="craft" style={SECTION_OFFSET} className="border-b border-black">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] border-b border-black">
          <div className="p-10 md:p-16 md:border-r border-black">
            <Reveal>
              <p className={LABEL}>Factory</p>
              <h2 className="text-[24px] md:text-[28px] mb-6">자체 생산 시설</h2>
              <p className="text-[15px] text-[var(--charcoal)] leading-[1.8] mb-4">
                부천에 저희 공장이 있어요. 델리, 소스, 빵, 디저트까지 전부 여기서 만들어요.
              </p>
              <p className="text-[15px] text-[var(--charcoal)] leading-[1.8]">
                외주 없이 직접 만드는 이유는 간단해요. 맛과 품질을 저희가 컨트롤하고 싶어서.
                재료 수급부터 생산, 포장까지 한 곳에서 해요.
              </p>
            </Reveal>
          </div>
          <AboutPlaceholder label="공장 이미지" className="aspect-[4/3] md:aspect-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2">
          <Reveal className="p-10 md:p-12 border-b md:border-b-0 md:border-r border-black">
            <p className={LABEL}>Archive</p>
            <h3 className="text-xl mb-4">비건 레시피 500+</h3>
            <p className="text-sm text-[var(--charcoal)] leading-[1.8]">
              5년간 개발한 비건 레시피 500개 이상 보유. 한식, 양식, 아시안, 디저트까지. 맛없으면 안 만들어요.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="p-10 md:p-12">
            <p className={LABEL}>Technology</p>
            <h3 className="text-xl mb-4">특허 기술</h3>
            <div className="flex flex-col gap-2">
              {["식물성 햄 제조 특허", "식물성 단백질 텍스처링"].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[var(--primary)]" />
                  <span className="text-sm text-[var(--charcoal)]">{t}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 6. STORES */}
      <section id="stores" style={SECTION_OFFSET} className="border-b border-black">
        {/* 홍대점 */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-b border-black">
          <AboutPlaceholder label="홍대점 이미지" className="aspect-[4/3] md:border-r border-black" />
          <div className="p-10 md:p-11 flex flex-col justify-center">
            <Reveal>
              <p className={LABEL}>Flagship Store</p>
              <h2 className="text-[24px] mb-6">홍대점</h2>
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[var(--warm-gray)] mt-[2px] shrink-0" />
                  <span className="text-[14px] text-[var(--charcoal)] leading-[1.6]">서울 마포구 와우산로 29길 6, 1층</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[var(--warm-gray)] shrink-0" />
                  <span className="text-[14px] text-[var(--charcoal)]">11:00 - 21:00 (월요일 휴무)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[var(--warm-gray)] shrink-0" />
                  <span className="text-[14px] text-[var(--charcoal)]">02-332-6525</span>
                </div>
              </div>
              <p className="text-[14px] text-[var(--warm-gray)] leading-[1.7] mb-5">
                홍대입구역 3번 출구에서 도보 7분. 작은 골목 안에 있어요. 테이크아웃도 되고, 안에서 먹어도 돼요.
              </p>
              <a href="https://naver.me/Fx3M8pKJ" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 border border-black bg-transparent text-[14px] w-fit transition-colors hover:bg-black hover:text-white">
                네이버 지도로 보기 <ExternalLink className="w-4 h-4" />
              </a>
            </Reveal>
          </div>
        </div>
        {/* 더현대 서울 */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-b border-black">
          <div className="p-10 md:p-12 flex flex-col justify-center md:border-r border-black order-2 md:order-1">
            <Reveal>
              <p className={LABEL}>Department Store</p>
              <h2 className="text-[24px] mb-6">더현대 서울</h2>
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[var(--warm-gray)] mt-[2px] shrink-0" />
                  <span className="text-[14px] text-[var(--charcoal)] leading-[1.6]">서울 영등포구 여의대로 108, 더현대 서울 B1</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[var(--warm-gray)] shrink-0" />
                  <span className="text-[14px] text-[var(--charcoal)]">10:30 - 20:00 (더현대 영업시간 따름)</span>
                </div>
              </div>
              <p className="text-[14px] text-[var(--warm-gray)] leading-[1.7]">
                지하 1층 푸드마켓 안에 있어요. 바로 먹을 수 있는 델리 위주예요.
              </p>
            </Reveal>
          </div>
          <AboutPlaceholder label="더현대점 이미지" className="aspect-[4/3] order-1 md:order-2" />
        </div>
        {/* 온라인 스토어 */}
        <Reveal className="p-12 md:p-16 text-center">
          <p className={LABEL}>Online</p>
          <h2 className="text-[24px] mb-4">온라인 스토어</h2>
          <p className="text-[14px] text-[var(--warm-gray)] leading-[1.7] mb-6">
            매장에 못 오셔도 괜찮아요. 냉동 배송으로 전국 어디든 보내드려요.
          </p>
          <Link href="/store" className="inline-flex items-center gap-2 px-7 py-3.5 bg-black text-white text-[14px] transition-transform hover:-translate-y-0.5">
            스토어 둘러보기 <ExternalLink className="w-4 h-4" />
          </Link>
        </Reveal>
      </section>

      {/* 7. B2B / OEM·FOB */}
      <section id="b2b" style={SECTION_OFFSET} className="border-b border-black">
        <Reveal className="p-10 md:p-16">
          <div className="max-w-[640px]">
            <p className={LABEL}>Partnership</p>
            <h2 className="text-[24px] md:text-[28px] mb-6">B2B · OEM/ODM</h2>
            <p className="text-[15px] text-[var(--charcoal)] leading-[1.8] mb-4">
              호텔, 레스토랑, 카페, 급식 등 비건 메뉴가 필요한 곳에 공급하고 있어요. OEM/ODM 문의도
              받아요. 레시피 개발부터 생산까지 같이 할 수 있어요.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <a href="https://catalogue.slunch.co.kr/ko/fob" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 border border-black text-[14px] transition-colors hover:bg-black hover:text-white">
                Experts 카탈로그 <ExternalLink className="w-4 h-4" />
              </a>
              <a href="https://catalogue.slunch.co.kr/ko/oemodm" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 border border-black text-[14px] transition-colors hover:bg-black hover:text-white">
                OEM/ODM 안내 <ExternalLink className="w-4 h-4" />
              </a>
              <a href="mailto:export@slunch.co.kr" className="inline-flex items-center gap-2 px-7 py-3 bg-black text-white text-[14px] transition-transform hover:-translate-y-0.5">
                <Mail className="w-4 h-4" /> B2B 문의하기
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
