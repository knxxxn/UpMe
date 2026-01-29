import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CodingPage from './pages/CodingPage'
import CodingListPage from './pages/CodingListPage'
import ConversationPage from './pages/ConversationPage'
import ChatRoom from './pages/ChatRoom'
import MyPage from './pages/MyPage'
import './App.css'

function App() {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Header />
                <main className="page-content">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/coding" element={<CodingListPage />} />
                        <Route path="/coding/:roomId" element={<CodingPage />} />
                        <Route path="/conversation" element={<ConversationPage />} />
                        <Route path="/conversation/:roomId" element={<ChatRoom />} />
                        <Route path="/mypage" element={<MyPage />} />
                    </Routes>
                </main>
            </div>
        </div>
    )
}

export default App
