
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import BookCard from './BookCard';
import { useToast } from '@/components/ui/use-toast';

interface Book {
  id: string;
  tittle: string;
  author: string;
  isbn: string;
  available: boolean;
}

const BookList = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('tittle');

      if (error) throw error;
      
      setBooks(data || []);
      setFilteredBooks(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch books",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();

    // Set up real-time subscription for book updates
    const channel = supabase
      .channel('books-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'books'
        },
        () => {
          console.log('Book data changed, refetching...');
          fetchBooks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    let filtered = books;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(book =>
        book.tittle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by availability
    if (showAvailableOnly) {
      filtered = filtered.filter(book => book.available);
    }

    setFilteredBooks(filtered);
  }, [books, searchTerm, showAvailableOnly]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-[#003087] text-lg">Loading books...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search books by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-gray-300 focus:border-[#003087] focus:ring-[#003087]"
            />
          </div>
          <Button
            onClick={() => setShowAvailableOnly(!showAvailableOnly)}
            variant={showAvailableOnly ? "default" : "outline"}
            className={showAvailableOnly 
              ? "bg-[#003087] hover:bg-[#D4A017] text-white" 
              : "border-[#003087] text-[#003087] hover:bg-[#003087] hover:text-white"
            }
          >
            {showAvailableOnly ? 'Show All Books' : 'Available Only'}
          </Button>
        </div>
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm || showAvailableOnly 
              ? 'No books found matching your criteria.' 
              : 'No books available in the catalog.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <BookCard 
              key={book.id} 
              book={book} 
              onBookUpdate={fetchBooks}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookList;
