import React from 'react';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Login } from './pages/Login';
import { useAuthStore } from './store/authStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from './components/ErrorBoundary';
import { UserRole } from './types';

const queryClient = new QueryClient();

export default function App() {
  const { isAuthenticated, setAuth, setLoading, isLoading } = useAuthStore();

  React.useEffect(() => {
    // Basic initialization and session recovery
    const savedUser = localStorage.getItem('medicore_user');
    if (savedUser) {
      try {
        setAuth(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to recover session", e);
      }
    }
    setLoading(false);
  }, [setAuth, setLoading]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0052CC]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <DashboardLayout />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
