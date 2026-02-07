import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../components/ToastContext'
import userService from '../services/userService'
import './MyPage.css'

const weeklyData = [
    { day: '월', hours: 2.5 },
    { day: '화', hours: 1.8 },
    { day: '수', hours: 3.2 },
    { day: '목', hours: 2.0 },
    { day: '금', hours: 4.1 },
    { day: '토', hours: 1.5 },
    { day: '일', hours: 2.8 }
]

const recentActivity = [
    { id: 1, type: 'coding', title: '두 수의 합', result: '통과', time: '2시간 전' },
    { id: 2, type: 'conversation', title: '일상 대화 연습', duration: '15분', time: '어제' },
    { id: 3, type: 'coding', title: '문자열 뒤집기', result: '통과', time: '2일 전' },
    { id: 4, type: 'word', title: '단어 학습', count: '10개', time: '3일 전' },
]

const maxHours = Math.max(...weeklyData.map(d => d.hours))

function MyPage() {
    const navigate = useNavigate()
    const { success, error, warning } = useToast()
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [showWithdrawModal, setShowWithdrawModal] = useState(false)
    const [isWithdrawing, setIsWithdrawing] = useState(false)
    const [user, setUser] = useState({
        id: null,
        name: '사용자',
        email: 'user@example.com',
        phoneNumber: ''
    })
    const [editForm, setEditForm] = useState({
        name: '',
        phoneNumber: ''
    })

    const stats = {
        totalStudyTime: '156시간',
        streak: '12일',
        conversationCount: 45,
        codingCount: 78,
        accuracy: '89%',
        wordsLearned: 234
    }

    // Load user data from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser)
                setUser({
                    id: userData.id || null,
                    name: userData.name || '사용자',
                    email: userData.email || 'user@example.com',
                    phoneNumber: userData.phoneNumber || ''
                })
            } catch (e) {
                console.error('Failed to parse user data:', e)
            }
        }
    }, [])

    const handleEditClick = () => {
        setEditForm({
            name: user.name,
            phoneNumber: user.phoneNumber
        })
        setIsEditing(true)
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
        setEditForm({ name: '', phoneNumber: '' })
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setEditForm(prev => ({ ...prev, [name]: value }))
    }

    const handleSave = async () => {
        if (!editForm.name.trim()) {
            error('이름을 입력해주세요')
            return
        }

        setIsSaving(true)
        try {
            const response = await userService.updateProfile({
                name: editForm.name,
                phoneNumber: editForm.phoneNumber
            })

            if (response.success) {
                const updatedUser = {
                    ...user,
                    name: editForm.name,
                    phoneNumber: editForm.phoneNumber
                }
                setUser(updatedUser)
                localStorage.setItem('user', JSON.stringify(updatedUser))
                success('프로필이 수정되었습니다')
                setIsEditing(false)
            }
        } catch (err) {
            error('프로필 수정에 실패했습니다')
        } finally {
            setIsSaving(false)
        }
    }

    const handleWithdraw = async () => {
        setIsWithdrawing(true)
        try {
            const response = await userService.deleteAccount()
            if (response.success) {
                success('계정이 삭제되었습니다. 이용해주셔서 감사합니다.')
                setShowWithdrawModal(false)
                // Clear all local storage and redirect to home
                localStorage.clear()
                setTimeout(() => {
                    navigate('/')
                }, 1500)
            }
        } catch (err) {
            error('계정 삭제에 실패했습니다. 다시 시도해주세요.')
        } finally {
            setIsWithdrawing(false)
        }
    }

    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'U'
    }

    return (
        <div className="my-page animate-fade-in">
            <div className="profile-header">
                <div className="profile-info">
                    <div className="profile-avatar">
                        <span>{getInitial(user.name)}</span>
                    </div>
                    <div className="profile-details">
                        {isEditing ? (
                            <div className="profile-edit-form">
                                <div className="edit-field">
                                    <label>이름</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="input"
                                        value={editForm.name}
                                        onChange={handleInputChange}
                                        placeholder="이름을 입력하세요"
                                    />
                                </div>
                                <div className="edit-field">
                                    <label>휴대폰 번호</label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        className="input"
                                        value={editForm.phoneNumber}
                                        onChange={handleInputChange}
                                        placeholder="010-1234-5678"
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <h1 className="profile-name">{user.name}님</h1>
                                <p className="profile-email">{user.email}</p>
                                {user.phoneNumber && (
                                    <p className="profile-phone">{user.phoneNumber}</p>
                                )}
                                <div className="profile-badges">
                                    <span className="badge badge-primary">🔥 12일 연속</span>
                                    <span className="badge badge-success">💎 프로</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                {isEditing ? (
                    <div className="profile-edit-actions">
                        <button
                            className="btn btn-secondary"
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                        >
                            취소
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? '저장 중...' : '저장'}
                        </button>
                    </div>
                ) : (
                    <button className="btn btn-secondary" onClick={handleEditClick}>
                        프로필 편집
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-icon">⏱️</span>
                    <div className="stat-info">
                        <span className="stat-value">{stats.totalStudyTime}</span>
                        <span className="stat-label">총 학습 시간</span>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">🔥</span>
                    <div className="stat-info">
                        <span className="stat-value">{stats.streak}</span>
                        <span className="stat-label">연속 학습</span>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">💬</span>
                    <div className="stat-info">
                        <span className="stat-value">{stats.conversationCount}</span>
                        <span className="stat-label">회화 세션</span>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">💻</span>
                    <div className="stat-info">
                        <span className="stat-value">{stats.codingCount}</span>
                        <span className="stat-label">코딩 문제</span>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">🎯</span>
                    <div className="stat-info">
                        <span className="stat-value">{stats.accuracy}</span>
                        <span className="stat-label">정답률</span>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">📚</span>
                    <div className="stat-info">
                        <span className="stat-value">{stats.wordsLearned}</span>
                        <span className="stat-label">학습 단어</span>
                    </div>
                </div>
            </div>

            <div className="content-grid">
                {/* Weekly Chart */}
                <section className="chart-section card">
                    <h2 className="section-title">주간 학습 그래프</h2>
                    <div className="chart-container">
                        {weeklyData.map((data, idx) => (
                            <div key={idx} className="chart-bar-wrapper">
                                <div className="chart-bar-container">
                                    <div
                                        className="chart-bar"
                                        style={{ height: `${(data.hours / maxHours) * 100}%` }}
                                    >
                                        <span className="chart-value">{data.hours}h</span>
                                    </div>
                                </div>
                                <span className="chart-label">{data.day}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Recent Activity */}
                <section className="activity-section card">
                    <h2 className="section-title">최근 활동</h2>
                    <div className="activity-list">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="activity-item">
                                <span className="activity-icon">
                                    {activity.type === 'coding' ? '💻' : activity.type === 'conversation' ? '💬' : '📚'}
                                </span>
                                <div className="activity-info">
                                    <span className="activity-title">{activity.title}</span>
                                    <span className="activity-detail">
                                        {activity.result || activity.duration || activity.count}
                                    </span>
                                </div>
                                <span className="activity-time">{activity.time}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Withdraw Section */}
            <div className="withdraw-section">
                <button
                    className="btn btn-danger-outline"
                    onClick={() => setShowWithdrawModal(true)}
                >
                    회원 탈퇴
                </button>
            </div>

            {/* Withdraw Confirmation Modal */}
            {showWithdrawModal && (
                <div className="modal-overlay" onClick={() => setShowWithdrawModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>⚠️ 회원 탈퇴</h2>
                        </div>
                        <div className="modal-body">
                            <p>정말로 탈퇴하시겠습니까?</p>
                            <p className="modal-warning">
                                탈퇴 시 모든 학습 기록과 데이터가 삭제되며,<br />
                                복구할 수 없습니다.
                            </p>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowWithdrawModal(false)}
                                disabled={isWithdrawing}
                            >
                                취소
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={handleWithdraw}
                                disabled={isWithdrawing}
                            >
                                {isWithdrawing ? '처리 중...' : '탈퇴하기'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MyPage
