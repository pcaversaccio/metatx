const Forwarder = artifacts.require("Forwarder");

module.exports = function (deployer) {
  deployer.deploy(Forwarder);
};
