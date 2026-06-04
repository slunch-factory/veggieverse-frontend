"use client";

/**
 * veggieverse `src/app/store/[slug]/_components/ProductDetailTemplate.tsx`의 1:1 포트.
 * 레이아웃·타이포·섹션 구조를 그대로 유지하되, admin 편집 미리보기를 위해
 * 이미지 슬롯에 URL이 있으면 실제 이미지를 렌더하고 없으면 플레이스홀더를 보여준다.
 */
import type { ProductDetailTemplateData } from "../_data/templateData";

/* ------------------------------------------------------------------ */
/*  Design tokens — veggieverse와 동일                                  */
/* ------------------------------------------------------------------ */
const C = {
  primary: "#6e5035",
  accent: "#e6863f",
  textMain: "#250a00",
  textBody: "#6e5035",
  textMuted: "#8a7a6e",
  white: "#fcfaf8",
  sand: "#e8e2e2",
  lime: "#dcfd4a",
  gray: "#b4b4b4",
  border: "#c9bcbe",
  ink: "#250a00",
  certBorder: "#e0b6e5",
};

const NOISE_SVG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncR type='linear' slope='3' intercept='-1'/%3E%3CfeFuncG type='linear' slope='3' intercept='-1'/%3E%3CfeFuncB type='linear' slope='3' intercept='-1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='150' height='150' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E\")";

/** admin 업로드/외부 URL 판별 (veggieverse 미리보기와 동일 규칙) */
function isImg(v?: string): v is string {
  return (
    !!v &&
    (v.startsWith("http") || v.startsWith("/uploads/") || v.startsWith("data:image/") || v.startsWith("/"))
  );
}

/* ------------------------------------------------------------------ */
/*  Section variants                                                   */
/* ------------------------------------------------------------------ */
type SectionVariant = "white" | "sand" | "lime" | "gray";

const SECTION_BG: Record<SectionVariant, React.CSSProperties> = {
  white: { backgroundColor: C.white },
  sand: { backgroundColor: C.sand },
  lime: { backgroundColor: C.lime },
  gray: {
    backgroundColor: C.gray,
    backgroundImage: NOISE_SVG,
    backgroundBlendMode: "overlay",
    backgroundSize: "150px 150px",
  },
};

/* ------------------------------------------------------------------ */
/*  Primitives                                                         */
/* ------------------------------------------------------------------ */

function Section({
  variant = "white",
  children,
  style,
}: {
  variant?: SectionVariant;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ ...SECTION_BG[variant], padding: "72px 48px", textAlign: "center", ...style }}>
      {children}
    </div>
  );
}

const BADGE_STYLE: Record<SectionVariant, React.CSSProperties> = {
  white: { backgroundColor: C.lime, color: C.ink },
  sand: { backgroundColor: C.lime, color: C.ink },
  lime: { backgroundColor: C.ink, color: C.lime },
  gray: { backgroundColor: C.lime, color: C.ink },
};

function Badge({ n, variant = "white" }: { n: number; variant?: SectionVariant }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        borderRadius: "50%",
        fontWeight: 700,
        fontSize: 18,
        marginBottom: 20,
        ...BADGE_STYLE[variant],
      }}
    >
      {n}
    </div>
  );
}

