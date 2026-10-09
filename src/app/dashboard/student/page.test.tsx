import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import StudentDashboard from './page';
import * as actions from './actions';

// Mock Supabase
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'stu-1' } } })
    },
    from: vi.fn((table) => {
      if (table === 'attendance') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({
            data: [
              { status: 'present' },
              { status: 'absent' }
            ]
          })
        };
      }
      if (table === 'requests') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'req-1',
                type: 'leave',
                description: 'Sick leave',
                status: 'pending',
                created_at: new Date().toISOString(),
                comments: ''
              }
            ]
          })
        };
      }
      return { select: vi.fn().mockResolvedValue({ data: [] }) };
    }),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: {}, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'http://test.com/doc.pdf' } })
      }))
    }
  })
}));

// Mock Actions
vi.mock('./actions', () => ({
  submitRequest: vi.fn().mockResolvedValue({ error: null })
}));

// Mock GSAP
vi.mock('gsap', () => ({
  default: {
    fromTo: vi.fn(),
  }
}));

describe('StudentDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders student dashboard and attendance correctly', async () => {
    render(<StudentDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('50%')).toBeInTheDocument(); // 1 present, 1 absent = 50%
      expect(screen.getByText('Shortage Warning')).toBeInTheDocument();
    });
  });

  it('submits a permission request successfully', async () => {
    render(<StudentDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Sick leave')).toBeInTheDocument();
    });

    const descInput = screen.getByPlaceholderText('Provide detailed reasoning for your request...');
    fireEvent.change(descInput, { target: { value: 'Going to hospital' } });

    const submitBtn = screen.getByText('Submit Request');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(actions.submitRequest).toHaveBeenCalled();
      expect(screen.getByText('Request submitted successfully.')).toBeInTheDocument();
    });
  });
});
