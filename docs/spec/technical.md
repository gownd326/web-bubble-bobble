# 웹 보글보글 — 기술·데이터 설계

> 문서 버전 v3 · 완성도 100% · 마지막 수정 2026. 10. 29. 18시 7분 52초
> 이 문서만 보고 AI(또는 개발자)가 개발해도 거의 같은 결과가 나오도록 작성되었습니다.

## 기본 정보

| 항목 | 값 |
| --- | --- |
| 사이트 이름 | 웹 보글보글 |
| 영문 식별자(slug) | web-bubble-bobble |
| 개발 방식(framework) | nextjs |
| 데이터베이스 사용 | 예 (Neon PostgreSQL) |
| 배포 | GitHub → Vercel (무료) |

## 1. 데이터 모델

### 데이터베이스 테이블 (Neon PostgreSQL)

#### 1. `users` (사용자 테이블)
- `id` (SERIAL, Primary Key)
- `username` (VARCHAR(50), Unique, Not Null): 사용자 아이디
- `password_hash` (VARCHAR(255), Not Null): 암호화된 비밀번호
- `created_at` (TIMESTAMP, Default: NOW())

#### 2. `game_saves` (게임 진행 상황 테이블)
- `id` (SERIAL, Primary Key)
- `user_id` (INT, Foreign Key to `users.id`, Unique)
- `stage` (INT, Default: 1): 현재 클리어해야 할 스테이지 번호
- `score` (INT, Default: 0): 누적 점수
- `lives` (INT, Default: 3): 남은 목숨
- `updated_at` (TIMESTAMP, Default: NOW()): 마지막 저장 시간

## 2. 기술 스택과 폴더 구조

### 기술 스택
- **프레임워크**: Next.js 14+ (App Router)
- **데이터베이스**: Neon PostgreSQL (서버리스)
- **스타일링**: Tailwind CSS
- **배포**: Vercel

### 폴더 및 파일 구조
```text
├── app/
│   ├── layout.tsx (공통 레이아웃, 폰트 설정)
│   ├── page.tsx (메인 화면, /)
│   ├── login/
│   │   └── page.tsx (로그인 화면, /login)
│   ├── signup/
│   │   └── page.tsx (회원가입 화면, /signup)
│   ├── game/
│   │   └── page.tsx (게임 플레이 화면, /game)
│   ├── help/
│   │   └── page.tsx (도움말 화면, /help)
│   ├── ranking/
│   │   └── page.tsx (순위표 화면, /ranking)
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts
│       │   └── signup/route.ts
│       └── game/
│           └── save/route.ts
├── components/
│   ├── GameCanvas.tsx (게임 엔진 및 캔버스 렌더러)
│   └── VirtualPad.tsx (모바일용 가상 조이스틱/버튼)
└── lib/
    └── db.ts (Neon PostgreSQL 연결 풀 설정)
```

### 환경 변수 (.env.local)
- `DATABASE_URL`: Neon PostgreSQL 연결 문자열 (서버 전용, 브라우저 노출 금지)

## 3. 품질 기준 (성능·보안·접근성)

### 품질 기준
- **성능**: 게임 렌더링 시 초당 60프레임(60 FPS) 유지 목표
- **보안**: 비밀번호는 `bcrypt` 등의 라이브러리로 해싱하여 저장, `DATABASE_URL` 등 환경변수는 서버 측에서만 안전하게 관리
- **호환성**: 크롬, 사파리, 엣지 등 최신 모던 브라우저 지원

## 변경 이력

| 버전 | 일시 | 변경 내용 |
| --- | --- | --- |
| v3 | 2026. 10. 29. 17시 42분 48초 | 최종 감수: 최종 감수 완료: 모든 섹션의 일관성을 맞추고, 파일 트리 및 테스트 시나리오, 수용 기준을 구체화하여 즉시 개발 가능한 상태로 확정함. |
| v2 | 2026. 10. 29. 17시 41분 56초 | 사용자의 추가 요청에 따라 게임 플레이 방법과 조작법을 확인할 수 있는 도움말/설명 페이지 또는 모달 기능 명세 및 화면 구조를 추가했습니다. |
| v1 | 2026. 10. 29. 17시 37분 53초 | 보글보글 웹게임 초기 개발 문서 작성 및 DB/로그인 필요 설정 반영 |
