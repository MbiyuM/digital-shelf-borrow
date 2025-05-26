
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';

const AuthPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-[#003087] text-lg">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <AuthForm />;
};

export default AuthPage;
