// src/components/__tests__/ErrorBoundary.test.js
import { render, screen } from '@testing-library/react'
import ErrorBoundary from '../ErrorBoundary'

// Component that throws an error
function ThrowError() {
    throw new Error('Test error')
}

// Component that works fine
function GoodComponent() {
    return <div>Good component</div>
}

describe('ErrorBoundary', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render children when there is no error', () => {
        render(
            <ErrorBoundary>
                <GoodComponent />
            </ErrorBoundary>
        )
        
        expect(screen.getByText('Good component')).toBeInTheDocument()
    })

    it('should display error message when error is thrown', () => {
        render(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        )
        
        expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
        expect(screen.getByText(/Test error/i)).toBeInTheDocument()
    })

    it('should display Go Home button on error', () => {
        render(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        )
        
        const button = screen.getByText('Go Home')
        expect(button).toBeInTheDocument()
    })
})
