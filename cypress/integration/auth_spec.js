const url = Cypress.env('url');

describe('Authentication', () => {
  it('Can successfully login', () => {
    cy.visit(url);
    // let heroku servers wake up
    cy.wait(60000);
    const loginToggle = cy.get('.form-toggle');
    loginToggle.click();
    cy.get('input[type=email]')
      .type('jeremy@test.com');
    cy.get('input[type=password]')
      .type('password');
    cy.get('form button').click();

    // wait for login
    cy.wait(10000);

    // find user list, meaning login is successful
    cy.get('.UserList');
  });

  it('can successfully logout', () => {
    cy.get('.navbar-right button').click();

    // if user list not found, user is logged out
    cy.get('.UserList').should('not.exist');
  });
});
