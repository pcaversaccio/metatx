const Relayer = artifacts.require("Relayer");

module.exports = function (deployer) {
  deployer.deploy(Relayer);
};
