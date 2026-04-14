# Veggieverse + Cafe24 인증 연동 설계서

## 개요

Veggieverse 자체 사이트(veggieverse.com)에서 회원가입/로그인을 처리하고, Cafe24 쇼핑몰(shop.veggieverse.com)과 SSO로 연동하는 구조를 설명합니다.

**핵심 원칙**: Cafe24는 최종적으로 Veggieverse OAuth Provider의 결과만 소비한다.

---

## 1. 전체 플로우

### 1-1. 회원가입 플로우 (소셜 로그인 포함)

```
사용자 → shop.veggieverse.com 회원가입 클릭
  → (Cafe24 기본 가입 페이지로 가지 않음)
  → veggieverse.com/signup 으로 이동
  → 기본가입 또는 소셜가입(Google OAuth) 진행
  → Veggieverse DB에 회원 생성 + 세션 생성
  → Cafe24 SSO 흐름 자동 재개
  → Cafe24 첫 로그인 시 회원 자동 생성 (@s 접두사)
  → shop.veggieverse.com 복귀 (로그인 상태)
```

### 1-2. 시퀀스 다이어그램

```
사용자         shop(Cafe24)       veggieverse.com       Google
  │                │                    │                  │
  │──회원가입 클릭──►│                    │                  │
  │                │──JS redirect──────►│                  │
  │                │   /signup          │                  │
  │◄───────────────┼────────────────────│                  │
  │   signup 페이지 표시                  │                  │
  │                │                    │                  │
  │──"Google로 가입" 클릭───────────────►│                  │
  │                │                    │──authorize──────►│
  │                │                    │                  │
  │◄────────────────────────────────────┼──Google 로그인───│
  │   Google 계정 선택                   │                  │
  │────────────────────────────────────►│                  │
  │                │                    │◄──code──────────│
  │                │                    │──code→token─────►│
  │                │                    │◄──access_token──│
  │                │                    │──userinfo───────►│
  │                │                    │◄──email,name────│
  │                │                    │                  │
  │                │                    │ DB에 회원 생성     │
  │                │                    │ 세션 쿠키 발급     │
  │                │                    │                  │
  │                │                    │ /oauth/authorize │
  │                │                    │ 세션 확인 → code 발급
  │                │◄───code + state────│                  │
  │                │                    │                  │
  │                │──code→token───────►│                  │
  │                │◄──access_token─────│                  │
  │                │──userinfo─────────►│                  │
  │                │◄──{id,email,name}──│                  │
  │                │                    │                  │
  │                │ Cafe24 회원 자동 생성 │                  │
  │                │ (@s 접두사 member_id)│                  │
  │◄──로그인 완료───│                    │                  │
  │  shop 메인 복귀  │                    │                  │
```

### 1-3. 로그인 플로우 (이미 가입된 사용자)

```
사용자 → shop.veggieverse.com 로그인 클릭
  → veggieverse.com/login 으로 이동
  → 이메일/비밀번호 또는 Google 로그인
  → 세션 존재 확인 → authorization code 즉시 발급
  → Cafe24로 redirect → 기존 회원 매칭 → 로그인 완료
  → shop.veggieverse.com 복귀
```

### 1-4. 이미 로그인 상태에서 쇼핑몰 이동

```
사용자 → veggieverse.com에서 "쇼핑몰 가기" 클릭
  → shop.veggieverse.com/member/login.html (SSO 로그인 URL)로 이동
  → Cafe24가 SSO 플로우 시작 → veggieverse.com/oauth/authorize 호출
  → 이미 세션 존재 → code 즉시 발급 (로그인 화면 없음)
  → Cafe24 token 교환 → userinfo 조회 → 자동 로그인
  → shop 메인 도착 (로그인 상태)

사용자 체감: 클릭 → 잠깐 깜빡임 → 쇼핑몰 (로그인 완료)
```

---

## 2. Veggieverse가 담당하는 두 가지 역할

veggieverse.com은 **동시에 두 가지 OAuth 역할**을 수행합니다. 이 두 역할은 완전히 독립적이며 서로 충돌하지 않습니다.

