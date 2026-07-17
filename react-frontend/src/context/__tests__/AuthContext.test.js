// src/context/__tests__/AuthContext.test.js
import { render, screen } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'

// Test component to access context
function TestComponent() {
    const { user, token, login, logout } = useAuth()
    
    return (
        <div>
            <div data-testid="user">{user ? user.email : 'No user'}</div>
            <div data-testid="token">{token ? 'Has token' : 'No token'}</div>
            <button onClick={() => login({ email: 'test@test.com' }, 'test-token')}>
                Login
            </button>
            <button onClick={logout}>Logout</button>
        </div>
    )
}

describe('AuthContext', () => {
    it('should provide initial auth state', () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )
        
        expect(screen.getByTestId('user')).toHaveTextContent('No user')
        expect(screen.getByTestId('token')).toHaveTextContent('No token')
    })

    it('should login user', () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )
        
        const loginBtn = screen.getByText('Login')
        loginBtn.click()
        
        expect(screen.getByTestId('token')).toHaveTextContent('Has token')
    })

    it('should logout user', () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )
        
        const loginBtn = screen.getByText('Login')
        loginBtn.click()
        
        const logoutBtn = screen.getByText('Logout')
        logoutBtn.click()
        
        expect(screen.getByTestId('user')).toHaveTextContent('No user')
        expect(screen.getByTestId('token')).toHaveTextContent('No token')
    })
})
