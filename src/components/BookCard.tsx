
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';

interface Book {
  id: string;
  tittle: string; // Note: using 'tittle' as per your database schema
  author: string;
  isbn: string;
  available: boolean;
  info: string | null;
}

interface BookCardProps {
  book: Book;
  onBookUpdate: () => void;
}

const BookCard = ({ book, onBookUpdate }: BookCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [borrowing, setBorrowing] = useState(false);

  const handleBorrow = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in to borrow books",
        variant: "destructive",
      });
      return;
    }

    setBorrowing(true);
    
    try {
      // Calculate return date (7 days from now)
      const borrowDate = new Date().toISOString();
      const returnDate = new Date();
      returnDate.setDate(returnDate.getDate() + 7);

      console.log('Creating borrow record for user:', user.id, 'book:', book.id);

      // Create borrow record
      const { error: borrowError } = await supabase
        .from('borrows')
        .insert({
          user_id: user.id,
          book_id: book.id,
          borrow_date: borrowDate,
          return_date: returnDate.toISOString(),
          returned: false,
        });

      if (borrowError) {
        console.error('Borrow error:', borrowError);
        throw borrowError;
      }

      console.log('Updating book availability for book:', book.id);

      // Update book availability
      const { error: updateError } = await supabase
        .from('books')
        .update({ available: false })
        .eq('id', book.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      toast({
        title: "Success",
        description: `You have successfully borrowed "${book.tittle}"`,
      });

      onBookUpdate();
    } catch (error: any) {
      console.error('Full error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to borrow book",
        variant: "destructive",
      });
    } finally {
      setBorrowing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <h3 className="text-xl font-bold text-[#003087] mb-2">{book.tittle}</h3>
      <p className="text-gray-700 mb-1"><span className="font-medium">Author:</span> {book.author}</p>
      <p className="text-gray-700 mb-1"><span className="font-medium">ISBN:</span> {book.isbn}</p>
      {book.info && (
        <p className="text-gray-700 mb-1"><span className="font-medium">Info:</span> {book.info}</p>
      )}
      <p className="text-gray-700 mb-4">
        <span className="font-medium">Status:</span> 
        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
          book.available 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {book.available ? 'Available' : 'Not Available'}
        </span>
      </p>
      
      {user && (
        <Button
          onClick={handleBorrow}
          disabled={!book.available || borrowing}
          className={`w-full font-medium transition-colors duration-200 ${
            book.available 
              ? 'bg-[#003087] hover:bg-[#D4A017] text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {borrowing ? 'Borrowing...' : (book.available ? 'Borrow' : 'Not Available')}
        </Button>
      )}
    </div>
  );
};

export default BookCard;
