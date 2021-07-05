const Forwarder = artifacts.require('Forwarder');
const name = 'AwlForwarder';
const version = '1';

module.exports = function (deployer) {
  deployer.deploy(Forwarder, name, version);
};
