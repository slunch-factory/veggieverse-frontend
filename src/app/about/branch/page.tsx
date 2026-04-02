import { MapPin, Phone, Clock, ExternalLink } from "lucide-react";

export default function AboutBranchPage() {
  return (
    <div>
      {/* 홍대점 */}
      <div className="grid grid-cols-2 border-b border-black">
        <div className="aspect-[4/3] bg-[#E8E4DF] border-r border-black flex items-center justify-center text-[var(--muted)] text-[14px]">
          [홍대점 이미지]
        </div>
        <div className="p-12 flex flex-col justify-center">
          <p className="text-[11px] text-[var(--warm-gray)] uppercase tracking-[0.1em] mb-3">Flagship Store</p>
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
          <p className="text-[14px] text-[var(--warm-gray)] leading-[1.7] mb-6">
            홍대입구역 3번 출구에서 도보 7분. 작은 골목 안에 있어요. 테이크아웃도 되고, 안에서 먹어도 돼요.
          </p>
          <a href="https://naver.me/Fx3M8pKJ" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 border border-black bg-transparent text-[14px] w-fit">
            네이버 지도로 보기 <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* 더현대 */}
      <div className="grid grid-cols-2 border-b border-black">
        <div className="p-12 flex flex-col justify-center border-r border-black">
          <p className="text-[11px] text-[var(--warm-gray)] uppercase tracking-[0.1em] mb-3">Department Store</p>
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
        </div>
        <div className="aspect-[4/3] bg-[#E8E4DF] flex items-center justify-center text-[var(--muted)] text-[14px]">
          [더현대점 이미지]
        </div>
      </div>

      {/* 온라인 스토어 */}
      <div className="p-16 text-center border-b border-black">
        <p className="text-[11px] text-[var(--warm-gray)] uppercase tracking-[0.1em] mb-3">Online</p>
        <h2 className="text-[24px] mb-4">온라인 스토어</h2>
        <p className="text-[14px] text-[var(--warm-gray)] leading-[1.7] mb-6">
          매장에 못 오셔도 괜찮아요. 냉동 배송으로 전국 어디든 보내드려요.
        </p>
        <a href="https://smartstore.naver.com/slunch" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-7 py-3.5 bg-black text-white text-[14px]">
          네이버 스마트스토어 <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
