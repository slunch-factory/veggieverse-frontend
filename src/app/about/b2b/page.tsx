import { Mail, Award } from "lucide-react";

export default function AboutB2BPage() {
  return (
    <div>
      {/* Factory */}
      <div className="grid grid-cols-[2fr_1fr] border-b border-black">
        <div className="p-16 border-r border-black">
          <p className="text-[11px] text-[color:var(--warm-gray)] uppercase tracking-[0.1em] mb-3">Factory</p>
          <h2 className="text-2xl mb-6">자체 생산 시설</h2>
          <p className="text-[15px] text-[color:var(--charcoal)] leading-[1.8] mb-4">
            부천에 저희 공장이 있어요. 델리, 소스, 빵, 디저트까지 전부 여기서 만들어요.
          </p>
          <p className="text-[15px] text-[color:var(--charcoal)] leading-[1.8]">
            외주 없이 직접 만드는 이유는 간단해요. 맛과 품질을 저희가 컨트롤하고 싶어서. 재료 수급부터 생산, 포장까지 한 곳에서 해요.
          </p>
        </div>
        <div className="bg-[#E8E4DF] flex items-center justify-center text-[color:var(--muted)] text-sm">
          [공장 이미지]
        </div>
      </div>

      {/* Archive + Patents */}
      <div className="grid grid-cols-2 border-b border-black">
        <div className="p-12 border-r border-black">
          <p className="text-[11px] text-[color:var(--warm-gray)] uppercase tracking-[0.1em] mb-3">Archive</p>
          <h3 className="text-xl mb-4">비건 레시피 500+</h3>
          <p className="text-sm text-[color:var(--charcoal)] leading-[1.8]">
            5년간 개발한 비건 레시피 500개 이상 보유. 한식, 양식, 아시안, 디저트까지. 맛없으면 안 만들어요.
          </p>
        </div>
        <div className="p-12">
          <p className="text-[11px] text-[color:var(--warm-gray)] uppercase tracking-[0.1em] mb-3">Technology</p>
          <h3 className="text-xl mb-4">특허 기술</h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[color:var(--primary)]" />
              <span className="text-sm text-[color:var(--charcoal)]">식물성 햄 제조 특허</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[color:var(--primary)]" />
              <span className="text-sm text-[color:var(--charcoal)]">식물성 단백질 텍스처링</span>
            </div>
          </div>
        </div>
      </div>

      {/* B2B Partnership */}
      <div className="p-16 border-b border-black">
        <div className="max-w-[600px]">
          <p className="text-[11px] text-[color:var(--warm-gray)] uppercase tracking-[0.1em] mb-3">Partnership</p>
          <h2 className="text-2xl mb-6">B2B 파트너십</h2>
          <p className="text-[15px] text-[color:var(--charcoal)] leading-[1.8] mb-4">
            호텔, 레스토랑, 카페, 급식 등 비건 메뉴가 필요한 곳에 공급하고 있어요. OEM/ODM 문의도 받아요. 레시피 개발부터 생산까지 같이 할 수 있어요.
          </p>
          <a href="mailto:export@slunch.co.kr" className="inline-flex items-center gap-2 px-7 py-3.5 bg-black text-white text-sm mt-2">
            <Mail className="w-4 h-4" /> B2B 문의하기
          </a>
        </div>
      </div>

      {/* Partners */}
      <div className="grid grid-cols-4">
        {["더현대 서울", "신세계푸드", "CJ프레시웨이", "풀무원"].map((partner, idx) => (
          <div key={partner} className={`px-8 py-12 text-center border-b border-black ${idx < 3 ? "border-r" : ""}`}>
            <div className="w-20 h-20 bg-[#E8E4DF] mx-auto mb-4 flex items-center justify-center text-xs text-[color:var(--muted)]">
              Logo
            </div>
            <span className="text-sm text-[color:var(--charcoal)]">{partner}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
