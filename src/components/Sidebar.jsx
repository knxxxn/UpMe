import { NavLink, useLocation } from 'react-router-dom'
import './Sidebar.css'

const menuItems = [
    {
        path: '/',
        icon: '🏠',
        label: '홈'
    },
    {
        path: '/conversation',
        icon: '💬',
        label: '회화 연습'
    },
    {
        path: '/coding',
        icon: '💻',
        label: '코딩 테스트'
    },
    {
        path: '/wordbook',
        icon: '📚',
        label: '단어장'
    },
    {
        path: '/daily-word',
        icon: '✨',
        label: '오늘의 단어'
    },
    {
        path: '/mypage',
        icon: '👤',
        label: '마이페이지'
    }
]

function Sidebar() {
    const location = useLocation()

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <NavLink to="/" className="sidebar-logo">
                    <span className="logo-icon">🚀</span>
                    <span className="logo-text">MeUp</span>
                </NavLink>
            </div>

            <nav className="sidebar-nav">
                <ul className="nav-list">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `nav-item ${isActive ? 'active' : ''}`
                                }
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span className="nav-label">{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <div className="user-card">
                    <div className="user-avatar">U</div>
                    <div className="user-info">
                        <span className="user-name">사용자</span>
                        <span className="user-status">온라인</span>
                    </div>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
