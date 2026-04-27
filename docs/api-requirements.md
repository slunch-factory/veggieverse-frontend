# API Requirements — Spirit & Subscribe

프론트엔드(`/spirit`, `/subscribe`)가 실제로 필요로 하는 API를 정리한 문서입니다.
기존 Swagger 스펙은 참조하지 않고, 현재 프론트 코드의 동작만을 근거로 도출했습니다.

## 목차

- [공통 규약](#공통-규약)
- [Spirit API](#spirit-api)
  - [GET /api/v1/spirit/survey](#get-apiv1spiritsurvey) — 설문 문항 조회
  - [POST /api/v1/spirit/results](#post-apiv1spiritresults) — 설문 제출 및 유형 산출
  - [GET /api/v1/spirit/results/me](#get-apiv1spiritresultsme) — 내 스피릿 결과 조회
  - [GET /api/v1/spirit/types](#get-apiv1spirittypes) — 전체 16가지 유형 조회
  - [GET /api/v1/spirit/types/{code}](#get-apiv1spirittypescode) — 유형 단건 조회
- [Subscribe API](#subscribe-api)
  - [GET /api/v1/subscription/metadata](#get-apiv1subscriptionmetadata) — 구독 페이지 메타데이터
  - [GET /api/v1/subscription/menus](#get-apiv1subscriptionmenus) — 메뉴 카탈로그
  - [GET /api/v1/subscription/menus/{menuId}](#get-apiv1subscriptionmenusmenuid) — 메뉴 단건
  - [GET /api/v1/subscription/calendar](#get-apiv1subscriptioncalendar) — 주간 캘린더(배송 가능일/공휴일)
  - [POST /api/v1/subscription/plans/preview](#post-apiv1subscriptionplanspreview) — 가격 미리보기
  - [POST /api/v1/subscription/plans](#post-apiv1subscriptionplans) — 플랜 생성
  - [GET /api/v1/subscription/plans/{planId}](#get-apiv1subscriptionplansplanid) — 플랜 조회
  - [PATCH /api/v1/subscription/plans/{planId}/slots](#patch-apiv1subscriptionplansplanidslots) — 슬롯 일괄 갱신
  - [POST /api/v1/subscription/plans/{planId}/checkout](#post-apiv1subscriptionplansplanidcheckout) — 결제 시작
  - [POST /api/v1/subscription/plans/{planId}/pause](#post-apiv1subscriptionplansplanidpause) — 일시정지
  - [POST /api/v1/subscription/plans/{planId}/cancel](#post-apiv1subscriptionplansplanidcancel) — 해지
  - [GET /api/v1/subscription/plans/me](#get-apiv1subscriptionplansme) — 내 구독 플랜 목록
- [우선순위 요약](#우선순위-요약)

---

## 공통 규약

### 베이스 URL

```
https://api.slunch.co.kr
```

### 인증

- 로그인된 요청은 `Authorization: Bearer <accessToken>` 헤더를 전달합니다.
- 스피릿 설문은 **비로그인 상태에서도** 제출 가능합니다. 이 경우 서버는 임시 세션 토큰(`anonymousSessionId`)을 발급하여 결과 조회에 사용합니다.

### 공통 요청 헤더

```
Content-Type: application/json
Accept: application/json
Accept-Language: ko-KR    // 다국어(translations) 응답 언어 기본값
X-Client-Timezone: Asia/Seoul  // 구독 캘린더 계산에 사용
```

### 공통 에러 응답

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "subscriptionProductId는 필수입니다.",
    "field": "subscriptionProductId",
    "traceId": "3f2a...b17c"
  }
}
```

| HTTP | `error.code` | 설명 |
|---|---|---|
| 400 | `VALIDATION_ERROR` | 요청 바디/쿼리 검증 실패 |
| 401 | `UNAUTHORIZED` | 토큰 없음/만료 |
| 403 | `FORBIDDEN` | 권한 없음 (타인의 플랜 수정 시도 등) |
| 404 | `NOT_FOUND` | 리소스 없음 |
| 409 | `CONFLICT` | 동시성/중복 (이미 활성 플랜 존재 등) |
| 422 | `BUSINESS_RULE_VIOLATION` | 알러지 충돌, 배송 불가일 등 도메인 규칙 위반 |
| 500 | `INTERNAL_ERROR` | 서버 내부 오류 |

### 페이지네이션

```
?page=1&size=20&sort=createdAt,desc
```

```json
{
  "content": [...],
  "page": 1,
  "size": 20,
  "totalElements": 42,
  "totalPages": 3
}
```

### 통화/날짜

- 모든 가격은 원(KRW) 단위 정수. 소수점 없음.
- 날짜: `YYYY-MM-DD` (`2026-05-04`)
- 일시: ISO 8601 UTC (`2026-05-04T09:00:00Z`)

---

## Spirit API

프론트: `src/app/spirit/step/page.tsx`, `src/app/spirit/_data/surveyQuestions.ts`, `src/app/spirit/_components/SpiritResult.tsx`

현재 `calculateSpiritType` 로직과 16가지 `VEGAN_TYPES`가 클라이언트에 하드코딩되어 있습니다.
이를 서버로 이관해서 설문 문항 관리와 결과 산출을 중앙화합니다.

---

### GET /api/v1/spirit/survey

설문 문항과 옵션을 조회합니다. 프론트는 이 응답만으로 타로 카드 그리드를 렌더링합니다.

현재 운영 중인 설문은 단일 버전(한국어)이며, A/B 테스트나 다국어가 필요해질 경우 이후 하위 호환으로 `?variant=`, `?lang=`을 추가합니다.

#### Query

없음.

#### Request

```http
GET /api/v1/spirit/survey
```

#### Response 200

```json
{
  "totalSteps": 4,
  "questions": [
    {
      "id": 1,
      "step": 1,
      "question": "어떤 식이유형을 따르고 계신가요?",
      "subtitle": "현재 실천 중이거나 관심 있는 식이유형을 선택해주세요.",
      "multiSelect": false,
      "options": [
        {
          "value": "vegan",
          "label": "비건",
          "description": "동물성 식품(고기, 생선, 유제품, 계란 등)을 모두 섭취하지 않습니다",
          "tarot": {
            "number": "I",
            "title": "The Garden.",
            "image": "/images/tarot/diet-type/garden.png"
          }
        },
        {
          "value": "pesco",
          "label": "페스코",
          "description": "육류는 섭취하지 않지만, 생선과 해산물은 섭취합니다",
          "tarot": {
            "number": "II",
            "title": "The Sea.",
            "image": "/images/tarot/diet-type/ocean.png"
          }
        }
      ]
    },
    {
      "id": 2,
      "step": 2,
      "question": "영양 목표는 무엇인가요?",
      "subtitle": "중요하게 생각하는 영양 목표를 모두 선택해주세요.",
      "multiSelect": true,
      "options": [
        {
          "value": "plant-based",
          "label": "플랜트 베이스드",
          "description": "식물성 식품 위주로 구성된 식단을 선호합니다",
          "tarot": { "number": "IV", "title": "The Seed.", "image": "/images/tarot/diet-type/garden.png" }
        }
      ]
    },
    {
      "id": 3,
      "step": 3,
      "question": "알레르기가 있으신가요?",
      "subtitle": "해당하는 항목을 모두 선택해주세요.",
      "multiSelect": true,
      "exclusiveOption": "no-allergy",
      "options": [
        {
          "value": "tree-nuts",
          "label": "견과류",
          "description": "견과류가 포함되지 않은 식단을 선호합니다",
          "tarot": { "number": "IX", "title": "The Nut.", "image": "/images/tarot/food-mood/heritage.png" }
        },
        {
          "value": "no-allergy",
          "label": "해당 없음",
          "description": "위 항목에 해당하는 알레르기가 없어요",
          "tarot": { "number": "XV", "title": "The Clear.", "image": "/images/tarot/food-mood/silence.png" }
        }
      ]
    }
  ]
}
```

> **참고**
> `exclusiveOption` 필드가 있는 질문은 해당 값을 선택하면 다른 선택지를 모두 해제하는 배타 옵션입니다(현재 "해당 없음" 로직).

---

### POST /api/v1/spirit/results

설문 응답을 제출하고, **제출한 답변 그대로**와 **그 답변에 부합하는 제품(구독 메뉴) 목록**을 함께 반환합니다.
스피릿 유형(MBTI) 산출은 이 엔드포인트에서 하지 않습니다 — 필요 시 별도 엔드포인트로 분리합니다.

#### Auth

- 비로그인 허용. 익명 세션도 제출 가능.
- 로그인된 요청이면 `Authorization: Bearer <accessToken>`를 전달하여 결과를 계정에 귀속시킵니다.

#### Request

```http
POST /api/v1/spirit/results
Content-Type: application/json
```

##### Request Body

```json
{
  "answers": [
    { "questionId": 1, "value": "vegan" },
    { "questionId": 2, "values": ["plant-based", "low-calories"] },
    { "questionId": 3, "values": ["tree-nuts"] },
    { "questionId": 4, "value": "spicy-no" }
  ],
  "anonymousSessionId": null
}
```

| field | type | required | 설명 |
|---|---|---|---|
| `answers` | array | Yes | 4개 질문에 대한 응답 모음 |
| `answers[].questionId` | integer | Yes | `GET /api/v1/spirit/survey` 응답의 `questions[].id` |
| `answers[].value` | string | 단일선택일 때 | 선택한 옵션 value (Q1, Q4) |
| `answers[].values` | string[] | 복수선택일 때 | 선택한 옵션 value 목록 (Q2, Q3) |
| `anonymousSessionId` | string \| null | No | 비로그인 재방문 식별자. 없으면 서버가 발급 |

#### Response 200

```json
{
  "resultId": "sp_01HXYZABCDE",
  "submittedAt": "2026-04-22T05:12:00Z",
  "anonymousSessionId": "anon_9a8b7c6d5e",
  "linkedToUser": false,

  "answers": [
    {
      "questionId": 1,
      "question": "어떤 식이유형을 따르고 계신가요?",
      "value": "vegan",
      "selected": [
        { "value": "vegan", "label": "비건" }
      ]
    },
    {
      "questionId": 2,
      "question": "영양 목표는 무엇인가요?",
      "values": ["plant-based", "low-calories"],
      "selected": [
        { "value": "plant-based", "label": "플랜트 베이스드" },
        { "value": "low-calories", "label": "저칼로리" }
      ]
    },
    {
      "questionId": 3,
      "question": "알레르기가 있으신가요?",
      "values": ["tree-nuts"],
      "selected": [
        { "value": "tree-nuts", "label": "견과류" }
      ]
    },
    {
      "questionId": 4,
      "question": "매운맛을 선호하시나요?",
      "value": "spicy-no",
      "selected": [
        { "value": "spicy-no", "label": "매운맛이 약한 순한 음식을 선호해요." }
      ]
    }
  ],

  "matchedFilters": {
    "dietaryType": "slim",
    "includeTags": ["저칼로리", "plant-based"],
    "excludeAllergens": ["nuts"],
    "spicy": false
  },

  "products": {
    "totalCount": 8,
    "items": [
      {
        "id": "S01",
        "code": "S01",
        "slug": "roasted-beet-carpaccio",
        "name": "로스티드 비트 카르파초",
        "description": "구운 비트의 선명한 맛",
        "dietaryType": "slim",
        "price": 7500,
        "imageUrl": "/images/menus/01_roasted_beet_carpaccio.png",
        "tags": ["저칼로리"],
        "spicy": false,
        "matchScore": 0.92,
        "matchReasons": [
          "식이유형 '비건' 부합",
          "저칼로리 목표 부합",
          "견과류 미포함"
        ]
      },
      {
        "id": "S05",
        "code": "S05",
        "slug": "mushroom-japchae",
        "name": "버섯 잡채",
        "description": "담백한 버섯 잡채",
        "dietaryType": "slim",
        "price": 7100,
        "imageUrl": "/images/menus/18_mushroom_japchae.png",
        "tags": ["저칼로리"],
        "spicy": false,
        "matchScore": 0.88,
        "matchReasons": [
          "식이유형 '비건' 부합",
          "저칼로리 목표 부합"
        ]
      },
      {
        "id": "S10",
        "code": "S10",
        "slug": "kale-caesar-salad",
        "name": "케일 시저 샐러드",
        "description": "비건 시저 드레싱의 케일",
        "dietaryType": "slim",
        "price": 6900,
        "imageUrl": "/images/menus/23_kale_caesar_salad.png",
        "tags": ["저칼로리"],
        "spicy": false,
        "matchScore": 0.84,
        "matchReasons": [
          "식이유형 '비건' 부합",
          "저칼로리 목표 부합"
        ]
      }
    ]
  }
}
```

##### 응답 필드 설명

| field | type | 설명 |
|---|---|---|
| `resultId` | string | 이 제출 건의 고유 ID. 이후 `GET /spirit/results/{resultId}`로 재조회 가능 |
| `submittedAt` | ISO8601 | 제출 시각 |
| `anonymousSessionId` | string \| null | 비로그인 제출 시 발급되는 세션 ID (로그인 연동 시 사용) |
| `linkedToUser` | boolean | 로그인 상태 제출 여부 |
| `answers[]` | array | **요청한 answers를 그대로 반환**하되, 질문 텍스트와 선택 옵션의 label까지 hydrate해서 제공 (클라이언트가 별도 매핑할 필요 없음) |
| `answers[].selected[]` | array | 선택한 옵션의 `value` + `label` pair |
| `matchedFilters` | object | 답변을 기반으로 서버가 제품 필터링에 사용한 조건을 투명하게 노출 |
| `matchedFilters.dietaryType` | string | `slim` 또는 `protein` |
| `matchedFilters.includeTags` | string[] | 추천 태그 (영양 목표에서 파생) |
| `matchedFilters.excludeAllergens` | string[] | 제외 알레르기 코드 (메뉴의 `excludable`과 매칭) |
| `matchedFilters.spicy` | boolean \| null | 매운맛 선호 (`spicy-no` → false, `spicy-yes` → true) |
| `products.totalCount` | integer | 필터 조건에 부합하는 전체 제품 수 |
| `products.items[]` | array | 추천 제품 목록. 기본 12개까지 반환하고 `matchScore` 내림차순 정렬 |
| `products.items[].matchScore` | number | 0~1 사이. 필터 부합도 점수 (추천 정렬용) |
| `products.items[].matchReasons` | string[] | 왜 추천되었는지 사람 읽기용 이유 (UI에 "왜 추천되나요?" 노출용) |

#### 매칭 규칙 (서버 로직)

답변 → 필터 변환 규칙은 아래와 같습니다.

| 질문 | 답변 | 필터 변환 |
|---|---|---|
| Q1 식이유형 | `vegan`/`pesco`/`pollo` | 어류·육류 포함 메뉴 필터링 기준으로 사용 |
| Q2 영양 목표 | `plant-based` | `matchedFilters.includeTags`에 `"plant-based"` 추가. 메뉴 `tags`와 교집합 |
| Q2 | `low-calories` | `dietaryType = "slim"` 우선 |
| Q2 | `high-protein` | `dietaryType = "protein"` 우선 |
| Q2 | `low-carb`, `low-sodium` | 해당 태그 포함 메뉴 우선 |
| Q3 알레르기 | `tree-nuts`, `peanuts` | `excludeAllergens`에 `"nuts"` |
| Q3 | `dairy` | `excludeAllergens`에 `"dairy"` |
| Q3 | `no-allergy` | `excludeAllergens = []` |
| Q4 매운맛 | `spicy-no` | `spicy = false`인 메뉴만 |
| Q4 | `spicy-yes` | 제외 조건 없음 (중립) |

서버는 메뉴 카탈로그(`GET /api/v1/subscription/menus`와 동일한 데이터 소스)에서 위 조건을 적용해 `products.items`를 만들고, 부합도 가중 점수로 정렬합니다.

#### Response 400 — 잘못된 요청

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "questionId=2는 복수선택 질문이므로 'values' 필드가 필요합니다.",
    "field": "answers[1]"
  }
}
```

#### Response 422 — 비즈니스 규칙 위반

```json
{
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "질문 3에 '해당 없음'과 다른 항목을 동시에 선택할 수 없습니다.",
    "field": "answers[2]"
  }
}
```

#### 사용 예시 (프론트 관점)

1. 사용자가 4개 질문을 모두 답하고 "완료" 버튼 클릭
2. 프론트는 `answers`를 바디에 담아 이 엔드포인트 호출
3. 응답의 `products.items`로 "당신에게 맞는 제품" 섹션을 즉시 렌더링
4. 사용자가 "구독하러 가기"를 누르면 `matchedFilters.dietaryType`, `excludeAllergens` 등을 쿼리로 들고 `/subscribe`로 이동 → 구독 페이지가 해당 필터 초기값으로 열림

#### 참고: MBTI 유형 산출 분리 사유

현재 프론트 `calculateSpiritType`이 E/I, N/S, T/F, J/P 점수로 16유형을 뽑아내는 별개의 책임을 수행합니다. 이 엔드포인트는 "답변 저장 + 제품 추천"에만 집중하고, MBTI 유형 산출은 `GET /api/v1/spirit/results/{resultId}/type` 같은 별도 엔드포인트나 같은 응답의 옵션 필드로 분리하는 편이 테스트/캐시 관점에서 깔끔합니다. 필요 시 별도 설계합니다.

---

### GET /api/v1/spirit/results/me

현재 로그인된 사용자의 가장 최근 스피릿 결과를 조회합니다. 헤더 아바타, 마이페이지, 구독 페이지 초기 필터에 사용.

#### Request

```http
GET /api/v1/spirit/results/me
Authorization: Bearer <accessToken>
```

#### Response 200

```json
{
  "resultId": "sp_01HXYZABCDE",
  "mbti": "INFJ",
  "type": {
    "code": "quiet-root",
    "name": "Quiet Root",
    "emoji": "🌱",
    "imageUrl": "/spirits/quiet-root.png"
  },
  "savedAt": "2026-04-22T04:15:33Z"
}
```

#### Response 404

아직 설문을 완료하지 않은 사용자:

```json
{ "error": { "code": "NOT_FOUND", "message": "스피릿 결과가 없습니다." } }
```

---

### GET /api/v1/spirit/types

16가지 유형 전체 목록. 마이페이지의 "유형 도감", 결과 페이지의 "다른 유형 보기" 링크 등에 사용.

#### Response 200

```json
{
  "types": [
    {
      "code": "bloomist",
      "mbti": "ENFP",
      "name": "Bloomist",
      "emoji": "🌻",
      "description": "새로운 거 시도하고 나누는 거 좋아해요",
      "color": "#F3B562",
      "imageUrl": "/spirits/bloomist.png"
    },
    {
      "code": "mindgrower",
      "mbti": "INFP",
      "name": "Mindgrower",
      "emoji": "🌿",
      "description": "내 기준이 확실해요. 조용히 생각 많은 편",
      "color": "#A3C585",
      "imageUrl": "/spirits/mindgrower.png"
    }
  ]
}
```

---

### GET /api/v1/spirit/types/{code}

특정 유형 상세. `code` 또는 `mbti`로도 조회.

#### Request

```http
GET /api/v1/spirit/types/quiet-root
```

#### Response 200

```json
{
  "code": "quiet-root",
  "mbti": "INFJ",
  "name": "Quiet Root",
  "emoji": "🌱",
  "description": "말보다 행동으로 보여주는 타입이에요",
  "longDescription": "조용하지만 자기만의 속도가 확실한 타입. 발효·곡물 계열을 선호합니다.",
  "color": "#6A8A6B",
  "imageUrl": "/spirits/quiet-root.png",
  "recommendedMenuIds": ["S03", "S12", "P14"],
  "compatibleTypes": ["mindgrower", "planter"]
}
```

---

## Subscribe API

프론트: `src/app/subscribe/_components/SubscribeClient.tsx`, `src/app/subscribe/_hooks/useSubscribePlanner.ts`, `src/app/subscribe/_data/subscription.ts`, `src/app/subscribe/order/_components/OrderClient.tsx`

현재 `MENUS`(33개), `PLAN_TYPES`, `EXCLUDE_CATEGORIES`, `DELIVERY_CYCLE_OPTIONS`, `PACK_COMPOSITION_OPTIONS`, `SUBSCRIPTION_DISCOUNT_RATE`, `getEarliestStartDate`, `getHolidayMeta` 등이 클라이언트 상수/함수로 존재합니다. 이를 서버 소유로 이관합니다.

---

### GET /api/v1/subscription/metadata

구독 페이지 진입 시 단 한 번 호출. 플랜 유형, 배송 주기 옵션, 팩 구성 옵션, 알러지 카테고리 등 **메뉴와 독립된 메타데이터**를 전부 반환.

#### Response 200

```json
{
  "planTypes": [
    {
      "id": "slim",
      "name": "슬림 밸런스",
      "subtitle": "SLIM BALANCE",
      "description": "저칼로리·저탄수 중심의 가벼운 식단. 샐러드·랩·채소 볼로 포만감은 유지하면서 체중 관리.",
      "imageUrl": "/images/menus/01_roasted_beet_carpaccio.png",
      "color": "#EEF6EF",
      "accent": "#4A7F52",
      "filterTags": ["저칼로리", "저탄수"]
    },
    {
      "id": "protein",
      "name": "헬시 프로틴",
      "subtitle": "HEALTHY PROTEIN",
      "description": "두부·해산물·견과류 등 고단백 재료 중심. 근육 유지와 든든한 포만감이 필요한 날에.",
      "imageUrl": "/images/menus/02_lentil_bolognese.png",
      "color": "#FBF1E8",
      "accent": "#8B5A2B",
      "filterTags": ["고단백"]
    }
  ],
  "excludeCategories": [
    { "code": "dairy",     "label": "유제품", "mark": "유", "keywords": ["치즈","크림","버터","우유","파르미지아노"] },
    { "code": "shellfish", "label": "갑각류", "mark": "갑", "keywords": ["새우","관자","랍스터","해물"] },
    { "code": "fish",      "label": "생선",   "mark": "어", "keywords": ["연어","참치","도미","고등어"] },
    { "code": "nuts",      "label": "견과류", "mark": "견", "keywords": ["땅콩","아몬드","호두","캐슈넛"] },
    { "code": "chicken",   "label": "닭고기", "mark": "닭", "keywords": ["닭","치킨","닭가슴살"] },
    { "code": "egg",       "label": "계란",   "mark": "난", "keywords": ["달걀","계란","오야코"] },
    { "code": "gluten",    "label": "글루텐", "mark": "밀", "keywords": ["파스타","우동","뇨끼","또띠아"] },
    { "code": "spicy",     "label": "매운맛", "mark": "매", "keywords": ["고추장","청양고추","스리라차"] }
  ],
  "deliveryCycleOptions": [
    { "value": "1month", "label": "1달마다 배송", "intervalDays": 30 },
    { "value": "2month", "label": "2달마다 배송", "intervalDays": 60 }
  ],
  "packCompositionOptions": [
    { "value": "14day",          "label": "슬런치 (식단구성) 14일팩",                "fixedDays": 14, "randomDays": 0 },
    { "value": "14day+random7",  "label": "슬런치 (식단구성) 14일팩 + 이후 랜덤 7일팩", "fixedDays": 14, "randomDays": 7 },
    { "value": "14day+random14", "label": "슬런치 (식단구성) 14일팩 + 이후 랜덤 14일팩","fixedDays": 14, "randomDays": 14 },
    { "value": "14day+random21", "label": "슬런치 (식단구성) 14일팩 + 이후 랜덤 21일팩","fixedDays": 14, "randomDays": 21 }
  ],
  "mealSlots": [
    { "index": 0, "label": "점심" },
    { "index": 1, "label": "저녁" }
  ],
  "subscriptionDiscountRate": 0.1,
  "minOrderAmount": 0,
  "shippingFee": 0
}
```

---

### GET /api/v1/subscription/menus

메뉴 카탈로그 조회. 프론트 `MENUS` 상수를 대체.

#### Query

| name | type | 설명 |
|---|---|---|
| `dietaryType` | string | `slim` 또는 `protein`로 필터링 |
| `exclude` | string | 쉼표 구분. `dairy,gluten` 처럼 전달 → 해당 카테고리 포함 메뉴 제외 |
| `tags` | string | `저칼로리,고단백` 등 `filterTags`에 매칭 |
| `active` | boolean | 기본 `true` |

#### Request

```http
GET /api/v1/subscription/menus?dietaryType=slim&exclude=gluten
```

#### Response 200

```json
{
  "menus": [
    {
      "id": "S01",
      "code": "S01",
      "slug": "roasted-beet-carpaccio",
      "name": "로스티드 비트 카르파초",
      "description": "구운 비트의 선명한 맛",
      "dietaryType": "slim",
      "category": "slim",
      "cost": 3800,
      "price": 7500,
      "imageUrl": "/images/menus/01_roasted_beet_carpaccio.png",
      "images": [
        { "url": "/images/menus/01_roasted_beet_carpaccio.png", "role": "thumbnail" }
      ],
      "excludable": ["nuts"],
      "tags": ["저칼로리"],
      "healthGoals": ["low-calories", "plant-based"],
      "spicy": false,
      "active": true,
      "variations": [
        {
          "trigger": "nuts",
          "name": "로스티드 비트 카르파초 (견과 없이)",
          "badge": "N"
        }
      ]
    }
  ]
}
```

- `excludable`: 이 메뉴에 포함된 알러지 카테고리(프론트 `EXCLUDE_CATEGORIES`의 `code`).
- `variations`: 특정 알러지 선택 시 대체 표기할 이름/뱃지 (현재 프론트 `MENU_VARIATIONS`가 비어있지만 스펙으로 남김).

---

### GET /api/v1/subscription/menus/{menuId}

메뉴 단건 상세. 카드 호버 툴팁(`MealHoverTooltip.tsx`) 또는 메뉴 라이브러리 상세 모달용.

#### Response 200

```json
{
  "id": "S01",
  "code": "S01",
  "slug": "roasted-beet-carpaccio",
  "name": "로스티드 비트 카르파초",
  "description": "구운 비트의 선명한 맛",
  "dietaryType": "slim",
  "cost": 3800,
  "price": 7500,
  "imageUrl": "/images/menus/01_roasted_beet_carpaccio.png",
  "excludable": ["nuts"],
  "tags": ["저칼로리"],
  "spicy": false,
  "ingredients": [
    { "name": "비트", "amount": "80g" },
    { "name": "루꼴라", "amount": "20g" }
  ],
  "nutrition": {
    "calories": 280,
    "proteinG": 6,
    "carbG": 25,
    "fatG": 12,
    "sodiumMg": 320
  },
  "allergens": ["nuts"],
  "storage": "냉장 0~10℃",
  "shelfLifeDays": 3
}
```

---

### GET /api/v1/subscription/calendar

구독 시작 가능일/공휴일을 서버 권위로 내려줍니다. 현재 프론트 `getEarliestStartDate`, `getHolidayMeta`, `generateWeekDays` 로직을 대체.

#### Query

| name | type | 설명 |
|---|---|---|
| `from` | string | 기준일 (`YYYY-MM-DD`, 기본 오늘) |
| `weeks` | integer | 반환할 주 수 (기본 8) |

#### Response 200

```json
{
  "referenceDate": "2026-04-22",
  "earliestStartDate": "2026-04-23",
  "isFlexibleToday": true,
  "weeks": [
    {
      "weekStart": "2026-04-20",
      "days": [
        {
          "date": "2026-04-20",
          "weekday": "MON",
          "weekdayKo": "월",
          "isHoliday": false,
          "isDeliverable": true,
          "holiday": null
        },
        {
          "date": "2026-05-05",
          "weekday": "TUE",
          "weekdayKo": "화",
          "isHoliday": true,
          "isDeliverable": false,
          "holiday": { "labelKo": "어린이날", "noteEn": "CHILDREN'S DAY" }
        }
      ]
    }
  ]
}
```

- 규칙: 월~수 결제 → 다음날 배송, 목~일 결제 → 다음 주 화요일부터 (현재 프론트 상수와 동일).

---

### POST /api/v1/subscription/plans/preview

**결제 전** 총액/할인/배송비를 서버 계산으로 검증. `CheckoutBar`와 `OrderSummaryCard`가 매 상태 변경마다 호출.

#### Request Body

```json
{
  "deliveryCycle": "1month",
  "packComposition": "14day+random7",
  "startDate": "2026-04-23",
  "slots": [
    { "date": "2026-04-23", "slot": 0, "menuId": "S01" },
    { "date": "2026-04-23", "slot": 1, "menuId": "P02" },
    { "date": "2026-04-24", "slot": 0, "menuId": "S05" }
  ],
  "excludeCategories": ["nuts", "gluten"],
  "promotionCode": null
}
```

#### Response 200

```json
{
  "itemCount": 3,
  "subtotal": 21600,
  "discount": {
    "subscriptionRate": 0.1,
    "subscriptionAmount": 2160,
    "promotionAmount": 0,
    "totalDiscount": 2160
  },
  "shippingFee": 0,
  "totalAmount": 19440,
  "breakdown": [
    { "menuId": "S01", "name": "로스티드 비트 카르파초", "quantity": 1, "unitPrice": 7500, "lineTotal": 7500 },
    { "menuId": "P02", "name": "크리스피 두부 스테이크", "quantity": 1, "unitPrice": 6900, "lineTotal": 6900 },
    { "menuId": "S05", "name": "버섯 잡채",             "quantity": 1, "unitPrice": 7200, "lineTotal": 7200 }
  ],
  "warnings": [
    {
      "code": "EXCLUDED_INGREDIENT_CONFLICT",
      "menuId": "P05",
      "message": "견과류를 제외하셨지만 '구운 채소 라자냐'에 캐슈넛이 포함되어 있습니다."
    }
  ]
}
```

- 이 엔드포인트는 상태를 만들지 않습니다(멱등 GET-like). 실제 플랜 저장은 `POST /plans`에서.

---

### POST /api/v1/subscription/plans

구독 플랜을 생성합니다. 결제 직전, 사용자가 "결제하기"를 눌렀을 때 호출.

#### Request Body

```json
{
  "deliveryCycle": "1month",
  "packComposition": "14day+random7",
  "startDate": "2026-04-23",
  "dietaryType": "slim",
  "excludeCategories": ["nuts"],
  "spirit": {
    "resultId": "sp_01HXYZABCDE"
  },
  "slots": [
    { "date": "2026-04-23", "slot": 0, "menuId": "S01" },
    { "date": "2026-04-23", "slot": 1, "menuId": "P02" },
    { "date": "2026-04-24", "slot": 0, "menuId": "S05" }
  ],
  "shippingAddress": {
    "recipient": "홍길동",
    "phone": "010-1234-5678",
    "postalCode": "14562",
    "address1": "경기 부천시 소사로160번길 23-8",
    "address2": "301호",
    "memo": "문 앞에 놓아주세요"
  },
  "promotionCode": null
}
```

| field | type | required | 설명 |
|---|---|---|---|
| `deliveryCycle` | string | Yes | `1month` \| `2month` |
| `packComposition` | string | Yes | `14day` \| `14day+random7` \| `14day+random14` \| `14day+random21` |
| `startDate` | date | Yes | `earliestStartDate` 이후여야 함 |
| `dietaryType` | string | Yes | `slim` \| `protein` |
| `excludeCategories` | string[] | No | 알러지/제외 카테고리 코드 |
| `spirit.resultId` | string | No | 스피릿 설문 결과 id (로그 연동) |
| `slots` | array | Yes | 날짜별 슬롯 배치 (점심=0, 저녁=1) |
| `shippingAddress` | object | Yes | 배송지 |
| `promotionCode` | string | No | 쿠폰 코드 |

#### Response 201

```json
{
  "planId": "plan_01HXYZPLAN",
  "status": "DRAFT",
  "createdAt": "2026-04-22T04:30:00Z",
  "summary": {
    "subtotal": 21600,
    "totalDiscount": 2160,
    "shippingFee": 0,
    "totalAmount": 19440
  },
  "checkout": {
    "required": true,
    "checkoutUrl": null
  }
}
```

- `status=DRAFT`: 결제 전. 결제 완료되면 `ACTIVE`로 전이.
- 실제 결제 시작은 별도 `POST /plans/{planId}/checkout`.

#### Response 422

```json
{
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "2026-04-20은 배송 가능일이 아닙니다.",
    "field": "slots[0].date"
  }
}
```

---

### GET /api/v1/subscription/plans/{planId}

플랜 단건 조회. 새로고침 복구, 주문 상세 페이지 등에서 사용.

#### Response 200

```json
{
  "planId": "plan_01HXYZPLAN",
  "userId": 1024,
  "status": "ACTIVE",
  "deliveryCycle": "1month",
  "packComposition": "14day+random7",
  "dietaryType": "slim",
  "excludeCategories": ["nuts"],
  "startDate": "2026-04-23",
  "nextDeliveryDate": "2026-05-21",
  "slots": [
    { "id": "slot_1", "date": "2026-04-23", "slot": 0, "menuId": "S01", "menuName": "로스티드 비트 카르파초" },
    { "id": "slot_2", "date": "2026-04-23", "slot": 1, "menuId": "P02", "menuName": "크리스피 두부 스테이크" }
  ],
  "shippingAddress": {
    "recipient": "홍길동",
    "phone": "010-1234-5678",
    "postalCode": "14562",
    "address1": "경기 부천시 소사로160번길 23-8",
    "address2": "301호"
  },
  "summary": {
    "subtotal": 21600,
    "totalDiscount": 2160,
    "shippingFee": 0,
    "totalAmount": 19440
  },
  "createdAt": "2026-04-22T04:30:00Z",
  "updatedAt": "2026-04-22T04:35:12Z"
}
```

---

### PATCH /api/v1/subscription/plans/{planId}/slots

주간 식단 슬롯을 **일괄 갱신**합니다. `useSubscribePlanner`의 드래그·드롭 반영.

> 단건 upsert/delete보다 주간 표 전체 upsert 방식이 프론트 상태 관리와 잘 맞습니다.
> 서버는 기존 슬롯을 전부 지우고 요청 body로 재생성합니다 (또는 diff 계산).

#### Request Body

```json
{
  "slots": [
    { "date": "2026-04-23", "slot": 0, "menuId": "S01" },
    { "date": "2026-04-23", "slot": 1, "menuId": "P02" },
    { "date": "2026-04-24", "slot": 0, "menuId": "S05" },
    { "date": "2026-04-24", "slot": 1, "menuId": null }
  ]
}
```

- `menuId: null`은 해당 슬롯 비우기.

#### Response 200

```json
{
  "planId": "plan_01HXYZPLAN",
  "slots": [
    { "id": "slot_1", "date": "2026-04-23", "slot": 0, "menuId": "S01" },
    { "id": "slot_2", "date": "2026-04-23", "slot": 1, "menuId": "P02" },
    { "id": "slot_3", "date": "2026-04-24", "slot": 0, "menuId": "S05" }
  ],
  "summary": {
    "subtotal": 21600,
    "totalDiscount": 2160,
    "totalAmount": 19440
  }
}
```

---

### POST /api/v1/subscription/plans/{planId}/checkout

결제 PG 연동 시작. 포트원/이니시스 등 PG로 리다이렉트할 URL 또는 토큰을 반환.

#### Request Body

```json
{
  "paymentMethod": "CARD",
  "pgProvider": "portone",
  "redirectUrl": "https://slunch.co.kr/subscribe/order/complete"
}
```

#### Response 200

```json
{
  "planId": "plan_01HXYZPLAN",
  "paymentId": "pay_01HXYZPAY",
  "status": "PENDING",
  "checkoutUrl": "https://pg.portone.io/checkout?token=...",
  "expiresAt": "2026-04-22T04:45:00Z"
}
```

#### Webhook 규약 (PG → Server)

```json
{
  "paymentId": "pay_01HXYZPAY",
  "status": "PAID",
  "paidAt": "2026-04-22T04:33:12Z",
  "amount": 19440,
  "pgTid": "portone_tid_xxx"
}
```

- 서버는 이를 받고 플랜 `status`를 `ACTIVE`로 전이하고 첫 배송 박스를 생성.

---

### POST /api/v1/subscription/plans/{planId}/pause

구독 일시정지.

#### Request Body

```json
{
  "reason": "여행 중",
  "resumeOn": "2026-06-01"
}
```

#### Response 200

```json
{
  "planId": "plan_01HXYZPLAN",
  "status": "PAUSED",
  "pausedAt": "2026-04-22T04:40:00Z",
  "resumeOn": "2026-06-01"
}
```

---

### POST /api/v1/subscription/plans/{planId}/cancel

구독 해지.

#### Request Body

```json
{
  "reason": "가격 부담",
  "feedback": "더 저렴한 옵션이 있었으면 좋겠어요."
}
```

#### Response 200

```json
{
  "planId": "plan_01HXYZPLAN",
  "status": "CANCELLED",
  "cancelledAt": "2026-04-22T04:42:00Z"
}
```

---

### GET /api/v1/subscription/plans/me

내 구독 플랜 목록. 마이페이지 `/mypage/orders`와 헤더의 현재 활성 구독 배지에 사용.

#### Query

| name | type | 설명 |
|---|---|---|
| `status` | string | `DRAFT`, `ACTIVE`, `PAUSED`, `CANCELLED` 필터 |
| `page`, `size`, `sort` | — | 공통 페이지네이션 |

#### Response 200

```json
{
  "content": [
    {
      "planId": "plan_01HXYZPLAN",
      "status": "ACTIVE",
      "deliveryCycle": "1month",
      "dietaryType": "slim",
      "startDate": "2026-04-23",
      "nextDeliveryDate": "2026-05-21",
      "totalAmount": 19440,
      "slotCount": 14,
      "createdAt": "2026-04-22T04:30:00Z"
    }
  ],
  "page": 1,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

---

## 우선순위 요약

### 🔴 P0 — 구독 결제 플로우가 성립하기 위한 최소 집합
1. `GET /api/v1/subscription/metadata`
2. `GET /api/v1/subscription/menus`
3. `GET /api/v1/subscription/calendar`
4. `POST /api/v1/subscription/plans/preview`
5. `POST /api/v1/subscription/plans`
6. `PATCH /api/v1/subscription/plans/{planId}/slots`
7. `POST /api/v1/subscription/plans/{planId}/checkout`
8. 결제 PG webhook 규약

### 🟡 P1 — 스피릿 연동 및 유저 컨텍스트
9. `GET /api/v1/spirit/survey`
10. `POST /api/v1/spirit/results`
11. `GET /api/v1/spirit/results/me`
12. `GET /api/v1/subscription/plans/{planId}`
13. `GET /api/v1/subscription/plans/me`

### 🟢 P2 — 부가 기능
14. `GET /api/v1/spirit/types`, `GET /api/v1/spirit/types/{code}`
15. `GET /api/v1/subscription/menus/{menuId}`
16. `POST /api/v1/subscription/plans/{planId}/pause`
17. `POST /api/v1/subscription/plans/{planId}/cancel`

### 🔵 별도 문서 필요 (이 문서 범위 외)
- 인증: `/api/v1/auth/login`, `/api/v1/auth/signup`, `/api/v1/auth/me`, `/api/v1/auth/refresh`
- 익명 결과 링킹: `/api/v1/auth/link-anonymous`
- 배송지 CRUD: `/api/v1/me/addresses`
- 쿠폰/프로모션 검증: `/api/v1/promotions/validate`

---

> 이 문서는 프론트엔드 코드(`src/app/spirit/**`, `src/app/subscribe/**`)에 이미 존재하는 상수/로직을 기준으로 작성되었습니다.
> 스펙 협의 후 변경점은 본 문서와 프론트 타입(`src/types/`)을 함께 갱신해주세요.
