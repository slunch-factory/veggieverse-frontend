# Slunch Veggieverse Design System

`docs/design-system-playground.html`의 시각 레퍼런스를 코드 적용 가이드로 정리한 문서. 모든 토큰과 클래스는 `src/app/globals.css`에 이미 정의되어 있어 바로 사용 가능.

---

## 1. Design Tokens

### Colors

#### Core
| Token | Value | 용도 |
|---|---|---|
| `--ink` | `#250a00` | 글씨, 가장 진한 색 / 보더 |
| `--point` | `#dcfd4a` | 포인트 라임 (CTA 액티브, 강조) |
| `--ink-light` | `#6e5035` | 진한색의 옅은 배리에이션 (보조 텍스트) |
| `--alert-red` | `#ff1714` | NEW, 오류, 강조 알림 |

#### Backgrounds
| Token | Value | 용도 |
|---|---|---|
| `--bg-canvas` | `#b4b4b4` | 캔버스 (노이즈 텍스처용) |
| `--bg-white` | `#ffffff` | 카드 배경 |
| `--bg-off` | `#e8e2e2` | 비활성/플레이스홀더 박스 |
| `--bg-pale` | `#fcfaf8` | 페이지 기본 배경 |

#### Neutrals & Status
`--neutral-stone` `--neutral-warm` `--neutral-lavender` `--neutral-yellow` `--neutral-lime` `--neutral-orange` `--neutral-blue`

(`--neutral-stone`은 디바이더, 보조 텍스트 등에 자주 쓰임)

#### Aliases
- `--cream` ≡ `--bg-pale`
- `--warm-gray` ≡ `--ink-light`
- `--muted` ≡ `--neutral-stone`

### Radius
| Token | Value | 용도 |
|---|---|---|
| `--r-btn` | `6px` | 버튼/카드/인풋 라운드 |
| `--r-modal` | `40px` | 모달 큰 라운드 |
| `--r-pill` | `999px` | 태그/뱃지 완전 타원 |

### Layout
- `--header-h`: 64px (모바일 56px)
- `--header-area-h`: `calc(promo + header)` — 페이지 컨텐츠 fixed 요소 top 기준값

---

## 2. Typography

> ⚠️ **NO BOLD RULE** — globals.css가 모든 요소의 `font-weight: 400`을 강제. `font-bold` 등 Tailwind bold 유틸리티는 무효화됨.

### Utility Classes
| Class | Size | Use |
|---|---|---|
| `.t-display` | 48px / -0.03em / 1.1 | 히어로 타이틀 |
| `.t-h1` | 32px / -0.02em / 1.2 | 페이지 타이틀 |
| `.t-h2` | 24px / -0.01em / 1.3 | 섹션 타이틀 |
| `.t-h3` | 18px / 1.4 | 카드/서브 타이틀 |
| `.t-body` | 15px / 1.7 | 본문 |
| `.t-small` | 13px / 1.5 | 보조 본문 / 라벨 |
| `.t-caption` | 11px / +0.02em | 캡션 / 메타 |

### 색상 페어링 가이드
- 메인 텍스트: `var(--ink)`
- 보조 텍스트: `var(--ink-light)`
- 메타/플레이스홀더: `var(--neutral-stone)`
- 오류: `var(--alert-red)`

---

## 3. Buttons

### 기본 사용
```tsx
<button className="btn btn-dark btn-lg">결제하기</button>
<button className="btn btn-primary btn-md">담기</button>
<button className="btn btn-ghost btn-sm">취소</button>
<button className="btn btn-dark btn-pill btn-md">구독 시작</button>
```

### Variants
| Class | Default | Hover | Active |
|---|---|---|---|
| `.btn-primary` | `--point` bg / `--ink` text | `--bg-off` | `--ink` bg / `--point` text |
| `.btn-dark` | `--ink` bg / `--point` text | `--ink-light` | `--point` bg / `--ink` text |
| `.btn-ghost` | transparent / `--ink` | `--bg-off` | `--neutral-stone` |

