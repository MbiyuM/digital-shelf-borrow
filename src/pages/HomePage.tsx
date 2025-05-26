
import BookList from '@/components/BookList';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#003087] mb-2">Book Catalog</h1>
          <p className="text-gray-600">Discover and borrow books from our library collection</p>
        </div>
        
        <BookList />
      </div>
    </div>
  );
};

export default HomePage;
