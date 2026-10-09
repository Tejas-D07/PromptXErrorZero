import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ContactPage from './page'

vi.mock('gsap', () => ({
  default: {
    context: vi.fn((cb) => {
      cb()
      return { revert: vi.fn() }
    }),
    from: vi.fn(),
  }
}))

describe('ContactPage', () => {
  it('submits form successfully', () => {
    render(<ContactPage />)
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'Test User' } }) // Name
    fireEvent.change(inputs[1], { target: { value: 'test@example.com' } }) // Email
    fireEvent.change(inputs[2], { target: { value: 'Hello world' } }) // Message
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'trainer' } }) // Role
    
    // Submit the form
    const form = document.querySelector('form')
    if (form) fireEvent.submit(form)
    
    expect(screen.getByText('Message Sent Successfully!')).toBeInTheDocument()
  })
})
