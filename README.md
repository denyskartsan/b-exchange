# Book Exchange Application

A full-stack book exchange platform built with React, Express, and Cypress for testing.

## Features

- **Authentication**: JWT-based user registration and login
- **Book Management**: Add, browse, and search books
- **User Dashboard**: Overview of personal books and exchange statistics
- **Responsive Design**: Built with TailwindCSS and Ant Design
- **E2E Testing**: Comprehensive Cypress test suite

## Tech Stack

### Frontend
- React 19
- Vite (development server)
- TailwindCSS (styling)
- Ant Design (UI components)
- React Router (routing)
- Axios (API calls)

### Backend
- Express.js
- JWT (authentication)
- bcryptjs (password hashing)
- LowDB (JSON file database)
- CORS (cross-origin requests)

### Testing
- Cypress (E2E testing)
- Testing Library Cypress (additional testing utilities)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation

1. **Clone/Navigate to the project:**
   ```bash
   cd book-exchange-app
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```
   The server will start on http://localhost:3001

2. **Start the Frontend Application (in a new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```
   The app will start on http://localhost:5173

3. **Access the Application:**
   Open your browser and navigate to http://localhost:5173

### Sample Users

The application comes with pre-seeded sample data:

- **Email:** john@example.com  
  **Password:** password123
  
- **Email:** jane@example.com  
  **Password:** password123

### Running Tests

1. **Make sure both frontend and backend are running**

2. **Run Cypress Tests:**
   ```bash
   cd frontend
   npm run cypress:open  # Interactive mode
   # OR
   npm run cypress:run   # Headless mode
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Books
- `GET /api/books` - Get all books
- `GET /api/books/my` - Get user's books (authenticated)
- `POST /api/books` - Add a new book (authenticated)
- `GET /api/books/search?q=query` - Search books

### Health Check
- `GET /api/health` - API health status

## Database

The application uses LowDB with a JSON file (`backend/db.json`) for data persistence. The database is automatically initialized with sample data on first run.

## Project Structure

```
book-exchange-app/
├── backend/
│   ├── index.js           # Express server
│   ├── db.json           # JSON database
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── utils/        # Utilities (auth, api)
│   │   └── App.jsx       # Main app component
│   ├── cypress/
│   │   ├── e2e/          # End-to-end tests
│   │   └── support/      # Cypress support files
│   └── package.json
└── README.md
```

## Testing

The application includes comprehensive Cypress tests covering:

### Login Functionality (`cypress/e2e/login.cy.js`)
- Form validation
- Successful login flow
- Invalid credentials handling
- Navigation between login/register
- Authentication redirects

### Add Book Functionality (`cypress/e2e/add-book.cy.js`)
- Form validation
- Successful book creation
- Required vs optional fields
- Navigation from different pages
- Authentication requirements

### Running Individual Test Files
```bash
# Run specific test file
npx cypress run --spec "cypress/e2e/login.cy.js"
npx cypress run --spec "cypress/e2e/add-book.cy.js"
```

## Development

### Adding New Tests
1. Create new test files in `frontend/cypress/e2e/`
2. Follow the existing pattern with `data-testid` attributes
3. Use the custom commands defined in `cypress/support/e2e.js`

### Custom Cypress Commands
- `cy.loginAs(email, password)` - Login as a user
- `cy.clearDatabase()` - Clear local storage

### Code Style
- Use `data-testid` attributes for reliable element selection in tests
- Follow React best practices with functional components
- Use descriptive variable and function names
- Prefer early returns for better readability

## Troubleshooting

1. **Port conflicts**: Make sure ports 3001 (backend) and 5173 (frontend) are available
2. **Database issues**: Delete `backend/db.json` to reset the database
3. **Test failures**: Ensure both servers are running before executing Cypress tests
4. **CORS issues**: The backend is configured for localhost:5173, update if using different ports

## Future Enhancements

- Real book exchange functionality
- Image upload for books
- User profiles and ratings
- Real-time notifications
- Mobile app version
- Advanced search filters
- Book recommendations
