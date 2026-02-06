# 🚀 MeUp (UpMe)

> 코딩 테스트 준비와 멘토링을 위한 올인원 학습 플랫폼

## 📖 프로젝트 소개

MeUp은 코딩 테스트 준비생들을 위한 종합 학습 플랫폼입니다. 프로그래머스 스타일의 코딩 테스트 환경과 멘토와의 실시간 채팅 기능을 통해 효율적인 학습을 지원합니다.

### 주요 기능

- 🖥️ **코딩 테스트** - Monaco Editor 기반의 IDE 스타일 코딩 환경
- 💬 **실시간 채팅** - 멘토/코치와 1:1 대화
- 👤 **마이페이지** - 학습 현황 및 통계 확인
- 📋 **문제 목록** - 난이도별, 카테고리별 문제 탐색

## 🛠️ 기술 스택

### Frontend
- **React 18** - UI 라이브러리
- **Vite** - 빌드 도구
- **React Router v7** - 라우팅
- **Monaco Editor** - 코드 에디터
- **Axios** - HTTP 클라이언트

### Backend (예정)
- 🔜 개발 예정

### Database (예정)
- 🔜 개발 예정

## 📁 프로젝트 구조

```
UpMe/
├── src/
│   ├── components/       # 공통 컴포넌트
│   │   ├── Header.jsx    # 헤더 네비게이션
│   │   ├── Sidebar.jsx   # 사이드바
│   │   └── CodeEditor.jsx # Monaco 에디터 래퍼
│   ├── pages/            # 페이지 컴포넌트
│   │   ├── HomePage.jsx      # 랜딩 페이지
│   │   ├── LoginPage.jsx     # 로그인
│   │   ├── RegisterPage.jsx  # 회원가입
│   │   ├── MyPage.jsx        # 마이페이지
│   │   ├── CodingListPage.jsx # 문제 목록
│   │   ├── CodingPage.jsx    # 코딩 테스트 IDE
│   │   ├── ConversationPage.jsx # 대화 목록
│   │   └── ChatRoom.jsx      # 채팅방
│   ├── services/         # API 서비스 레이어
│   │   ├── api.js        # Axios 설정
│   │   ├── authService.js    # 인증 API
│   │   ├── userService.js    # 사용자 API
│   │   ├── codingService.js  # 코딩 테스트 API
│   │   └── chatService.js    # 채팅 API
│   ├── App.jsx           # 앱 라우팅
│   └── main.jsx          # 엔트리포인트
├── index.html
├── package.json
└── vite.config.js
```