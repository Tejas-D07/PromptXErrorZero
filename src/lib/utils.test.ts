import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn utility', () => {
  it('merges class names correctly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white')
    expect(cn('px-2 py-1', { 'bg-blue-500': true, 'bg-red-500': false })).toBe('px-2 py-1 bg-blue-500')
  })
})
