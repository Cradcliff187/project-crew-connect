import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client'; // Actual client, will be mocked
import { ensureSession, AuthProvider, useAuth, useRequireAuth } from '@/contexts/AuthContext';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import React, { ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js'; // Import Session and User types

// Original ensureSession for direct testing
import { ensureSession as originalEnsureSession } from '@/contexts/AuthContext';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      refreshSession: vi.fn(),
    },
    // Mock other Supabase methods if needed by other hooks/components under test indirectly
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn() })) })),
      // Add other chainable methods like eq, update, delete if necessary for broader tests
    })),
  },
}));

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const original = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...original,
    useNavigate: () => mockNavigate,
  };
});

// Mock parts of AuthContext module for useAuth and useRequireAuth testing
// Keep original AuthProvider and originalEnsureSession for their respective tests
const mockEnsureSession = vi.fn();
vi.mock('@/contexts/AuthContext', async (importOriginal) => {
  const originalContextModule = await importOriginal<typeof import('@/contexts/AuthContext')>();
  return {
    ...originalContextModule, // Includes original AuthProvider and originalEnsureSession
    ensureSession: mockEnsureSession, // Mock for hooks that use it
    // useAuth and useRequireAuth will use the mocked AuthProvider context below or be tested via renderHook
  };
});

const TestWrapper: React.FC<{ children: ReactNode; initialEntries?: string[] }> = ({ children, initialEntries = ['/protected'] }) => (
  <MemoryRouter initialEntries={initialEntries}>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/protected" element={<>{children}</>} />
        {/* Add more routes if specific tests require them */}
      </Routes>
    </AuthProvider>
  </MemoryRouter>
);

