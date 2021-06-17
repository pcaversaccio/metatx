// Author: Pascal Marco Caversaccio
// E-Mail: pascal.caversaccio@hotmail.ch

// Add the web3 node package
var Web3 = require('web3');
// Load the Infura project ID & the private key needed for the signature
const { projectId, privateKey } = require('./../secrets.json');
// Initiate the web3 object using the Infura project ID
const web3 = new Web3(`https://rinkeby.infura.io/v3/${projectId}`);

// The address who has 0 ether and is the creator of the transaction
// This address is the one which signs the transaction data
let fromAddr = "0x9F3f11d72d96910df008Cfe3aBA40F361D2EED03";
let toAddr = "0x3854Ca47Abc62A3771fE06ab45622A42C4A438Cf"; // Target address of the transfer
let DaiTokenAddress = "0xc7ad46e0b8a400bb3c915120d284aafba8fc4735"; // Token smart contract address

let base = 10**18; // 1 ETH = 10^18 wei
let amount = 100; // Amount to be transferred

// Amount in wei to be transferred. Recommendation use BigNumber objects to 
// represent whole numbers larger than 2^53 - 1
let tokenValue = BigInt(base*amount);

let calldata = ""; // Variable for the calldata

// Get the function signature by hashing it and retrieving the first 4 bytes
// The first four bytes of the calldata for a function call specifies the function
// to be called. It is the first (left, high-order in big-endian) four bytes of the 
// Keccak-256 hash of the signature of the function. Now since 1 nibble (4 bits) can be represented
// by a hex digit, 1 byte == 2 hex digits => 4 bytes == 8 hex digits  
let fnSignature = web3.utils.keccak256("transferFrom(address,address,uint256)").substr(0,10);

// Encode the function parameters
let fnParams = web3.eth.abi.encodeParameters(
  ["address", "address", "uint256"],
  [fromAddr, toAddr, tokenValue]
);
calldata = fnSignature + fnParams.substr(2); // Add the encoded function parameters to the calldata

console.log(calldata) // Output the calldata

// Pack the token contract address and the "transferFrom()" calldata together and sign them
let rawData = web3.eth.abi.encodeParameters(
    ['address', 'bytes'],
    [DaiTokenAddress, calldata]
  );
let hash = web3.utils.soliditySha3(rawData); // Hash the data
signer = fromAddr // Set the signer
let signature = web3.eth.accounts.sign(hash, privateKey); // Sign the hash

console.log(signature.signature); // Output the final signature
