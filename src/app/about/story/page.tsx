export default function AboutStoryPage() {
  return (
    <div>
      {/* Hero Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 border-b border-black">
        <div className="aspect-[4/3] bg-[#E8E4DF] md:border-r border-black flex items-center justify-center text-[var(--muted)] text-sm">
          [브랜드 이미지]
        </div>
        <div className="p-10 md:p-16 flex flex-col justify-center">
          <p className="text-[11px] text-[var(--warm-gray)] uppercase tracking-widest mb-4">
            Since 2019
          </p>
          <h1 className="text-[32px] leading-[1.3] mb-6">Slow and Lunch</h1>
          <p className="text-[15px] leading-[1.8] text-[var(--charcoal)]">
            슬런치팩토리는 2019년 부천에서 시작했어요.
            &apos;천천히, 제대로 만든 점심 한 끼&apos;라는 생각으로
            Slow와 Lunch를 합쳐 슬런치라는 이름을 지었어요.
          </p>
        </div>
      </div>

      {/* 3-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 border-b border-black">
        {[
          { label: "Philosophy", text: "고기 없이도 맛있을 수 있다는 걸 보여주고 싶었어요. \"비건이라서 맛있는 게 아니라, 맛있는데 비건인 거\" 그게 저희가 생각하는 방향이에요." },
          { label: "Production", text: "홍대와 더현대에서 직접 만든 음식을 팔고 있어요. 공장도 직접 운영하고, 온라인으로도 보내드려요." },
          { label: "Vision", text: "식물성이라고 해서 특별하거나 불편하지 않았으면 해요. 그냥 맛있는 음식. 속 편한 한 끼. 그게 슬런치가 만들고 싶은 거예요." },
        ].map((item, idx) => (
          <div
            key={item.label}
            className={`py-12 px-8 ${idx < 2 ? "md:border-r border-black" : ""}`}
          >
            <p className="text-[11px] text-[var(--warm-gray)] uppercase tracking-widest mb-4">
              {item.label}
            </p>
            <p className="text-[15px] leading-[1.8] text-[var(--charcoal)]">{item.text}</p>
          </div>
        ))}
      </div>

      {/* Full-width Image */}
      <div className="h-[400px] bg-[#D4CFC7] border-b border-black flex items-center justify-center text-[var(--muted)] text-sm">
        [공장/매장 전경 이미지]
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-4 px-8 py-6 border-b border-black">
        {["#속편한", "#재료가솔직한", "#식물성", "#천천히제대로"].map((tag) => (
          <span key={tag} className="px-4 py-2 border border-black text-[13px]">{tag}</span>
        ))}
      </div>
    </div>
  );
}
