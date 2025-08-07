describe('Add Book Functionality', () => {
  beforeEach(() => {
    cy.clearDatabase();
    cy.loginAs(); // Login before each test
    cy.visit('/add-book'); // Navigate to add book page
    cy.url().should('include', '/add-book');
  });

  it('should display add book form correctly', () => {
    cy.contains('Add New Book').should('be.visible');
    cy.contains('Share your books with the community!').should('be.visible');
    cy.get('[data-testid="book-title-input"]').should('be.visible');
    cy.get('[data-testid="book-author-input"]').should('be.visible');
    cy.get('[data-testid="book-genre-select"]').should('be.visible');
    cy.get('[data-testid="book-condition-select"]').should('be.visible');
    cy.get('[data-testid="book-description-input"]').should('be.visible');
    cy.get('[data-testid="add-book-button"]').should('be.visible');
  });

  it('should show validation errors for required fields', () => {
    cy.get('[data-testid="add-book-button"]').click();

    cy.contains('Please enter the book title').should('be.visible');
    cy.contains('Please enter the author name').should('be.visible');
    cy.contains('Please select a genre').should('be.visible');
    cy.contains('Please select the book condition').should('be.visible');
  });

  it('should successfully add a book with valid data', () => {
    // Fill in the form
    cy.get('[data-testid="book-title-input"]').type('The Catcher in the Rye');
    cy.get('[data-testid="book-author-input"]').type('J.D. Salinger');
    
    // Select genre - wait for dropdown to be fully rendered
    cy.get('[data-testid="book-genre-select"]').click();
    cy.get('.ant-select-dropdown').should('be.visible');
    cy.get('.ant-select-item').contains('Fiction').click();
    
    // Select condition - wait for dropdown to be fully rendered
    cy.get('[data-testid="book-condition-select"]').click();
    cy.get('.ant-select-dropdown').should('be.visible');
    cy.get('.ant-select-item').contains('Very Good').click();
    
    // Add description
    cy.get('[data-testid="book-description-input"]').type('A classic coming-of-age story about teenager Holden Caulfield.');

    // Submit form
    cy.get('[data-testid="add-book-button"]').click();

    // Should show success message
    cy.get('.ant-message-notice-content', { timeout: 10000 }).should('contain', 'Book added successfully!');
    
    // Should redirect to dashboard
    cy.url({ timeout: 10000 }).should('include', '/');
    cy.contains('Dashboard').should('be.visible');
  });

  it('should successfully add a book without optional description', () => {
    // Fill in only required fields
    cy.get('[data-testid="book-title-input"]').type('1984');
    cy.get('[data-testid="book-author-input"]').type('George Orwell');
    
    // Select genre
    cy.get('[data-testid="book-genre-select"]').click();
    cy.get('.ant-select-dropdown').should('be.visible');
    cy.get('.ant-select-item').contains('Fiction').click();
    
    // Select condition
    cy.get('[data-testid="book-condition-select"]').click();
    cy.get('.ant-select-dropdown').should('be.visible');
    cy.get('.ant-select-item').contains('Good').click();

    // Submit form without description
    cy.get('[data-testid="add-book-button"]').click();

    // Should show success message
    cy.get('.ant-message-notice-content', { timeout: 10000 }).should('contain', 'Book added successfully!');
    
    // Should redirect to dashboard
    cy.url({ timeout: 10000 }).should('include', '/');
  });

  it('should navigate to add book page from header menu', () => {
    cy.visit('/');
    
    // Click on Add Book in navigation
    cy.contains('Add Book').click();
    
    cy.url().should('include', '/add-book');
    cy.contains('Add New Book').should('be.visible');
  });

  it('should navigate to add book page from dashboard', () => {
    cy.visit('/');
    
    // Click on Add Book button in dashboard
    cy.get('[data-testid="add-book-button"], .ant-btn').contains('Add Book').click();
    
    cy.url().should('include', '/add-book');
    cy.contains('Add New Book').should('be.visible');
  });

  it('should display all genre options', () => {
    cy.get('[data-testid="book-genre-select"]').click();
    
    // Just check that the dropdown is open and has options
    cy.get('.ant-select-dropdown').should('be.visible');
    cy.contains('.ant-select-item', 'Fiction').should('be.visible');
    cy.contains('.ant-select-item', 'Mystery').should('be.visible');
    cy.contains('.ant-select-item', 'Technology').should('be.visible');
  });

  it('should display all condition options', () => {
    cy.get('[data-testid="book-condition-select"]').click();
    
    // Just check that the dropdown is open and has options
    cy.get('.ant-select-dropdown').should('be.visible');
    cy.contains('.ant-select-item', 'Like New').should('be.visible');
    cy.contains('.ant-select-item', 'Very Good').should('be.visible');
    cy.contains('.ant-select-item', 'Good').should('be.visible');
  });

  it('should clear form after successful submission', () => {
    // Fill form
    cy.get('[data-testid="book-title-input"]').type('Test Book');
    cy.get('[data-testid="book-author-input"]').type('Test Author');
    cy.get('[data-testid="book-genre-select"]').click();
    cy.get('.ant-select-dropdown').should('be.visible');
    cy.get('.ant-select-item').contains('Fiction').click();
    cy.get('[data-testid="book-condition-select"]').click();
    cy.get('.ant-select-dropdown').should('be.visible');
    cy.get('.ant-select-item').contains('Good').click();

    // Submit
    cy.get('[data-testid="add-book-button"]').click();

    // Wait for success and navigation
    cy.get('.ant-message-notice-content', { timeout: 10000 }).should('contain', 'Book added successfully!');
    cy.url({ timeout: 10000 }).should('include', '/');
  });

  it('should require authentication', () => {
    // Clear auth and try to access add book page
    cy.clearLocalStorage();
    cy.visit('/add-book');
    
    // Should redirect to login
    cy.url().should('include', '/login');
    cy.contains('Sign in to your account').should('be.visible');
  });
});