### Sizes
- `.btn-lg` — h48 / 15px (메인 CTA)
- `.btn-md` — h40 / 14px
- `.btn-sm` — h32 / 13px

### Modifiers
- `.btn-pill` — `--r-pill` 라운드
- `.btn-icon.btn-{lg,md,sm}` — 정사각 아이콘 버튼

### Disabled
`disabled` 속성으로 자동 처리 (`opacity 0.32; pointer-events: none`).

---

## 4. Form Elements

### Text Input
```tsx
<input className="ds-input" placeholder="이메일" />
<input className="ds-input is-error" />
<p className="ds-input-msg is-error">올바른 형식으로 입력해주세요.</p>
```
- 포커스 시 `--ink` 보더 + 박스 섀도
- `is-error` 클래스 → `--alert-red` 보더/텍스트
- `:disabled` → `--bg-off` 배경

### Select
`<select>`는 native chevron을 숨기고 커스텀 아이콘 추가 권장:
```tsx
<div className="relative">
  <select className="ds-input" style={{ appearance: "none", paddingRight: 40 }}>
    <option>...</option>
  </select>
  <ChevronDown
    size={16}
    color="var(--ink-light)"
    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
  />
</div>
```

### Checkbox
```tsx
<label className="chk-wrap">
  <input type="checkbox" />
  <span>동의합니다</span>
</label>
```
- 체크 시 `--point` 채움 + `--ink` 체크마크

### Radio
```tsx
<label className="radio-wrap">
  <input type="radio" name="g" />
  <span>옵션 A</span>
</label>
```

### Toggle Switch
```tsx
<label className="toggle-wrap">
  <input type="checkbox" />
  <span>알림 받기</span>
</label>
```

### Form Section 패턴 (재사용)
주문 / 회원가입 / 구독 설정 등 일관 사용:
```tsx
<section style={{
  background: "var(--bg-white)",
  border: "1px solid var(--ink)",
  borderRadius: "var(--r-btn)",
}}>
  <header
    className="px-5 py-4 flex items-center gap-2"
    style={{ borderBottom: "1px solid var(--neutral-stone)", color: "var(--ink)" }}
  >
    <Icon size={16} strokeWidth={1.5} />
    <h2 className="t-h3">섹션 제목</h2>
  </header>
  <div className="px-5 py-5 flex flex-col gap-4">
    {/* FormField들 */}
  </div>
</section>
```

### Form Field 패턴
```tsx
<div className="flex flex-col gap-1.5">
  <span className="t-small" style={{ color: "var(--ink)" }}>
    라벨
    <span className="ml-1" style={{ color: "var(--alert-red)" }}>*</span>
  </span>
  <input className="ds-input" />
</div>
```

---

## 5. Tags & Pills

```tsx
<span className="tag">#유기농</span>
<button className="tag is-selected">#비건</button>
<span className="tag is-disabled">#비활성</span>
```

- `.is-selected` → `--ink` bg / `--point` text
- 항상 클릭 가능 인터랙션을 가지므로 장식용은 `style={{ pointerEvents: "none", cursor: "default" }}` 추가

---

## 6. Badges (정원 50×50)

상품 상태 표기용 원형 배지:
```tsx
<span className="badge badge-new">NEW</span>
<span className="badge badge-best">BEST</span>
<span className="badge badge-sale">SALE</span>
<span className="badge badge-sold">SOLD OUT</span>
<span className="badge badge-limited">LIMITED</span>
```

---

## 7. Toast

```tsx
<div className="toast">
  <div className="toast-dot" />
  <span>장바구니에 추가되었습니다.</span>
</div>
```
- `--ink` 배경 + `--point` 도트 + 흰 글자

---

## 8. Product Card

프레임 없음. 썸네일만 4:3, hover 시 상품명 underline:
```tsx
<div className="card">
  <div className="card-img">
    <div className="card-badges">
      <span className="badge badge-best">BEST</span>
    </div>
    <Image .../>
  </div>
  <div className="card-body">
    <p className="card-name">상품명</p>
    <p className="card-desc">짧은 설명</p>
    <p className="card-orig">35,000원</p>
    <div className="card-price-row">
      <span className="card-discount">9%</span>
      <span className="card-price">32,000원</span>
    </div>
  </div>
</div>
```
- `.card.is-soldout` → opacity 0.55

