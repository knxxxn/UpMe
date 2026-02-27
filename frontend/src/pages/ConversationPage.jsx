import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthContext'
import conversationService from '../services/conversationService'
import './ConversationPage.css'

const topics = [
    { id: 1, title: '일상 대화', description: '친구와 대화하듯 자연스럽게', icon: '☕', color: '#f59e0b' },
    { id: 2, title: '여행', description: '여행 계획과 경험 이야기', icon: '✈️', color: '#3b82f6' },
    { id: 3, title: '비즈니스', description: '업무 미팅과 이메일 작성', icon: '💼', color: '#10b981' },
    { id: 4, title: '면접 준비', description: '취업 면접 연습하기', icon: '🎯', color: '#ef4444' },
    { id: 5, title: '기술 토론', description: '개발 관련 주제 토의', icon: '💻', color: '#8b5cf6' },
    { id: 6, title: '자유 주제', description: '원하는 주제로 대화하기', icon: '🎨', color: '#ec4899' },
]

const topicIcons = { 1: '☕', 2: '✈️', 3: '💼', 4: '🎯', 5: '💻', 6: '🎨' }

function ConversationPage() {
    const { isLoggedIn } = useAuth()
    const navigate = useNavigate()
    const [recentChats, setRecentChats] = useState([])
    const [loadingChats, setLoadingChats] = useState(false)

    useEffect(() => {
        if (isLoggedIn) {
            fetchConversations()
        }
    }, [isLoggedIn])

    const fetchConversations = async () => {
        setLoadingChats(true)
        try {
            const data = await conversationService.getConversations()
            setRecentChats(data)
        } catch (err) {
            console.error('대화 목록 조회 실패:', err)
        } finally {
            setLoadingChats(false)
        }
    }

    // 로그인 사용자: 새 대화 생성 후 채팅방 이동
    const handleTopicClick = async (topicId) => {
        if (!isLoggedIn) {
            // 비로그인: 기존 체험 모드 (topicId로 이동)
            navigate(`/conversation/${topicId}`)
            return
        }

        try {
            const result = await conversationService.createConversation(topicId)
            navigate(`/conversation/c-${result.id}`)
        } catch (err) {
            console.error('대화 생성 실패:', err)
            // 실패 시 기존 방식으로 이동
            navigate(`/conversation/${topicId}`)
        }
    }

    const handleDeleteChat = async (e, chatId) => {
        e.preventDefault()
        e.stopPropagation()
        if (!window.confirm('이 대화를 삭제하시겠습니까?')) return

        try {
            await conversationService.deleteConversation(chatId)
            setRecentChats(prev => prev.filter(c => c.id !== chatId))
        } catch (err) {
            console.error('대화 삭제 실패:', err)
        }
    }

    const formatTime = (dateStr) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now - date
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffHours < 1) return '방금 전'
        if (diffHours < 24) return `${diffHours}시간 전`
        if (diffDays < 7) return `${diffDays}일 전`
        return date.toLocaleDateString('ko-KR')
    }

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
                        <div
                            key={topic.id}
                            className="topic-card"
                            style={{ '--accent-color': topic.color }}
                            onClick={() => handleTopicClick(topic.id)}
                        >
                            <span className="topic-icon">{topic.icon}</span>
                            <h3 className="topic-title">{topic.title}</h3>
                            <p className="topic-description">{topic.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 최근 대화 - 로그인 시에만 표시 */}
            {isLoggedIn && (
                <section className="recent-section">
                    <h2 className="section-title">최근 대화</h2>
                    {loadingChats ? (
                        <div className="recent-loading">대화 목록을 불러오는 중...</div>
                    ) : recentChats.length > 0 ? (
                        <div className="recent-list">
                            {recentChats.map((chat) => (
                                <Link key={chat.id} to={`/conversation/c-${chat.id}`} className="recent-item">
                                    <div className="recent-avatar">
                                        {topicIcons[chat.topicId] || '💬'}
                                    </div>
                                    <div className="recent-content">
                                        <h4 className="recent-title">{chat.title}</h4>
                                        <p className="recent-message">{formatTime(chat.updatedAt)}</p>
                                    </div>
                                    <button
                                        className="recent-delete-btn"
                                        onClick={(e) => handleDeleteChat(e, chat.id)}
                                        title="대화 삭제"
                                    >
                                        🗑️
                                    </button>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="recent-empty">
                            <p>아직 저장된 대화가 없습니다. 토픽을 선택하여 대화를 시작해보세요!</p>
                        </div>
                    )}
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