| 역할 | 상대방 | 설명 |
|------|--------|------|
| **OAuth Client (Consumer)** | Google | 사용자의 Google 계정으로 로그인받는 역할 |
| **OAuth Provider (Server)** | Cafe24 | Cafe24에게 인증 결과를 제공하는 역할 |

```
Google ──(provider)──► veggieverse.com ──(provider)──► Cafe24
                       ↑ OAuth Client       ↑ OAuth Provider
                       (Google의 토큰 소비)   (자체 토큰 발급)
```

서로 다른 엔드포인트, 다른 토큰, 다른 쿠키를 사용하므로 기술적 충돌이 없습니다.

---

## 3. 프론트엔드 설계

### 3-1. 파일 구조

```
src/app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx              ← 로그인 페이지
│   └── signup/
│       └── page.tsx              ← 회원가입 페이지
├── oauth/
│   └── authorize/
│       └── route.ts              ← OAuth Authorization Endpoint (GET)
├── api/
│   ├── auth/
│   │   ├── google/
│   │   │   └── route.ts          ← Google OAuth 시작 (GET → redirect)
│   │   ├── google/callback/
│   │   │   └── route.ts          ← Google OAuth 콜백 (GET)
│   │   ├── signup/
│   │   │   └── route.ts          ← 이메일 회원가입 (POST)
│   │   ├── login/
│   │   │   └── route.ts          ← 이메일 로그인 (POST)
│   │   ├── session/
│   │   │   └── route.ts          ← 세션 조회 (GET)
│   │   └── logout/
│   │       └── route.ts          ← 로그아웃 (POST)
│   ├── oauth/
│   │   └── token/
│   │       └── route.ts          ← OAuth Token Endpoint (POST)
│   └── userinfo/
│       └── route.ts              ← OAuth UserInfo Endpoint (GET)
src/lib/
├── oauth.ts                      ← code/token 생성·검증 헬퍼
├── session.ts                    ← JWT 세션 관리
└── db.ts                         ← DB 접근 레이어
```

### 3-2. 회원가입 페이지 (`/signup`)

```tsx
// src/app/(auth)/signup/page.tsx
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function SignupPage() {
  const searchParams = useSearchParams();
  // OAuth 플로우에서 넘어온 경우 callback에 원래 authorize URL이 담겨있음
  const callback = searchParams.get("callback");

  const [form, setForm] = useState({ email: "", password: "", name: "" });

  // 이메일 회원가입
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      // 회원가입 성공 → 세션 쿠키 자동 설정됨
      // callback이 있으면 OAuth 플로우 재개, 없으면 홈으로
      window.location.href = callback || "/";
    }
  };

  // Google 소셜 가입
  const handleGoogleSignup = () => {
    // callback을 state에 담아서 Google OAuth 시작
    const googleAuthUrl = `/api/auth/google?callback=${encodeURIComponent(callback || "/")}`;
    window.location.href = googleAuthUrl;
  };

  return (
    <div>
      <h1>회원가입</h1>

      {/* Google 소셜 가입 */}
      <button onClick={handleGoogleSignup}>
        Google로 가입
      </button>

      <hr />

      {/* 이메일 기본 가입 */}
      <form onSubmit={handleEmailSignup}>
        <input
          type="text"
          placeholder="이름"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="이메일"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit">가입하기</button>
      </form>
    </div>
  );
}
```

**핵심**: `callback` 파라미터가 OAuth 플로우 전체를 관통합니다.

```
Cafe24 SSO 시작
  → /oauth/authorize?client_id=...&redirect_uri=...&state=...
  → 세션 없음 → /signup?callback=/oauth/authorize?client_id=...&redirect_uri=...&state=...
  → 가입 완료 후 callback URL로 리다이렉트
  → /oauth/authorize 재진입 → 이제 세션 있음 → code 발급 → Cafe24로 복귀
```

### 3-3. 로그인 페이지 (`/login`)

