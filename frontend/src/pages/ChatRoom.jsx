import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
    const navigate = useNavigate()
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
    const [isListening, setIsListening] = useState(false)
    const messagesEndRef = useRef(null)
    const isRequestInFlight = useRef(false)
    const recognitionRef = useRef(null)
    const hasUserMessageRef = useRef(false)
    const initialMessageCountRef = useRef(0)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // 음성 인식(STT) 초기화
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition()
            recognition.continuous = false
            recognition.interimResults = true
            recognition.lang = 'en-US' // 영어 회화이므로 영어를 기본으로 설정

            recognition.onresult = (event) => {
                let interimTranscript = ''
                let finalTranscript = ''
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript
                    } else {
                        interimTranscript += event.results[i][0].transcript
                    }
                }

                if (finalTranscript) {
                    setInput(prev => {
                        const spacer = prev && !prev.endsWith(' ') ? ' ' : ''
                        return prev + spacer + finalTranscript
                    })
                }
            }

            recognition.onerror = (event) => {
                console.error('Speech recognition error', event.error)
                setIsListening(false)
            }

            recognition.onend = () => {
                setIsListening(false)
            }

            recognitionRef.current = recognition
        }

        // 컴포넌트 언마운트 시 TTS 중지 및 빈 방 삭제
        return () => {
            window.speechSynthesis.cancel()
            
            // 빈 방 처리 (새로 생성된 방인데 메시지가 0개인 경우 삭제)
            if (isDbMode && conversationId) {
                if (initialMessageCountRef.current === 0 && !hasUserMessageRef.current) {
                    conversationService.deleteConversation(conversationId).catch(console.error)
                }
            }
        }
    }, [isDbMode, conversationId])

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert('이 브라우저에서는 음성 인식을 지원하지 않습니다. Chrome을 권장합니다.')
            return
        }

        if (isListening) {
            recognitionRef.current.stop()
        } else {
            try {
                recognitionRef.current.start()
                setIsListening(true)
            } catch (e) {
                console.error("음성 인식 시작 실패:", e)
            }
        }
    }

    // TTS(텍스트 읽어주기) 함수
    const playAudio = useCallback((text) => {
        if (!text) return

        // 실행 중인 음성 취소
        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'en-US'

        // 조금 더 자연스러운 영어 목소리 선택 (가능한 경우)
        const voices = window.speechSynthesis.getVoices()
        const englishVoice = voices.find(voice => voice.lang.startsWith('en-') && voice.name.includes('Google')) ||
            voices.find(voice => voice.lang.startsWith('en-'))

        if (englishVoice) {
            utterance.voice = englishVoice
        }

        // 속도 및 피치 조절 (선택사항)
        utterance.rate = 1.0
        utterance.pitch = 1.0

        window.speechSynthesis.speak(utterance)
    }, [])

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
            initialMessageCountRef.current = data.length;
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

        hasUserMessageRef.current = true;
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

    const handleDeleteChat = async () => {
        if (!window.confirm('현재 대화를 삭제하고 나가시겠습니까?')) return
        try {
            await conversationService.deleteConversation(conversationId)
            // navigate 전에 삭제 플래그를 두면 좋지만, 삭제후 이동해도 문제없음. 이동 시 unmount cleanup 호출됨
            // unmount cleanup 은 이미 삭제된 것을 다시 삭제하려 하겠지만 catch 가 있음
            // 안전을 위해 flag 설정
            hasUserMessageRef.current = true; // 빈 방 삭제 트리거 방지
            navigate('/conversation')
        } catch (err) {
            console.error('대화 삭제 실패:', err)
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
                    {isDbMode && (
                        <button 
                            className="btn btn-danger-outline" 
                            style={{ padding: '4px 8px', fontSize: '0.8rem', marginRight: '10px' }}
                            onClick={handleDeleteChat}
                            title="이 채팅방 삭제"
                        >
                            🗑️ 삭제
                        </button>
                    )}
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
                                <div className="message-meta">
                                    <span className="message-time">{message.timestamp}</span>
                                    {message.role === 'ai' && (
                                        <button
                                            className="tts-btn"
                                            onClick={() => playAudio(message.content)}
                                            title="들어보기"
                                            aria-label="메시지 듣기"
                                        >
                                            🔊
                                        </button>
                                    )}
                                </div>
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
                    <button
                        className={`stt-btn ${isListening ? 'listening' : ''}`}
                        onClick={toggleListening}
                        title={isListening ? "녹음 중지" : "음성으로 입력하기"}
                        disabled={isGuestLimitReached}
                        type="button"
                    >
                        {isListening ? '🛑' : '🎙️'}
                    </button>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={
                            isGuestLimitReached
                                ? "체험이 끝났습니다. 로그인하여 계속하세요!"
                                : (isListening ? "듣고 있습니다..." : "영어로 메시지를 입력하세요...")
                        }
                        rows={1}
                        className="message-input"
                        disabled={isGuestLimitReached || isListening}
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
