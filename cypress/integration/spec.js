describe('logs in', function() {
    it('visits homepage', function() {
        cy.visit('/');
    
        cy.get('.row-hero')
            .should('contain', "We're creating maps of communities to end gerrymandering.")
    })
})