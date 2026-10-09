import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import HRDDashboard from './page';
import * as actions from './actions';

// Mock Supabase
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'req-1',
              type: 'leave',
              description: 'Sick leave',
              status: 'pending',
              created_at: new Date().toISOString(),
              student_id: 'stu-1',
              profile: { full_name: 'John Doe', role: 'student' }
            }
          ],
          error: null
        })
      }))
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
  })
}));

// Mock Actions
vi.mock('./actions', () => ({
  processRequest: vi.fn().mockResolvedValue({ error: null }),
  updateAttendancePolicy: vi.fn().mockResolvedValue({ error: null })
}));

// Mock GSAP to prevent animation issues in test environment
vi.mock('gsap', () => ({
  default: {
    fromTo: vi.fn(),
  }
}));

// Mock JSPDF
vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => ({
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    text: vi.fn(),
    save: vi.fn(),
  }))
}));
vi.mock('jspdf-autotable', () => ({
  default: vi.fn()
}));

// URL.createObjectURL mock for CSV export
global.URL.createObjectURL = vi.fn();

describe('HRDDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard loading state initially and then shows requests', async () => {
    render(<HRDDashboard />);
    // We expect John Doe to appear eventually
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('handles request review and approval', async () => {
    render(<HRDDashboard />);
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click Review
    const reviewBtn = screen.getByText('Review');
    fireEvent.click(reviewBtn);

    // Ensure details panel shows up
    expect(screen.getByText('Review Request')).toBeInTheDocument();
    expect(screen.getByText('Sick leave')).toBeInTheDocument();

    // Fill comments
    const commentInput = screen.getByPlaceholderText('Provide reasoning for approval or rejection...');
    fireEvent.change(commentInput, { target: { value: 'Looks good' } });

    // Click approve
    const approveBtn = screen.getByText('Approve');
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(actions.processRequest).toHaveBeenCalled();
    });
  });

  it('requires comments for approval/rejection', async () => {
    render(<HRDDashboard />);
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const reviewBtn = screen.getByText('Review');
    fireEvent.click(reviewBtn);

    // Try to approve without comments
    const approveBtn = screen.getByText('Approve');
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(screen.getByText('Comments are mandatory to approve or reject a request.')).toBeInTheDocument();
    });
  });
});
