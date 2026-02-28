import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import LoginPromptModal from '../components/LoginPromptModal'
import { useAuth } from '../components/AuthContext'
import axios from 'axios'
import conversationService from '../services/conversationService'
import './ChatRoom.css'

// Gemini API용 별도 axios 인스턴스 (타임아웃 30초) - 비로그인 체험용
const chatApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://upme-backend-service-603271573899.asia-northeast3.run.app/api',
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

    // DB 기반 대화인지 체험 모드인지 구분
    const isDbMode = roomId?.startsWith('c-')
    const conversationId = isDbMode ? parseInt(roomId.replace('c-', '')) : null
    const topicId = isDbMode ? null : (parseInt(roomId) || 6)
    const topicName = isDbMode ? '' : (topics[topicId] || '자유 주제')

    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [guestMessageCount, setGuestMessageCount] = useState(0)
    const [showLoginPrompt, setShowLoginPrompt] = useState(false)
    const [chatTopicName, setChatTopicName] = useState(topicName)
    const [loadingMessages, setLoadingMessages] = useState(false)
    const messagesEndRef = useRef(null)
    const isRequestInFlight = useRef(false)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // DB 모드: 이전 메시지 로드
    useEffect(() => {
        if (isDbMode && conversationId) {
            loadMessages()
        } else {
            // 체험 모드: 초기 인사 메시지
            setMessages([{
                id: 1,
                role: 'ai',
                content: `Hello! I'm your AI conversation partner. Let's practice English together! Today's topic is "${topicName}". What would you like to talk about?`,
                timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
            }])
        }
    }, [roomId])

    const loadMessages = async () => {
        setLoadingMessages(true)
        try {
            const data = await conversationService.getMessages(conversationId)
            const loadedMessages = data.map(m => ({
                id: m.id,
                role: m.role,
                content: m.content,
                type: m.feedback ? undefined : undefined,
                timestamp: new Date(m.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                feedback: m.feedback,
            }))

            // 피드백이 있는 AI 메시지는 별도 피드백 메시지로 분리
            const expandedMessages = []
            loadedMessages.forEach(m => {
                expandedMessages.push(m)
                if (m.role === 'ai' && m.feedback && m.feedback.trim()) {
                    expandedMessages.push({
                        id: m.id + 0.5,
                        role: 'ai',
                        type: 'feedback',
                        content: m.feedback,
                        timestamp: m.timestamp,
                    })
                }
            })

            setMessages(expandedMessages)

            // 첫 메시지에서 토픽 이름 추출
            if (data.length > 0) {
                const firstMsg = data[0].content
                const topicMatch = firstMsg.match(/topic is "([^"]+)"/)
                if (topicMatch) setChatTopicName(topicMatch[1])
            }
        } catch (err) {
            console.error('메시지 로드 실패:', err)
        } finally {
            setLoadingMessages(false)
        }
    }

    /**
     * 대화 히스토리를 백엔드 API 형식으로 변환
     */
    const buildHistory = () => {
        return messages
            .filter(m => m.type !== 'feedback')
            .map(m => ({
                role: m.role,
                content: m.content
            }))
    }

    const handleSend = async () => {
        if (!input.trim() || isRequestInFlight.current) return
        isRequestInFlight.current = true

        // 비로그인 사용자 메시지 제한 체크 (체험 모드)
        if (!isDbMode && !isLoggedIn) {
            if (guestMessageCount >= GUEST_MESSAGE_LIMIT) {
                setShowLoginPrompt(true)
                isRequestInFlight.current = false
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
            let reply, feedback

            if (isDbMode && conversationId) {
                // DB 모드: 메시지 저장 API 사용
                const response = await conversationService.sendMessage(
                    conversationId,
                    currentInput,
                    topicId || 6,
                    buildHistory()
                )
                reply = response.reply
                feedback = response.feedback
            } else {
                // 체험 모드: 기존 chat API 사용 (저장 안 됨)
                const response = await chatApi.post('/chat', {
                    message: currentInput,
                    topicId: topicId,
                    history: buildHistory()
                })
                reply = response.data.reply
                feedback = response.data.feedback
            }

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

    const remainingMessages = (!isDbMode && !isLoggedIn) ? GUEST_MESSAGE_LIMIT - guestMessageCount : null
    const isGuestLimitReached = !isDbMode && !isLoggedIn && guestMessageCount >= GUEST_MESSAGE_LIMIT

    return (
        <div className="chat-room animate-fade-in">
            <div className="chat-header">
                <div className="chat-info">
                    <div className="chat-avatar">🤖</div>
                    <div>
                        <h2 className="chat-title">AI 회화 파트너</h2>
                        <span className="chat-status">
                            ● {chatTopicName || '대화'}
                            {isDbMode && <span className="save-badge"> 💾 저장됨</span>}
                        </span>
                    </div>
                </div>
                <div className="chat-actions">
                    {remainingMessages !== null && (
                        <span className="guest-limit-badge">
                            체험 {remainingMessages}회 남음
                        </span>
                    )}
                </div>
            </div>

            <div className="messages-container">
                {loadingMessages ? (
                    <div className="messages-loading">
                        <div className="typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                        <p>이전 대화를 불러오는 중...</p>
                    </div>
                ) : (
                    messages.map((message) => (
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
                    ))
                )}

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
                            isGuestLimitReached
                                ? "체험이 끝났습니다. 로그인하여 계속하세요!"
                                : "영어로 메시지를 입력하세요..."
                        }
                        rows={1}
                        className="message-input"
                        disabled={isGuestLimitReached}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping || isGuestLimitReached}
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
