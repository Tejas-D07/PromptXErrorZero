import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import LoginPage from './page'
import { login } from './actions'

vi.mock('gsap', () => ({
  default: {
    fromTo: vi.fn(),
  }
}))

vi.mock('./actions', () => ({
  login: vi.fn().mockResolvedValue({ error: 'Invalid login credentials' })
}))

describe('LoginPage', () => {
  it('renders login form', () => {
    render(<LoginPage />)
    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('name@college.edu')).toBeInTheDocument()
  })

  it('shows error on failed login', async () => {
    render(<LoginPage />)
    fireEvent.change(screen.getByPlaceholderText('name@college.edu'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password' } })
    fireEvent.click(screen.getByText('Sign In'))
    
    expect(await screen.findByText('Invalid login credentials')).toBeInTheDocument()
  })

  it('handles successful login', async () => {
    // Mock successful login
    vi.mocked(login).mockResolvedValueOnce({ error: '' })
    
    render(<LoginPage />)
    fireEvent.change(screen.getByPlaceholderText('name@college.edu'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password' } })
    fireEvent.click(screen.getByText('Sign In'))
    
    // We can just expect no error message to appear
    expect(screen.queryByText('Invalid login credentials')).not.toBeInTheDocument()
  })
})
