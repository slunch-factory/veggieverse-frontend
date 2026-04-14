# Google 소셜 로그인 전체 플로우 정리

Google 소셜 로그인 기준으로, Veggieverse 사이트·Google·Cafe24 세 시스템 간의 리다이렉트 흐름과 필요한 페이지를 정리합니다.

---

## 시나리오 A: 카페24 쇼핑몰에서 시작

사용자가 `shop.veggieverse.com`에서 회원가입 또는 로그인을 클릭한 경우입니다.

### 전체 리다이렉트 경로

```
[1] shop.veggieverse.com (카페24)
 │  사용자가 "회원가입" 또는 "로그인" 클릭
 │
 │  ★ 카페24 스마트디자인에 삽입한 JS가 동작
 │  ★ 기본 /member/join.html로 가지 않고 외부로 리다이렉트
 │
 ▼
[2] veggieverse.com/signup (또는 /login)
 │  Veggieverse 회원가입(또는 로그인) 페이지 표시
 │  사용자가 "Google로 가입" 버튼 클릭
 │
 ▼
[3] veggieverse.com/api/auth/google
 │  Google OAuth 시작을 처리하는 API Route (사용자에게 화면 없음)
 │  Google 로그인 URL을 생성하고 즉시 리다이렉트
 │
 ▼
[4] accounts.google.com/o/oauth2/v2/auth
 │  ★ Google 로그인 화면 (사용자가 실제로 보는 화면)
 │  ★ Google 계정 선택 또는 이메일/비밀번호 입력
 │  로그인 완료 후 authorization code와 함께 콜백으로 리다이렉트
 │
 ▼
[5] veggieverse.com/api/auth/google/callback?code=xxx&state=xxx
 │  Google에서 돌아온 code를 처리하는 API Route (사용자에게 화면 없음)
 │  ① code → Google access_token 교환 (서버 간 통신)
 │  ② access_token → Google 사용자 정보 조회 (서버 간 통신)
 │  ③ Veggieverse DB에 회원 생성(첫 가입) 또는 조회(기존 회원)
 │  ④ Veggieverse 세션 쿠키(vv_session) 발급
 │  ⑤ 원래 요청(callback URL)으로 리다이렉트
 │
 ▼
[6] veggieverse.com/oauth/authorize?client_id=...&redirect_uri=...&state=...
 │  Cafe24 SSO를 위한 OAuth Authorization Endpoint (사용자에게 화면 없음)
 │  ★ 방금 세션이 생성되었으므로 세션 확인 → 즉시 authorization code 발급
 │  code + state를 붙여서 Cafe24의 redirect_uri로 리다이렉트
 │
 ▼
[7] shop.veggieverse.com/member/login/callback?code=xxx&state=xxx
 │  Cafe24가 내부적으로 처리 (사용자에게 화면 없음)
 │  ① code → Veggieverse access_token 교환 (서버 간 통신)
 │  ② access_token → Veggieverse 사용자 정보 조회 (서버 간 통신)
 │  ③ Cafe24 회원 자동 생성(첫 방문) 또는 매칭(기존 회원)
 │  ④ Cafe24 세션 생성
 │
 ▼
[8] shop.veggieverse.com
    ★ 쇼핑몰 메인 페이지 (로그인 완료 상태)
```

### 사용자가 실제로 보는 화면

| 순서 | URL | 화면 | 체류 시간 |
|------|-----|------|----------|
| 1 | shop.veggieverse.com | 쇼핑몰 (회원가입 클릭) | 사용자 액션 |
| 2 | veggieverse.com/signup | 회원가입 페이지 (Google 버튼 클릭) | 사용자 액션 |
| 3 | accounts.google.com | Google 계정 선택 화면 | 사용자 액션 |
| 4 | shop.veggieverse.com | 쇼핑몰 메인 (로그인 완료) | 도착 |

3번에서 4번으로 넘어갈 때 중간에 [5]→[6]→[7] 리다이렉트가 발생하지만, 모두 서버 측 즉시 리다이렉트이므로 사용자 눈에는 "Google 로그인 완료 → 쇼핑몰 도착"으로 보입니다.

---

## 시나리오 B: Veggieverse 사이트에서 시작

