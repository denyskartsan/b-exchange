# Zustand Store Implementation

This project now uses Zustand for global state management, significantly reducing the need for `useState` in components. Here's how to use the stores effectively.

## Available Stores

### 1. AuthStore (`useAuthStore`)

Manages user authentication state and provides user-related functionality.

**State:**
- `user`: Current user object or null
- `isLoading`: Auth loading state
- `isInitialized`: Whether auth initialization is complete

**Actions:**
- `initializeAuth()`: Initialize auth from stored token
- `login(userData)`: Login with user data
- `logout()`: Logout and clear user data
- `isAuthenticated()`: Check if user is logged in
- `getCurrentUser()`: Get current user object
- `updateUser(userData)`: Update user information

**Usage:**
```jsx
import { useAuthStore } from '../stores';

const MyComponent = () => {
  const { user, login, logout, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated()) {
    return <LoginForm onLogin={login} />;
  }
  
  return <div>Welcome {user.name}!</div>;
};
```

### 2. BooksStore (`useBooksStore`)

Manages book-related data and operations.

**State:**
- `books`: Array of all books
- `myBooks`: Array of current user's books
- `recentBooks`: Array of recently added books
- `availableForExchange`: Number of books available for exchange
- `isLoading`: Loading state for book operations
- `error`: Error message if any

**Actions:**
- `fetchBooks()`: Fetch all books
- `fetchMyBooks()`: Fetch current user's books
- `fetchDashboardData()`: Fetch combined dashboard data
- `addBook(bookData)`: Add a new book
- `updateBook(id, bookData)`: Update a book
- `deleteBook(id)`: Delete a book
- `getAvailableBooksForUser()`: Get books available for exchange
- `getBookById(id)`: Get specific book by ID
- `clearError()`: Clear error state
- `reset()`: Reset store to initial state

**Usage:**
```jsx
import { useBooksStore } from '../stores';

const BookList = () => {
  const { books, isLoading, fetchBooks, addBook, error } = useBooksStore();
  
  useEffect(() => {
    fetchBooks();
  }, []);
  
  const handleAddBook = async (bookData) => {
    try {
      await addBook(bookData);
      message.success('Book added!');
    } catch (error) {
      // Error handled by store
    }
  };
  
  if (isLoading) return <Loading />;
  
  return (
    <div>
      {books.map(book => <BookCard key={book.id} book={book} />)}
    </div>
  );
};
```

### 3. UIStore (`useUIStore`)

Manages global UI state like modals, notifications, and themes.

**State:**
- `globalLoading`: Global loading state
- `modals`: Modal states object
- `notifications`: Array of notifications
- `theme`: Current theme ('light' or 'dark')
- `isMobileMenuOpen`: Mobile menu state

**Actions:**
- `setGlobalLoading(loading)`: Set global loading state
- `openModal(modalName, data)`: Open modal with optional data
- `closeModal(modalName)`: Close modal
- `isModalOpen(modalName)`: Check if modal is open
- `getModalData(modalName)`: Get modal data
- `addNotification(notification)`: Add notification
- `removeNotification(id)`: Remove notification
- `clearAllNotifications()`: Clear all notifications
- `setTheme(theme)`: Set theme
- `toggleTheme()`: Toggle between light/dark theme
- `toggleMobileMenu()`: Toggle mobile menu

**Usage:**
```jsx
import { useUIStore } from '../stores';

const MyComponent = () => {
  const { openModal, isModalOpen, addNotification } = useUIStore();
  
  const handleOpenExchange = (book) => {
    openModal('exchange', book);
  };
  
  const handleSuccess = () => {
    addNotification({
      type: 'success',
      message: 'Operation completed!',
      duration: 3000
    });
  };
  
  return (
    <div>
      <button onClick={handleOpenExchange}>Open Exchange Modal</button>
      <Modal open={isModalOpen('exchange')}>
        {/* Modal content */}
      </Modal>
    </div>
  );
};
```

## When to Use useState vs Zustand

### Use Zustand for:
- **Global state** that needs to be accessed by multiple components
- **Data fetching** and API state management
- **User authentication** state
- **Modal states** that are used across different components
- **Complex state** with multiple related properties
- **State that needs to persist** between route changes

### Keep useState for:
- **Local component state** like form inputs, toggles, temporary UI state
- **Simple state** that doesn't need to be shared
- **Temporary state** that's only needed during a single interaction
- **Component-specific UI state** like expanded/collapsed sections

## Best Practices

1. **Error Handling**: Always handle errors in components using useEffect:
```jsx
useEffect(() => {
  if (error) {
    message.error(error);
    clearError();
  }
}, [error, clearError]);
```

2. **Loading States**: Use store loading states for better UX:
```jsx
const { isLoading } = useBooksStore();
return <Button loading={isLoading}>Submit</Button>;
```

3. **Selective Subscriptions**: Only subscribe to store values you need:
```jsx
// Good - only subscribes to books and isLoading
const { books, isLoading } = useBooksStore();

// Avoid - subscribes to entire store
const store = useBooksStore();
```

4. **Actions in Effects**: Call store actions in useEffect for data fetching:
```jsx
useEffect(() => {
  fetchDashboardData();
}, [fetchDashboardData]);
```

5. **Error Boundaries**: Consider implementing error boundaries for better error handling in production.

## Migration Guide

When migrating from useState to Zustand:

1. **Identify shared state**: Look for props being passed down multiple levels
2. **Move API calls**: Move API calls from components to store actions
3. **Centralize loading states**: Replace individual loading states with store loading
4. **Consolidate error handling**: Use store error state instead of component-level error handling
5. **Update imports**: Replace API imports with store imports

Example migration:
```jsx
// Before
const [books, setBooks] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await booksAPI.getAll();
      setBooks(response.data);
    } catch (error) {
      message.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);

// After
const { books, isLoading, fetchBooks } = useBooksStore();

useEffect(() => {
  fetchBooks();
}, []);
```

This implementation provides a clean, scalable state management solution while maintaining the simplicity that makes React development enjoyable.
