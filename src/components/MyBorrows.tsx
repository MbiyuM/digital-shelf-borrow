
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface BorrowRecord {
  id: string;
  book_id: string;
  borrow_date: string;
  return_date: string;
  returned: boolean;
  books: {
    tittle: string;
    author: string;
    isbn: string;
  };
}

const MyBorrows = () => {
  const { user } = useAuth();
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBorrows = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('borrows')
        .select(`
          *,
          books (
            tittle,
            author,
            isbn
          )
        `)
        .eq('user_id', user.id)
        .order('borrow_date', { ascending: false });

      if (error) throw error;
      
      setBorrows(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch your borrows",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (borrowId: string, bookId: string) => {
    try {
      // Update borrow record
      const { error: borrowError } = await supabase
        .from('borrows')
        .update({ returned: true })
        .eq('id', borrowId);

      if (borrowError) throw borrowError;

      // Update book availability
      const { error: bookError } = await supabase
        .from('books')
        .update({ available: true })
        .eq('id', bookId);

      if (bookError) throw bookError;

      toast({
        title: "Success",
        description: "Book returned successfully",
      });

      fetchBorrows();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to return book",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchBorrows();

    // Set up real-time subscription for borrow updates
    if (user) {
      const channel = supabase
        .channel('borrows-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'borrows',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            console.log('Borrow data changed, refetching...');
            fetchBorrows();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-[#003087] text-lg">Loading your borrows...</div>
      </div>
    );
  }

  if (borrows.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">You haven't borrowed any books yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {borrows.map((borrow) => (
        <div key={borrow.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[#003087] mb-2">
                {borrow.books.tittle}
              </h3>
              <p className="text-gray-700 mb-1">
                <span className="font-medium">Author:</span> {borrow.books.author}
              </p>
              <p className="text-gray-700 mb-1">
                <span className="font-medium">ISBN:</span> {borrow.books.isbn}
              </p>
              <p className="text-gray-700 mb-1">
                <span className="font-medium">Borrowed:</span> {new Date(borrow.borrow_date).toLocaleDateString()}
              </p>
              <p className="text-gray-700 mb-4">
                <span className="font-medium">Due:</span> {new Date(borrow.return_date).toLocaleDateString()}
              </p>
              <div className="flex items-center">
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  borrow.returned 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {borrow.returned ? 'Returned' : 'Borrowed'}
                </span>
              </div>
            </div>
            
            {!borrow.returned && (
              <div className="mt-4 sm:mt-0 sm:ml-4">
                <Button
                  onClick={() => handleReturn(borrow.id, borrow.book_id)}
                  className="bg-[#003087] hover:bg-[#D4A017] text-white font-medium"
                >
                  Return Book
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyBorrows;
