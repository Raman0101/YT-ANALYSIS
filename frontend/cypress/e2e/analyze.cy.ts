describe('Analyze flow', () => {
  it('loads and submits channel name', () => {
    cy.visit('/');
    cy.get('input[type="text"]').type('MrBeast');
    cy.contains('button', /analyze/i).click();
  });
});


