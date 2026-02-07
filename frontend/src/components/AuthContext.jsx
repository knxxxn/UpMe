import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    // Check login status on mount
    useEffect(() => {
        checkAuthStatus()
    }, [])

    const checkAuthStatus = () => {
        const token = localStorage.getItem('accessToken')
        const storedUser = localStorage.getItem('user')

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser))
                setIsLoggedIn(true)
            } catch (e) {
                console.error('Failed to parse user data:', e)
                logout()
            }
        }
        setIsLoading(false)
    }

    const login = (userData, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
        setIsLoggedIn(true)
    }

    const logout = () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        setUser(null)
        setIsLoggedIn(false)
    }

    const value = {
        isLoggedIn,
        user,
        isLoading,
        login,
        logout,
        checkAuthStatus
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export default AuthContext
