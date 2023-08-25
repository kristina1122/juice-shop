/// <reference types="cypress"/>

describe("Sign up flow", () => {
    let randomString = Math.random().toString(36).substring(2);
    const email = "auto_" + randomString + "@gmail.com";        
    const password = "password1";
    describe("UI tests", () => {
    beforeEach(() => {
        cy.log("Email: " + email);
        cy.log("Password: " + password)
        cy.visit("http://localhost:3000/#/"); 
        //cy.get(':nth-child(3) > .mat-tooltip-trigger').click();  --это мой способ, кликнуть на кнопку и модалка закрывается
        cy.get('.cdk-overlay-backdrop').click(-50, -50, {force:true}); // это оф решение, берется весь экран и клик не в область попапа, чтобы он пропал 
        cy.get('#navbarAccount').click();
        cy.get('#navbarLoginButton').click();
    })
    it("handle modal screen", () =>{
        cy.get('#newCustomerLink').contains("Not yet a customer?").click({force: true});
        cy.get('#emailControl').type(email);
        cy.get('#passwordControl').type(password);
        cy.get('#repeatPasswordControl').type(password);
       // cy.get('.mat-select-arrow-wrapper').click(); моя версия, кликаю на стрелку, чтобы появился список
       cy.get('.mat-form-field-type-mat-select > .mat-form-field-wrapper > .mat-form-field-flex > .mat-form-field-infix').click(); //решение из курса
       cy.get('#mat-option-4 > .mat-option-text').click();
        cy.get('#securityAnswerControl').type(123456);
        cy.get('#registerButton').click();
        cy.get('.mat-simple-snack-bar-content').contains("Registration completed successfully.")
        // cy.get('#email').type(email);
        // cy.get('#password').type(password);
        // cy.get('#loginButton').click();
    });

    it("test valid login", () => {
        cy.get('#email').type(email);
        cy.get('#password').type(password);
        cy.get('#loginButton').click();
        cy.get('.fa-layers-counter').contains(0);
    });
    });

    describe("API test", () => {    
    const userCredentials = {
        "email": email,
        "password": password
    }

    it("Login via API", () => {
    cy.request("POST", "http://localhost:3000/rest/user/login", userCredentials).then(response => {
    expect(response.status).to.eql(200)
    });
    });

    it("Login VIA Token  (Non UI)", () => {
    cy.request("POST", "http://localhost:3000/rest/user/login", userCredentials)
    .its('body').then(body => {
        const token = body.authentication.token
        cy.wrap(token).as("userToken")
        cy.log("@userToken")

        const userToken = cy.get("@userToken")
        cy.visit("http://localhost:3000/", {
            onBeforeLoad(browser) {
                browser.localStorage.setItem("token", userToken)
            }
        })
        cy.wait(2000)
        cy.get('.cdk-overlay-backdrop').click(-50, -50, {force:true});
        cy.get('.fa-layers-counter').contains(0);
    })
    })

});
});


    // it("Go to Sign up", () => {
    //     cy.visit("http://localhost:3000/#/");
    //     cy.get(':nth-child(3) > .mat-tooltip-trigger').click({force: true}); 
    // })

    // Мой тест не работал, тк нужно было добавить вторую запись Describe после ввода переменный, чтобы разделить тесты