회원가입 페이지와 동일한 구조. `callback` 파라미터를 동일하게 처리합니다.

```tsx
// src/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callback = searchParams.get("callback");

  const [form, setForm] = useState({ email: "", password: "" });

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      window.location.href = callback || "/";
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `/api/auth/google?callback=${encodeURIComponent(callback || "/")}`;
  };

  return (
    <div>
      <h1>로그인</h1>

      <button onClick={handleGoogleLogin}>
        Google로 로그인
      </button>

      <hr />

      <form onSubmit={handleEmailLogin}>
        <input
          type="email"
          placeholder="이메일"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit">로그인</button>
      </form>

      <p>
        계정이 없으신가요?{" "}
        <a href={`/signup${callback ? `?callback=${encodeURIComponent(callback)}` : ""}`}>
          회원가입
        </a>
      </p>
    </div>
  );
}
```

---

## 4. 백엔드 API 구현

### 4-1. OAuth Authorization Endpoint

Cafe24 SSO가 호출하는 첫 번째 엔드포인트입니다.

```typescript
// src/app/oauth/authorize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { generateAuthorizationCode, validateClient } from "@/lib/oauth";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const client_id = params.get("client_id");
  const redirect_uri = params.get("redirect_uri");
  const response_type = params.get("response_type");
  const state = params.get("state");

  // 1. 요청 검증
  if (response_type !== "code") {
    return NextResponse.json({ error: "unsupported_response_type" }, { status: 400 });
  }

  const client = await validateClient(client_id, redirect_uri);
  if (!client) {
    return NextResponse.json({ error: "invalid_client" }, { status: 400 });
  }

  // 2. 세션 확인
  const session = await getSession(request);

  if (!session?.userId) {
    // 로그인 안 됨 → 로그인 페이지로 보내면서 현재 URL을 callback으로 전달
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callback", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 3. 세션 있음 → authorization code 발급
  const code = await generateAuthorizationCode({
    clientId: client_id!,
    userId: session.userId,
    redirectUri: redirect_uri!,
  });

  // 4. Cafe24의 redirect_uri로 code + state 전달
  const callbackUrl = new URL(redirect_uri!);
  callbackUrl.searchParams.set("code", code);
  if (state) callbackUrl.searchParams.set("state", state);

  return NextResponse.redirect(callbackUrl);
}
```

**동작 방식:**
- 세션이 있으면 → 즉시 code 발급 후 Cafe24로 redirect (사용자 화면 전환 없음)
- 세션이 없으면 → `/login?callback=<현재URL>` 로 redirect → 로그인 후 다시 여기로 돌아옴

### 4-2. OAuth Token Endpoint

Cafe24 서버가 authorization code를 access_token으로 교환하는 엔드포인트입니다.

```typescript
// src/app/api/oauth/token/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  verifyAuthorizationCode,
  generateAccessToken,
  verifyClientCredentials,
} from "@/lib/oauth";

export async function POST(request: NextRequest) {
  // Cafe24는 application/x-www-form-urlencoded로 전송
  const body = await request.formData();
  const grant_type = body.get("grant_type") as string;
  const client_id = body.get("client_id") as string;
  const client_secret = body.get("client_secret") as string;
  const code = body.get("code") as string;
  const redirect_uri = body.get("redirect_uri") as string;

  // 1. 클라이언트 인증
  const clientValid = await verifyClientCredentials(client_id, client_secret);
  if (!clientValid) {
    return NextResponse.json({ error: "invalid_client" }, { status: 401 });
  }

  // 2. grant_type 확인
  if (grant_type !== "authorization_code") {
    return NextResponse.json({ error: "unsupported_grant_type" }, { status: 400 });
  }

  // 3. authorization code 검증 (1회성, 만료 확인, client_id/redirect_uri 매칭)
  const authCode = await verifyAuthorizationCode(code, client_id, redirect_uri);
  if (!authCode) {
    return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
  }

  // 4. access_token 발급
  const accessToken = await generateAccessToken(authCode.userId, client_id);

  // Cafe24가 기대하는 응답 형식 (표준 OAuth 2.0)
  return NextResponse.json({
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: 3600,
  });
}
```

