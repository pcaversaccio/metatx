const SimpleForwarder = artifacts.require("SimpleForwarder");

describe("SimpleForwarder contract", function () {
    let accounts;

    before(async function () {
        accounts = await web3.eth.getAccounts();
    });

    describe("Deployment", function () {
        it("Should deploy with the right greeting", async function () {
            const greeter = await SimpleForwarder.new("Hello, world!");
            assert.equal(await greeter.greet(), "Hello, world!");

            const greeter2 = await SimpleForwarder.new("Hola, mundo!");
            assert.equal(await greeter2.greet(), "Hola, mundo!");
        });
    });
});