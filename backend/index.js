const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { JSONFilePreset } = require('lowdb/node');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
let db;

const initDB = async () => {
  const defaultData = {
    users: [],
    books: [],
    exchanges: []
  };
  
  db = await JSONFilePreset('db.json', defaultData);
  
  // Ensure exchanges array exists
  if (!db.data.exchanges) {
    db.data.exchanges = [];
    await db.write();
  }
  
  // Add sample data if database is empty
  if (db.data.users.length === 0) {
    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const sampleUsers = [
      {
        id: uuidv4(),
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: hashedPassword,
        createdAt: new Date().toISOString()
      }
    ];
    
    db.data.users = sampleUsers;
    
    // Add sample books
    const sampleBooks = [
      {
        id: uuidv4(),
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        genre: 'Fiction',
        condition: 'Good',
        description: 'A classic American novel',
        status: 'available',
        ownerId: sampleUsers[0].id,
        owner: { name: sampleUsers[0].name, email: sampleUsers[0].email },
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        genre: 'Fiction',
        condition: 'Very Good',
        description: 'A powerful story of racial injustice and childhood innocence',
        status: 'available',
        ownerId: sampleUsers[1].id,
        owner: { name: sampleUsers[1].name, email: sampleUsers[1].email },
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: 'Clean Code',
        author: 'Robert C. Martin',
        genre: 'Technology',
        condition: 'Like New',
        description: 'A handbook of agile software craftsmanship',
        status: 'available',
        ownerId: sampleUsers[0].id,
        owner: { name: sampleUsers[0].name, email: sampleUsers[0].email },
        createdAt: new Date().toISOString()
      }
    ];
    
    db.data.books = sampleBooks;
    await db.write();
    
    console.log('Sample data created');
  }
};

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = db.data.users.find(user => user.email === email);
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    db.data.users.push(newUser);
    await db.write();

    res.status(201).json({
      message: 'User created successfully',
      user: { id: newUser.id, name: newUser.name, email: newUser.email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = db.data.users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Book routes
app.get('/api/books', (req, res) => {
  try {
    const books = db.data.books.map(book => ({
      ...book,
      owner: { name: book.owner.name }
    }));
    res.json(books);
  } catch (error) {
    console.error('Fetch books error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/books/my', authenticateToken, (req, res) => {
  try {
    const myBooks = db.data.books.filter(book => book.ownerId === req.user.id);
    res.json(myBooks);
  } catch (error) {
    console.error('Fetch my books error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/books', authenticateToken, async (req, res) => {
  try {
    const { title, author, genre, condition, description, coverImageUrl } = req.body;

    // Validate input
    if (!title || !author || !genre || !condition) {
      return res.status(400).json({ message: 'Title, author, genre, and condition are required' });
    }

    // Get user info
    const user = db.data.users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create new book
    const newBook = {
      id: uuidv4(),
      title,
      author,
      genre,
      condition,
      description: description || '',
      status: 'available',
      ownerId: req.user.id,
      owner: { name: user.name, email: user.email },
      coverImageUrl: typeof coverImageUrl === 'string' && coverImageUrl.length ? coverImageUrl : undefined,
      createdAt: new Date().toISOString()
    };

    db.data.books.push(newBook);
    await db.write();

    res.status(201).json({
      message: 'Book added successfully',
      book: newBook
    });
  } catch (error) {
    console.error('Add book error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a book (owner only)
app.put('/api/books/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, genre, condition, description, coverImageUrl, status } = req.body;

    const book = db.data.books.find(b => b.id === id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    if (book.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own books' });
    }

    // Update allowed fields only
    if (typeof title === 'string') book.title = title;
    if (typeof author === 'string') book.author = author;
    if (typeof genre === 'string') book.genre = genre;
    if (typeof condition === 'string') book.condition = condition;
    if (typeof description === 'string') book.description = description;
    if (typeof coverImageUrl === 'string') book.coverImageUrl = coverImageUrl;
    if (typeof status === 'string') book.status = status; // e.g., available

    book.updatedAt = new Date().toISOString();
    await db.write();

    res.json(book);
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a book (owner only)
app.delete('/api/books/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const bookIndex = db.data.books.findIndex(b => b.id === id);

    if (bookIndex === -1) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const book = db.data.books[bookIndex];
    if (book.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own books' });
    }

    // Remove the book
    db.data.books.splice(bookIndex, 1);

    // Optional: also remove related exchanges where this book participated
    if (Array.isArray(db.data.exchanges)) {
      db.data.exchanges = db.data.exchanges.filter(ex =>
        ex.requestedBookId !== id && ex.offeredBookId !== id
      );
    }

    await db.write();

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/books/search', (req, res) => {
  try {
    const query = req.query.q?.toLowerCase();
    if (!query) {
      return res.json(db.data.books);
    }

    const filteredBooks = db.data.books.filter(book =>
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.genre.toLowerCase().includes(query)
    );

    res.json(filteredBooks);
  } catch (error) {
    console.error('Search books error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Exchange routes
app.post('/api/exchanges', authenticateToken, async (req, res) => {
  try {
    const { requestedBookId, offeredBookId, message: exchangeMessage } = req.body;

    // Validate input
    if (!requestedBookId || !offeredBookId) {
      return res.status(400).json({ message: 'Both requested and offered book IDs are required' });
    }

    // Get books
    const requestedBook = db.data.books.find(b => b.id === requestedBookId);
    const offeredBook = db.data.books.find(b => b.id === offeredBookId);

    if (!requestedBook || !offeredBook) {
      return res.status(404).json({ message: 'One or both books not found' });
    }

    // Validate ownership
    if (offeredBook.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'You can only offer your own books' });
    }

    if (requestedBook.ownerId === req.user.id) {
      return res.status(400).json({ message: 'You cannot request your own book' });
    }

    // Check if both books are available for exchange
    const validStatuses = ['available', 'exchanged-available'];
    if (!validStatuses.includes(requestedBook.status) || !validStatuses.includes(offeredBook.status)) {
      return res.status(400).json({ message: 'Both books must be available for exchange' });
    }

    // Set books to pending-exchange status
    requestedBook.status = 'pending-exchange';
    offeredBook.status = 'pending-exchange';

    // Create exchange request (store only IDs, not full book data)
    const exchangeRequest = {
      id: uuidv4(),
      requesterId: req.user.id,
      requesterName: req.user.name,
      ownerId: requestedBook.ownerId,
      ownerName: requestedBook.owner.name,
      requestedBookId: requestedBook.id,
      offeredBookId: offeredBook.id,
      message: exchangeMessage || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    db.data.exchanges.push(exchangeRequest);
    await db.write();

    res.status(201).json({
      message: 'Exchange request created successfully',
      exchange: exchangeRequest
    });
  } catch (error) {
    console.error('Create exchange error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/exchanges/received', authenticateToken, (req, res) => {
  try {
    const receivedExchanges = db.data.exchanges
      .filter(exchange => exchange.ownerId === req.user.id)
      .map(exchange => {
        // Populate current book data dynamically
        const requestedBook = db.data.books.find(b => b.id === exchange.requestedBookId);
        const offeredBook = db.data.books.find(b => b.id === exchange.offeredBookId);
        
        return {
          ...exchange,
          requestedBook: requestedBook ? {
            id: requestedBook.id,
            title: requestedBook.title,
            author: requestedBook.author,
            condition: requestedBook.condition
          } : null,
          offeredBook: offeredBook ? {
            id: offeredBook.id,
            title: offeredBook.title,
            author: offeredBook.author,
            condition: offeredBook.condition
          } : null
        };
      })
      .filter(exchange => exchange.requestedBook && exchange.offeredBook); // Filter out exchanges with deleted books
    
    res.json(receivedExchanges);
  } catch (error) {
    console.error('Fetch received exchanges error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/exchanges/sent', authenticateToken, (req, res) => {
  try {
    const sentExchanges = db.data.exchanges
      .filter(exchange => exchange.requesterId === req.user.id)
      .map(exchange => {
        // Populate current book data dynamically
        const requestedBook = db.data.books.find(b => b.id === exchange.requestedBookId);
        const offeredBook = db.data.books.find(b => b.id === exchange.offeredBookId);
        
        return {
          ...exchange,
          requestedBook: requestedBook ? {
            id: requestedBook.id,
            title: requestedBook.title,
            author: requestedBook.author,
            condition: requestedBook.condition
          } : null,
          offeredBook: offeredBook ? {
            id: offeredBook.id,
            title: offeredBook.title,
            author: offeredBook.author,
            condition: offeredBook.condition
          } : null
        };
      })
      .filter(exchange => exchange.requestedBook && exchange.offeredBook); // Filter out exchanges with deleted books
    
    res.json(sentExchanges);
  } catch (error) {
    console.error('Fetch sent exchanges error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/exchanges/:id/respond', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'accept' or 'decline'

    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ message: 'Action must be accept or decline' });
    }

    const exchange = db.data.exchanges.find(ex => ex.id === id);
    if (!exchange) {
      return res.status(404).json({ message: 'Exchange not found' });
    }

    if (exchange.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'You can only respond to exchanges for your books' });
    }

    if (exchange.status !== 'pending') {
      return res.status(400).json({ message: 'Exchange has already been responded to' });
    }

    exchange.status = action === 'accept' ? 'accepted' : 'declined';
    exchange.respondedAt = new Date().toISOString();

    // Get books to update their status
    const requestedBook = db.data.books.find(b => b.id === exchange.requestedBookId);
    const offeredBook = db.data.books.find(b => b.id === exchange.offeredBookId);

    if (action === 'accept') {
      if (requestedBook && offeredBook) {
        // Swap ownership
        const tempOwnerId = requestedBook.ownerId;
        const tempOwner = requestedBook.owner;
        
        requestedBook.ownerId = offeredBook.ownerId;
        requestedBook.owner = offeredBook.owner;
        
        offeredBook.ownerId = tempOwnerId;
        offeredBook.owner = tempOwner;
        
        // Set books as exchanged-available after successful exchange
        requestedBook.status = 'exchanged-available';
        offeredBook.status = 'exchanged-available';
      }
    } else {
      // Declined: reset books to their original available status
      if (requestedBook && offeredBook) {
        // Check if the books were previously exchanged or just available
        // For now, we'll set them back to available
        // In a more sophisticated system, we'd track the previous status
        requestedBook.status = 'available';
        offeredBook.status = 'available';
      }
    }

    await db.write();

    res.json({
      message: `Exchange ${action}ed successfully`,
      exchange
    });
  } catch (error) {
    console.error('Respond to exchange error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Book Exchange API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const startServer = async () => {
  await initDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Sample users: john@example.com and jane@example.com (password: password123)`);
  });
};

startServer();