### 4-3. UserInfo Endpoint

Cafe24가 access_token으로 사용자 정보를 조회하는 엔드포인트입니다.

```typescript
// src/app/api/userinfo/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/oauth";
import { getUserById } from "@/lib/db";

export async function GET(request: NextRequest) {
  // Authorization: Bearer <access_token>
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const tokenData = await verifyAccessToken(token);
  if (!tokenData) {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  const user = await getUserById(tokenData.userId);
  if (!user) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }

  // Cafe24가 소비하는 사용자 정보
  // Cafe24는 이 정보로 쇼핑몰 회원을 자동 생성함
  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
  });
}
```

### 4-4. Google OAuth 엔드포인트 (Consumer 역할)

```typescript
// src/app/api/auth/google/route.ts
import { NextRequest, NextResponse } from "next/server";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

export async function GET(request: NextRequest) {
  const callback = request.nextUrl.searchParams.get("callback") || "/";

  // Google OAuth 시작 — state에 callback URL을 인코딩하여 전달
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
  googleAuthUrl.searchParams.set("redirect_uri", GOOGLE_REDIRECT_URI);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("state", callback); // callback URL을 state로 전달

  return NextResponse.redirect(googleAuthUrl);
}
```

```typescript
// src/app/api/auth/google/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/session";
import { upsertUserByGoogle } from "@/lib/db";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const callback = request.nextUrl.searchParams.get("state") || "/";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", request.url));
  }

  // 1. code → access_token 교환
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });
  const tokenData = await tokenRes.json();

  // 2. 사용자 정보 조회
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const googleUser = await userRes.json();

  // 3. DB에 사용자 생성 또는 조회 (upsert)
  const user = await upsertUserByGoogle({
    googleId: googleUser.id,
    email: googleUser.email,
    name: googleUser.name,
    picture: googleUser.picture,
  });

  // 4. Veggieverse 세션 생성 (httpOnly 쿠키)
  const response = NextResponse.redirect(new URL(callback, request.url));
  await createSession(response, user.id);

  return response;
  // callback이 /oauth/authorize?...이면 → authorize가 세션 확인 후 code 발급 → Cafe24 복귀
  // callback이 /이면 → 단순 로그인 완료, 홈으로 이동
}
```

### 4-5. 이메일 회원가입/로그인 API

```typescript
// src/app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/lib/db";
import { createSessionCookie } from "@/lib/session";
import { hashPassword } from "@/lib/password";

export async function POST(request: NextRequest) {
  const { email, password, name } = await request.json();

  // 유효성 검사 (생략)

  const passwordHash = await hashPassword(password);
  const user = await createUser({ email, passwordHash, name });

  // 세션 쿠키 설정
  const response = NextResponse.json({ success: true });
  await createSessionCookie(response, user.id);

  return response;
}
```

```typescript
// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/db";
import { createSessionCookie } from "@/lib/session";
import { verifyPassword } from "@/lib/password";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const user = await getUserByEmail(email);
  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  await createSessionCookie(response, user.id);

  return response;
}
```

---

## 5. 핵심 라이브러리

### 5-1. 세션 관리

```typescript
// src/lib/session.ts
import { SignJWT, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const SESSION_SECRET = new TextEncoder().encode(process.env.SESSION_SECRET!);
const COOKIE_NAME = "vv_session";

// NextResponse에 세션 쿠키 설정
export async function createSession(response: NextResponse, userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SESSION_SECRET);

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
}

// 쿠키에 직접 설정 (API route에서 사용)
export async function createSessionCookie(response: NextResponse, userId: string) {
  return createSession(response, userId);
}

// Request에서 세션 읽기
export async function getSession(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET);
    return { userId: payload.userId as string };
  } catch {
    return null;
  }
}
```

### 5-2. OAuth Provider 헬퍼

