describe('Login Functionality', () => {
  beforeEach(() => {
    cy.clearDatabase();
    cy.visit('/login');
  });

  it('should display login form correctly', () => {
    cy.contains('Book Exchange').should('be.visible');
    cy.contains('Sign in to your account').should('be.visible');
    cy.get('[data-testid="email-input"]').should('be.visible');
    cy.get('[data-testid="password-input"]').should('be.visible');
    cy.get('[data-testid="login-button"]').should('be.visible');
    cy.contains('Don\'t have an account?').should('be.visible');
    cy.contains('Sign up').should('be.visible');
  });

  it('should show validation errors for empty fields', () => {
    cy.get('[data-testid="login-button"]').click();
    cy.contains('Please enter your email').should('be.visible');
    cy.contains('Please enter your password').should('be.visible');
  });

  it('should show validation error for invalid email format', () => {
    cy.get('[data-testid="email-input"]').type('invalid-email');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    cy.contains('Please enter a valid email').should('be.visible');
  });

  it('should successfully login with valid credentials', () => {
    // Use sample user credentials from backend
    cy.get('[data-testid="email-input"]').type('john@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();

    // Wait for redirect and check URL
    cy.url({ timeout: 10000 }).should('not.include', '/login');
    cy.url().should('match', /\/$/);
    
    // Should show success message (Ant Design message appears temporarily)
    cy.get('.ant-message-notice-content', { timeout: 5000 }).should('contain', 'Login successful!');
    
    // Should display dashboard elements
    cy.contains('Dashboard', { timeout: 10000 }).should('be.visible');
    cy.contains('Welcome back!').should('be.visible');
    
    // Should show header with user info
    cy.contains('John Doe').should('be.visible');
  });

  it('should show error for invalid credentials', () => {
    cy.get('[data-testid="email-input"]').type('wrong@example.com');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    cy.get('[data-testid="login-button"]').click();

    // Should show error message in Ant Design notification
    cy.get('.ant-message-notice-content', { timeout: 5000 }).should('contain', 'Login failed');
    
    // Should remain on login page
    cy.url().should('include', '/login');
  });

  it('should navigate to register page when clicking sign up link', () => {
    cy.contains('Sign up').click();
    cy.url().should('include', '/register');
    cy.contains('Join Book Exchange').should('be.visible');
  });

  it('should redirect authenticated users away from login page', () => {
    // First login
    cy.loginAs();
    
    // Try to visit login page again
    cy.visit('/login');
    
    // Should redirect to dashboard
    cy.url().should('include', '/');
    cy.contains('Dashboard').should('be.visible');
  });
});
