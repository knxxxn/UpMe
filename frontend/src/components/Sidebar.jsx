import { useState, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import authService from '../services/authService'
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
        label: '마이페이지',
        requiresAuth: true
    }
]

function Sidebar() {
    const location = useLocation()
    const navigate = useNavigate()
    const [user, setUser] = useState(null)

    useEffect(() => {
        // localStorage에서 사용자 정보 확인
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser))
            } catch (e) {
                setUser(null)
            }
        }
    }, [location]) // location이 바뀔 때마다 체크 (로그인 후 리다이렉트 시)

    const handleLogout = async () => {
        await authService.logout()
        setUser(null)
        navigate('/login')
    }

    const handleNavClick = (e, item) => {
        if (item.requiresAuth && !user) {
            e.preventDefault()
            navigate('/login')
        }
    }

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
                                onClick={(e) => handleNavClick(e, item)}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span className="nav-label">{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                {user ? (
                    <div className="user-card">
                        <div className="user-avatar">{user.name?.charAt(0) || 'U'}</div>
                        <div className="user-info">
                            <span className="user-name">{user.name || '사용자'}</span>
                            <button className="logout-btn" onClick={handleLogout}>
                                로그아웃
                            </button>
                        </div>
                    </div>
                ) : (
                    <NavLink to="/login" className="login-card">
                        <div className="user-avatar">👤</div>
                        <div className="user-info">
                            <span className="user-name">로그인</span>
                            <span className="user-status">로그인하세요</span>
                        </div>
                    </NavLink>
                )}
            </div>
        </aside>
    )
}

export default Sidebar

