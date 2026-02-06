import { Link } from 'react-router-dom'
import './HomePage.css'

const features = [
    {
        icon: '💬',
        title: 'AI 회화 연습',
        description: '실시간 AI와 영어 대화를 통해 회화 실력을 향상시키세요',
        link: '/conversation',
        color: '#3b82f6'
    },
    {
        icon: '💻',
        title: '코딩 테스트',
        description: '다양한 알고리즘 문제로 코딩 능력을 키우세요',
        link: '/coding',
        color: '#10b981'
    },
    {
        icon: '📚',
        title: '단어장',
        description: '학습한 단어들을 저장하고 복습하세요',
        link: '/wordbook',
        color: '#f59e0b'
    },
    {
        icon: '✨',
        title: '오늘의 단어',
        description: '매일 새로운 단어를 배워보세요',
        link: '/daily-word',
        color: '#a855f7'
    }
]

const stats = [
    { value: '1,234', label: '문제 풀이' },
    { value: '567', label: '대화 세션' },
    { value: '89%', label: '정답률' },
    { value: '156', label: '학습 시간(h)' }
]

function HomePage() {
    return (
        <div className="home-page animate-fade-in">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        <span className="gradient-text">MeUp</span>과 함께
                        <br />
                        성장하세요
                    </h1>
                    <p className="hero-description">
                        AI 기반 회화 연습과 코딩 테스트로 실력을 향상시키세요.
                        <br />
                        매일 조금씩, 꾸준히 성장하는 당신을 응원합니다.
                    </p>
                    <div className="hero-buttons">
                        <Link to="/coding" className="btn btn-primary btn-lg">
                            시작하기 🚀
                        </Link>
                        <Link to="/conversation" className="btn btn-secondary btn-lg">
                            체험하기
                        </Link>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="code-block">
                        <div className="code-header">
                            <span className="dot red"></span>
                            <span className="dot yellow"></span>
                            <span className="dot green"></span>
                        </div>
                        <pre className="code-content">
                            {`def solve(problem):
    # Think creatively
    solution = think() + code()
    return success 🎯`}
                        </pre>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                {stats.map((stat, idx) => (
                    <div key={idx} className="stat-card">
                        <span className="stat-value">{stat.value}</span>
                        <span className="stat-label">{stat.label}</span>
                    </div>
                ))}
            </section>

            {/* Features Section */}
            <section className="features-section">
                <h2 className="section-title">주요 기능</h2>
                <div className="features-grid">
                    {features.map((feature, idx) => (
                        <Link
                            key={idx}
                            to={feature.link}
                            className="feature-card"
                            style={{ '--accent-color': feature.color }}
                        >
                            <span className="feature-icon">{feature.icon}</span>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>
                            <span className="feature-arrow">→</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2>지금 바로 시작하세요!</h2>
                    <p>무료로 가입하고 AI와 함께 학습을 시작하세요</p>
                    <Link to="/register" className="btn btn-primary btn-lg">
                        무료 가입하기
                    </Link>
                </div>
            </section>
        </div>
    )
}

export default HomePage
