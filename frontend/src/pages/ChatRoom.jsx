import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import LoginPromptModal from '../components/LoginPromptModal'
import { useAuth } from '../components/AuthContext'
import axios from 'axios'
import './ChatRoom.css'

// Gemini API용 별도 axios 인스턴스 (타임아웃 30초)
const chatApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
})

const GUEST_MESSAGE_LIMIT = 3

const topics = {
    1: '일상 대화',
    2: '여행',
    3: '비즈니스',
    4: '면접 준비',
    5: '기술 토론',
    6: '자유 주제',
}

function ChatRoom() {
    const { roomId } = useParams()
    const { isLoggedIn } = useAuth()
    const topicId = parseInt(roomId) || 6
    const topicName = topics[topicId] || '자유 주제'

    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'ai',
            content: `Hello! I'm your AI conversation partner. Let's practice English together! Today's topic is "${topicName}". What would you like to talk about?`,
            timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
        }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [guestMessageCount, setGuestMessageCount] = useState(0)
    const [showLoginPrompt, setShowLoginPrompt] = useState(false)
    const messagesEndRef = useRef(null)
    const isRequestInFlight = useRef(false) // 중복 요청 방지

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    /**
     * 대화 히스토리를 백엔드 API 형식으로 변환
     */
    const buildHistory = () => {
        return messages
            .filter(m => m.type !== 'feedback') // 피드백 메시지는 히스토리에서 제외
            .map(m => ({
                role: m.role,
                content: m.content
            }))
    }

    const handleSend = async () => {
        if (!input.trim() || isRequestInFlight.current) return
        isRequestInFlight.current = true

        // 비로그인 사용자 메시지 제한 체크
        if (!isLoggedIn) {
            if (guestMessageCount >= GUEST_MESSAGE_LIMIT) {
                setShowLoginPrompt(true)
                return
            }
            setGuestMessageCount(prev => prev + 1)
        }

        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: input,
            timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
        }

        setMessages(prev => [...prev, userMessage])
        const currentInput = input
        setInput('')
        setIsTyping(true)

        try {
            const response = await chatApi.post('/chat', {
                message: currentInput,
                topicId: topicId,
                history: buildHistory()
            })

            const { reply, feedback } = response.data

            // AI 응답 메시지
            const aiMessage = {
                id: Date.now() + 1,
                role: 'ai',
                content: reply,
                timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
            }
            setMessages(prev => [...prev, aiMessage])

            // 피드백이 있으면 별도 메시지로 추가
            if (feedback && feedback.trim()) {
                const feedbackMessage = {
                    id: Date.now() + 2,
                    role: 'ai',
                    type: 'feedback',
                    content: feedback,
                    timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
                }
                setMessages(prev => [...prev, feedbackMessage])
            }
        } catch (error) {
            console.error('Chat API error:', error)
            const errorMessage = {
                id: Date.now() + 1,
                role: 'ai',
                content: "I'm sorry, I'm having trouble connecting right now. Please try again!",
                timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsTyping(false)
            isRequestInFlight.current = false
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const remainingMessages = isLoggedIn ? null : GUEST_MESSAGE_LIMIT - guestMessageCount

    return (
        <div className="chat-room animate-fade-in">
            <div className="chat-header">
                <div className="chat-info">
                    <div className="chat-avatar">🤖</div>
                    <div>
                        <h2 className="chat-title">AI 회화 파트너</h2>
                        <span className="chat-status">● {topicName}</span>
                    </div>
                </div>
                <div className="chat-actions">
                    {!isLoggedIn && remainingMessages !== null && (
                        <span className="guest-limit-badge">
                            체험 {remainingMessages}회 남음
                        </span>
                    )}
                </div>
            </div>

            <div className="messages-container">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`message ${message.role === 'user' ? 'user' : 'ai'} ${message.type === 'feedback' ? 'feedback' : ''}`}
                    >
                        {message.role === 'ai' && (
                            <div className="message-avatar">
                                {message.type === 'feedback' ? '📝' : '🤖'}
                            </div>
                        )}
                        <div className={`message-content ${message.type === 'feedback' ? 'feedback-content' : ''}`}>
                            <p className="message-text">{message.content}</p>
                            <span className="message-time">{message.timestamp}</span>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="message ai">
                        <div className="message-avatar">🤖</div>
                        <div className="message-content">
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="input-container">
                <div className="input-wrapper">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={
                            !isLoggedIn && guestMessageCount >= GUEST_MESSAGE_LIMIT
                                ? "체험이 끝났습니다. 로그인하여 계속하세요!"
                                : "영어로 메시지를 입력하세요..."
                        }
                        rows={1}
                        className="message-input"
                        disabled={!isLoggedIn && guestMessageCount >= GUEST_MESSAGE_LIMIT}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping || (!isLoggedIn && guestMessageCount >= GUEST_MESSAGE_LIMIT)}
                        className="send-btn"
                    >
                        ➤
                    </button>
                </div>
                <div className="input-hint">
                    <span>Shift + Enter로 줄바꿈</span>
                </div>
            </div>

            {/* Login Prompt Modal */}
            <LoginPromptModal
                isOpen={showLoginPrompt}
                onClose={() => setShowLoginPrompt(false)}
                feature="무제한 회화 연습"
                message="체험 횟수를 모두 사용했습니다. 로그인하면 무제한으로 대화하고 기록을 저장할 수 있어요!"
            />
        </div>
    )
}

export default ChatRoom
