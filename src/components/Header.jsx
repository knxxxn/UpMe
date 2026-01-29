import { Link, useLocation } from 'react-router-dom'
import './Header.css'

function Header() {
    const location = useLocation()

    const getPageTitle = () => {
        const path = location.pathname
        if (path === '/') return '홈'
        if (path.startsWith('/coding/')) return '코딩 테스트'
        if (path === '/coding') return '코딩 테스트 목록'
        if (path.startsWith('/conversation/')) return '회화 채팅'
        if (path === '/conversation') return '회화 연습'
        if (path === '/mypage') return '마이페이지'
        if (path === '/login') return '로그인'
        if (path === '/register') return '회원가입'
        if (path === '/wordbook') return '단어장'
        if (path === '/daily-word') return '오늘의 단어'
        return 'MeUp'
    }

    return (
        <header className="header">
            <div className="header-left">
                <button className="mobile-menu-btn" aria-label="메뉴">
                    <span className="menu-icon">☰</span>
                </button>
                <h1 className="page-title">{getPageTitle()}</h1>
            </div>

            <div className="header-right">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="검색..."
                        className="search-input"
                    />
                </div>

                <button className="icon-btn notification-btn" aria-label="알림">
                    <span>🔔</span>
                    <span className="notification-badge">3</span>
                </button>

                <Link to="/login" className="btn btn-primary btn-sm">
                    로그인
                </Link>
            </div>
        </header>
    )
}

export default Header
