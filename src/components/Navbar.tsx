
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
      navigate('/auth');
    }
  };

  return (
    <nav className="bg-[#003087] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-[#D4A017] text-xl font-bold">
              Library App - Knowledge is power
            </Link>
            {user && (
              <div className="flex space-x-6">
                <Link 
                  to="/" 
                  className="hover:text-[#D4A017] transition-colors duration-200"
                >
                  Home
                </Link>
                <Link 
                  to="/my-borrows" 
                  className="hover:text-[#D4A017] transition-colors duration-200"
                >
                  My Borrows
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm">{user.user_metadata?.name || user.email}</span>
                <Button 
                  onClick={handleSignOut}
                  className="bg-[#D4A017] hover:bg-[#B8900F] text-[#003087] font-medium"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button className="bg-[#D4A017] hover:bg-[#B8900F] text-[#003087] font-medium">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
