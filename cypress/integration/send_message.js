const url = Cypress.env('url');

describe('Users', () => {
  it('can open user list', () => {
    cy.visit(url);
    const loginToggle = cy.get('.form-toggle');
    loginToggle.click();
    cy.get('input[type=email]')
      .type('jeremy@test.com');
    cy.get('input[type=password]')
      .type('password');
    cy.get('form button').click();

    // wait for login
    cy.wait(10000);

    cy.get('.UserList')
      .should('have.class', 'closed');
    cy.get('.fa-bars').click();
    cy.get('.UserList')
      .should('have.class', 'open');
  });

  it('can close user list', () => {
    cy.get('.fa-times').click();
    cy.get('.UserList')
      .should('have.class', 'closed');
  });

  it('can select user', () => {
    cy.get('.fa-bars').click();
    cy.get('.user').first().click();
  });

  it('select user and panel closes automatically', () => {
    cy.get('.UserList')
      .should('have.class', 'closed');
  });

  it('can write and send a message', () => {
    cy.get('.message').then((messages) => {
      const messageCount = messages.length;
      cy.get('.message-input input')
        .type('Hello. This is a test message');
      cy.get('button[type=submit]').click();
      cy.wait(5000);
      cy.get('.message').then((newMessages) => {
        const newMessageCount = newMessages.length;
        expect(newMessageCount).to.eq(messageCount + 1);
      });
    });
  });
});
