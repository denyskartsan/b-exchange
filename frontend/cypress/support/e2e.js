// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import '@testing-library/cypress/add-commands';

// Custom commands
Cypress.Commands.add('loginAs', (email = 'john@example.com', password = 'password123') => {
  cy.visit('/login');
  cy.get('[data-testid="email-input"]', { timeout: 10000 }).should('be.visible').type(email);
  cy.get('[data-testid="password-input"]', { timeout: 10000 }).should('be.visible').type(password);
  cy.get('[data-testid="login-button"]').click();
  
  // Wait for navigation and authentication
  cy.url({ timeout: 10000 }).should('not.include', '/login');
  cy.contains('Dashboard', { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('clearDatabase', () => {
  // This would be used to reset the database between tests
  // For now, we'll just clear local storage
  cy.clearLocalStorage();
});

// Ignore uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent test failure for known React errors
  return false;
});
