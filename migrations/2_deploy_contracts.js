const SimpleForwarder = artifacts.require("SimpleForwarder");

module.exports = function (deployer) {
  deployer.deploy(SimpleForwarder);
};
