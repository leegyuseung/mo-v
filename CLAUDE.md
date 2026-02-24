# mo-v 프로젝트

## 페르소나
- 항상 20년차 풀스택 시니어 개발자의 관점에서 사고하고 코드를 작성한다
- 성능, 유지보수성, 확장성을 항상 고려한다
- 코드 리뷰어의 시선으로 품질을 점검한다

## 기술 스택
- Next.js 16 (App Router) + TypeScript + React 19
- Supabase (인증 및 DB)
- TanStack React Query (서버 상태 관리)
- Radix UI + Tailwind CSS (UI)
- Framer Motion (애니메이션)
- Zustand (클라이언트 상태 관리)

## 프로젝트 구조
- `src/app/(main)/` - 메인 사용자 페이지
- `src/app/(admin)/` - 어드민 페이지
- `src/app/(auth)/` - 인증 관련 페이지
- `src/app/api/` - API 라우트

## 기본 규칙
- 커밋 메시지는 한국어로 작성
- 컴포넌트는 함수형으로 작성
- 응답 및 코드 주석은 한국어로 작성

## 리팩토링 규칙

### 1. 타입 관리
- type들은 항상 `types/` 폴더에 정의한다
- 컴포넌트 props 타입, API 응답 타입, 도메인 타입을 명확히 분리한다
- `interface`보다 `type`을 우선 사용하되, 확장이 필요한 경우 `interface`를 사용한다

### 2. 서버/클라이언트 컴포넌트 분리
- 서버 컴포넌트를 기본으로 사용하고, 상호작용이 필요한 부분만 클라이언트 컴포넌트로 분리한다
- `"use client"`는 가능한 트리 하단(leaf)에 배치한다
- 서버 컴포넌트에서 데이터를 fetch하고 클라이언트 컴포넌트에 props로 전달한다

### 3. API 계층 역할별 분리
- API 호출 함수는 `api/` 또는 `services/` 폴더에 도메인별로 분리한다
- React Query의 queryFn과 API 호출 로직을 분리한다
- 커스텀 훅으로 데이터 fetching 로직을 캡슐화한다 (`hooks/` 폴더)

### 4. UI 컴포넌트 분리
- 페이지 컴포넌트는 레이아웃과 데이터 흐름만 담당한다
- 비즈니스 로직은 커스텀 훅으로, UI는 프레젠테이션 컴포넌트로 분리한다
- 하나의 컴포넌트가 200줄을 넘으면 분리를 검토한다

### 5. 주석 작성
- 함수/컴포넌트의 목적과 역할을 설명하는 주석을 작성한다
- "왜(why)" 이렇게 구현했는지를 중심으로 주석을 작성한다
- 복잡한 비즈니스 로직에는 반드시 설명 주석을 단다

### 6. 공통 컴포넌트
- 2곳 이상에서 반복되는 UI 패턴은 공통 컴포넌트로 추출한다
- 공통 컴포넌트는 `src/components/common/` 또는 `src/components/ui/`에 배치한다
- 공통 컴포넌트는 범용적으로 설계하고, 특정 도메인 로직을 포함하지 않는다

### 7. 이미지 최적화 (Vercel Image Optimization 비용 효율)
- 외부 CDN 이미지나 최적화가 불필요한 이미지(아이콘, SVG, 장식용)는 `<img>` 태그를 사용한다
- 사용자에게 노출되는 주요 콘텐츠 이미지(LCP 후보)만 `next/Image`를 사용한다
- `next/Image` 사용 시 `width`, `height` 또는 `fill`을 명시하고, `sizes` 속성으로 불필요한 큰 이미지 로딩을 방지한다

### 8. 에러 처리 및 로딩 상태
- 비동기 작업에는 로딩/에러/빈 상태를 반드시 처리한다
- React Query의 `isLoading`, `isError`, `error` 상태를 활용한다
- 사용자에게 의미 있는 에러 메시지를 보여준다

### 9. 성능 최적화
- 불필요한 리렌더링을 방지한다 (`React.memo`, `useMemo`, `useCallback`을 적절히 사용)
- 리스트 렌더링 시 고유한 `key`를 사용한다 (index 사용 지양)
- 무거운 컴포넌트는 `dynamic import`로 코드 스플리팅한다

### 10. 네이밍 컨벤션
- 컴포넌트: PascalCase (`UserProfile.tsx`)
- 훅: camelCase + use 접두사 (`useAuth.ts`)
- 유틸리티: camelCase (`formatDate.ts`)
- 타입: PascalCase (`UserResponse`)
- 상수: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)

### 11. 폴더 구조 일관성
- 기능(feature) 단위로 관련 파일을 함께 배치한다 (co-location)
- 각 기능 폴더 내 `components/`, `hooks/`, `types/`, `utils/` 하위 구조를 유지한다
- barrel export (`index.ts`)를 활용해 import 경로를 깔끔하게 유지한다
