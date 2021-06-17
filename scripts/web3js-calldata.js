// Add the web3 node module
var Web3 = require('web3');
const { projectId, privateKey } = require('./../secrets.json');
const web3 = new Web3(`https://rinkeby.infura.io/v3/${projectId}`);

let fromAddr = "0x9F3f11d72d96910df008Cfe3aBA40F361D2EED03"
let toAddr = "0x3854Ca47Abc62A3771fE06ab45622A42C4A438Cf"
let tokenValue = "1000000000000000000000"
let DaiTokenAddress = "0xc7ad46e0b8a400bb3c915120d284aafba8fc4735"

let calldata = ""

// Get the function signature by hashing it and retrieving the first 4 bytes
let fnSignature = web3.utils.keccak256("transferFrom(address,address,uint256)").substr(0,10)

// Encode the function parameters and add them to the call data
let fnParams = web3.eth.abi.encodeParameters(
  ["address", "address", "uint256"],
  [fromAddr, toAddr, tokenValue]
)

calldata = fnSignature + fnParams.substr(2)

console.log(calldata)

// Pack the DAI Token address and our "transferFrom()" calldata together and sign them
let rawData = web3.eth.abi.encodeParameters(
    ['address', 'bytes'],
    [DaiTokenAddress, calldata]
  );
  // Hash the data
  let hash = web3.utils.soliditySha3(rawData);
  // Sign the hash
  signer = fromAddr
  let signature = web3.eth.accounts.sign(hash, privateKey);
  console.log(signature);