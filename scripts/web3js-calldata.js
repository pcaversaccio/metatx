// Author: Pascal Marco Caversaccio
// E-Mail: pascal.caversaccio@hotmail.ch

// -------------------IMPORTS------------------- //
let Web3 = require('web3'); // Add the web3 node package
const BigNumber = require('bignumber.js'); // Add the bignumber.js node package
const contractAbi = require('./ABI/Forwarder.json'); // Get the contract ABI of the Forwarder smart contract

// Load the Infura project ID & the private key for the `fromAddr` parameter needed for the signature
const {
  projectId,
  privateKey
} = require('./../secrets.json');

const web3 = new Web3(`https://rinkeby.infura.io/v3/${projectId}`); // Initiate the web3 object using the Infura project ID

// -------------------PARAMETERS------------------- //
// The address who has 0 ether and is the creator of the transaction
// This address is the one which signs the transaction data
let fromAddr = '0x3854Ca47Abc62A3771fE06ab45622A42C4A438Cf';
let toAddr = '0x9F3f11d72d96910df008Cfe3aBA40F361D2EED03'; // Target address of the transfer
let daiTokenAddress = '0xc7ad46e0b8a400bb3c915120d284aafba8fc4735'; // Token smart contract address (e.g. Startfeld token address)
let forwarderAddress = '0xba5b421D415054b08b7D1CeB7F0f790c35729c48' // Forwarder smart contract address

let gasLimit = new BigNumber(21000 * 10); // Amount of gas limit to set for the execution
let nonce = 0; // Initiate the nonce

let base = new BigNumber(10 ** 18); // 1 ETH = 10^18 wei
let amount = 1; // Amount to be transferred

// Amount in wei to be transferred. Recommendation use BigNumber objects to represent whole numbers larger than 2^53 - 1
let tokenValue = new BigNumber(base * amount);

// -------------------DATA PROCESSING------------------- //
// Get the function signature by hashing it and retrieving the first 4 bytes
// The first four bytes of the calldata for a function call specifies the function to be called
// It is the first (left, high-order in big-endian) four bytes of the Keccak-256 hash of the 
// signature of the function. Now since 1 nibble (4 bits) can be represented by a hex digit,
// 1 byte == 2 hex digits => 4 bytes == 8 hex digits
let fnSignatureApprove = web3.utils.keccak256('approve(address,uint256)').substr(0, 10);
let fnSignatureTransfer = web3.utils.keccak256('transferFrom(address,address,uint256)').substr(0, 10);

// Encode the function parameters
let fnParamsApprove = web3.eth.abi.encodeParameters(
  ['address', 'uint256'],
  [forwarderAddress, tokenValue.toFixed()]
);

let fnParamsTransfer = web3.eth.abi.encodeParameters(
  ['address', 'address', 'uint256'],
  [fromAddr, toAddr, tokenValue.toFixed()]
);

// Add the encoded function parameters to the calldata
// Also, remove the hex '0x' prefix for the encoded parameters since the function signature already contains it
calldataApprove = fnSignatureApprove + fnParamsApprove.substr(2);
calldataTransfer = fnSignatureTransfer + fnParamsTransfer.substr(2);

console.log('Calldata(`approve()`): ' + calldataApprove, '\n') // Output the calldata
console.log('Calldata(`transferFrom()`): ' + calldataTransfer, '\n') // Output the calldata

const contract = new web3.eth.Contract(contractAbi, forwarderAddress); // Initiate the web3 contract object
contract.methods.getNonce(fromAddr).call().then(data => {
  nonce = data;
  // Pack the token contract address and the `approve()`/`transferFrom()` calldata together and sign them
  let rawDataApprove = web3.eth.abi.encodeParameters(
    ['address', 'address', 'uint256', 'uint256', 'bytes'],
    [fromAddr, daiTokenAddress, gasLimit, nonce, calldataApprove]
  );
  let rawDataTransfer = web3.eth.abi.encodeParameters(
    ['address', 'address', 'uint256', 'uint256', 'bytes'],
    [fromAddr, daiTokenAddress, gasLimit, nonce, calldataTransfer]
  );

  let hashApprove = web3.utils.soliditySha3(rawDataApprove); // Hash the `approve()` data
  let hashTransfer = web3.utils.soliditySha3(rawDataTransfer); // Hash the `transferFrom()` data

  signer = fromAddr // Set the signer

  let signatureApprove = web3.eth.accounts.sign(hashApprove, privateKey); // Sign the hash of the `approve()` data
  let signatureTransfer = web3.eth.accounts.sign(hashTransfer, privateKey); // Sign the hash of the `transferFrom()` data

  console.log('Signature(`approve()()`): ' + signatureApprove.signature, '\n'); // Output the final signature
  console.log('Signature(`transferFrom()`): ' + signatureTransfer.signature, '\n'); // Output the final signature

  console.log('Recovered EOA address(`approve()`): ' + web3.eth.accounts.recover(signatureApprove), '\n'); // Output the recovered signer address
  console.log('Recovered EOA address(`transferFrom()`): ' + web3.eth.accounts.recover(signatureTransfer), '\n'); // Output the recovered signer address

  console.log('Tuple data(`approve()`): ' + '[' + '"' + fromAddr + '"' + ', ' + '"' + daiTokenAddress + '"' + ', ' + '"' + gasLimit + '"' +
    ', ' + '"' + nonce + '"' + ', ' + '"' + calldataApprove + '"' + ']'); // Output the complete ForwardRequest struct for `approve()`
  console.log('Tuple data(`transferFrom()`): ' + '[' + '"' + fromAddr + '"' + ', ' + '"' + daiTokenAddress + '"' + ', ' + '"' + gasLimit + '"' +
    ', ' + '"' + nonce + '"' + ', ' + '"' + calldataTransfer + '"' + ']'); // Output the complete ForwardRequest struct for `transferFrom()`
});