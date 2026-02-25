# TODO: Google OAuth 외부 설정

Google 로그인 코드 구현은 완료되었습니다.
아래 외부 설정을 완료해야 실제로 동작합니다.

---

## [ ] 1. Google Cloud Console 설정

### 1-1. 프로젝트 생성 또는 선택

1. [console.cloud.google.com](https://console.cloud.google.com) 접속
2. 상단 프로젝트 선택기 클릭
3. 기존 프로젝트 선택 또는 "새 프로젝트" 생성

### 1-2. OAuth 동의 화면 구성

1. 좌측 메뉴 → "API 및 서비스" → "OAuth 동의 화면"
2. User Type: **외부(External)** 선택 → 만들기
3. 필수 항목 입력:
   - 앱 이름: (프로젝트 이름)
   - 사용자 지원 이메일: (본인 이메일)
   - 개발자 연락처 이메일: (본인 이메일)
4. "저장 후 계속" 클릭 (나머지 단계는 기본값으로 진행)

### 1-3. OAuth 2.0 클라이언트 ID 생성

1. 좌측 메뉴 → "API 및 서비스" → "사용자 인증 정보"
2. 상단 "+ 사용자 인증 정보 만들기" → "OAuth 클라이언트 ID"
3. 애플리케이션 유형: **웹 애플리케이션** 선택
4. 이름: (원하는 이름 입력, 예: "Next.js Supabase App")
5. **승인된 리디렉션 URI** 섹션에서 "+ URI 추가":
   ```
   https://nswtdyfdgvjfoowrffaq.supabase.co/auth/v1/callback
   ```
   > ⚠️ 이 URI는 Supabase 프로젝트가 Google로부터 코드를 받는 엔드포인트입니다.
   > 절대로 `localhost` URL을 이 곳에 추가하면 안 됩니다.
6. "만들기" 클릭
7. 팝업에서 **클라이언트 ID**와 **클라이언트 보안 비밀번호** 복사 → 안전한 곳에 저장

---

## [ ] 2. Supabase 대시보드 설정

> Supabase 프로젝트 ref: `nswtdyfdgvjfoowrffaq`
> 대시보드 URL: https://supabase.com/dashboard/project/nswtdyfdgvjfoowrffaq

### 2-1. Google Provider 활성화

1. 대시보드 → "Authentication" → "Providers"
2. 목록에서 **Google** 찾기 → 클릭하여 펼치기
3. "Enable Sign in with Google" 토글 **ON**
4. 입력:
   - **Client ID**: (1-3단계에서 복사한 클라이언트 ID)
   - **Client Secret**: (1-3단계에서 복사한 클라이언트 보안 비밀번호)
5. **Save** 클릭

### 2-2. Redirect URL 등록

1. 대시보드 → "Authentication" → "URL Configuration"
2. **Redirect URLs** 섹션에서 "Add URL" 클릭
3. 다음 URL 추가:
   ```
   http://localhost:3000/**
   ```
   > 개발 환경에서 `/auth/callback`으로 콜백을 받기 위한 설정입니다.
   > `**` 와일드카드가 하위 경로를 모두 허용합니다.
4. 프로덕션 배포 시 추가로 등록:
   ```
   https://your-production-domain.com/**
   ```
5. **Save** 클릭

### 2-3. (선택) Site URL 확인

1. 동일 페이지 **Site URL** 항목 확인
2. 개발 중에는 `http://localhost:3000`으로 설정되어 있는지 확인

---

## 설정 완료 후 동작 확인

```bash
npm run dev
```

1. `http://localhost:3000/auth/login` 접속
2. "Google로 계속하기" 버튼 클릭
3. Google 계정 선택 팝업 표시 확인
4. 계정 선택 → `/protected` 페이지로 리다이렉트 확인
5. 브라우저 개발자 도구 → Application → Cookies → `sb-*` 세션 쿠키 존재 확인

---

## 관련 코드 파일 (이미 구현 완료)

- `app/auth/callback/route.ts` — OAuth 코드 → 세션 교환 Route Handler
- `components/login-form.tsx` — Google 버튼 포함 (50번째 줄)
- `components/sign-up-form.tsx` — Google 버튼 포함 (30번째 줄)