---

## 9. Accordion

```tsx
<div className="acc">
  <details className="acc-item">
    <summary>
      <span>제목</span>
      <span className="acc-icon">+</span>
    </summary>
    <div className="acc-body">본문</div>
  </details>
</div>
```
- `[open]` 상태 → `--ink` 배경 + `--point` 글자 + 아이콘 45° 회전

---

## 10. Modal

`.sl-modal-overlay` / `.sl-modal` (globals.css §7).

```tsx
<div className="sl-modal-overlay">
  <div className="sl-modal">
    <div className="sl-modal-header">
      <button className="sl-modal-close">×</button>
    </div>
    <div className="sl-modal-content">...</div>
  </div>
</div>
```

큰 라운드(`--r-modal`)가 필요한 경우 `border-radius: var(--r-modal)`을 inline으로 적용.

---

## 11. 자주 쓰는 페이지 패턴

### 페이지 셸
```tsx
<div className="min-h-screen" style={{ background: "var(--bg-pale)" }}>
  <div className="mx-auto max-w-5xl px-4 py-6">
    {/* content */}
  </div>
</div>
```

### 백 링크
```tsx
<Link
  href="/parent"
  className="inline-flex items-center gap-1 t-small mb-6"
  style={{ color: "var(--ink-light)" }}
>
  <ChevronLeft size={16} />
  부모 페이지명
</Link>
```

### Section Card (라벨 헤더형)
주문 상세, 결제 완료 등에서 쓰는 캡션 헤더 + 내용:
```tsx
<section style={{
  background: "var(--bg-white)",
  border: "1px solid var(--ink)",
  borderRadius: "var(--r-btn)",
  overflow: "hidden",
}}>
  <header className="px-5 py-3"
    style={{ borderBottom: "1px solid var(--ink)", background: "var(--bg-pale)" }}>
    <p className="t-caption"
      style={{ color: "var(--ink-light)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
      Section Label
    </p>
  </header>
  {/* content */}
</section>
```

### Status Badge (작은 pill)
```tsx
<span className="inline-flex items-center"
  style={{
    background: "var(--point)",  // 또는 --neutral-blue, --bg-off 등
    color: "var(--ink)",
    padding: "3px 10px",
    borderRadius: "var(--r-pill)",
    border: "1px solid var(--ink)",
    fontSize: 11,
    letterSpacing: "0.02em",
  }}
>
  준비중
</span>
```

---

## 12. Don'ts

- ❌ 하드코딩된 색상값 (`bg-gray-300`, `#8C451D` 등) — 토큰 사용
- ❌ `font-bold`, `font-semibold` — 무효화됨
- ❌ 부드러운 alpha 보더 (`rgba(26,10,5,0.08)` 등) — `var(--ink)` 또는 `var(--neutral-stone)` 사용
- ❌ 둥근 모서리 임의값 — `var(--r-btn)` / `var(--r-pill)` / `var(--r-modal)`
- ❌ 인풋에 인라인 스타일 — `.ds-input` 사용

---

## 빠른 참조

| 상황 | 사용 |
|---|---|
| 페이지 배경 | `var(--bg-pale)` |
| 카드 배경 | `var(--bg-white)` + `1px solid var(--ink)` + `var(--r-btn)` |
| 내부 디바이더 | `1px solid var(--neutral-stone)` |
| 본문 텍스트 | `t-small` + `var(--ink)` |
| 보조 텍스트 | `t-caption` + `var(--ink-light)` |
| 메인 CTA | `btn btn-dark btn-lg` |
| 보조 액션 | `btn btn-ghost btn-sm` + `border: 1px solid var(--neutral-stone)` |
| 인풋 | `.ds-input` |
| 체크박스 | `.chk-wrap` |
| 필수 표시 | `<span style={{ color: "var(--alert-red)" }}>*</span>` |
| 오류 메시지 | `var(--alert-red)` |