사용자가 `veggieverse.com`에서 직접 로그인한 후, 쇼핑몰로 이동하는 경우입니다.

### B-1. Veggieverse에서 로그인

```
[1] veggieverse.com
 │  사용자가 "로그인" 클릭
 │
 ▼
[2] veggieverse.com/login
 │  로그인 페이지 표시
 │  사용자가 "Google로 로그인" 버튼 클릭
 │
 ▼
[3] veggieverse.com/api/auth/google
 │  Google OAuth 시작 (즉시 리다이렉트, 화면 없음)
 │
 ▼
[4] accounts.google.com/o/oauth2/v2/auth
 │  ★ Google 계정 선택 화면
 │
 ▼
[5] veggieverse.com/api/auth/google/callback?code=xxx&state=/
 │  Google 콜백 처리 (화면 없음)
 │  ① code → token 교환
 │  ② 사용자 정보 조회
 │  ③ DB 회원 조회/생성
 │  ④ 세션 쿠키 발급
 │  ⑤ callback(/)으로 리다이렉트
 │
 ▼
[6] veggieverse.com
    ★ 홈 (로그인 완료 상태)
```

### B-2. 로그인 상태에서 쇼핑몰 이동

```
[1] veggieverse.com
 │  사용자가 "쇼핑몰 가기" 클릭
 │
 ▼
[2] shop.veggieverse.com
 │  Cafe24 쇼핑몰 메인 도착 (아직 Cafe24에는 미로그인)
 │  SSO 로그인 자동 시작 또는 사용자가 로그인 클릭
 │
 ▼
[3] veggieverse.com/oauth/authorize?client_id=...&redirect_uri=...&state=...
 │  ★ 이미 세션이 있으므로 로그인 화면 없이 즉시 code 발급
 │  (사용자에게 화면 없음, 즉시 리다이렉트)
 │
 ▼
[4] shop.veggieverse.com/member/login/callback?code=xxx&state=xxx
 │  Cafe24 내부 처리 (화면 없음)
 │  code → token → userinfo → 회원 매칭 → 세션 생성
 │
 ▼
[5] shop.veggieverse.com
    ★ 쇼핑몰 메인 (로그인 완료 상태)
```

사용자가 보는 화면: "쇼핑몰 가기 클릭 → 잠깐 깜빡임 → 쇼핑몰 도착(로그인 완료)"

---

## 시나리오 C: 쇼핑몰에서 로그인 (이미 Veggieverse 가입된 사용자)

```
[1] shop.veggieverse.com
 │  사용자가 "로그인" 클릭
 │
 │  ★ 스마트디자인 JS → veggieverse.com/login으로 리다이렉트
 │
 ▼
[2] veggieverse.com/login
 │  로그인 페이지 표시
 │  사용자가 "Google로 로그인" 클릭
 │
 ▼
[3] accounts.google.com
 │  ★ Google 계정 선택 (이미 Google에 로그인되어 있으면 원클릭)
 │
 ▼
[4] veggieverse.com/api/auth/google/callback
 │  (화면 없음) DB 회원 조회 → 세션 발급 → /oauth/authorize로 리다이렉트
 │
 ▼
[5] veggieverse.com/oauth/authorize
 │  (화면 없음) 세션 확인 → code 발급 → Cafe24로 리다이렉트
 │
 ▼
[6] shop.veggieverse.com
    ★ 쇼핑몰 (로그인 완료)
```

---

## callback 파라미터가 플로우를 연결하는 방법

세 시스템 간 리다이렉트가 끊기지 않는 이유는 `callback` 파라미터가 전체 플로우를 관통하기 때문입니다.

### 시나리오 A 기준 callback 전달 과정

