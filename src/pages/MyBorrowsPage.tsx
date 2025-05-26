
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import MyBorrows from '@/components/MyBorrows';

const MyBorrowsPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-[#003087] text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#003087] mb-2">My Borrowed Books</h1>
          <p className="text-gray-600">Manage your current and past book borrows</p>
        </div>
        
        <MyBorrows />
      </div>
    </div>
  );
};

export default MyBorrowsPage;