```typescript
// src/lib/oauth.ts
import { randomBytes } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { db } from "./db";

const JWT_SECRET = new TextEncoder().encode(process.env.OAUTH_JWT_SECRET!);
const CODE_EXPIRY = 10 * 60 * 1000; // 10분

// 클라이언트 검증 (Cafe24 등록 정보와 대조)
export async function validateClient(
  clientId: string | null,
  redirectUri: string | null
) {
  if (!clientId || !redirectUri) return null;
  const client = await db.oauthClient.findUnique({ where: { clientId } });
  if (!client || client.redirectUri !== redirectUri) return null;
  return client;
}

// 클라이언트 인증 (client_id + client_secret)
export async function verifyClientCredentials(
  clientId: string,
  clientSecret: string
) {
  const client = await db.oauthClient.findUnique({ where: { clientId } });
  return client?.clientSecret === clientSecret;
}

// Authorization Code 발급 (랜덤 문자열, DB 저장)
export async function generateAuthorizationCode(params: {
  clientId: string;
  userId: string;
  redirectUri: string;
}) {
  const code = randomBytes(32).toString("hex");
  await db.oauthCode.create({
    data: {
      code,
      clientId: params.clientId,
      userId: params.userId,
      redirectUri: params.redirectUri,
      expiresAt: new Date(Date.now() + CODE_EXPIRY),
      used: false,
    },
  });
  return code;
}

// Authorization Code 검증 (1회성, 만료, 매칭)
export async function verifyAuthorizationCode(
  code: string,
  clientId: string,
  redirectUri: string
) {
  const record = await db.oauthCode.findUnique({ where: { code } });
  if (!record) return null;
  if (record.used) return null;
  if (record.expiresAt < new Date()) return null;
  if (record.clientId !== clientId) return null;
  if (record.redirectUri !== redirectUri) return null;

  // 1회 사용 처리
  await db.oauthCode.update({ where: { code }, data: { used: true } });
  return record;
}

// Access Token 발급 (JWT — stateless 검증 가능)
export async function generateAccessToken(userId: string, clientId: string) {
  return new SignJWT({ sub: userId, client_id: clientId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .setIssuer("https://veggieverse.com")
    .sign(JWT_SECRET);
}

// Access Token 검증
export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: "https://veggieverse.com",
    });
    return { userId: payload.sub as string, clientId: payload.client_id as string };
  } catch {
    return null;
  }
}
```

---

## 6. DB 스키마 (Prisma)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  name         String?
  picture      String?
  passwordHash String?  @map("password_hash")
  provider     String   @default("email") // "email" | "google"
  providerId   String?  @map("provider_id") // Google sub ID
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  oauthCodes  OAuthCode[]
  oauthTokens OAuthToken[]

  @@map("users")
}

model OAuthClient {
  clientId     String @id @map("client_id")
  clientSecret String @map("client_secret")
  redirectUri  String @map("redirect_uri")
  name         String

  oauthCodes  OAuthCode[]
  oauthTokens OAuthToken[]

  @@map("oauth_clients")
}

model OAuthCode {
  code        String   @id
  userId      String   @map("user_id")
  clientId    String   @map("client_id")
  redirectUri String   @map("redirect_uri")
  expiresAt   DateTime @map("expires_at")
  used        Boolean  @default(false)

  user   User        @relation(fields: [userId], references: [id])
  client OAuthClient @relation(fields: [clientId], references: [clientId])

  @@map("oauth_codes")
}

