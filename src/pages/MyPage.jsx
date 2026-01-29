import './MyPage.css'

const stats = {
    totalStudyTime: '156시간',
    streak: '12일',
    conversationCount: 45,
    codingCount: 78,
    accuracy: '89%',
    wordsLearned: 234
}

const recentActivity = [
    { id: 1, type: 'coding', title: '두 수의 합', result: '통과', time: '2시간 전' },
    { id: 2, type: 'conversation', title: '일상 대화 연습', duration: '15분', time: '어제' },
    { id: 3, type: 'coding', title: '문자열 뒤집기', result: '통과', time: '2일 전' },
    { id: 4, type: 'word', title: '단어 학습', count: '10개', time: '3일 전' },
]

const weeklyData = [
    { day: '월', hours: 2.5 },
    { day: '화', hours: 1.8 },
    { day: '수', hours: 3.2 },
    { day: '목', hours: 2.0 },
    { day: '금', hours: 4.1 },
    { day: '토', hours: 1.5 },
    { day: '일', hours: 2.8 }
]

const maxHours = Math.max(...weeklyData.map(d => d.hours))

function MyPage() {
    return (
        <div className="my-page animate-fade-in">
            <div className="profile-header">
                <div className="profile-info">
                    <div className="profile-avatar">
                        <span>U</span>
                    </div>
                    <div className="profile-details">
                        <h1 className="profile-name">사용자님</h1>
                        <p className="profile-email">user@example.com</p>
                        <div className="profile-badges">
                            <span className="badge badge-primary">🔥 12일 연속</span>
                            <span className="badge badge-success">💎 프로</span>
                        </div>
                    </div>
                </div>
                <button className="btn btn-secondary">프로필 편집</button>
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
        </div>
    )
}

export default MyPage