// Helper to create a more complete mock user
const createMockUser = (id: string, email: string = 'test@example.com'): User => ({
  id,
  app_metadata: { provider: 'email' },
  user_metadata: { name: 'Test User' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: email,
  // Add other user fields if necessary based on your app's usage
});

// Helper to create a more complete mock session
const createMockSession = (userId: string, email?: string): Session => ({
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: createMockUser(userId, email),
});

describe('Auth Session Recovery and Guarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.auth.getSession as vi.Mock).mockResolvedValue({ data: { session: null }, error: null });
    (supabase.auth.refreshSession as vi.Mock).mockResolvedValue({ data: { session: null }, error: null });
    mockEnsureSession.mockImplementation(originalEnsureSession); // Default to original for indirect calls
  });

  describe('ensureSession (direct test)', () => {
    it('should return null and try to refresh if no initial session', async () => {
      (supabase.auth.getSession as vi.Mock).mockResolvedValueOnce({ data: { session: null }, error: null });
      (supabase.auth.refreshSession as vi.Mock).mockResolvedValueOnce({ data: { session: null }, error: { message: 'Refresh failed' } });

      const session = await originalEnsureSession();

      expect(supabase.auth.getSession).toHaveBeenCalledTimes(1);
      expect(supabase.auth.refreshSession).toHaveBeenCalledTimes(1);
      expect(session).toBeNull();
    });

    it('should return existing session if available', async () => {
      const mockSessionData = createMockSession('user-123');
      (supabase.auth.getSession as vi.Mock).mockResolvedValueOnce({ data: { session: mockSessionData }, error: null });

      const session = await originalEnsureSession();

      expect(supabase.auth.getSession).toHaveBeenCalledTimes(1);
      expect(supabase.auth.refreshSession).not.toHaveBeenCalled();
      expect(session).toEqual(mockSessionData);
    });

    it('should return refreshed session if initial is null but refresh succeeds', async () => {
      const refreshedSessionData = createMockSession('user-456');
      (supabase.auth.getSession as vi.Mock).mockResolvedValueOnce({ data: { session: null }, error: null });
      (supabase.auth.refreshSession as vi.Mock).mockResolvedValueOnce({ data: { session: refreshedSessionData }, error: null });

      const session = await originalEnsureSession();

      expect(supabase.auth.getSession).toHaveBeenCalledTimes(1);
      expect(supabase.auth.refreshSession).toHaveBeenCalledTimes(1);
      expect(session).toEqual(refreshedSessionData);
    });
  });

  describe('useRequireAuth', () => {
    it('should redirect to /login if no session after AuthProvider loading', async () => {
      (supabase.auth.getSession as vi.Mock).mockResolvedValueOnce({ data: { session: null }, error: null });

      renderHook(() => useRequireAuth(), { wrapper: TestWrapper });

      await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); });
      await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); });

      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true, state: { from: '/protected' } });
    });

    it('should not redirect if session exists after AuthProvider loading', async () => {
      const mockUserSessionData = createMockSession('user-session-test');
      (supabase.auth.getSession as vi.Mock).mockResolvedValueOnce({ data: { session: mockUserSessionData }, error: null });

      renderHook(() => useRequireAuth(), { wrapper: TestWrapper });

      await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Data fetching hook behavior (simulating useScheduleItems)', () => {
    const mockScheduleItemData = { title: 'Test Item', project_id: 'proj-1' };

    const useTestDataHook = () => {
      const [data, setData] = React.useState<any | null>(null);
      const [error, setError] = React.useState<string | null>(null);

      const addItem = async (item: any) => {
        const session = await originalEnsureSession();
        if (!session) {
          setError('No session from ensureSession');
          mockNavigate('/login', {replace: true, state: {from: '/protected'}});
          return null;
        }
        try {
          const { data: insertedData, error: insertError } = await supabase
            .from('schedule_items')
            .insert(item)
            .select()
            .single();
          if (insertError) throw insertError;
          setData(insertedData);
          return insertedData;
        } catch (e: any) {
          setError(e.message);
          return null;
        }
      };
      return { addItem, data, error };
    };

    it('should allow adding item if session is valid', async () => {
      const validUserSessionData = createMockSession('user-valid-for-item');
      const newItem = { id: 'item-1', ...mockScheduleItemData };

      (supabase.auth.getSession as vi.Mock).mockResolvedValue({ data: { session: validUserSessionData }, error: null });
      (supabase.from('schedule_items').insert as vi.Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({ single: vi.fn().mockResolvedValueOnce({ data: newItem, error: null }) }),
      });

      const { result } = renderHook(() => useTestDataHook(), { wrapper: TestWrapper });

      let addedItem;
      await act(async () => {
        addedItem = await result.current.addItem(mockScheduleItemData);
      });

      expect(supabase.from('schedule_items').insert).toHaveBeenCalledWith(mockScheduleItemData);
      expect(addedItem).toEqual(newItem);
      expect(result.current.data).toEqual(newItem);
      expect(result.current.error).toBeNull();
      expect(mockNavigate).not.toHaveBeenCalledWith('/login', expect.anything());
    });

    it('should prevent adding item and redirect if session is invalid (after refresh fails)', async () => {
      (supabase.auth.getSession as vi.Mock).mockResolvedValueOnce({ data: { session: null }, error: null }); // For AuthProvider init
      (supabase.auth.getSession as vi.Mock).mockResolvedValueOnce({ data: { session: null }, error: null }); // For ensureSession
      (supabase.auth.refreshSession as vi.Mock).mockResolvedValueOnce({ data: { session: null }, error: {message: 'Refresh failed'} }); // For ensureSession

      const { result } = renderHook(() => useTestDataHook(), { wrapper: TestWrapper });

      let addedItem;
      await act(async () => {
        addedItem = await result.current.addItem(mockScheduleItemData);
      });

      expect(supabase.from('schedule_items').insert).not.toHaveBeenCalled();
      expect(addedItem).toBeNull();
      expect(result.current.error).toBe('No session from ensureSession');
      expect(mockNavigate).toHaveBeenCalledWith('/login', {replace: true, state: {from: '/protected'}});
    });
  });
});