```
① Cafe24 SSO 시작
   → veggieverse.com/oauth/authorize?client_id=C&redirect_uri=R&state=S

② 세션 없음 → 로그인 페이지로 리다이렉트
   → veggieverse.com/login?callback=/oauth/authorize?client_id=C&redirect_uri=R&state=S
                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                          원래 OAuth URL 전체가 callback에 담김

③ Google로 로그인 클릭
   → veggieverse.com/api/auth/google?callback=/oauth/authorize?client_id=C&redirect_uri=R&state=S

④ Google OAuth 시작 — callback을 state에 저장
   → accounts.google.com/...?state=/oauth/authorize?client_id=C&redirect_uri=R&state=S

⑤ Google 콜백 — state에서 callback 복원
   → veggieverse.com/api/auth/google/callback?code=G_CODE&state=/oauth/authorize?...
   → 세션 생성 후, state(=callback)로 리다이렉트

⑥ OAuth authorize 재진입 — 이제 세션 있음
   → veggieverse.com/oauth/authorize?client_id=C&redirect_uri=R&state=S
   → code 발급 → redirect_uri(R)로 리다이렉트

⑦ Cafe24 복귀
   → shop.veggieverse.com/member/login/callback?code=VV_CODE&state=S
```

핵심: `/oauth/authorize`의 전체 URL이 `callback` → Google `state` → 콜백 `state`를 거쳐 끝까지 살아남습니다.

---

## 필요한 페이지·엔드포인트 목록

### 사용자에게 화면이 보이는 페이지 (2개)

| 페이지 | URL | 역할 |
|--------|-----|------|
| **회원가입** | `veggieverse.com/signup` | 이메일 가입 폼 + Google 가입 버튼 |
| **로그인** | `veggieverse.com/login` | 이메일 로그인 폼 + Google 로그인 버튼 |

두 페이지 모두 `?callback=` 쿼리 파라미터를 받아서, 가입/로그인 완료 후 해당 URL로 리다이렉트합니다.

### 서버 측 API 엔드포인트 (화면 없음, 7개)

| 엔드포인트 | 메서드 | 역할 | 호출 주체 |
|-----------|--------|------|----------|
| `/api/auth/google` | GET | Google OAuth 시작 (Google로 리다이렉트) | 사용자 브라우저 |
| `/api/auth/google/callback` | GET | Google 콜백 처리 → 세션 생성 → callback으로 리다이렉트 | Google 리다이렉트 |
| `/api/auth/signup` | POST | 이메일 회원가입 → 세션 생성 | signup 페이지 fetch |
| `/api/auth/login` | POST | 이메일 로그인 → 세션 생성 | login 페이지 fetch |
| `/oauth/authorize` | GET | OAuth authorization code 발급 → Cafe24로 리다이렉트 | Cafe24 SSO |
| `/api/oauth/token` | POST | authorization code → access_token 교환 | Cafe24 서버 |
| `/api/userinfo` | GET | access_token → 사용자 정보(id, email, name) 반환 | Cafe24 서버 |

### Cafe24 쇼핑몰 측 수정 (스마트디자인)

| 대상 | 수정 내용 |
|------|----------|
| 회원가입 버튼/페이지 | `veggieverse.com/signup`으로 리다이렉트하는 JS 삽입 |
| 로그인 버튼/페이지 | `veggieverse.com/login`으로 리다이렉트하는 JS 삽입 (또는 SSO 로그인만 노출) |
| SSO 연동 관리 | authorize/token/userinfo 3개 URL 등록 |

### 외부 서비스 설정

| 서비스 | 설정 내용 |
|--------|----------|
| **Google Cloud Console** | OAuth 2.0 Client ID 생성, redirect_uri에 `veggieverse.com/api/auth/google/callback` 등록 |
| **Cafe24 관리자** | SSO 연동에 Veggieverse OAuth Provider 등록 (client_id, client_secret, 3개 URL) |

---

## 리다이렉트 횟수 정리

| 시나리오 | 리다이렉트 횟수 | 사용자가 보는 화면 수 |
|---------|---------------|-------------------|
| A. 쇼핑몰에서 첫 가입 (Google) | 7회 | 3개 (signup → Google → 쇼핑몰) |
| B-1. 자체 사이트 로그인 (Google) | 4회 | 2개 (login → Google → 홈) |
| B-2. 로그인 상태에서 쇼핑몰 이동 | 3회 | 0개 (클릭 → 자동 → 쇼핑몰) |
| C. 쇼핑몰에서 재로그인 (Google) | 5회 | 2개 (login → Google → 쇼핑몰) |

리다이렉트가 많아 보이지만, 사용자가 직접 조작하는 화면은 2~3개뿐이고 나머지는 즉시 리다이렉트로 체감 시간이 거의 없습니다.
