import { create } from 'zustand';
import { booksAPI } from '../utils/api';

export const useBooksStore = create((set, get) => ({
  books: [],
  myBooks: [],
  recentBooks: [],
  availableForExchange: 0,
  isLoading: false,
  error: null,

  // Fetch all books
  fetchBooks: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await booksAPI.getAll();
      set({ books: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Fetch user's books
  fetchMyBooks: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await booksAPI.getMyBooks();
      set({ myBooks: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Fetch dashboard data (combines multiple API calls)
  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [myBooksResponse, allBooksResponse] = await Promise.all([
        booksAPI.getMyBooks(),
        booksAPI.getAll()
      ]);

      const myBooks = myBooksResponse.data;
      const allBooks = allBooksResponse.data;

      // Get current user ID from my books
      const currentUserId = myBooks?.length > 0 ? myBooks[0].ownerId : null;
      
      // Filter out user's own books for available exchange count and recent books
      const otherUsersBooks = allBooks.filter(book => book.ownerId !== currentUserId);
      const availableBooks = otherUsersBooks.filter(book => book.status === 'available');
      
      set({
        myBooks,
        books: allBooks,
        recentBooks: otherUsersBooks.slice(0, 5),
        availableForExchange: availableBooks.length,
        isLoading: false
      });

      return { myBooks, allBooks, recentBooks: otherUsersBooks.slice(0, 5) };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Add a new book
  addBook: async (bookData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await booksAPI.add(bookData);
      // Backend returns { message, book }
      const newBook = response.data?.book || response.data;
      
      set(state => ({
        books: [...state.books, newBook],
        myBooks: [...state.myBooks, newBook],
        isLoading: false
      }));
      
      return newBook;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Update a book
  updateBook: async (bookId, bookData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await booksAPI.update(bookId, bookData);
      const updatedBook = response.data;
      
      set(state => ({
        books: state.books.map(book => 
          book.id === bookId ? updatedBook : book
        ),
        myBooks: state.myBooks.map(book => 
          book.id === bookId ? updatedBook : book
        ),
        isLoading: false
      }));
      
      return updatedBook;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Delete a book
  deleteBook: async (bookId) => {
    set({ isLoading: true, error: null });
    try {
      await booksAPI.delete(bookId);
      
      set(state => ({
        books: state.books.filter(book => book.id !== bookId),
        myBooks: state.myBooks.filter(book => book.id !== bookId),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Get books available for exchange (excluding user's own books)
  getAvailableBooksForUser: () => {
    const { books, myBooks } = get();
    const myBookIds = myBooks.map(book => book.id);
    return books.filter(book => 
      !myBookIds.includes(book.id) && book.status === 'available'
    );
  },

  // Get book by ID
  getBookById: (bookId) => {
    const { books } = get();
    return books.find(book => book.id === bookId);
  },

  // Clear error state
  clearError: () => {
    set({ error: null });
  },

  // Reset store
  reset: () => {
    set({
      books: [],
      myBooks: [],
      recentBooks: [],
      availableForExchange: 0,
      isLoading: false,
      error: null
    });
  }
}));
