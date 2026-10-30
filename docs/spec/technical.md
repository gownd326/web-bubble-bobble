# 웹 보글보글 — 기술·데이터 설계

> 문서 버전 v7 · 완성도 100% · 마지막 수정 2026. 10. 30. 10시 51분 24초
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

### 데이터베이스 스키마 (Neon PostgreSQL)

모든 DB 접근은 Next.js 서버 컴포넌트 또는 `/app/api` 라우트 핸들러를 통해서만 실행되며, 클라이언트에 자격 증명이 노출되지 않습니다.

#### 1. `users` (사용자 계정)
| 컬럼명 | 데이터 타입 | 제약 조건 | 설명 |
| --- | --- | --- | --- |
| `id` | SERIAL | PRIMARY KEY | 고유 사용자 번호 |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | 사용자 로그인 아이디 |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt 단방향 암호화 해시 |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | 가입 일시 |

#### 2. `game_saves` (진행도 및 최고 기록)
| 컬럼명 | 데이터 타입 | 제약 조건 | 설명 |
| --- | --- | --- | --- |
| `id` | SERIAL | PRIMARY KEY | 세이브 고유 번호 |
| `user_id` | INT | NOT NULL, UNIQUE, REFERENCES `users(id)` ON DELETE CASCADE | 사용자 외래키 |
| `stage` | INT | NOT NULL, DEFAULT 1 | 현재 진행 스테이지 (1~5) |
| `score` | INT | NOT NULL, DEFAULT 0 | 현재 누적 점수 |
| `high_score` | INT | NOT NULL, DEFAULT 0 | 개인 최고 점수 (순위표 연동) |
| `lives` | INT | NOT NULL, DEFAULT 3 | 남은 목숨 수 |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | 마지막 세이브 일시 |

### 주요 쿼리 규칙
- **랭킹 조회**: `SELECT u.username, g.high_score, g.updated_at FROM game_saves g JOIN users u ON g.user_id = u.id ORDER BY g.high_score DESC LIMIT 50;`
- **세이브 갱신**: 스테이지 완료 시 `stage`, `score`, `lives`를 UPDATE하며, 기존 `high_score`보다 현재 `score`가 높으면 `high_score`도 함께 갱신

## 2. 기술 스택과 폴더 구조

### 기술 스택
- **프레임워크**: Next.js 14+ (App Router)
- **데이터베이스 클라이언트**: `@neondatabase/serverless` (Neon PostgreSQL 연결)
- **스타일링**: Tailwind CSS
- **비밀번호 암호화**: `bcryptjs`
- **배포 플랫폼**: Vercel (GitHub 연동 CI/CD)

### 폴더 및 파일 트리
```text
├── app/
│   ├── layout.tsx (전체 레이아웃 및 폰트, 전역 스타일 적용)
│   ├── page.tsx (메인 시작 화면, /)
│   ├── login/
│   │   └── page.tsx (로그인 폼, /login)
│   ├── signup/
│   │   └── page.tsx (회원가입 폼, /signup)
│   ├── game/
│   │   └── page.tsx (게임 플레이 화면, /game)
│   ├── help/
│   │   └── page.tsx (조작법 및 게임 규칙 가이드, /help)
│   ├── ranking/
│   │   └── page.tsx (상위 50위 랭킹 보드, /ranking)
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts (로그인 및 세션 쿠키 설정)
│       │   ├── signup/route.ts (회원가입 처리)
│       │   ├── logout/route.ts (세션 해제)
│       │   └── me/route.ts (현재 로그인 유저 정보 및 세이브 로드)
│       ├── game/
│       │   └── save/route.ts (진행 상태 및 점수 자동 저장)
│       └── ranking/
│           └── route.ts (최고 점수 순위 리스트 반환)
├── components/
│   ├── GameCanvas.tsx (HTML5 Canvas 게임 루프 및 렌더러)
│   ├── VirtualPad.tsx (모바일 전용 가상 조이스틱/버튼)
│   ├── Navbar.tsx (상단 네비게이션 및 사용자 상태 바)
│   └── Button.tsx (레트로 스타일 공통 버튼)
├── lib/
│   ├── db.ts (Neon PostgreSQL 연결 풀 및 SQL 헬퍼)
│   └── auth.ts (JWT 및 세션 쿠키 검증 유틸)
└── types/
    └── game.ts (플레이어, 방울, 적 엔티티 및 세이브 타입 정의)
```

### 환경 변수 (.env.local / Vercel Environment Variables)
- `DATABASE_URL`: Neon PostgreSQL 접속 연결 문자열 (반드시 서버 전용, 브라우저 노출 금지)
- `SESSION_SECRET`: 세션/쿠키 암호화용 32자 이상 비밀키

## 3. 품질 기준 (성능·보안·접근성)

### 품질 기준 (성능·보안·접근성)
- **성능**: Canvas 2D Context 애니메이션 처리 시 RequestAnimationFrame을 통해 안정적인 초당 60프레임(60 FPS)을 유지합니다.
- **보안**: 
  - 비밀번호 저장 시 `bcryptjs`(소금 10라운드 이상)로 단방향 암호화합니다.
  - `DATABASE_URL` 및 `SESSION_SECRET` 등 데이터베이스 자격 증명과 보안 키는 서버 라우트 핸들러 내에서만 접근 가능하도록 조치합니다.
- **안정성 및 호환성**: Chrome, Safari, Edge, Firefox 최신 버전에서 키보드 이벤트 키 바인딩 동작 시 기본 브라우저 스크롤 등의 부작용을 방지(`e.preventDefault()`)합니다.

## 변경 이력

| 버전 | 일시 | 변경 내용 |
| --- | --- | --- |
| v7 | 2026. 10. 30. 10시 50분 3초 | 최종 감수: 최종 감수 완료: 모든 섹션 간 일관성을 확보하고 구현 가능한 완벽한 개발 규격을 확정했습니다. |
| v6 | 2026. 10. 30. 10시 48분 23초 | Z키 입력 시 방울 발사 과정에서 게임 상태가 초기화/리셋되는 버그 방지 명세(e.preventDefault 및 키 이벤트 처리 규칙) 추가 |
| v5 | 2026. 10. 30. 10시 34분 7초 | 최종 감수: 최종 감수 완료: API 라우트 구조 정합성 확보, 랭킹 및 저장 로직 명세 구체화, 테스트 시나리오 보강 |
| v4 | 2026. 10. 30. 10시 27분 58초 | PC 화면 조작키 한 줄 표시 및 가상 버튼 제거, 방울 직선 발사·적 포획·플레이어 충돌 시 방울 및 적 처치 상세 메커니즘을 문서에 반영했습니다. |
| v3 | 2026. 10. 29. 17시 42분 48초 | 최종 감수: 최종 감수 완료: 모든 섹션의 일관성을 맞추고, 파일 트리 및 테스트 시나리오, 수용 기준을 구체화하여 즉시 개발 가능한 상태로 확정함. |
| v2 | 2026. 10. 29. 17시 41분 56초 | 사용자의 추가 요청에 따라 게임 플레이 방법과 조작법을 확인할 수 있는 도움말/설명 페이지 또는 모달 기능 명세 및 화면 구조를 추가했습니다. |
| v1 | 2026. 10. 29. 17시 37분 53초 | 보글보글 웹게임 초기 개발 문서 작성 및 DB/로그인 필요 설정 반영 |
