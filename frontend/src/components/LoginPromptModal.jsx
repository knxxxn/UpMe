import { useNavigate } from 'react-router-dom'
import './LoginPromptModal.css'

function LoginPromptModal({ isOpen, onClose, message, feature }) {
    const navigate = useNavigate()

    if (!isOpen) return null

    const handleLogin = () => {
        onClose()
        navigate('/login')
    }

    const handleRegister = () => {
        onClose()
        navigate('/register')
    }

    return (
        <div className="login-prompt-overlay" onClick={onClose}>
            <div className="login-prompt-modal" onClick={e => e.stopPropagation()}>
                <div className="login-prompt-icon">🔐</div>
                <h2 className="login-prompt-title">로그인이 필요합니다</h2>
                <p className="login-prompt-message">
                    {message || `${feature || '이 기능'}을 사용하려면 로그인이 필요합니다.`}
                </p>
                <p className="login-prompt-benefit">
                    로그인하면 학습 기록을 저장하고<br />
                    나만의 학습 통계를 확인할 수 있어요!
                </p>
                <div className="login-prompt-actions">
                    <button className="btn btn-primary" onClick={handleLogin}>
                        로그인
                    </button>
                    <button className="btn btn-secondary" onClick={handleRegister}>
                        회원가입
                    </button>
                </div>
                <button className="login-prompt-close" onClick={onClose}>
                    나중에 할게요
                </button>
            </div>
        </div>
    )
}

export default LoginPromptModal
