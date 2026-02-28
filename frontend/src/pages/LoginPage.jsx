import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import authService from '../services/authService'
import { useAuth } from '../components/AuthContext'
import './LoginPage.css'

function LoginPage() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const response = await authService.login(formData.email, formData.password)
            if (response.success) {
                // AuthContext 상태 업데이트
                login(response.user, response.accessToken, response.refreshToken)
                navigate('/')
            }
        } catch (err) {
            setError(err.response?.data?.message || '로그인에 실패했습니다. 다시 시도해주세요.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setIsLoading(true)
                const response = await authService.googleLogin(tokenResponse.access_token)
                if (response.success) {
                    login(response.user, response.accessToken, response.refreshToken)
                    navigate('/')
                }
            } catch (err) {
                console.error("Google login error:", err)
                setError(err.response?.data?.message || '구글 로그인에 실패했습니다. 다시 시도해주세요.')
            } finally {
                setIsLoading(false)
            }
        },
        onError: errorResponse => {
            console.error("Google OAuth error:", errorResponse)
            setError('구글 로그인에 실패했습니다.')
        }
    })

    return (
        <div className="login-page animate-fade-in">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <Link to="/" className="login-logo">
                            <span className="logo-icon">🚀</span>
                            <span className="logo-text">MeUp</span>
                        </Link>
                        <h1>로그인</h1>
                        <p>계정에 로그인하여 학습을 시작하세요</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        {error && (
                            <div className="error-message">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="label" htmlFor="email">이메일</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="input"
                                placeholder="example@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="label" htmlFor="password">비밀번호</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="input"
                                placeholder="비밀번호를 입력하세요"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-options">
                            <label className="checkbox-label">
                                <input type="checkbox" className="checkbox" />
                                <span>로그인 상태 유지</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner"></span>
                                    로그인 중...
                                </>
                            ) : (
                                '로그인'
                            )}
                        </button>
                    </form>

                    <div className="login-divider">
                        <span>또는</span>
                    </div>

                    <div className="social-login">
                        <button
                            type="button"
                            className="social-btn google"
                            onClick={() => handleGoogleLogin()}
                            disabled={isLoading}
                        >
                            <span>G</span>
                            Google로 로그인
                        </button>
                    </div>

                    <div className="login-footer">
                        계정이 없으신가요? <Link to="/register">회원가입</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