model OAuthToken {
  accessToken String   @id @map("access_token")
  userId      String   @map("user_id")
  clientId    String   @map("client_id")
  expiresAt   DateTime @map("expires_at")

  user   User        @relation(fields: [userId], references: [id])
  client OAuthClient @relation(fields: [clientId], references: [clientId])

  @@map("oauth_tokens")
}
```

> **참고**: Access Token을 JWT로 발급하면 `oauth_tokens` 테이블은 사실상 불필요합니다 (JWT 자체에 만료 정보가 포함). 토큰 취소(revoke) 기능이 필요한 경우에만 DB 저장을 고려하세요.

---

## 7. Cafe24 쇼핑몰 측 설정

### 7-1. SSO 연동 관리 등록

**경로**: 카페24 관리자 > 쇼핑몰 설정 > 고객 설정 > 회원 가입/로그인 > SSO 로그인 연동 관리

| 설정 항목 | 값 |
|----------|-----|
| 연동 서비스명 | Veggieverse |
| Client ID | `veggieverse-cafe24-client` (자체 발급) |
| Client Secret | `<랜덤 생성한 시크릿>` (자체 발급) |
| Authorize Redirect URL | `https://veggieverse.com/oauth/authorize` |
| Access Token Return API | `https://veggieverse.com/api/oauth/token` |
| User info return API | `https://veggieverse.com/api/userinfo` |

이 설정 후 Cafe24가 SSO 플로우에서 위 3개 엔드포인트를 순차 호출합니다.

### 7-2. 회원가입 버튼 리다이렉트

Cafe24 쇼핑몰의 기본 회원가입 버튼이 `/member/join.html`로 이동하는 것을 veggieverse.com으로 변경해야 합니다.

**방법**: 스마트디자인 편집에서 회원가입 관련 템플릿 수정

```html
<!-- Cafe24 스마트디자인: layout/header.html 또는 member/join.html -->
<script>
  // 기본 회원가입 페이지 접근 시 veggieverse.com/signup으로 리다이렉트
  if (window.location.pathname.includes('/member/join')) {
    window.location.href = 'https://veggieverse.com/signup';
  }
</script>
```

또는 헤더의 회원가입 링크 자체를 변경:

```html
<!-- 기존 -->
<a href="/member/join.html">회원가입</a>

<!-- 변경 -->
<a href="https://veggieverse.com/signup">회원가입</a>
```

### 7-3. 로그인 버튼 리다이렉트

로그인도 동일하게 veggieverse.com/login으로 리다이렉트하거나, SSO 로그인 버튼만 노출:

```html
<!-- Cafe24 스마트디자인: member/login.html -->
<script>
  // 로그인 페이지 접근 시 SSO 플로우 자동 시작
  // 또는 veggieverse.com/login으로 리다이렉트
  if (window.location.pathname.includes('/member/login')) {
    window.location.href = 'https://veggieverse.com/login';
  }
</script>
```

### 7-4. veggieverse.com → shop 이동 링크

veggieverse.com 사이트에서 쇼핑몰로 이동하는 버튼:

```tsx
// veggieverse.com의 쇼핑몰 이동 버튼
<a href="https://shop.veggieverse.com/member/login.html">
  쇼핑몰 가기
</a>
```

이미 veggieverse.com에 로그인된 상태라면:
1. Cafe24의 SSO 플로우가 `/oauth/authorize`를 호출
2. 세션 확인 → code 즉시 발급
3. 사용자는 로그인 화면을 보지 않고 바로 쇼핑몰에 도착

---

## 8. 환경변수

```env
# .env (veggieverse.com)

# 앱 URL
NEXT_PUBLIC_APP_URL=https://veggieverse.com

# DB
DATABASE_URL=postgresql://user:pass@host:5432/veggieverse

# 세션
SESSION_SECRET=<32바이트 이상 랜덤 문자열>

# OAuth Provider (자체 발급 — Cafe24에 등록할 값)
OAUTH_JWT_SECRET=<32바이트 이상 랜덤 문자열, SESSION_SECRET과 다른 값>
CAFE24_CLIENT_ID=veggieverse-cafe24-client
CAFE24_CLIENT_SECRET=<랜덤 생성>
CAFE24_REDIRECT_URI=https://shop.veggieverse.com/member/login/callback

# Google OAuth (Consumer)
GOOGLE_CLIENT_ID=<Google Cloud Console에서 발급>
GOOGLE_CLIENT_SECRET=<Google Cloud Console에서 발급>
```

---

## 9. 필요 패키지