function PTitle({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        fontSize: 38,
        fontWeight: 700,
        marginBottom: 16,
        color: C.textMain,
        lineHeight: 1.6,
        textAlign: "center",
        whiteSpace: "pre-line",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function PSubtitle({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        fontSize: 18,
        fontWeight: 600,
        marginBottom: 10,
        color: C.primary,
        letterSpacing: "1.5px",
        textTransform: "uppercase",
        textAlign: "center",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function PText({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        fontSize: 18,
        lineHeight: 1.6,
        color: C.textBody,
        textAlign: "center",
        maxWidth: 640,
        margin: "0 auto",
        whiteSpace: "pre-line",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Image blocks — URL 있으면 실제 이미지, 없으면 플레이스홀더            */
/* ------------------------------------------------------------------ */

/** 박스형 placeholder/이미지 공통 */
function ImgFill({
  src,
  label,
  style,
}: {
  src?: string;
  label: string;
  style: React.CSSProperties;
}) {
  if (isImg(src)) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src={src} alt="" style={{ ...style, objectFit: "cover", display: "block" }} />
    );
  }
  return (
    <div
      style={{
        ...style,
        background: style.background ?? C.sand,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#aaa",
        fontSize: 13,
        textAlign: "center",
      }}
    >
      {label}
    </div>
  );
}

/** 섹션 내 인라인 이미지 (480px 등) */
function InlineImg({ label, height = 480, src }: { label: string; height?: number; src?: string }) {
  return <ImgFill src={src} label={label} style={{ width: "100%", height, borderRadius: 12 }} />;
}

/** 풀와이드 히어로 이미지 (3:1) */
function HeroImageBlock({ label, src }: { label: string; src?: string }) {
  return (
    <ImgFill src={src} label={label} style={{ width: "100%", aspectRatio: "3/1", overflow: "hidden" }} />
  );
}

/** 풀와이드 일반 이미지 */
function FullWidthImage({
  label,
  aspectRatio = "5/4",
  src,
}: {
  label: string;
  aspectRatio?: string;
  src?: string;
}) {
  return (
    <ImgFill src={src} label={label} style={{ width: "100%", aspectRatio, overflow: "hidden" }} />
  );
}

/* ------------------------------------------------------------------ */
/*  Sections                                                           */
/* ------------------------------------------------------------------ */

function Sec1Hero({ data, n }: { data: NonNullable<ProductDetailTemplateData["hero"]>; n: number }) {
  return (
    <Section variant="white">
      <Badge n={n} />
      <PTitle>{data.title}</PTitle>
      <PText>{data.desc}</PText>
    </Section>
  );
}

function Sec2Intro({ data, n }: { data: NonNullable<ProductDetailTemplateData["intro"]>; n: number }) {
  return (
    <Section variant="sand">
      <Badge n={n} variant="sand" />
      <PSubtitle>{data.label}</PSubtitle>
      <PTitle>{data.title}</PTitle>
      <PText>{data.body}</PText>
    </Section>
  );
}

function Sec3Feature({ data, n }: { data: NonNullable<ProductDetailTemplateData["feature"]>; n: number }) {
  return (
    <Section variant="white">
      <Badge n={n} />
      <PTitle>{data.title}</PTitle>
      <PText>{data.body}</PText>
    </Section>
  );
}

function Sec4Process({ data, n }: { data: NonNullable<ProductDetailTemplateData["process"]>; n: number }) {
  return (
    <Section variant="lime">
      <Badge n={n} variant="lime" />
      <div style={{ margin: "0 -48px", padding: "0 16px" }}>
        <InlineImg label="공정 이미지 영역" height={480} src={data.image} />
      </div>
      <PTitle style={{ marginTop: 24 }}>{data.title}</PTitle>
      <PText>{data.body}</PText>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
          marginTop: 45,
          maxWidth: 480,
          width: "100%",
          marginLeft: "auto",
          marginRight: "auto",
          padding: "0 16px",
        }}
      >
        {data.steps.map((step, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 24px",
                background: C.white,
                borderRadius: 28,
                fontSize: 17,
                color: C.textMain,
                width: "fit-content",
                maxWidth: "100%",
              }}
            >
              <span style={{ fontWeight: 700, color: C.primary, fontSize: 19, flexShrink: 0 }}>
                {i + 1}
              </span>
              <span style={{ color: C.textMain }}>{step}</span>
            </div>
            {i < data.steps.length - 1 && (
              <div style={{ color: C.primary, fontSize: 16, textAlign: "center", padding: "2px 0" }}>↓</div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}

function Sec5Ingredient({ data, n }: { data: NonNullable<ProductDetailTemplateData["ingredient"]>; n: number }) {
  return (
    <Section variant="gray">
      <Badge n={n} variant="gray" />
      <div style={{ margin: "0 -48px", padding: "0 16px" }}>
        <InlineImg label="재료 그리드 이미지 영역" height={480} src={data.image} />
      </div>
      <PTitle style={{ marginTop: 24 }}>{data.title}</PTitle>
      <PText>{data.body}</PText>
      <div style={{ margin: "24px auto 0", maxWidth: "80%" }}>
        <ImgFill
          src={data.detailImage}
          label="재료 상세 이미지 (1:1)"
          style={{ width: "100%", aspectRatio: "1/1", borderRadius: 12 }}
        />
      </div>
    </Section>
  );
}

function Sec6Cert({ data, n }: { data: NonNullable<ProductDetailTemplateData["cert"]>; n: number }) {
  return (
    <Section variant="gray">
      <Badge n={n} variant="gray" />
      <PSubtitle>{data.subtitle}</PSubtitle>
      <PTitle>{data.title}</PTitle>
      <PText>{data.body}</PText>
      <div style={{ display: "flex", gap: 32, marginTop: 54, alignItems: "stretch" }}>
        <ImgFill
          src={data.image}
          label="인증 이미지 영역"
          style={{
            flex: 1,
            minHeight: 280,
            borderRadius: 12,
            overflow: "hidden",
            background: `linear-gradient(135deg, ${C.sand} 0%, ${C.border} 100%)`,
          }}
        />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {data.items.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 8,
                padding: "14px 0",
                borderBottom: `1px solid ${C.certBorder}`,
                borderTop: i === 0 ? `1px solid ${C.certBorder}` : undefined,
              }}
            >
              <span style={{ fontSize: 17, fontWeight: 700, color: C.ink, whiteSpace: "nowrap" }}>
                {item.title}
              </span>
              <span style={{ fontSize: 14, color: "#666" }}>{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function Sec7Heritage({ data, n }: { data: NonNullable<ProductDetailTemplateData["heritage"]>; n: number }) {
  return (
    <Section variant="gray">
      <Badge n={n} variant="gray" />
      <PSubtitle>{data.label}</PSubtitle>
      <PTitle>{data.title}</PTitle>
      {data.stats.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 56, marginTop: 72 }}>
          {data.stats.map((stat, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 53, fontWeight: 700, color: C.primary, lineHeight: 1.1 }}>
                {stat.num}
                <span style={{ fontSize: 22, color: C.primary, marginLeft: 2 }}>{stat.unit}</span>
              </div>
              <div style={{ fontSize: 17, color: C.textMuted, marginTop: 8 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}
      <PText style={{ marginTop: 72 }}>{data.body}</PText>
    </Section>
  );
}

function Sec8Serving({ data, n }: { data: NonNullable<ProductDetailTemplateData["serving"]>; n: number }) {
  return (
    <Section variant="white">
      <Badge n={n} />
      <PTitle>{data.title}</PTitle>
      <PText style={{ marginBottom: 24 }}>{data.subtitle}</PText>
      <div style={{ margin: "0 -48px 24px", overflow: "hidden" }}>
        <ImgFill
          src={data.centerImage}
          label="서빙 배너 이미지 영역 (풀와이드)"
          style={{ width: "100%", height: 240 }}
        />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16, marginTop: 63 }}>
        {data.items.map((item, i) => (
          <div key={i} style={{ textAlign: "center", width: 180, flexShrink: 0 }}>
            <ImgFill
              src={item.image}
              label="이미지 영역"
              style={{ width: 180, height: 180, overflow: "hidden", borderRadius: 12 }}
            />
            <div style={{ fontSize: 19, fontWeight: 700, marginTop: 14, color: C.textMain }}>
              {item.title}
            </div>
            <div style={{ fontSize: 14, color: "#666", marginTop: 6, whiteSpace: "pre-line" }}>
              {item.desc}
            </div>
          </div>
        ))}
      </div>
      {data.tip && (
        <PText style={{ marginTop: 48, textDecoration: "underline", color: C.primary, fontSize: 15 }}>
          {data.tip}
        </PText>
      )}
    </Section>
  );
}

function Sec9Strength({ data, n }: { data: NonNullable<ProductDetailTemplateData["strength"]>; n: number }) {
  return (
    <Section variant="sand">
      <Badge n={n} variant="sand" />
      <PTitle>{data.title}</PTitle>
      <PSubtitle style={{ letterSpacing: 0, textTransform: "none", color: C.textBody }}>
        {data.quote}
      </PSubtitle>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 24,
          marginTop: 72,
          flexWrap: "wrap",
          maxWidth: 468,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {data.circles.map((c, i) => (
          <div
            key={i}
            style={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              backgroundColor: C.ink,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 700, color: C.white }}>{c.main}</div>
            <div style={{ fontSize: 14, color: "rgba(252,250,248,0.7)", marginTop: 4 }}>{c.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 32, marginTop: 72, width: "100%" }}>
        {data.items.map((item, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
            <ImgFill
              src={item.image}
              label="이미지 영역 (16:7)"
              style={{ width: "100%", aspectRatio: "16/7", background: C.gray, borderRadius: 12, overflow: "hidden" }}
            />
            <div style={{ padding: "12px 24px 28px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.primary, marginBottom: 4, letterSpacing: "0.5px" }}>
                {i + 1}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: C.textMain, lineHeight: 1.2 }}>
                {item.title}
              </div>
              <div style={{ fontSize: 15, color: "#666", lineHeight: 1.35 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Sec10Reveal({ data, n }: { data: NonNullable<ProductDetailTemplateData["reveal"]>; n: number }) {
  return (
    <Section variant="white">
      <Badge n={n} />
      <div style={{ margin: "0 -48px", padding: "0 16px" }}>
        <InlineImg label="리빌 이미지 영역" height={480} src={data.image} />
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          margin: "24px 0 14px",
          textAlign: "center",
          color: C.ink,
          lineHeight: 1.4,
          whiteSpace: "pre-line",
        }}
      >
        {data.quote}
      </div>
      <PText>{data.body}</PText>
    </Section>
  );
}

function Sec11Review({ data, n }: { data: NonNullable<ProductDetailTemplateData["review"]>; n: number }) {
  return (
    <Section variant="lime">
      <Badge n={n} variant="lime" />
      <PTitle>{data.title}</PTitle>
      <PText style={{ marginBottom: 20 }}>{data.subtitle}</PText>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 0,
          marginTop: 54,
          maxWidth: 680,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {data.items.map((review, i) => (
          <div
            key={i}
            style={{
              padding: "16px 0",
              fontSize: 18,
              lineHeight: 1.6,
              color: C.ink,
              textAlign: "center",
              borderBottom: i < data.items.length - 1 ? `1px solid ${C.ink}` : "none",
            }}
          >
            &ldquo;{review}&rdquo;
          </div>
        ))}
      </div>
    </Section>
  );
}

function Sec12QnA({ data, n }: { data: NonNullable<ProductDetailTemplateData["qna"]>; n: number }) {
  return (
    <Section variant="white">
      <Badge n={n} />
      <PTitle>{data.title}</PTitle>
      <PText style={{ marginBottom: 24 }}>{data.subtitle}</PText>
      <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "left" }}>
        {data.items.map((item, i) => (
          <div key={i} style={{ padding: "18px 0", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontWeight: 700, marginBottom: 10, color: C.ink, fontSize: 18 }}>Q. {item.q}</div>
            <div style={{ color: C.textBody, fontSize: 17, lineHeight: 1.6 }}>A. {item.a}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Sec13Info({ data, n }: { data: NonNullable<ProductDetailTemplateData["info"]>; n: number }) {
  const gridPairKeys = ["제품명", "식품유형", "품목보고번호", "내용량", "내포장재질", "유통기한"] as const;
  const fullRowKeys = ["제조원", "소분원", "판매원"] as const;

  const filteredPairs = gridPairKeys.filter((k) => data[k]);
  const infoRows: [string, string | undefined][] = [];
  for (let i = 0; i < filteredPairs.length; i += 2) {
    infoRows.push([filteredPairs[i], filteredPairs[i + 1]]);
  }

  return (
    <Section variant="white" style={{ padding: "72px 48px", textAlign: "left" }}>
      <Badge n={n} />
      <div style={{ width: "100%", textAlign: "left" }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: C.ink,
            padding: "14px 0 24px",
            borderBottom: `2px solid ${C.ink}`,
          }}
        >
          {data.제품명}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {infoRows.map(([k1, k2], i) => (
            <div key={i} style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
              {[k1, k2].map((k) =>
                k ? (
                  <div
                    key={k}
                    style={{ display: "flex", fontSize: 13, lineHeight: 1.6, padding: "10px 0", gap: 16, flex: 1 }}
                  >
                    <div style={{ width: 80, flexShrink: 0, fontWeight: 600, color: C.primary }}>{k}</div>
                    <div style={{ flex: 1, color: C.ink }}>{data[k as keyof typeof data]}</div>
                  </div>
                ) : (
                  <div key="empty" style={{ flex: 1 }} />
                ),
              )}
            </div>
          ))}

          {fullRowKeys.map((k) =>
            data[k] ? (
              <div key={k} style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", fontSize: 13, lineHeight: 1.6, padding: "10px 0", gap: 16, width: "100%" }}>
                  <div style={{ width: 80, flexShrink: 0, fontWeight: 600, color: C.primary }}>{k}</div>
                  <div style={{ flex: 1, color: C.ink }}>{data[k]}</div>
                </div>
              </div>
            ) : null,
          )}

          {data.원료명 && (
            <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", fontSize: 13, lineHeight: 1.6, padding: "10px 0", gap: 16, width: "100%" }}>
                <div style={{ width: 80, flexShrink: 0, fontWeight: 600, color: C.primary }}>원료명</div>
                <div style={{ flex: 1, color: C.ink }}>{data.원료명}</div>
              </div>
            </div>
          )}
        </div>

        {data.알레르기 && (
          <div
            style={{
              background: C.ink,
              color: "#fff",
              padding: "12px 20px",
              fontSize: 13,
              fontWeight: 600,
              lineHeight: 1.6,
              borderRadius: 4,
              marginTop: 16,
            }}
          >
            알레르기 유발물질: {data.알레르기}
          </div>
        )}

        {data.참고사항 && (
          <div style={{ padding: "8px 0", fontSize: 10, color: "#999", lineHeight: 1.5, whiteSpace: "pre-line" }}>
            {data.참고사항}
          </div>
        )}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export function ProductDetailTemplate({ data }: { data: ProductDetailTemplateData | undefined }) {
  if (!data) return null;

  let n = 0;
  const next = () => ++n;

  return (
    <div style={{ margin: "0 -16px" }}>
      <HeroImageBlock label="히어로 이미지 영역 (3:1 비율)" src={data.hero?.image} />
      <FullWidthImage label="디쉬 항공샷 이미지 영역" aspectRatio="5/3" src={data.feature?.image} />

      {data.hero && <Sec1Hero data={data.hero} n={next()} />}
      {data.intro && <Sec2Intro data={data.intro} n={next()} />}

      <FullWidthImage label="함께 나눠먹기 이미지 영역 (5:4)" aspectRatio="5/4" src={data.intro?.sharingImage} />

      {data.feature && <Sec3Feature data={data.feature} n={next()} />}
      {data.process && <Sec4Process data={data.process} n={next()} />}
      {data.ingredient && <Sec5Ingredient data={data.ingredient} n={next()} />}
      {data.cert && <Sec6Cert data={data.cert} n={next()} />}

      <HeroImageBlock label="브랜드 스토리 이미지 영역 (3:1 비율)" src={data.heritage?.image} />

      {data.heritage && <Sec7Heritage data={data.heritage} n={next()} />}
      {data.serving && <Sec8Serving data={data.serving} n={next()} />}
      {data.strength && <Sec9Strength data={data.strength} n={next()} />}
      {data.reveal && <Sec10Reveal data={data.reveal} n={next()} />}

      <FullWidthImage label="다같이 모여먹기 이미지 영역 (5:4)" aspectRatio="5/4" src={data.reveal?.gatheringImage} />

      {data.review && <Sec11Review data={data.review} n={next()} />}
      {data.qna && <Sec12QnA data={data.qna} n={next()} />}

      <HeroImageBlock label="제품 엔딩샷 (패키지+내용물 병렬)" src={data.endingImage} />

      {data.info && <Sec13Info data={data.info} n={next()} />}
    </div>
  );
}
