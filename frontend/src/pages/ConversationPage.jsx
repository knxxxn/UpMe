import { Link } from 'react-router-dom'
import { useAuth } from '../components/AuthContext'
import './ConversationPage.css'

const topics = [
    { id: 1, title: '일상 대화', description: '친구와 대화하듯 자연스럽게', icon: '☕', color: '#f59e0b' },
    { id: 2, title: '여행', description: '여행 계획과 경험 이야기', icon: '✈️', color: '#3b82f6' },
    { id: 3, title: '비즈니스', description: '업무 미팅과 이메일 작성', icon: '💼', color: '#10b981' },
    { id: 4, title: '면접 준비', description: '취업 면접 연습하기', icon: '🎯', color: '#ef4444' },
    { id: 5, title: '기술 토론', description: '개발 관련 주제 토의', icon: '💻', color: '#8b5cf6' },
    { id: 6, title: '자유 주제', description: '원하는 주제로 대화하기', icon: '🎨', color: '#ec4899' },
]

const recentChats = [
    { id: 'r1', title: '여행 계획 이야기', lastMessage: 'That sounds like a great trip!', time: '2시간 전' },
    { id: 'r2', title: '일상 대화 연습', lastMessage: 'How was your weekend?', time: '어제' },
    { id: 'r3', title: '면접 연습', lastMessage: 'Tell me about yourself.', time: '3일 전' },
]

function ConversationPage() {
    const { isLoggedIn } = useAuth()

    return (
        <div className="conversation-page animate-fade-in">
            <div className="page-header">
                <h1>회화 연습</h1>
                <p>AI와 함께 영어 회화 실력을 향상시키세요</p>
                {!isLoggedIn && (
                    <div className="guest-notice">
                        <span className="guest-notice-icon">💡</span>
                        <span>비회원은 3회까지 체험 가능합니다. 로그인하면 무제한!</span>
                    </div>
                )}
            </div>

            <section className="topics-section">
                <h2 className="section-title">주제 선택</h2>
                <div className="topics-grid">
                    {topics.map((topic) => (
                        <Link
                            key={topic.id}
                            to={`/conversation/${topic.id}`}
                            className="topic-card"
                            style={{ '--accent-color': topic.color }}
                        >
                            <span className="topic-icon">{topic.icon}</span>
                            <h3 className="topic-title">{topic.title}</h3>
                            <p className="topic-description">{topic.description}</p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* 최근 대화 - 로그인 시에만 표시 */}
            {isLoggedIn && (
                <section className="recent-section">
                    <h2 className="section-title">최근 대화</h2>
                    <div className="recent-list">
                        {recentChats.map((chat) => (
                            <Link key={chat.id} to={`/conversation/${chat.id}`} className="recent-item">
                                <div className="recent-avatar">💬</div>
                                <div className="recent-content">
                                    <h4 className="recent-title">{chat.title}</h4>
                                    <p className="recent-message">{chat.lastMessage}</p>
                                </div>
                                <span className="recent-time">{chat.time}</span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* 비로그인 시 로그인 유도 */}
            {!isLoggedIn && (
                <section className="login-cta-section">
                    <div className="login-cta-card">
                        <span className="login-cta-icon">🔒</span>
                        <h3>로그인하고 더 많은 기능을 이용하세요</h3>
                        <p>대화 기록 저장 • 학습 통계 확인 • 무제한 회화</p>
                        <div className="login-cta-buttons">
                            <Link to="/login" className="btn btn-primary">로그인</Link>
                            <Link to="/register" className="btn btn-secondary">회원가입</Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}

export default ConversationPage
