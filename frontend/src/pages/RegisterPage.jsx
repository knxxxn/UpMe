import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useToast } from '../components/ToastContext'
import authService from '../services/authService'
import './RegisterPage.css'

function RegisterPage() {
    const navigate = useNavigate()
    const { success, error: showError } = useToast()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validate = () => {
        const newErrors = {}
        if (!formData.name) newErrors.name = '이름을 입력해주세요'
        if (!formData.email) newErrors.email = '이메일을 입력해주세요'
        if (!formData.password) newErrors.password = '비밀번호를 입력해주세요'
        if (formData.password.length < 8) newErrors.password = '비밀번호는 8자 이상이어야 합니다'
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = '비밀번호가 일치하지 않습니다'
        }
        return newErrors
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const newErrors = validate()

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setIsLoading(true)
        try {
            const userData = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phoneNumber: formData.phone || null
            }
            const response = await authService.register(userData)
            if (response.success) {
                success('회원가입이 완료되었습니다!')
                navigate('/login')
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || '회원가입에 실패했습니다. 다시 시도해주세요.'

            // Show toast for duplicate email error
            if (errorMessage.includes('이메일') || errorMessage.includes('이미')) {
                showError('이미 가입된 사용자입니다')
            } else {
                showError(errorMessage)
            }

            setErrors({ general: errorMessage })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="register-page animate-fade-in">
            <div className="register-container">
                <div className="register-card">
                    <div className="register-header">
                        <Link to="/" className="register-logo">
                            <span className="logo-icon">🚀</span>
                            <span className="logo-text">MeUp</span>
                        </Link>
                        <h1>회원가입</h1>
                        <p>새 계정을 만들어 시작하세요</p>
                    </div>

                    <form onSubmit={handleSubmit} className="register-form">
                        <div className="form-group">
                            <label className="label" htmlFor="name">이름</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className={`input ${errors.name ? 'error' : ''}`}
                                placeholder="홍길동"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            {errors.name && <span className="error-text">{errors.name}</span>}
                        </div>

                        <div className="form-group">
                            <label className="label" htmlFor="email">이메일</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className={`input ${errors.email ? 'error' : ''}`}
                                placeholder="example@email.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {errors.email && <span className="error-text">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label className="label" htmlFor="password">비밀번호</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className={`input ${errors.password ? 'error' : ''}`}
                                placeholder="8자 이상 입력하세요"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            {errors.password && <span className="error-text">{errors.password}</span>}
                        </div>

                        <div className="form-group">
                            <label className="label" htmlFor="confirmPassword">비밀번호 확인</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                className={`input ${errors.confirmPassword ? 'error' : ''}`}
                                placeholder="비밀번호를 다시 입력하세요"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                        </div>

                        <div className="form-group">
                            <label className="label" htmlFor="phone">휴대전화 (선택)</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                className="input"
                                placeholder="010-1234-5678"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="terms-check">
                            <label className="checkbox-label">
                                <input type="checkbox" className="checkbox" required />
                                <span><a href="#">이용약관</a> 및 <a href="#">개인정보처리방침</a>에 동의합니다</span>
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
                                    가입 중...
                                </>
                            ) : (
                                '회원가입'
                            )}
                        </button>
                    </form>

                    <div className="register-footer">
                        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage
