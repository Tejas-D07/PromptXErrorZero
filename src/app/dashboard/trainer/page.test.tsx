import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import TrainerDashboard from './page';

// Mock Supabase
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'trainer-1' } } })
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'class-1',
            name: 'React Fundamentals',
            enrollments: [{ count: 12 }]
          }
        ]
      })
    }))
  })
}));

// Mock GSAP
vi.mock('gsap', () => ({
  default: {
    fromTo: vi.fn(),
  }
}));

describe('TrainerDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders trainer dashboard and active classes', async () => {
    render(<TrainerDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      expect(screen.getByText('12 Enrolled Students')).toBeInTheDocument();
    });
  });
});