```bash
yarn add jose          # JWT 생성/검증 (경량, Edge 호환)
yarn add prisma        # ORM (dev dependency)
yarn add @prisma/client # Prisma 런타임
```

- `next-auth`는 **불필요** — Google OAuth는 수동 구현 (3개 엔드포인트), OAuth Provider는 직접 구현
- `oidc-provider` 같은 무거운 라이브러리도 **불필요** — 클라이언트가 Cafe24 하나뿐

---

## 10. 실현 가능성 검증 결과

### 확인됨 (구현 가능)

| 항목 | 근거 |
|------|------|
| Cafe24 SSO가 OAuth 2.0 Authorization Code 플로우를 사용 | Cafe24 공식 헬프센터, 서비스가이드 확인 |
| Cafe24가 외부 Provider의 authorize/token/userinfo 3개 엔드포인트를 순차 호출 | SSO 연동 관리 설정 항목과 일치 |
| Cafe24가 SSO 로그인 시 회원 자동 생성 | 공식 문서 확인 — member_id에 `@s` 접두사 부여 |
| Cafe24 스마트디자인에서 회원가입/로그인 페이지 JS 리다이렉트 가능 | 스마트디자인 HTML/JS 편집 기능 확인 |
| SSO 서비스 최대 5개 등록 가능 | 공식 문서 확인 |
| Next.js App Router에서 OAuth Provider 3개 엔드포인트 구현 가능 | Route Handlers (route.ts) 사용 |
| Google OAuth + 자체 OAuth Provider 동시 운영 가능 | 서로 다른 엔드포인트/토큰/쿠키 사용, 충돌 없음 |
| jose 라이브러리로 JWT 기반 세션 및 토큰 관리 가능 | Edge 호환, Next.js 공식 권장 |

### 주의사항

| 항목 | 상세 |
|------|------|
| SSO 첫 로그인 시 약관 동의 팝업 | Cafe24 SSO 설정에서 "약관 동의 생략" 옵션 존재 — 이미 veggieverse에서 동의받았다면 활성화 권장 |
| UserInfo 응답 필수 필드 | `id`, `email`, `name`이 핵심. 정확한 필수/선택 구분은 Cafe24 기술지원(1588-3284) 확인 권장 |
| SSO 연동 삭제 불가 | 한번 등록하면 삭제할 수 없으므로 스테이징 쇼핑몰에서 먼저 테스트 |
| HTTPS 필수 | OAuth 2.0 스펙상 모든 엔드포인트가 HTTPS여야 함 |
| 배포 환경 | GitHub Pages → Vercel 전환 필요 (API Routes는 서버 환경 필수) |

### 불가능한 것

| 항목 | 대안 |
|------|------|
| Cafe24 API로 직접 회원 생성 (POST /customers 없음) | SSO 자동 생성으로 해결 |
| Cafe24 세션을 API로 직접 생성 | SSO 리다이렉트 플로우로 해결 |

---

## 11. 구현 순서

```
Phase 1: 기반 세팅
  ├── Vercel 배포 환경 구성
  ├── PostgreSQL 세팅 (Supabase 또는 Neon)
  ├── Prisma 스키마 작성 + 마이그레이션
  └── 환경변수 설정

Phase 2: 인증 시스템
  ├── 세션 관리 (lib/session.ts)
  ├── 이메일 회원가입/로그인 API
  ├── Google OAuth API (consumer)
  ├── 로그인/회원가입 페이지 UI
  └── 로그아웃 API

Phase 3: OAuth Provider
  ├── oauth_clients 테이블에 Cafe24 클라이언트 등록 (seed)
  ├── /oauth/authorize 엔드포인트
  ├── /api/oauth/token 엔드포인트
  ├── /api/userinfo 엔드포인트
  └── 로컬 테스트 (Postman으로 플로우 시뮬레이션)

Phase 4: Cafe24 연동
  ├── Cafe24 스테이징 쇼핑몰에서 SSO 설정
  ├── 스마트디자인 회원가입/로그인 리다이렉트 설정
  ├── E2E 플로우 테스트
  └── 프로덕션 적용
```
