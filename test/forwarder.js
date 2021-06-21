const Forwarder = artifacts.require("Forwarder");

const DaiTokenAddress = '0xc7ad46e0b8a400bb3c915120d284aafba8fc4735'; // Token smart contract address

beforeEach(async function () {
    this.contract = await Forwarder.new();
  });

describe("Forwarder contract", function () {
    
});